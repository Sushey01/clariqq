"""Chroma lookup of ingested textbook chunks."""

from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings

from app.config import CHROMA_DIR, EMBED_MODEL, RETRIEVE_K

_store = None


def get_retriever():
    global _store
    if not CHROMA_DIR.exists():
        raise FileNotFoundError(
            f"No Chroma index at {CHROMA_DIR}. Run backend/scripts/data_ingestion.py first."
        )
    if _store is None:
        embeddings = OllamaEmbeddings(model=EMBED_MODEL)
        _store = Chroma(
            persist_directory=str(CHROMA_DIR),
            embedding_function=embeddings,
        )
    return _store.as_retriever(search_kwargs={"k": RETRIEVE_K})
