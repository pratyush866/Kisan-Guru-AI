import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "9a7c36192db84b2e88a562137bc0f70c3298a8342718e809cd8015c928de6840"

    POSTGRES_USER: str = "kisan_guru_admin"
    POSTGRES_PASSWORD: str = "kisan_secure_db_pass_2026"
    POSTGRES_DB: str = "kisan_guru_prod"
    POSTGRES_HOST: str = "127.0.0.1"
    POSTGRES_PORT: int = 5432
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Supabase & Cloud Database Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_DB_URL: str = ""

    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "kisan_secure_redis_pass_2026"

    YOLO_CONFIDENCE_THRESHOLD: float = 0.75
    WHISPER_MODEL_PATH: str = "models/whisper_base_indian.onnx"
    LLM_API_KEY: str = "sk-placeholder-key"
    VECTOR_DB_URL: str = "http://localhost:6333"
    WEATHER_API_KEY: str = "placeholder"
    GEMINI_API_KEY: str = "placeholder"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def database_url(self) -> str:
        # Check explicit Supabase DB URL first
        if self.SUPABASE_DB_URL and self.SUPABASE_DB_URL.strip():
            url = self.SUPABASE_DB_URL.strip()
            if url.startswith("postgresql://"):
                return "postgresql+asyncpg://" + url[len("postgresql://"):]
            elif url.startswith("postgres://"):
                return "postgresql+asyncpg://" + url[len("postgres://"):]
            elif not url.startswith("postgresql+asyncpg://") and not url.startswith("sqlite"):
                return "postgresql+asyncpg://" + url
            return url

        if self.ENV == "production":
            return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            
        return "sqlite+aiosqlite:///./kisan_guru_dev.db"

# Instantiated single-use configuration object
settings = Settings()
