
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ScrapingSelectorConfig(BaseModel):
    """
    CSS selectors used for structured extraction.

    All selectors are optional so the engine can still scrape
    generic pages such as example.com.
    """

    title: str | None = None
    description: str | None = None
    price: str | None = None
    category: str | None = None
    item_id: str | None = None


class ScrapingTargetCreate(BaseModel):
    """
    Individual scraping target.

    Each target contains the URL to scrape and an optional
    external identifier supplied by the client/frontend.
    """

    url: HttpUrl
    external_id: str | None = None


class ScrapingJobCreate(BaseModel):
    targets: list[ScrapingTargetCreate] = Field(
        min_length=1,
        max_length=100,
    )

    max_concurrency: int = Field(
        default=5,
        ge=1,
        le=50,
    )

    max_retries: int = Field(
        default=3,
        ge=0,
        le=10,
    )

    selectors: ScrapingSelectorConfig | None = None


class ScrapingJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    target_url: str
    status: str

    max_concurrency: int
    max_retries: int

    total_items: int
    successful_items: int
    failed_items: int

    error_message: str | None = None

    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None


class ScrapingTargetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    url: str
    status: str
    attempt: int

    error_message: str | None = None

    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None


class ScrapingRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    url: str
    status: str

    title: str | None = None
    content: str | None = None
    data: dict | None = None

    error_message: str | None = None

    attempt: int
    created_at: datetime

