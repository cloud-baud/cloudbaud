
from src.processing.pdf_extract import extract_revenue_amount

def test_extract_revenue_amount():
    assert extract_revenue_amount("Consulting Revenue: $12,500 received") == 12500.0
