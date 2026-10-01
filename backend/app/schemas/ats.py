from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ATSCheckRequest(BaseModel):
    resume_id: UUID
    job_description: str = Field(min_length=20)


class ATSReportResponse(BaseModel):
    id: UUID
    resume_id: UUID
    score: float
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendations: list[str]
    created_at: datetime