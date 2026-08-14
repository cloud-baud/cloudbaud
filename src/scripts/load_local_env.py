"""Prefer `.env.test`, then `.env`; no files when NETLIFY=true (use injected env)."""
from __future__ import annotations

import os
from pathlib import Path


def load_local_env() -> None:
    if os.environ.get("NETLIFY") == "true":
        return
    root = Path(__file__).resolve().parent.parent
    for name in (".env.test", ".env"):
        path = root / name
        if path.is_file():
            from dotenv import load_dotenv

            load_dotenv(path)
            return
