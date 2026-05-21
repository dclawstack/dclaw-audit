from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    app_name: str = "DClaw Audit"
    app_env: str = "dev"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_audit"

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60

    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.1-8b-instruct"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
