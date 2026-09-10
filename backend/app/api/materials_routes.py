"""Student PDF/notes uploads: catalog in SQLite, chunks in Chroma."""

import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.auth.jwt_tokens import get_current_user
from app.config import MATERIALS_MAX_BYTES, UPLOADS_DIR
from app.pipelines.ingest_material import ingest_material_file
from app.schemas.materials import MaterialOut
from app.storage.chroma import delete_material_chunks
from app.storage.materials import (
    create_material,
    delete_material,
    get_material,
    list_materials,
    set_indexed,
)

router = APIRouter()

_ALLOWED_SUFFIXES = {".pdf", ".txt", ".md", ".markdown", ".csv"}


def _public(row: dict) -> MaterialOut:
    return MaterialOut(
        id=row["id"],
        filename=row["filename"],
        mime=row["mime"],
        indexed=row["indexed"],
        index_error=row.get("index_error"),
        created_at=row["created_at"],
    )


def _safe_filename(name: str) -> str:
    base = Path(name or "notes").name
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", base).strip("._") or "notes"
    return cleaned[:180]


@router.get("/api/materials", response_model=list[MaterialOut])
def get_materials(user: dict = Depends(get_current_user)):
    return [_public(row) for row in list_materials(user["id"])]


@router.post("/api/materials", response_model=MaterialOut)
async def upload_material(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    filename = _safe_filename(file.filename or "notes")
    suffix = Path(filename).suffix.lower()
    if suffix not in _ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail="Upload a PDF, text, markdown, or CSV file.",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="That file is empty.")
    if len(data) > MATERIALS_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum size is 10 MB.",
        )

    material_id = str(uuid.uuid4())
    dest_dir = UPLOADS_DIR / str(user["id"])
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{material_id}_{filename}"
    dest.write_bytes(data)

    row = create_material(
        material_id=material_id,
        user_id=user["id"],
        filename=filename,
        mime=file.content_type or "application/octet-stream",
        path=str(dest),
    )

    try:
        ingest_material_file(
            dest,
            user_id=user["id"],
            material_id=material_id,
            filename=filename,
        )
    except Exception as exc:
        set_indexed(material_id, False, str(exc))
        raise HTTPException(
            status_code=503,
            detail=(
                "File saved but not indexed. Start Ollama with nomic-embed-text "
                f"and try again. ({exc})"
            ),
        ) from exc

    set_indexed(material_id, True, None)
    row["indexed"] = True
    row["index_error"] = None
    return _public(row)


@router.post("/api/materials/{material_id}/index", response_model=MaterialOut)
def reindex_material(material_id: str, user: dict = Depends(get_current_user)):
    row = get_material(material_id, user["id"])
    if row is None:
        raise HTTPException(status_code=404, detail="Material not found.")
    dest = Path(row["path"])
    if not dest.is_file():
        set_indexed(material_id, False, "File is missing on disk.")
        raise HTTPException(status_code=404, detail="Uploaded file is missing.")
    try:
        delete_material_chunks(material_id)
        ingest_material_file(
            dest,
            user_id=user["id"],
            material_id=material_id,
            filename=row["filename"],
        )
    except Exception as exc:
        set_indexed(material_id, False, str(exc))
        raise HTTPException(
            status_code=503,
            detail=(
                "Could not index that file. Start Ollama with nomic-embed-text "
                f"and try again. ({exc})"
            ),
        ) from exc
    set_indexed(material_id, True, None)
    row["indexed"] = True
    row["index_error"] = None
    return _public(row)


@router.delete("/api/materials/{material_id}", response_model=MaterialOut)
def remove_material(material_id: str, user: dict = Depends(get_current_user)):
    row = delete_material(material_id, user["id"])
    if row is None:
        raise HTTPException(status_code=404, detail="Material not found.")
    delete_material_chunks(material_id)
    path = Path(row["path"])
    if path.is_file():
        path.unlink()
    return _public(row)
