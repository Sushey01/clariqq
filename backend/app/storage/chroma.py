"""Chroma lookup of textbook and student-note chunks."""

import logging

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings

from app.config import CHROMA_DIR, EMBED_MODEL, RETRIEVE_K, SHARED_USER_ID

_store = None
_tagged = False
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


def _embeddings():
    return OllamaEmbeddings(model=EMBED_MODEL)


def _ensure_shared_tags(store: Chroma) -> None:
    """Treat legacy textbook chunks with no user_id as shared curriculum."""
    global _tagged
    if _tagged:
        return
    try:
        collection = store._collection
        result = collection.get(include=["metadatas"])
        ids = result.get("ids") or []
        metadatas = result.get("metadatas") or []
        update_ids = []
        update_metas = []
        for doc_id, meta in zip(ids, metadatas):
            data = dict(meta or {})
            if data.get("user_id"):
                continue
            data["user_id"] = SHARED_USER_ID
            data.setdefault("source_kind", "textbook")
            update_ids.append(doc_id)
            update_metas.append(data)
        if update_ids:
            collection.update(ids=update_ids, metadatas=update_metas)
            logger.info("Tagged %s untagged Chroma chunks as shared textbook.", len(update_ids))
    except Exception as exc:
        logger.warning("Could not tag shared textbook chunks: %s", exc)
    _tagged = True


def get_store() -> Chroma:
    global _store
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    if _store is None:
        _store = Chroma(
            persist_directory=str(CHROMA_DIR),
            embedding_function=_embeddings(),
        )
    _ensure_shared_tags(_store)
    return _store


def get_retriever():
    try:
        store = get_store()
        return store.as_retriever(search_kwargs={"k": RETRIEVE_K})
    except Exception as exc:
        logger.warning("Chroma unavailable (%s). Answering without textbook retrieval.", exc)
        return EmptyRetriever()


def _search(store: Chroma, query: str, k: int, where: dict) -> list[Document]:
    try:
        return store.similarity_search(query, k=k, filter=where)
    except Exception as exc:
        logger.warning("Chroma search failed (%s) for filter %s.", exc, where)
        return []


def retrieve_documents(query: str, user_id: str | None = None) -> list[Document]:
    """Student notes first (if signed in), then shared textbook chunks."""
    try:
        store = get_store()
    except Exception as exc:
        logger.warning("Chroma unavailable (%s). Answering without retrieval.", exc)
        return []

    notes: list[Document] = []
    if user_id:
        notes = _search(store, query, RETRIEVE_K, {"user_id": str(user_id)})
    textbook = _search(store, query, RETRIEVE_K, {"user_id": SHARED_USER_ID})
    seen = set()
    merged: list[Document] = []
    for doc in notes + textbook:
        key = (doc.page_content, (doc.metadata or {}).get("source"))
        if key in seen:
            continue
        seen.add(key)
        merged.append(doc)
    return merged[: max(RETRIEVE_K * 2, RETRIEVE_K)]


def add_material_chunks(chunks: list[Document]) -> None:
    store = get_store()
    store.add_documents(chunks)


def delete_material_chunks(material_id: str) -> None:
    try:
        store = get_store()
        store._collection.delete(where={"material_id": material_id})
    except Exception as exc:
        logger.warning("Could not delete Chroma chunks for material %s: %s", material_id, exc)
