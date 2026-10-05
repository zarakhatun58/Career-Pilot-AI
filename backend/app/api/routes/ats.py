from __future__ import annotations

import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.ats import ATSReport
from app.models.resume import Resume
from app.models.user import User
from app.schemas.ats import ATSCheckRequest, ATSReportResponse
from app.services.ats_service import analyze_resume_against_job


router = APIRouter(
    prefix="/ats",
    tags=["ATS Analysis"],
)


@router.post(
    "/check",
    response_model=ATSReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def check_ats(
    payload: ATSCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Analyze an authenticated user's resume against a job description.

    The score is a deterministic CareerPilot compatibility score.
    It is not a claim to reproduce a proprietary ATS vendor's score.
    """

    resume = db.scalar(
        select(Resume).where(
            Resume.id == payload.resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    if not resume.content or not resume.content.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "This resume does not contain readable text. "
                "Please upload a readable PDF, DOCX, or TXT resume."
            ),
        )

    try:
        analysis = analyze_resume_against_job(
            resume_text=resume.content,
            job_description=payload.job_description,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to analyze the resume.",
        ) from exc

    report = ATSReport(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description=payload.job_description.strip(),
        score=analysis.score,
        matched_keywords=json.dumps(
            analysis.matched_keywords,
            ensure_ascii=False,
        ),
        missing_keywords=json.dumps(
            analysis.missing_keywords,
            ensure_ascii=False,
        ),
        recommendations=json.dumps(
            analysis.recommendations,
            ensure_ascii=False,
        ),
    )

    try:
        db.add(report)
        db.commit()
        db.refresh(report)

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save ATS report.",
        ) from exc

    return ATSReportResponse(
        id=report.id,
        resume_id=report.resume_id,
        score=report.score,
        matched_keywords=analysis.matched_keywords,
        missing_keywords=analysis.missing_keywords,
        recommendations=analysis.recommendations,
        created_at=report.created_at,
    )


@router.get(
    "/reports",
    response_model=list[ATSReportResponse],
)
def list_ats_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the authenticated user's ATS reports.
    """

    reports = db.scalars(
        select(ATSReport)
        .where(
            ATSReport.user_id == current_user.id,
        )
        .order_by(
            ATSReport.created_at.desc(),
        )
    ).all()

    results: list[ATSReportResponse] = []

    for report in reports:
        results.append(
            ATSReportResponse(
                id=report.id,
                resume_id=report.resume_id,
                score=report.score,
                matched_keywords=_load_json_list(
                    report.matched_keywords,
                ),
                missing_keywords=_load_json_list(
                    report.missing_keywords,
                ),
                recommendations=_load_json_list(
                    report.recommendations,
                ),
                created_at=report.created_at,
            )
        )

    return results


@router.get(
    "/reports/{report_id}",
    response_model=ATSReportResponse,
)
def get_ats_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return one ATS report belonging to the authenticated user.
    """

    report = db.scalar(
        select(ATSReport).where(
            ATSReport.id == report_id,
            ATSReport.user_id == current_user.id,
        )
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ATS report not found.",
        )

    return ATSReportResponse(
        id=report.id,
        resume_id=report.resume_id,
        score=report.score,
        matched_keywords=_load_json_list(
            report.matched_keywords,
        ),
        missing_keywords=_load_json_list(
            report.missing_keywords,
        ),
        recommendations=_load_json_list(
            report.recommendations,
        ),
        created_at=report.created_at,
    )


def _load_json_list(value: str | None) -> list[str]:
    """
    Safely convert the database JSON string back to a list.
    """

    if not value:
        return []

    try:
        data = json.loads(value)

    except (TypeError, json.JSONDecodeError):
        # Backward compatibility for any old comma-separated records.
        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    if not isinstance(data, list):
        return []

    return [
        str(item)
        for item in data
        if str(item).strip()
    ]