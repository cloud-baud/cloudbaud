
# Writer × Avyka — Enterprise RAG + Agent Template (Full Stack)

**Purpose-built for interviews & delivery at Writer (SF) with Avyka as implementation partner.**

End-to-end repository for **RAG + Agentic** systems using **Writer Palmyra** models (via API), **LlamaIndex** retrieval, **LangChain/LangGraph** agents, and **governance + evaluation** built-in. Shipping as a **FastAPI** microservice with **Docker**, **CI/CD**, and stubs for **Azure Container Apps** deployment.

## Highlights
- **Writer provider** with `palmyra-x5` default & env-driven routing
- **Knowledge ingestion** endpoints & **Writer-style RAG** with citations
- **Agent pack**: rewriting, classification, revenue-extraction
- **Governance**: guardrails, PII masking, prompt versioning, audit logs
- **Eval**: unit tests + offline eval harness with sample datasets
- **Ops**: Docker, Compose (Qdrant+MLflow), GitHub Actions CI; Azure deploy stub

> Swap vector store to **Azure AI Search** with the documented adapter in `docs/azure-search.md`.
