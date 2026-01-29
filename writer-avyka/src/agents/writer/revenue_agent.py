
from src.config.settings import Settings

class RevenueAgent:
    def __init__(self, settings: Settings, llm, query_engine):
        self.settings = settings
        self.llm = llm
        self.query_engine = query_engine

    def get_monthly_revenue(self, year: int, month: int):
        # TODO: use retrieval + extraction prompts via WriterClient
        key = f"{year}-{month:02d}"
        return {"period": key, "amount": None, "status": "not_implemented"}
