from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    app_name: str = "DClaw Audit"
    app_env: str = "dev"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_audit"

    # Auth
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60
    disable_auth: bool = True
    logto_endpoint: str = ""
    logto_audience: str = ""

    # AI
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.1-8b-instruct"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"

    # Demo mode (landing-page seed/reset). Off by default; enable with ENABLE_DEMO_MODE=true.
    enable_demo_mode: bool = False
    demo_owner_email: str = "demo@dclawstack.io"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # MinIO / object storage
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "dclaw-audit-files"
    minio_use_ssl: bool = False

    # File upload
    upload_dir: str = "/tmp/dclaw_uploads"
    max_upload_size_mb: int = 50


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
