
# Azure AI Search Integration

Use LlamaIndex's Azure AI Search vector store adapter to swap from local/Qdrant to a managed index. See official docs for authentication modes and configuration parameters.

- LlamaIndex Azure AI Search integration docs.
- Microsoft Tech Community article on advanced RAG (pre-, retrieval, post- stages).

Implementation steps:
1. Install the Azure vector store integration packages.
2. Replace `src/retrieval/writer_rag.py` storage context with AzureAI Search vector store.
3. Configure `AZURE_SEARCH_ENDPOINT`, `AZURE_SEARCH_API_KEY`, and `AZURE_SEARCH_INDEX` in `.env`.
