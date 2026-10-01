from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CareerPilot AI"
    app_version: str = "0.1.0"
    environment: str = "development"

    database_url: str

    frontend_url: str = "http://localhost:3000"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"

    openai_api_key: str | None = None
    openai_model: str | None = None

    # ---------------------------------------------------------
    # Web automation / scraping
    # ---------------------------------------------------------

    # Comma-separated proxy URLs.
    #
    # Example:
    # SCRAPING_PROXIES=http://127.0.0.1:8080,http://127.0.0.1:8081
    #
    # With authentication:
    # SCRAPING_PROXIES=http://user:password@127.0.0.1:8080
    #
    # Leave empty to use a direct connection.
    scraping_proxies: str = ""

    scraping_proxy_enabled: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()