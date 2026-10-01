from dataclasses import dataclass, field
from datetime import datetime, timezone
from time import perf_counter
from uuid import uuid4


def create_session_id() -> str:
    """
    Create a short unique identifier for one browser session.
    """
    return f"session-{uuid4().hex[:12]}"


@dataclass
class ExecutionTelemetry:
    """
    Runtime telemetry for one scraping target/session.
    """

    target_id: int
    url: str

    session_id: str = field(
        default_factory=create_session_id
    )

    started_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    _timer: float = field(
        default_factory=perf_counter,
        repr=False,
    )

    completed_at: datetime | None = None
    duration_ms: float | None = None

    http_status: int | None = None
    attempt: int = 0

    proxy: str = "direct"
    status: str = "pending"

    error: str | None = None

    # Examples:
    # http_403
    # http_429
    # protection_challenge
    # timeout
    # connection_error
    # navigation_error
    # extraction_error
    # unknown
    failure_type: str | None = None

    def mark_started(
        self,
        attempt: int,
        proxy: str,
    ) -> None:
        self.attempt = attempt
        self.proxy = proxy
        self.status = "running"

        self.error = None
        self.failure_type = None

        self.started_at = datetime.now(
            timezone.utc
        )

        self.completed_at = None
        self.duration_ms = None

        self._timer = perf_counter()

    def mark_success(
        self,
        http_status: int | None,
    ) -> None:
        self.http_status = http_status
        self.status = "success"

        self.error = None
        self.failure_type = None

        self.completed_at = datetime.now(
            timezone.utc
        )

        self.duration_ms = round(
            (
                perf_counter()
                - self._timer
            )
            * 1000,
            2,
        )

    def mark_failed(
        self,
        error: str,
        failure_type: str = "unknown",
        http_status: int | None = None,
    ) -> None:
        self.status = "failed"

        self.error = error
        self.failure_type = failure_type

        if http_status is not None:
            self.http_status = http_status

        self.completed_at = datetime.now(
            timezone.utc
        )

        self.duration_ms = round(
            (
                perf_counter()
                - self._timer
            )
            * 1000,
            2,
        )

    def to_dict(self) -> dict:
        """
        Convert telemetry into frontend/API-friendly JSON.
        """

        return {
            "target_id": self.target_id,
            "url": self.url,
            "session_id": self.session_id,
            "status": self.status,
            "attempt": self.attempt,
            "proxy": self.proxy,
            "http_status": self.http_status,
            "duration_ms": self.duration_ms,
            "failure_type": self.failure_type,
            "started_at": (
                self.started_at.isoformat()
            ),
            "completed_at": (
                self.completed_at.isoformat()
                if self.completed_at
                else None
            ),
            "error": self.error,
        }