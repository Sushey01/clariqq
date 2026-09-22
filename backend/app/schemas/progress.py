from pydantic import BaseModel, Field


class ConceptOut(BaseModel):
    id: str
    subject: str
    name: str
    chapter: str
    aliases: list[str] = Field(default_factory=list)


class MasteryOut(BaseModel):
    concept_id: str
    name: str
    subject: str
    chapter: str
    m: float
    confused: bool
    low_streak: int
    updated_at: str | None = None


class GraphNodeOut(BaseModel):
    id: str
    subject: str
    name: str
    chapter: str
    m: float
    confused: bool
    seen: bool


class GraphEdgeOut(BaseModel):
    source: str
    target: str


class GraphOut(BaseModel):
    counts: dict
    nodes: list[GraphNodeOut]
    edges: list[GraphEdgeOut]


class WeeklyReportOut(BaseModel):
    user_id: str
    window_days: int
    event_count: int
    mean_st: float | None
    weakest: list[MasteryOut]
    confused: list[MasteryOut]
