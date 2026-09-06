"""JWT helpers for Google-authenticated students."""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import JWT_EXPIRE_HOURS, JWT_SECRET, reload_env

_bearer = HTTPBearer(auto_error=False)


def issue_token(user: dict) -> str:
    reload_env()
    secret = JWT_SECRET
    if not secret:
        raise HTTPException(
            status_code=503,
            detail="JWT_SECRET is empty. Add JWT_SECRET to the repo-root .env file.",
        )
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=JWT_EXPIRE_HOURS)).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token: str) -> dict:
    reload_env()
    if not JWT_SECRET:
        raise HTTPException(status_code=503, detail="JWT_SECRET is empty.")
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") from exc


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not signed in.")
    payload = decode_token(creds.credentials)
    return {
        "id": str(payload["sub"]),
        "email": payload.get("email") or "",
        "name": payload.get("name") or "",
    }
