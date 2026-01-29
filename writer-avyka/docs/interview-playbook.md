
# Interview Playbook (AI Engineer — Writer × Avyka)

**Goal:** Show you design, implement, and operate enterprise-grade LLM systems that align with Writer's Palmyra models, Knowledge Graph, and governance.

**Storyline:** Bank statements → ingestion → RAG → Writer Agent pack → API → CI/CD → governance → metrics.

**Key talking points**
- Why Writer: Palmyra models (tool-calling, long context) and enterprise governance.
- RAG decisions: chunking, metadata, hybrid search, re-ranking.
- Governance: PII masking, audit trails, prompt versioning, eval harness.
- Ops: CI/CD, containerization, rollout and rollback.

**Demo flow**
1) Upload a PDF to `/ingest/pdf` → see chars count.
2) Ask `/ask` → show RAG answer with citation.
3) Call `/revenue/monthly?year=2025&month=06` → outline agent plan + result (stub OK).

**Follow-ups you should be ready for**
- Swapping vector store to Azure AI Search.
- Cost and latency controls (batching, caching, streaming).
- Data isolation, tenancy, and redaction.
