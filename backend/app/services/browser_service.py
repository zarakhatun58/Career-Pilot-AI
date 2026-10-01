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
    Manages Playwright browser lifecycle and isolated sessions.

    Each browser context can optionally receive its own proxy.
    No proxy is used when proxy_config is None.
    """

    def __init__(self) -> None:
        self._playwright: Playwright | None = None
        self._browser: Browser | None = None

    async def start(self) -> None:
        if self._browser is not None:
            return

        self._playwright = await async_playwright().start()

        self._browser = await self._playwright.chromium.launch(
            headless=True,
        )

    async def create_context(
        self,
        proxy_config: ProxyConfig | None = None,
    ) -> BrowserContext:
        if self._browser is None:
            await self.start()

        if self._browser is None:
            raise RuntimeError(
                "Playwright browser failed to start."
            )

        context_options = {
            "viewport": {
                "width": 1440,
                "height": 900,
            },
            "ignore_https_errors": False,
        }

        if proxy_config is not None:
            context_options["proxy"] = (
                proxy_config.to_playwright_proxy()
            )

        return await self._browser.new_context(
            **context_options,
        )

    async def create_page(
        self,
        context: BrowserContext,
    ) -> Page:
        return await context.new_page()

    async def close_context(
        self,
        context: BrowserContext,
    ) -> None:
        await context.close()

    async def stop(self) -> None:
        if self._browser is not None:
            await self._browser.close()
            self._browser = None

        if self._playwright is not None:
            await self._playwright.stop()
            self._playwright = None