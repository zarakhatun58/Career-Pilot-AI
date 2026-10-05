import asyncio
import platform

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.resumes import router as resumes_router
from app.api.routes.ats import router as ats_router
from app.api.routes.scraping import router as scraping_router
from app.core.config import settings


# Playwright on Windows benefits from the Proactor event loop.
# Render/Linux uses the default asyncio event loop.
if platform.system() == "Windows":
    asyncio.set_event_loop_policy(
        asyncio.WindowsProactorEventLoopPolicy()
    )


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)


# CORS
# FRONTEND_URL is configured through the environment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(ats_router, prefix="/api")
app.include_router(scraping_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Welcome to CareerPilot AI API",
        "version": settings.app_version,
        "environment": settings.environment,
    }