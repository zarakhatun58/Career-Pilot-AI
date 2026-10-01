import asyncio

from playwright.async_api import async_playwright


async def main():
    print("Starting Playwright...")

    async with async_playwright() as p:
        print("Playwright started.")

        browser = await p.chromium.launch(
            headless=True,
        )

        print("Chromium started.")

        page = await browser.new_page()

        response = await page.goto(
            "https://example.com/",
            wait_until="domcontentloaded",
            timeout=30_000,
        )

        print("HTTP status:", response.status if response else None)
        print("Title:", await page.title())

        await browser.close()

        print("Playwright test completed successfully.")


if __name__ == "__main__":
    asyncio.set_event_loop_policy(
        asyncio.WindowsProactorEventLoopPolicy()
    )

    asyncio.run(main())