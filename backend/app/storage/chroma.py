"""Chroma lookup of ingested textbook chunks."""

import logging

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings

from app.config import CHROMA_DIR, EMBED_MODEL, RETRIEVE_K

_store = None
logger = logging.getLogger(__name__)


class EmptyRetriever(BaseRetriever):
    """Used when Chroma cannot load so the tutor can still answer from the prompt."""

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun | None = None,
    ) -> list[Document]:
        return []


def get_retriever():
    global _store
    try:
        if not CHROMA_DIR.exists():
            raise FileNotFoundError(f"No Chroma index at {CHROMA_DIR}")
        if _store is None:
            embeddings = OllamaEmbeddings(model=EMBED_MODEL)
            _store = Chroma(
                persist_directory=str(CHROMA_DIR),
                embedding_function=embeddings,
            )
        return _store.as_retriever(search_kwargs={"k": RETRIEVE_K})
    except Exception as exc:
        logger.warning("Chroma unavailable (%s). Answering without textbook retrieval.", exc)
        return EmptyRetriever()
