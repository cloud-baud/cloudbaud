
from typing import Any
from src.config.settings import Settings
from src.llms.writer_client import WriterClient

class DummyLLM:
    def generate(self, prompt: str) -> dict:
        return {"text": "stub", "raw": {}}


def get_llm_client(settings: Settings) -> Any:
    prov = settings.LLM_PROVIDER.lower()
    if prov == "writer":
        return WriterClient(api_key=settings.WRITER_API_KEY, model=settings.WRITER_MODEL)
    # Add OpenAI/HF here as needed
    return DummyLLM()
