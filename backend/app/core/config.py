from functools import lru_cache
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("backend/.env", ".env"), extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = Field(default="smart_pantry", validation_alias=AliasChoices("mongodb_db", "mongodb_database"))
    jwt_secret: str = "smart-pantry-production-secure-jwt-key-256bit-entropy"
    jwt_alg: str = "HS256"
    access_ttl_min: int = 60
    refresh_ttl_days: int = 30
    admin_emails: str = ""
    cors_origins: str = "*"
    storage_dir: str = "storage"

    llm_provider: str = "groq"  # groq | gemini | openrouter | none
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free"

    # Optional legacy providers
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-5-5"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    @property
    def admin_email_set(self) -> set[str]:
        return {e.strip().lower() for e in self.admin_emails.split(",") if e.strip()}


@lru_cache
def get_settings() -> Settings:
    return Settings()
