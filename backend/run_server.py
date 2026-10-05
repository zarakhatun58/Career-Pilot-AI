import asyncio
import os
import platform

import uvicorn


if __name__ == "__main__":
    # Playwright works more reliably with ProactorEventLoop on Windows.
    if platform.system() == "Windows":
        asyncio.set_event_loop_policy(
            asyncio.WindowsProactorEventLoopPolicy()
        )

    port = int(os.environ.get("PORT", "8000"))

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
    )