from dataclasses import dataclass

from playwright.async_api import Page


@dataclass(frozen=True)
class ProtectionResult:
    detected: bool
    failure_type: str | None = None
    reason: str | None = None
    http_status: int | None = None


class ProtectionDetector:
    """
    Detects common access-control and anti-bot challenge responses.

    Detection only:
    this service does not bypass CAPTCHA, Cloudflare,
    DataDome, Kasada, fingerprint checks, or similar controls.
    """

    HTTP_PROTECTION_CODES = {
        403: "http_403",
        429: "http_429",
    }

    TITLE_MARKERS = (
        "access denied",
        "forbidden",
        "verify you are human",
        "checking your browser",
        "just a moment",
        "security check",
        "attention required",
        "captcha",
        "challenge",
    )

    BODY_MARKERS = (
        "access denied",
        "request blocked",
        "too many requests",
        "verify you are human",
        "checking your browser",
        "security check",
        "attention required",
        "captcha",
        "challenge",
        "cf-chl-",
        "cloudflare ray id",
    )

    @classmethod
    async def inspect(
        cls,
        page: Page,
        http_status: int | None = None,
    ) -> ProtectionResult:

        # ---------------------------------------------
        # HTTP-level protection
        # ---------------------------------------------

        if http_status in cls.HTTP_PROTECTION_CODES:
            failure_type = cls.HTTP_PROTECTION_CODES[
                http_status
            ]

            return ProtectionResult(
                detected=True,
                failure_type=failure_type,
                reason=(
                    f"HTTP {http_status} access "
                    "protection response."
                ),
                http_status=http_status,
            )

        # ---------------------------------------------
        # Page title detection
        # ---------------------------------------------

        try:
            title = (
                await page.title()
            ).strip().lower()
        except Exception:
            title = ""

        if title:
            for marker in cls.TITLE_MARKERS:
                if marker in title:
                    return ProtectionResult(
                        detected=True,
                        failure_type=(
                            "protection_challenge"
                        ),
                        reason=(
                            "Protection/challenge "
                            "indicator found in page title: "
                            f"{marker}"
                        ),
                        http_status=http_status,
                    )

        # ---------------------------------------------
        # Body detection
        # ---------------------------------------------

        try:
            body = await page.locator(
                "body"
            ).inner_text(
                timeout=5_000
            )

            body = body[:50_000].lower()

        except Exception:
            body = ""

        if body:
            for marker in cls.BODY_MARKERS:
                if marker in body:
                    return ProtectionResult(
                        detected=True,
                        failure_type=(
                            "protection_challenge"
                        ),
                        reason=(
                            "Protection/challenge "
                            "indicator found in page content: "
                            f"{marker}"
                        ),
                        http_status=http_status,
                    )

        return ProtectionResult(
            detected=False,
            http_status=http_status,
        )


def classify_exception(
    exc: Exception,
) -> tuple[str, str]:
    """
    Convert Playwright/network errors into stable
    dashboard-friendly failure categories.
    """

    message = str(exc)
    lowered = message.lower()

    if (
        "http_403:" in lowered
        or "http 403" in lowered
    ):
        return "http_403", message

    if (
        "http_429:" in lowered
        or "http 429" in lowered
    ):
        return "http_429", message

    if (
        "protection_challenge:" in lowered
        or "challenge" in lowered
        or "captcha" in lowered
        or "cloudflare" in lowered
    ):
        return (
            "protection_challenge",
            message,
        )

    if (
        "timeout" in lowered
        or "timed out" in lowered
    ):
        return "timeout", message

    if "err_connection_refused" in lowered:
        return "connection_error", message

    if (
        "err_connection_reset" in lowered
        or "connection reset" in lowered
    ):
        return "connection_error", message

    if (
        "err_name_not_resolved" in lowered
        or "name_not_resolved" in lowered
    ):
        return "dns_error", message

    if (
        "net::err_" in lowered
        or "navigation" in lowered
    ):
        return "navigation_error", message

    return "unknown", message


def should_retry(
    failure_type: str,
    attempt: int,
    max_retries: int,
) -> bool:
    """
    Decide whether another attempt should be made.

    Protection challenges are terminal for the current target.
    They are detected and reported rather than repeatedly retried.

    Rate limits and transient network failures may be retried
    using bounded backoff.
    """

    if attempt > max_retries:
        return False

    retryable_types = {
        "http_429",
        "timeout",
        "connection_error",
        "dns_error",
        "navigation_error",
        "unknown",
    }

    return failure_type in retryable_types


def retry_delay_seconds(
    failure_type: str,
    attempt: int,
) -> int:
    """
    Return a bounded exponential-backoff delay.
    """

    if failure_type == "http_429":
        return min(
            5 * (2 ** (attempt - 1)),
            30,
        )

    if failure_type in {
        "timeout",
        "connection_error",
        "dns_error",
        "navigation_error",
    }:
        return min(
            2 ** (attempt - 1),
            8,
        )

    return min(
        2 ** (attempt - 1),
        8,
    )