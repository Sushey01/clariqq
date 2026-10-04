"""JWT helpers for signed-in Clariq users."""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import JWT_EXPIRE_HOURS, JWT_SECRET, reload_env
from app.storage.users import get_user

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
        "role": user.get("role") or "student",
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


def _user_from_bearer(creds: HTTPAuthorizationCredentials | None) -> dict:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not signed in.")
    payload = decode_token(creds.credentials)
    sub = str(payload.get("sub", ""))
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token claims.")
    stored = get_user(sub)
    if stored:
        return stored
    from app.storage.users import get_user_by_sub

    stored_by_sub = get_user_by_sub(sub)
    if stored_by_sub:
        return stored_by_sub
    raise HTTPException(
        status_code=401,
        detail="User account not found or has been revoked.",
    )


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    return _user_from_bearer(creds)


def get_optional_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict | None:
    """Chat can proceed without notes if the JWT is missing or stale."""
    if creds is None or not creds.credentials:
        return None
    if creds.scheme.lower() != "bearer":
        return None
    try:
        payload = decode_token(creds.credentials)
    except HTTPException:
        return None
    sub = str(payload.get("sub", ""))
    if not sub:
        return None
    stored = get_user(sub)
    if stored:
        return stored
    from app.storage.users import get_user_by_sub

    return get_user_by_sub(sub)


def require_role(*roles: str):
    allowed = set(roles)

    def _check(user: dict = Depends(get_current_user)) -> dict:
        if (user.get("role") or "student") not in allowed:
            raise HTTPException(
                status_code=403,
                detail="This desk is for a different role.",
            )
        return user

    return _check
