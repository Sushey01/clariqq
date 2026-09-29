"""Start the API: uvicorn app.main:app --reload --app-dir backend"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router
from app.api.materials_routes import router as materials_router
from app.api.progress_routes import router as progress_router
from app.api.routes import router
from app.parent.routes import router as parent_router
from app.storage.users import ensure_demo_accounts
from app.teacher.routes import router as teacher_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_demo_accounts()
    yield


app = FastAPI(title="Clariq", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_router)
app.include_router(materials_router)
app.include_router(progress_router)
app.include_router(teacher_router)
app.include_router(parent_router)
