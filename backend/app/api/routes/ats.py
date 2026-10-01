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
from app.services.ats_service import (
    build_recommendations,
    calculate_ats_score,
)


router = APIRouter(
    prefix="/ats",
    tags=["ATS"],
)


@router.post(
    "/check",
    response_model=ATSReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def check_ats_score(
    payload: ATSCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    if not resume.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text could not be extracted.",
        )

    score, matched, missing = calculate_ats_score(
        resume.content,
        payload.job_description,
    )

    recommendations = build_recommendations(missing)

    report = ATSReport(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description=payload.job_description,
        score=score,
        matched_keywords=json.dumps(matched),
        missing_keywords=json.dumps(missing),
        recommendations=json.dumps(recommendations),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return ATSReportResponse(
        id=report.id,
        resume_id=report.resume_id,
        score=report.score,
        matched_keywords=matched,
        missing_keywords=missing,
        recommendations=recommendations,
        created_at=report.created_at,
    )


@router.get(
    "/{report_id}",
    response_model=ATSReportResponse,
)
def get_ats_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
        matched_keywords=json.loads(report.matched_keywords),
        missing_keywords=json.loads(report.missing_keywords),
        recommendations=json.loads(report.recommendations),
        created_at=report.created_at,
    )