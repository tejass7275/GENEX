from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret: str
    jwt_expire_minutes: int = 60 * 24
    google_client_id: str
    frontend_origin: str = "http://localhost:5173"

    web3_service_url: str = "http://localhost:3001"
    web3_service_key: str = "dev-key"
    web3_mock: bool = False

    tsa_url: str = "https://freetsa.org/tsr"
    ai_provider: str = "mock"  # mock | reality_defender
    reality_defender_api_key: str = ""
    reality_defender_base_url: str = "https://api.prd.realitydefender.xyz"

    anchor_interval_minutes: int = 60
    phash_max_distance: int = 10
    irys_gateway: str = "https://gateway.irys.xyz"
    media_tmp_dir: str = "tmp_media"
    max_media_mb: int = 50


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

