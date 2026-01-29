
# Portfolio Update: Enterprise AI Engineering — RAG + Agents (Writer × Avyka)

I designed and shipped a production-ready **RAG + Agentic** microservice aligned to **Writer’s Palmyra** models and enterprise governance. It ingests bank statements (PDF), auto-tags and extracts monthly consulting revenue, and exposes a FastAPI API with CI/CD and Azure deployment stubs.

**Highlights**
- Writer provider support (Palmyra X5), tool-calling ready, structured outputs
- LlamaIndex retrieval with citations; pluggable vector store (Qdrant/Azure AI Search)
- Agent pack for rewriting, classification, and financial extraction
- Governance: guardrails, audit logs, PII masking, MLflow tracking
- Docker + GitHub Actions + Azure Container Apps deployment path
