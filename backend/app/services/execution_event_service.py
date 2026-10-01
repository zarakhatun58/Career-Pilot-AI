from collections import defaultdict
from datetime import datetime, timezone
from threading import Lock
from typing import Any


class ExecutionEventService:
    """
    Lightweight in-memory event store for live scraping execution.

    Events are kept in the current API process and are intended for
    live dashboard/demo telemetry. Persistent scraping results remain
    stored in PostgreSQL.
    """

    def __init__(self) -> None:
        self._events: dict[int, list[dict[str, Any]]] = (
            defaultdict(list)
        )
        self._lock = Lock()

    def emit(
        self,
        job_id: int,
        event_type: str,
        message: str,
        *,
        target_id: int | None = None,
        session_id: str | None = None,
        status: str | None = None,
        attempt: int | None = None,
        proxy: str | None = None,
        http_status: int | None = None,
        duration_ms: float | None = None,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        event = {
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
            "job_id": job_id,
            "event_type": event_type,
            "message": message,
            "target_id": target_id,
            "session_id": session_id,
            "status": status,
            "attempt": attempt,
            "proxy": proxy,
            "http_status": http_status,
            "duration_ms": duration_ms,
            "data": data or {},
        }

        with self._lock:
            self._events[job_id].append(event)

        return event

    def get_events(
        self,
        job_id: int,
    ) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._events.get(job_id, []))

    def clear(
        self,
        job_id: int,
    ) -> None:
        with self._lock:
            self._events.pop(job_id, None)


execution_events = ExecutionEventService()