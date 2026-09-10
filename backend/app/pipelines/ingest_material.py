"""Chunk and embed one student file into the shared Chroma index."""

from pathlib import Path

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.storage.chroma import add_material_chunks

_TEXT_SUFFIXES = {".txt", ".md", ".markdown", ".csv"}


def _splitter() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=64,
        length_function=len,
        is_separator_regex=False,
    )


def _load_documents(path: Path) -> list[Document]:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return PyMuPDFLoader(str(path)).load()
    if suffix in _TEXT_SUFFIXES:
        text = path.read_text(encoding="utf-8", errors="replace")
        return [Document(page_content=text, metadata={"source": path.name})]
    raise ValueError(f"Unsupported file type: {suffix or 'unknown'}")


def ingest_material_file(
    path: Path,
    *,
    user_id: str,
    material_id: str,
    filename: str,
) -> int:
    documents = _load_documents(path)
    chunks = _splitter().split_documents(documents)
    if not chunks:
        raise ValueError("No text could be extracted from that file.")
    for chunk in chunks:
        meta = dict(chunk.metadata or {})
        meta["user_id"] = str(user_id)
        meta["material_id"] = material_id
        meta["source"] = filename
        meta["source_kind"] = "notes"
        chunk.metadata = meta
    add_material_chunks(chunks)
    return len(chunks)
