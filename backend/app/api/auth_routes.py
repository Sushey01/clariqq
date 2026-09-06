"""Google Sign-In: one route for first-time signup and later login."""

from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.auth.jwt_tokens import get_current_user, issue_token
from app.config import GOOGLE_CLIENT_ID, reload_env
from app.schemas.auth import AuthResponse, AuthUser, GoogleAuthRequest
from app.storage.users import upsert_google_user

router = APIRouter()


@router.get("/api/auth/config")
def auth_config():
    reload_env()
    return {"google_client_id": GOOGLE_CLIENT_ID}


@router.post("/api/auth/google", response_model=AuthResponse)
def google_auth(body: GoogleAuthRequest):
    reload_env()
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="GOOGLE_CLIENT_ID is empty. Add it to the repo-root .env file.",
        )
    try:
        claims = google_id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            audience=GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=15,
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Google sign-in failed.") from exc

    google_sub = claims.get("sub")
    email = (claims.get("email") or "").strip().lower()
    name = (claims.get("name") or email or "Student").strip()
    if not google_sub or not email:
        raise HTTPException(status_code=401, detail="Google token is missing email.")

    user = upsert_google_user(google_sub=google_sub, email=email, name=name)
    token = issue_token(user)
    return AuthResponse(
        access_token=token,
        user=AuthUser(id=user["id"], name=user["name"], email=user["email"]),
    )


@router.get("/api/auth/me", response_model=AuthUser)
def me(user: dict = Depends(get_current_user)):
    return AuthUser(id=user["id"], name=user["name"], email=user["email"])
