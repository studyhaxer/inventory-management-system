from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    ENV: str = "development"

    DATABASE_URL: str = "sqlite:///./inventory_db.db"

    SECRET_KEY: str = "justatemporarysecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


    model_config = SettingsConfigDict(
    env_file=os.path.join(os.path.dirname(__file__), ".env"),
    env_file_encoding="utf-8",
)

    def validate_production(self):
        """Fail fast if required secrets are missing in production."""
        if self.ENV == "production":
            missing = []
            if not self.SECRET_KEY or self.SECRET_KEY == "justatemporarysecretkey":
                missing.append("SECRET_KEY")
            if not self.DATABASE_URL or self.DATABASE_URL.startswith("sqlite"):
                missing.append("DATABASE_URL")
            if missing:
                raise RuntimeError(f"Missing required production settings: {', '.join(missing)}")


settings = Settings()
settings.validate_production()