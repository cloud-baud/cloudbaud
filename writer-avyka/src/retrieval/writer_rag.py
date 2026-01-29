
from llama_index.core import VectorStoreIndex, Document, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores import SimpleVectorStore
from pathlib import Path
from src.config.settings import Settings

_index = None

def build_index(settings: Settings) -> VectorStoreIndex:
    docs = []
    processed_dir = Path("data/processed")
    for p in processed_dir.glob("*.txt"):
        docs.append(Document(text=p.read_text(), metadata={"source": str(p)}))
    embed_model = HuggingFaceEmbedding(model_name=settings.EMBEDDINGS_MODEL)
    storage_context = StorageContext.from_defaults(vector_store=SimpleVectorStore())
    return VectorStoreIndex.from_documents(docs, storage_context=storage_context, embed_model=embed_model)


def get_query_engine(settings: Settings):
    global _index
    if _index is None:
        _index = build_index(settings)
    return _index.as_query_engine()
