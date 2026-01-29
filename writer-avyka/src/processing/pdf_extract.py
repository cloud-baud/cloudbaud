
from io import BytesIO
from pypdf import PdfReader
import re

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))
    text = []
    for page in reader.pages:
        text.append(page.extract_text() or "")
    return "
".join(text)

REVENUE_PATTERN = re.compile(r"(?i)(consulting|services).*?\$?([0-9,.]+)")

def extract_revenue_amount(text: str) -> float | None:
    m = REVENUE_PATTERN.search(text)
    if not m:
        return None
    amt = m.group(2).replace(",", "")
    try:
        return float(amt)
    except ValueError:
        return None
