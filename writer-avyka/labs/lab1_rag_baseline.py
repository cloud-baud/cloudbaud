
from pathlib import Path
from pypdf import PdfReader

# 1. Load PDFs from your local folder
PDF_FOLDER = Path("D:/Users/Jishn/OneDrive - CloudBaud, LLC/Documents - Taxes/2025/Columbia Statements/PDFs")
pdf_files = list(PDF_FOLDER.glob("*.pdf"))

def extract_text(pdf_path):
    reader = PdfReader(str(pdf_path))
    text = []
    for page in reader.pages:
        text.append(page.extract_text() or "")
    return "\n".join(text)

all_text = []
for pdf in pdf_files:
    content = extract_text(pdf)
    all_text.append({"name": pdf.stem, "text": content})

print(f"Loaded {len(all_text)} PDFs.")

# 2. Build a simple RAG index
from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.llms import MockLLM

# Start configuring Settings
# Use a MockLLM to avoid needing an API key for this baseline test
Settings.llm = MockLLM()
Settings.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

documents = [Document(text=d["text"], metadata={"source": d["name"]}) for d in all_text]

index = VectorStoreIndex.from_documents(documents)

retriever = index.as_retriever(similarity_top_k=3)

# 3. Query your data (Retrieval Only)
q = "What is my consulting revenue for June 2025?"

# LET'S SEE THE NUMBERS!
query_embedding = Settings.embed_model.get_query_embedding(q)
print(f"\n=== BEHIND THE SCENES: THE 'NUMBERS' ===")
print(f"The phrase '{q}' was converted into a list of {len(query_embedding)} numbers.")
print(f"Here are the first 10 numbers:\n{query_embedding[:10]}...")

nodes = retriever.retrieve(q)

print(f"\n=== RETRIEVED TEXT FOR: '{q}' ===")
for i, node in enumerate(nodes, 1):
    print(f"\n--- Result {i} (Source: {node.metadata['source']}) ---")
    print(f"Match Score: {node.score:.4f} (1.0 is a perfect match)")
    print(node.get_content()[:500] + "...")  # Print first 500 chars
