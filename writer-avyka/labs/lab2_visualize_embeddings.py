
from pathlib import Path
from pypdf import PdfReader
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
import numpy as np

# 1. Setup LlamaIndex (MockLLM for safety)
from llama_index.core import Document, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.llms import MockLLM

Settings.llm = MockLLM()
Settings.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. Load Data
PDF_FOLDER = Path("D:/Users/Jishn/OneDrive - CloudBaud, LLC/Documents - Taxes/2025/Columbia Statements/PDFs")
pdf_files = list(PDF_FOLDER.glob("*.pdf"))

def extract_text(pdf_path):
    try:
        reader = PdfReader(str(pdf_path))
        text = []
        for page in reader.pages:
            text.append(page.extract_text() or "")
        return "\n".join(text)
    except Exception:
        return ""

print("Loading and embedding documents...")
documents = []
doc_names = []
embeddings = []

for pdf in pdf_files:
    text = extract_text(pdf)
    if text.strip():
        # Get embedding directly
        emb = Settings.embed_model.get_text_embedding(text)
        embeddings.append(emb)
        doc_names.append(pdf.stem)
        documents.append(text)

# 3. Embed the Query
query = "What is my consulting revenue for June 2025?"
query_embedding = Settings.embed_model.get_query_embedding(query)

# Add query to the list for PCA (so it's in the same vector space)
all_embeddings = np.array(embeddings + [query_embedding])

# 4. Reduce Dimensions (384 -> 2)
print("Calculating PCA...")
pca = PCA(n_components=2)
reduced_data = pca.fit_transform(all_embeddings)

# Split back into docs and query
doc_coords = reduced_data[:-1]
query_coord = reduced_data[-1]

# 5. Plot
plt.figure(figsize=(12, 8))

# Draw dots
plt.scatter(doc_coords[:, 0], doc_coords[:, 1], c='blue', label='Documents', alpha=0.6, s=100)
plt.scatter(query_coord[0], query_coord[1], c='red', label='Query', marker='X', s=200)

# --- NEW: DRAW LINES TO NEAREST 3 ---
# Calculate Euclidean distance in 2D space for visualization
distances_2d = np.linalg.norm(doc_coords - query_coord, axis=1)
nearest_indices = distances_2d.argsort()[:3]

print("\nConnections drawn to:")
for idx in nearest_indices:
    print(f"- {doc_names[idx]}")
    # Draw a dashed red line
    plt.plot([query_coord[0], doc_coords[idx, 0]], 
             [query_coord[1], doc_coords[idx, 1]], 
             color='red', linestyle='--', alpha=0.5, linewidth=1.5)
# ------------------------------------

# Label points
for i, name in enumerate(doc_names):
    # Shorten name for display
    short_name = name.replace("4386-Could Baud, LLC-", "")
    plt.text(doc_coords[i, 0]+0.02, doc_coords[i, 1]+0.02, short_name, fontsize=9)

plt.text(query_coord[0]+0.02, query_coord[1]+0.02, "QUERY: Consulting Revenue June", fontsize=10, fontweight='bold', color='red')

plt.title(f"RAG Concept Map: Query vs Documents\n(Lines connect Query to the 3 closest matches)")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
plt.grid(True, linestyle='--', alpha=0.3)
plt.legend()

output_file = Path("embedding_concept_map_connected.png")
plt.savefig(output_file)
print(f"Concept map saved to: {output_file.absolute()}")
