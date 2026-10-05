from __future__ import annotations

from uuid import uuid4

from playwright.async_api import (
    Browser,
    BrowserContext,
    Page,
    Playwright,
    async_playwright,
)

from app.services.proxy_manager import ProxyConfig


class BrowserService:
    """
    Manages Playwright browser lifecycle and isolated scraping sessions.

    Architecture:
    - One shared Chromium browser process.
    - One isolated BrowserContext per scraping target/attempt.
    - Optional proxy per context.
    - Configurable session metadata for consistent browser sessions.
    - No anti-bot bypass or stealth fingerprint spoofing.
    """

    def __init__(self) -> None:
        self._playwright: Playwright | None = None
        self._browser: Browser | None = None

    async def start(self) -> None:
        """Start the shared Playwright Chromium browser."""
        if self._browser is not None:
            return

        self._playwright = await async_playwright().start()

        self._browser = await self._playwright.chromium.launch(
            headless=True,
        )

    async def create_context(
        self,
        proxy_config: ProxyConfig | None = None,
        *,
        user_agent: str | None = None,
        locale: str = "en-US",
        timezone_id: str = "UTC",
        color_scheme: str = "dark",
    ) -> BrowserContext:
        """
        Create an isolated browser session.

        Every call creates a fresh BrowserContext, so cookies,
        local storage, cache, and session state are isolated.

        A session ID is attached to the context for telemetry/debugging.
        """

        if self._browser is None:
            await self.start()

        if self._browser is None:
            raise RuntimeError(
                "Playwright browser failed to start."
            )

        session_id = f"session-{uuid4().hex[:12]}"

        context_options: dict = {
            "viewport": {
                "width": 1440,
                "height": 900,
            },
            "locale": locale,
            "timezone_id": timezone_id,
            "color_scheme": color_scheme,
            "ignore_https_errors": False,
            "extra_http_headers": {
                "X-CareerPilot-Session": session_id,
            },
        }

        if user_agent:
            context_options["user_agent"] = user_agent

        if proxy_config is not None:
            context_options["proxy"] = (
                proxy_config.to_playwright_proxy()
            )

        context = await self._browser.new_context(
            **context_options,
        )

        # Keep the session ID available to the worker/telemetry layer.
        setattr(context, "careerpilot_session_id", session_id)

        return context

    async def create_page(
        self,
        context: BrowserContext,
    ) -> Page:
        """Create a page inside an isolated browser context."""
        return await context.new_page()

    async def close_context(
        self,
        context: BrowserContext,
    ) -> None:
        """Close one isolated scraping session."""
        await context.close()

    async def stop(self) -> None:
        """Close the shared browser and Playwright runtime."""
        if self._browser is not None:
            await self._browser.close()
            self._browser = None

        if self._playwright is not None:
            await self._playwright.stop()
            self._playwright = None