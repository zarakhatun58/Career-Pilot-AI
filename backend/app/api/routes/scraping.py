from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas.scraping import (
    ScrapingJobCreate,
    ScrapingJobResponse,
    ScrapingRecordResponse,
    ScrapingTargetResponse,
)
from app.services.execution_event_service import (
    execution_events,
)
from app.services.scraping_service import (
    create_scraping_job,
    get_scraping_job,
    get_scraping_jobs,
    get_scraping_records,
    get_scraping_targets,
)
from app.workers.scraping_worker import run_scraping_job


router = APIRouter(
    prefix="/scraping",
    tags=["Web Scraping"],
)


@router.post(
    "/jobs",
    response_model=ScrapingJobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    payload: ScrapingJobCreate,
    db: Session = Depends(get_db),
):
    return create_scraping_job(db, payload)


@router.get(
    "/jobs",
    response_model=list[ScrapingJobResponse],
)
def list_jobs(
    db: Session = Depends(get_db),
):
    return get_scraping_jobs(db)


@router.get(
    "/jobs/{job_id}",
    response_model=ScrapingJobResponse,
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = get_scraping_job(db, job_id)

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scraping job not found",
        )

    return job


@router.get(
    "/jobs/{job_id}/targets",
    response_model=list[ScrapingTargetResponse],
)
def get_job_targets(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = get_scraping_job(db, job_id)

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scraping job not found",
        )

    return get_scraping_targets(db, job_id)


@router.get(
    "/jobs/{job_id}/records",
    response_model=list[ScrapingRecordResponse],
)
def get_job_records(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = get_scraping_job(db, job_id)

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scraping job not found",
        )

    return get_scraping_records(db, job_id)


@router.get(
    "/jobs/{job_id}/events",
)
def get_job_events(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = get_scraping_job(db, job_id)

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scraping job not found",
        )

    return {
        "job_id": job_id,
        "events": execution_events.get_events(
            job_id
        ),
    }


@router.post(
    "/jobs/{job_id}/start",
    response_model=ScrapingJobResponse,
)
async def start_job(
    job_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    job = get_scraping_job(db, job_id)

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scraping job not found",
        )

    if job.status not in {"pending", "failed"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Job cannot be started while status "
                f"is '{job.status}'."
            ),
        )

    # Clear telemetry from an earlier run.
    execution_events.clear(job_id)

    job.status = "queued"
    job.error_message = None

    db.commit()
    db.refresh(job)

    execution_events.emit(
        job_id=job_id,
        event_type="job_queued",
        message="Scraping job queued.",
        status="queued",
    )

    background_tasks.add_task(
        run_scraping_job,
        job.id,
    )

    return job