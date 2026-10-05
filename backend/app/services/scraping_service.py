
from sqlalchemy.orm import Session

from app.models.scraping import ScrapingJob
from app.models.scraping_record import ScrapingRecord
from app.models.scraping_target import ScrapingTarget
from app.schemas.scraping import ScrapingJobCreate


def create_scraping_job(
    db: Session,
    payload: ScrapingJobCreate,
) -> ScrapingJob:
    """
    Create a scraping job and its individual targets.

    Each target is represented by ScrapingTargetCreate and contains:
    - url
    - optional external_id

    The database stores the actual URL in ScrapingTarget.url.
    """

    targets = [
        str(target.url)
        for target in payload.targets
    ]

    selector_data = None

    if payload.selectors is not None:
        selector_data = payload.selectors.model_dump(
            exclude_none=True
        )

    job = ScrapingJob(
        target_url=targets[0],
        status="pending",
        max_concurrency=payload.max_concurrency,
        max_retries=payload.max_retries,
        total_items=len(targets),
        successful_items=0,
        failed_items=0,
        selectors=selector_data,
    )

    db.add(job)
    db.flush()

    for target in payload.targets:
        scraping_target = ScrapingTarget(
            job_id=job.id,
            url=str(target.url),
            status="pending",
            attempt=0,
        )

        db.add(scraping_target)
    db.commit()
    db.refresh(job)

    return job


def get_scraping_job(
    db: Session,
    job_id: int,
) -> ScrapingJob | None:
    return (
        db.query(ScrapingJob)
        .filter(
            ScrapingJob.id == job_id
        )
        .first()
    )


def get_scraping_jobs(
    db: Session,
) -> list[ScrapingJob]:
    return (
        db.query(ScrapingJob)
        .order_by(
            ScrapingJob.created_at.desc()
        )
        .all()
    )


def get_scraping_records(
    db: Session,
    job_id: int,
) -> list[ScrapingRecord]:
    return (
        db.query(ScrapingRecord)
        .filter(
            ScrapingRecord.job_id == job_id
        )
        .order_by(
            ScrapingRecord.id.asc()
        )
        .all()
    )


def get_scraping_targets(
    db: Session,
    job_id: int,
) -> list[ScrapingTarget]:
    return (
        db.query(ScrapingTarget)
        .filter(
            ScrapingTarget.job_id == job_id
        )
        .order_by(
            ScrapingTarget.id.asc()
        )
        .all()
    )

