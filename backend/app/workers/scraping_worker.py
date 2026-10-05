import asyncio
from datetime import datetime, timezone
from urllib.parse import urlsplit

from playwright.async_api import Page
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.scraping import ScrapingJob
from app.models.scraping_record import ScrapingRecord
from app.models.scraping_target import ScrapingTarget
from app.services.browser_service import BrowserService
from app.services.execution_event_service import execution_events
from app.services.protection_detector import (
    ProtectionDetector,
    classify_exception,
    retry_delay_seconds,
    should_retry,
)
from app.services.proxy_manager import (
    ProxyConfig,
    ProxyManager,
)
from app.services.telemetry_service import ExecutionTelemetry


class ScrapingWorker:
    """
    Async scraping worker with bounded concurrency.

    The browser process is shared, while every target receives
    its own isolated BrowserContext/session.

    Protection systems are detected and recorded.
    No anti-bot bypass is performed.
    """

    def __init__(self, job_id: int) -> None:
        self.job_id = job_id
        self.browser_service = BrowserService()
        self.proxy_manager = self._create_proxy_manager()

    # =========================================================
    # Proxy configuration
    # =========================================================

    def _create_proxy_manager(self) -> ProxyManager:
        if not settings.scraping_proxy_enabled:
            return ProxyManager()

        raw_proxies = (
            settings.scraping_proxies or ""
        ).strip()

        if not raw_proxies:
            return ProxyManager()

        proxies: list[ProxyConfig] = []

        for raw_proxy in raw_proxies.split(","):
            proxy_url = raw_proxy.strip()

            if not proxy_url:
                continue

            proxies.append(
                ProxyConfig(
                    server=proxy_url,
                )
            )

        return ProxyManager(proxies)

    @staticmethod
    def _safe_proxy_label(
        proxy_config: ProxyConfig | None,
    ) -> str:
        if proxy_config is None:
            return "direct"

        try:
            parsed = urlsplit(
                proxy_config.server
            )

            if parsed.hostname is None:
                return "configured-proxy"

            scheme = parsed.scheme or "proxy"
            host = parsed.hostname

            port = (
                f":{parsed.port}"
                if parsed.port
                else ""
            )

            return f"{scheme}://{host}{port}"

        except Exception:
            return "configured-proxy"

    # =========================================================
    # Database helpers
    # =========================================================

    def _get_job(
        self,
        db: Session,
    ) -> ScrapingJob | None:
        return (
            db.query(ScrapingJob)
            .filter(
                ScrapingJob.id == self.job_id
            )
            .first()
        )

    def _get_targets(
        self,
        db: Session,
    ) -> list[ScrapingTarget]:
        return (
            db.query(ScrapingTarget)
            .filter(
                ScrapingTarget.job_id == self.job_id,
                ScrapingTarget.status == "pending",
            )
            .order_by(
                ScrapingTarget.id.asc()
            )
            .all()
        )

    # =========================================================
    # Extraction
    # =========================================================

    async def _extract_structured_data(
        self,
        page: Page,
        selectors: dict | None,
    ) -> dict:
        selectors = selectors or {}

        result = {
            "item_id": None,
            "title": None,
            "description": None,
            "price": None,
            "category": None,
        }

        for field_name in result:
            selector = selectors.get(field_name)

            if not selector:
                continue

            try:
                locator = (
                    page.locator(selector).first
                )

                if await locator.count() == 0:
                    continue

                value = await locator.inner_text()

                value = value.strip()

                result[field_name] = (
                    value if value else None
                )

            except Exception:
                result[field_name] = None

        return result

    async def _extract_generic_data(
        self,
        page: Page,
    ) -> dict:
        title = await page.title()

        body = page.locator("body")

        try:
            content = await body.inner_text()
        except Exception:
            content = ""

        content = content[:20_000]

        try:
            links = await page.locator(
                "a"
            ).evaluate_all(
                """
                elements => elements
                    .slice(0, 100)
                    .map(a => ({
                        text: (
                            a.innerText || ""
                        ).trim(),
                        href: a.href || ""
                    }))
                """
            )
        except Exception:
            links = []

        return {
            "title": title,
            "content": content,
            "links": links,
        }

    async def _extract_page_data(
        self,
        page: Page,
        selectors: dict | None,
    ) -> dict:
        structured = (
            await self._extract_structured_data(
                page,
                selectors,
            )
        )

        generic = (
            await self._extract_generic_data(
                page
            )
        )

        return {
            "structured": structured,
            "generic": generic,
        }

    # =========================================================
    # Main worker
    # =========================================================

    async def run(self) -> None:
        db = SessionLocal()

        try:
            job = self._get_job(db)

            if job is None:
                print(
                    f"[worker] Job "
                    f"{self.job_id} not found."
                )
                return

            targets = self._get_targets(db)

            if not targets:
                job.status = "completed"
                job.total_items = 0
                job.successful_items = 0
                job.failed_items = 0
                job.completed_at = (
                    datetime.now(timezone.utc)
                )

                db.commit()

                execution_events.emit(
                    self.job_id,
                    "job_completed",
                    "No pending targets found.",
                    status="completed",
                    data={
                        "total_items": 0,
                        "successful_items": 0,
                        "failed_items": 0,
                    },
                )

                return

            # -------------------------------------------------
            # Mark job running
            # -------------------------------------------------

            job.status = "running"

            job.started_at = (
                datetime.now(timezone.utc)
            )

            job.error_message = None

            job.total_items = len(targets)
            job.successful_items = 0
            job.failed_items = 0

            db.commit()

            execution_events.emit(
                self.job_id,
                "job_started",
                "Scraping job started.",
                status="running",
                data={
                    "target_count": len(targets),
                    "max_concurrency": (
                        job.max_concurrency
                    ),
                    "max_retries": (
                        job.max_retries
                    ),
                    "proxy": (
                        self.proxy_manager.describe()
                    ),
                    "selectors": (
                        job.selectors or {}
                    ),
                },
            )

            print(
                "\n"
                "========================================\n"
                f"[worker] JOB {job.id} STARTED\n"
                f"[worker] targets={len(targets)}\n"
                f"[worker] concurrency="
                f"{job.max_concurrency}\n"
                f"[worker] retries="
                f"{job.max_retries}\n"
                f"[worker] proxy="
                f"{self.proxy_manager.describe()}\n"
                "========================================\n"
            )

            # -------------------------------------------------
            # Shared browser process
            # -------------------------------------------------

            await self.browser_service.start()

            # Maximum concurrency is deliberately capped.
            concurrency = max(
                1,
                min(
                    job.max_concurrency,
                    10,
                ),
            )

            semaphore = asyncio.Semaphore(
                concurrency
            )

            results = await asyncio.gather(
                *[
                    self._process_target(
                        target_id=target.id,
                        target_url=target.url,
                        semaphore=semaphore,
                        max_retries=job.max_retries,
                        selectors=job.selectors,
                    )
                    for target in targets
                ],
                return_exceptions=True,
            )

            # -------------------------------------------------
            # Persist results
            # -------------------------------------------------

            successful = 0
            failed = 0

            for result in results:
                if (
                    isinstance(result, dict)
                    and result.get("success") is True
                ):
                    successful += 1

                    db.add(
                        ScrapingRecord(
                            job_id=job.id,
                            url=result["url"],
                            status="success",
                            title=result.get("title"),
                            content=result.get("content"),
                            data=result.get("data"),
                            attempt=result.get(
                                "attempt",
                                1,
                            ),
                        )
                    )

                else:
                    failed += 1

                    if isinstance(
                        result,
                        dict,
                    ):
                        error_message = result.get(
                            "error",
                            "Unknown scraping error",
                        )

                        url = result.get(
                            "url",
                            "",
                        )

                        attempt = result.get(
                            "attempt",
                            job.max_retries + 1,
                        )

                        telemetry = result.get(
                            "telemetry"
                        )

                    else:
                        error_message = str(result)
                        url = ""
                        attempt = (
                            job.max_retries + 1
                        )
                        telemetry = None

                    db.add(
                        ScrapingRecord(
                            job_id=job.id,
                            url=url,
                            status="failed",
                            error_message=error_message,
                            attempt=attempt,
                            data=(
                                telemetry
                                if isinstance(
                                    telemetry,
                                    dict,
                                )
                                else None
                            ),
                        )
                    )

            # -------------------------------------------------
            # Final job state
            # -------------------------------------------------

            job.successful_items = successful
            job.failed_items = failed

            if failed == 0:
                job.status = "completed"

                final_event = "job_completed"

                message = (
                    "Scraping job completed successfully."
                )
            else:
                job.status = (
                    "completed_with_errors"
                )

                final_event = (
                    "job_completed_with_errors"
                )

                message = (
                    "Scraping job completed with errors."
                )

            job.completed_at = (
                datetime.now(timezone.utc)
            )

            db.commit()

            execution_events.emit(
                self.job_id,
                final_event,
                message,
                status=job.status,
                data={
                    "total_items": len(targets),
                    "successful_items": successful,
                    "failed_items": failed,
                },
            )

            print(
                "\n"
                "========================================\n"
                f"[worker] JOB {job.id} COMPLETE\n"
                f"[worker] successful={successful}\n"
                f"[worker] failed={failed}\n"
                "========================================\n"
            )

        except Exception as exc:
            db.rollback()

            print(
                f"[worker] JOB ERROR "
                f"{self.job_id}: {exc}"
            )

            job = self._get_job(db)

            if job is not None:
                job.status = "failed"
                job.error_message = str(exc)
                job.completed_at = (
                    datetime.now(timezone.utc)
                )

                db.commit()

            execution_events.emit(
                self.job_id,
                "job_failed",
                "Scraping job failed.",
                status="failed",
                data={
                    "error": str(exc),
                },
            )

        finally:
            await self.browser_service.stop()
            db.close()

    # =========================================================
    # Target processing
    # =========================================================

    async def _process_target(
        self,
        target_id: int,
        target_url: str,
        semaphore: asyncio.Semaphore,
        max_retries: int,
        selectors: dict | None,
    ) -> dict:

        async with semaphore:
            db = SessionLocal()

            try:
                target = (
                    db.query(
                        ScrapingTarget
                    )
                    .filter(
                        ScrapingTarget.id
                        == target_id
                    )
                    .first()
                )

                if target is not None:
                    target.status = "running"

                    target.started_at = (
                        datetime.now(
                            timezone.utc
                        )
                    )

                    db.commit()

            finally:
                db.close()

            last_telemetry = None

            # max_retries means additional retries.
            # Therefore attempts are 1..max_retries+1.
            for attempt in range(
                1,
                max_retries + 2,
            ):
                context = None
                status_code = None

                proxy_config = (
                    self.proxy_manager
                    .get_proxy_for_target(
                        target_id
                    )
                )

                proxy_label = (
                    self._safe_proxy_label(
                        proxy_config
                    )
                )

                telemetry = ExecutionTelemetry(
                    target_id=target_id,
                    url=target_url,
                )

                telemetry.mark_started(
                    attempt=attempt,
                    proxy=proxy_label,
                )

                execution_events.emit(
                    self.job_id,
                    "target_started",
                    "Target execution started.",
                    target_id=target_id,
                    session_id=(
                        telemetry.session_id
                    ),
                    status="running",
                    attempt=attempt,
                    proxy=proxy_label,
                )

                db = SessionLocal()

                try:
                    # -----------------------------------------
                    # Update target attempt
                    # -----------------------------------------

                    target = (
                        db.query(
                            ScrapingTarget
                        )
                        .filter(
                            ScrapingTarget.id
                            == target_id
                        )
                        .first()
                    )

                    if target is not None:
                        target.attempt = attempt
                        db.commit()

                    # -----------------------------------------
                    # Create isolated browser context
                    # -----------------------------------------

                    context = (
                        await self.browser_service
                        .create_context(
                            proxy_config=proxy_config
                        )
                    )

                    # IMPORTANT:
                    # BrowserService owns the real session ID.
                    # Use that same ID in telemetry/events.
                    telemetry.session_id = getattr(
                        context,
                        "careerpilot_session_id",
                        telemetry.session_id,
                    )

                    page = (
                        await self.browser_service
                        .create_page(
                            context
                        )
                    )

                    execution_events.emit(
                        self.job_id,
                        "session_created",
                        "Isolated browser session created.",
                        target_id=target_id,
                        session_id=(
                            telemetry.session_id
                        ),
                        status="running",
                        attempt=attempt,
                        proxy=proxy_label,
                    )

                    print(
                        f"[worker] TARGET "
                        f"{target_id} "
                        f"attempt={attempt} "
                        f"session="
                        f"{telemetry.session_id}"
                    )

                    # -----------------------------------------
                    # Navigation
                    # -----------------------------------------

                    response = await page.goto(
                        target_url,
                        wait_until="domcontentloaded",
                        timeout=30_000,
                    )

                    status_code = (
                        response.status
                        if response is not None
                        else None
                    )

                    execution_events.emit(
                        self.job_id,
                        "navigation_completed",
                        "Page navigation completed.",
                        target_id=target_id,
                        session_id=(
                            telemetry.session_id
                        ),
                        status="running",
                        attempt=attempt,
                        proxy=proxy_label,
                        http_status=status_code,
                    )

                    # Give dynamic pages a short
                    # opportunity to finish loading.
                    try:
                        await page.wait_for_load_state(
                            "networkidle",
                            timeout=5_000,
                        )
                    except Exception:
                        pass

                    # -----------------------------------------
                    # Protection detection
                    # -----------------------------------------

                    protection = (
                        await ProtectionDetector.inspect(
                            page,
                            http_status=status_code,
                        )
                    )

                    if protection.detected:
                        failure_type = (
                            protection.failure_type
                            or "protection_challenge"
                        )

                        reason = (
                            protection.reason
                            or "Protection detected."
                        )

                        error_message = (
                            f"{failure_type}: "
                            f"{reason}"
                        )

                        telemetry.mark_failed(
                            error=error_message,
                            failure_type=failure_type,
                            http_status=status_code,
                        )

                        last_telemetry = (
                            telemetry.to_dict()
                        )

                        retry = should_retry(
                            failure_type=failure_type,
                            attempt=attempt,
                            max_retries=max_retries,
                        )

                        execution_events.emit(
                            self.job_id,
                            "protection_detected",
                            (
                                "Access protection detected; "
                                "no bypass attempted."
                            ),
                            target_id=target_id,
                            session_id=(
                                telemetry.session_id
                            ),
                            status="failed",
                            attempt=attempt,
                            proxy=proxy_label,
                            http_status=status_code,
                            duration_ms=(
                                telemetry.duration_ms
                            ),
                            data={
                                "failure_type": (
                                    failure_type
                                ),
                                "reason": reason,
                                "will_retry": retry,
                            },
                        )

                        if retry:
                            delay = (
                                retry_delay_seconds(
                                    failure_type=(
                                        failure_type
                                    ),
                                    attempt=attempt,
                                )
                            )

                            execution_events.emit(
                                self.job_id,
                                "target_retry_scheduled",
                                (
                                    "Retry scheduled after "
                                    "protection response."
                                ),
                                target_id=target_id,
                                session_id=(
                                    telemetry.session_id
                                ),
                                status="retrying",
                                attempt=attempt,
                                proxy=proxy_label,
                                http_status=status_code,
                                data={
                                    "failure_type": (
                                        failure_type
                                    ),
                                    "retry_delay_seconds": (
                                        delay
                                    ),
                                },
                            )

                            await asyncio.sleep(delay)

                            continue

                        target = (
                            db.query(
                                ScrapingTarget
                            )
                            .filter(
                                ScrapingTarget.id
                                == target_id
                            )
                            .first()
                        )

                        if target is not None:
                            target.status = "failed"

                            target.error_message = (
                                f"[{failure_type}] "
                                f"{reason}"
                            )

                            target.completed_at = (
                                datetime.now(
                                    timezone.utc
                                )
                            )

                            db.commit()

                        return {
                            "success": False,
                            "target_id": target_id,
                            "url": target_url,
                            "error": error_message,
                            "attempt": attempt,
                            "telemetry": (
                                last_telemetry
                            ),
                        }

                    # -----------------------------------------
                    # Extraction
                    # -----------------------------------------

                    extracted = (
                        await self._extract_page_data(
                            page,
                            selectors,
                        )
                    )

                    structured = extracted[
                        "structured"
                    ]

                    generic = extracted[
                        "generic"
                    ]

                    title = (
                        structured.get("title")
                        or generic.get("title")
                    )

                    content = generic.get(
                        "content",
                        "",
                    )

                    # -----------------------------------------
                    # Successful telemetry
                    # -----------------------------------------

                    telemetry.mark_success(
                        http_status=status_code
                    )

                    telemetry_data = (
                        telemetry.to_dict()
                    )

                    data = {
                        "item_id": structured.get(
                            "item_id"
                        ),
                        "title": structured.get(
                            "title"
                        ),
                        "description": structured.get(
                            "description"
                        ),
                        "price": structured.get(
                            "price"
                        ),
                        "category": structured.get(
                            "category"
                        ),
                        "url": page.url,
                        "http_status": status_code,
                        "content_length": len(
                            content
                        ),
                        "target_id": target_id,
                        "attempt": attempt,
                        "session_id": (
                            telemetry.session_id
                        ),
                        "proxy": proxy_label,
                        "duration_ms": (
                            telemetry.duration_ms
                        ),
                        "links": generic.get(
                            "links",
                            [],
                        ),
                        "telemetry": (
                            telemetry_data
                        ),
                    }

                    # -----------------------------------------
                    # Update target success
                    # -----------------------------------------

                    target = (
                        db.query(
                            ScrapingTarget
                        )
                        .filter(
                            ScrapingTarget.id
                            == target_id
                        )
                        .first()
                    )

                    if target is not None:
                        target.status = "success"
                        target.error_message = None
                        target.completed_at = (
                            datetime.now(
                                timezone.utc
                            )
                        )

                        db.commit()

                    execution_events.emit(
                        self.job_id,
                        "target_completed",
                        (
                            "Target scraped and "
                            "structured successfully."
                        ),
                        target_id=target_id,
                        session_id=(
                            telemetry.session_id
                        ),
                        status="success",
                        attempt=attempt,
                        proxy=proxy_label,
                        http_status=status_code,
                        duration_ms=(
                            telemetry.duration_ms
                        ),
                        data={
                            "item_id": structured.get(
                                "item_id"
                            ),
                            "title": structured.get(
                                "title"
                            ),
                            "description": structured.get(
                                "description"
                            ),
                            "price": structured.get(
                                "price"
                            ),
                            "category": structured.get(
                                "category"
                            ),
                        },
                    )

                    print(
                        f"[worker] SUCCESS "
                        f"target={target_id} "
                        f"status={status_code} "
                        f"item="
                        f"{structured.get('item_id')} "
                        f"attempt={attempt} "
                        f"duration="
                        f"{telemetry.duration_ms}ms"
                    )

                    return {
                        "success": True,
                        "target_id": target_id,
                        "url": target_url,
                        "title": title,
                        "content": content,
                        "data": data,
                        "attempt": attempt,
                        "telemetry": telemetry_data,
                    }

                except Exception as exc:
                    db.rollback()

                    failure_type, error_message = (
                        classify_exception(exc)
                    )

                    telemetry.mark_failed(
                        error=error_message,
                        failure_type=failure_type,
                        http_status=status_code,
                    )

                    last_telemetry = (
                        telemetry.to_dict()
                    )

                    retry = should_retry(
                        failure_type=failure_type,
                        attempt=attempt,
                        max_retries=max_retries,
                    )

                    execution_events.emit(
                        self.job_id,
                        "target_attempt_failed",
                        "Target attempt failed.",
                        target_id=target_id,
                        session_id=(
                            telemetry.session_id
                        ),
                        status="failed",
                        attempt=attempt,
                        proxy=proxy_label,
                        http_status=status_code,
                        duration_ms=(
                            telemetry.duration_ms
                        ),
                        data={
                            "error": error_message,
                            "failure_type": (
                                failure_type
                            ),
                            "will_retry": retry,
                        },
                    )

                    print(
                        f"[worker] FAILED "
                        f"target={target_id} "
                        f"attempt={attempt} "
                        f"type={failure_type} "
                        f"error={error_message}"
                    )

                    if not retry:
                        target = (
                            db.query(
                                ScrapingTarget
                            )
                            .filter(
                                ScrapingTarget.id
                                == target_id
                            )
                            .first()
                        )

                        if target is not None:
                            target.status = "failed"

                            target.error_message = (
                                f"[{failure_type}] "
                                f"{error_message}"
                            )

                            target.completed_at = (
                                datetime.now(
                                    timezone.utc
                                )
                            )

                            db.commit()

                        execution_events.emit(
                            self.job_id,
                            "target_failed",
                            "Target permanently failed.",
                            target_id=target_id,
                            session_id=(
                                telemetry.session_id
                            ),
                            status="failed",
                            attempt=attempt,
                            proxy=proxy_label,
                            http_status=status_code,
                            duration_ms=(
                                telemetry.duration_ms
                            ),
                            data={
                                "failure_type": (
                                    failure_type
                                ),
                                "error": error_message,
                            },
                        )

                        return {
                            "success": False,
                            "target_id": target_id,
                            "url": target_url,
                            "error": error_message,
                            "attempt": attempt,
                            "telemetry": (
                                last_telemetry
                            ),
                        }

                    delay = retry_delay_seconds(
                        failure_type=failure_type,
                        attempt=attempt,
                    )

                    execution_events.emit(
                        self.job_id,
                        "target_retry_scheduled",
                        "Target retry scheduled.",
                        target_id=target_id,
                        session_id=(
                            telemetry.session_id
                        ),
                        status="retrying",
                        attempt=attempt,
                        proxy=proxy_label,
                        http_status=status_code,
                        data={
                            "failure_type": (
                                failure_type
                            ),
                            "retry_delay_seconds": (
                                delay
                            ),
                        },
                    )

                    await asyncio.sleep(delay)

                finally:
                    if context is not None:
                        try:
                            await (
                                self.browser_service
                                .close_context(
                                    context
                                )
                            )
                        except Exception as close_error:
                            print(
                                "[worker] Context "
                                "cleanup error: "
                                f"{close_error}"
                            )

                    db.close()

            return {
                "success": False,
                "target_id": target_id,
                "url": target_url,
                "error": (
                    "Worker exited without result."
                ),
                "attempt": max_retries + 1,
                "telemetry": last_telemetry,
            }


async def run_scraping_job(
    job_id: int,
) -> None:
    worker = ScrapingWorker(job_id)
    await worker.run()