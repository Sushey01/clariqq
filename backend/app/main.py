"""Start the API: uvicorn app.main:app --reload --app-dir backend"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.routes import router as auth_router
from app.api.materials_routes import router as materials_router
from app.api.progress_routes import router as progress_router
from app.api.routes import router
from app.parent.routes import router as parent_router
from app.storage.users import ensure_demo_accounts
from app.study.routes import router as study_router
from app.teacher.routes import router as teacher_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_demo_accounts()
    yield


app = FastAPI(title="Clariq", version="1.0.0", lifespan=lifespan)

raw_origins = os.getenv("CORS_ORIGINS", "*").strip()
cors_origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error processing %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )

app.include_router(router)
app.include_router(auth_router)
app.include_router(materials_router)
app.include_router(progress_router)
app.include_router(teacher_router)
app.include_router(parent_router)
app.include_router(study_router)
