
import httpx
from typing import Any, Dict

class WriterClient:
    def __init__(self, api_key: str | None, model: str = "palmyra-x5", base_url: str = "https://api.writer.com/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url

    async def acomplete(self, messages: list[dict], **kwargs) -> Dict[str, Any]:
        # Async chat completion wrapper
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {"model": self.model, "messages": messages} | kwargs
        async with httpx.AsyncClient() as client:
            r = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload, timeout=60)
            r.raise_for_status()
            return r.json()

    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        # Sync convenience wrapper (non-streaming)
        import requests
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {"model": self.model, "input": prompt} | kwargs
        r = requests.post(f"{self.base_url}/generate", headers=headers, json=payload, timeout=60)
        r.raise_for_status()
        return r.json()
