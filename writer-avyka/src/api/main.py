
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from src.config.settings import get_settings
from src.providers.llm_router import get_llm_client
from src.retrieval.writer_rag import get_query_engine
from src.processing.pdf_extract import extract_text_from_pdf
from src.agents.writer.revenue_agent import RevenueAgent

app = FastAPI(title="Writer×Avyka RAG Agents API")
settings = get_settings()
llm = get_llm_client(settings)
query_engine = get_query_engine(settings)
revenue_agent = RevenueAgent(settings, llm, query_engine)

class AskRequest(BaseModel):
    query: str

@app.get("/health")
def health():
    return {"status": "ok", "env": settings.APP_ENV}

@app.post("/ask")
def ask(payload: AskRequest):
    resp = query_engine.query(payload.query)
    return {"answer": str(resp)}

@app.post("/ingest/pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text_from_pdf(content)
    # TODO: persist and update index
    return {"file": file.filename, "chars": len(text)}

@app.get("/revenue/monthly")
def revenue_monthly(year: int, month: int):
    return revenue_agent.get_monthly_revenue(year, month)
