from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base, DATABASE_SCHEMA


class ATSReport(Base):
    __tablename__ = "ats_reports"
    __table_args__ = {"schema": DATABASE_SCHEMA}

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey(f"{DATABASE_SCHEMA}.users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    resume_id: Mapped[UUID] = mapped_column(
        ForeignKey(f"{DATABASE_SCHEMA}.resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    job_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    matched_keywords: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    missing_keywords: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    recommendations: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )