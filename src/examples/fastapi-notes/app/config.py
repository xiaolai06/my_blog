from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="NOTES_", env_file=".env", extra="ignore"
    )

    database_url: str = "sqlite:///./notes.db"
    api_key: SecretStr = Field(min_length=16)
    allowed_origin: str = "http://localhost:3000"
