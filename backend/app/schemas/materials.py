from pydantic import BaseModel


class MaterialOut(BaseModel):
    id: str
    filename: str
    mime: str
    indexed: bool
    index_error: str | None = None
    created_at: str
