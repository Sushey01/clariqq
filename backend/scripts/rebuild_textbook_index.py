"""Rebuild the shared textbook index into a new Chroma directory.

Removes running headers, page numbers, and reprint lines, then chunks at
about 1200 characters (close to the interim report's 300 tokens) so a
concept and its definition stay in one chunk. Scanned PDFs (sampled pages
across the book carry almost no text) are skipped and listed, not OCR'd.

    python backend/scripts/rebuild_textbook_index.py --out backend/storage/chroma_db_v2
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from collections import Counter
from pathlib import Path

import fitz
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

BACKEND = Path(__file__).resolve().parents[1]
PDF_DIR = BACKEND / "data" / "pdfs"

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200
REPEAT_SHARE = 0.15
BATCH = 64

_BOILERPLATE = re.compile(
    r"(optional science,?\s*grade\s*-?\s*10"
    r"|science,?\s*(grade|class)\s*-?\s*(9|10)"
    r"|reprint\s+20\d\d(-\d\d)?"
    r"|^\s*\d{1,3}\s*$"
    r"|^\s*page\s+\d+\s*$"
    r"|^\s*figure\s+[\d.]+\s*$)",
    re.I,
)


def repeated_lines(pages: list[list[str]]) -> set[str]:
    """Short lines that recur on many pages of one book are headers or footers."""
    counts: Counter[str] = Counter()
    for lines in pages:
        counts.update({line for line in lines if 0 < len(line) <= 80})
    floor = max(3, int(len(pages) * REPEAT_SHARE))
    return {line for line, count in counts.items() if count >= floor}


def clean_page(lines: list[str], drop: set[str]) -> str:
    kept = []
    for line in lines:
        if not line or line in drop:
            continue
        if _BOILERPLATE.search(line):
            stripped = _BOILERPLATE.sub("", line).strip(" ,-|\t")
            if len(stripped) < 4:
                continue
            line = stripped
        kept.append(line)
    text = "\n".join(kept)
    text = re.sub(r"[ \t]+", " ", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def has_text_layer(path: Path, samples: int = 7, floor: int = 500) -> bool:
    """Sample pages across the book; scanned books return almost no text."""
    doc = fitz.open(path)
    try:
        count = doc.page_count
        if not count:
            return False
        picks = sorted({int(count * step / samples) for step in range(samples)} | {count - 1})
        chars = sum(len((doc[index].get_text("text") or "").strip()) for index in picks)
        return chars >= floor
    finally:
        doc.close()


def load_book(path: Path) -> list[Document]:
    doc = fitz.open(path)
    pages = []
    for page in doc:
        raw = page.get_text("text") or ""
        pages.append([line.strip() for line in raw.splitlines()])
    doc.close()
    drop = repeated_lines(pages)
    rel = f"data/pdfs/{path.name}"
    out = []
    for number, lines in enumerate(pages):
        text = clean_page(lines, drop)
        if len(text) < 80:
            continue
        out.append(
            Document(
                page_content=text,
                metadata={
                    "source": rel,
                    "file_path": rel,
                    "page": number,
                    "user_id": "shared",
                    "source_kind": "textbook",
                },
            )
        )
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=BACKEND / "storage" / "chroma_db_v2")
    parser.add_argument("--embed-model", default="nomic-embed-text")
    args = parser.parse_args()
    if args.out.exists() and any(args.out.iterdir()):
        sys.exit(f"{args.out} is not empty. Choose a new directory.")

    pages: list[Document] = []
    skipped = []
    for path in sorted(PDF_DIR.glob("*.pdf")):
        if not has_text_layer(path):
            skipped.append(path.name)
            print(f"skip (no text layer): {path.name}", flush=True)
            continue
        book = load_book(path)
        if not book:
            skipped.append(path.name)
            print(f"skip (no text layer): {path.name}", flush=True)
            continue
        pages.extend(book)
        print(f"{path.name}: {len(book)} pages with text", flush=True)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = [chunk for chunk in splitter.split_documents(pages) if len(chunk.page_content) >= 80]
    print(f"chunks={len(chunks)} skipped={skipped}", flush=True)

    store = Chroma(
        persist_directory=str(args.out),
        embedding_function=OllamaEmbeddings(model=args.embed_model),
    )
    started = time.time()
    for start in range(0, len(chunks), BATCH):
        store.add_documents(chunks[start : start + BATCH])
        done = min(start + BATCH, len(chunks))
        print(f"embedded {done}/{len(chunks)} in {time.time() - started:.0f}s", flush=True)
    print(f"done: {args.out}", flush=True)


if __name__ == "__main__":
    main()
