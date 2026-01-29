
import os
from functools import lru_cache
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    APP_ENV: str = os.getenv("APP_ENV", "local")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "writer")
    WRITER_API_KEY: str | None = os.getenv("WRITER_API_KEY")
    WRITER_MODEL: str = os.getenv("WRITER_MODEL", "palmyra-x5")

    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    HF_API_TOKEN: str | None = os.getenv("HF_API_TOKEN")

    EMBEDDINGS_MODEL: str = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

    VECTOR_STORE: str = os.getenv("VECTOR_STORE", "in_memory")
    QDRANT_URL: str | None = os.getenv("QDRANT_URL")
    QDRANT_API_KEY: str | None = os.getenv("QDRANT_API_KEY")
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "writer-rag")

    AZURE_SEARCH_ENDPOINT: str | None = os.getenv("AZURE_SEARCH_ENDPOINT")
    AZURE_SEARCH_API_KEY: str | None = os.getenv("AZURE_SEARCH_API_KEY")
    AZURE_SEARCH_INDEX: str | None = os.getenv("AZURE_SEARCH_INDEX")

    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")

@lru_cache()
def get_settings() -> Settings:
    return Settings()
