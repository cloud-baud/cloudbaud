
# Architecture (Writer-aligned)

```mermaid
flowchart LR
  SP[SharePoint / Sources] --> INJ[Ingestion]
  INJ --> PROC[PDF/Text Processing]
  PROC --> IDX[(Index: LlamaIndex + Vector Store)]
  IDX --> RAG[RAG Orchestrator]
  RAG --> AGENTS[Writer Agents (Rewrite / Classify / Revenue)]
  AGENTS --> API[FastAPI]
  API --> UI[Client / Sites]
  AGENTS --> GOV[Governance: Guardrails + Audit]
  AGENTS --> MLF[MLflow]
```

- **Palmyra models** via Writer API
- **Knowledge Graph-ready** ingestion (stub)
- **Governance** for enterprise deployments
