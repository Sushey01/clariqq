"""Login, signup, Google, and dummy desk login."""

from fastapi import APIRouter, Depends, HTTPException

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.auth.jwt_tokens import get_current_user, issue_token
from app.config import GOOGLE_CLIENT_ID, reload_env
from app.schemas.auth import (
    AuthResponse,
    AuthUser,
    DemoLoginRequest,
    GoogleAuthRequest,
    LoginRequest,
    SignupRequest,
)
from app.storage.users import (
    DEMO_SUBS,
    create_email_user,
    ensure_demo_accounts,
    get_user_by_sub,
    get_user_with_secret_by_email,
    upsert_google_user,
    verify_password,
)

router = APIRouter()


def _auth_response(user: dict) -> AuthResponse:
    token = issue_token(user)
    return AuthResponse(
        access_token=token,
        user=AuthUser(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user.get("role") or "student",
        ),
    )


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
    return _auth_response(user)


@router.post("/api/auth/signup", response_model=AuthResponse)
def signup(body: SignupRequest):
    try:
        user = create_email_user(body.name, body.email, body.password, role="student")
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return _auth_response(user)


@router.post("/api/auth/login", response_model=AuthResponse)
def login(body: LoginRequest):
    record = get_user_with_secret_by_email(body.email)
    if record is None:
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")

    if not record.get("password_hash"):
        google_sub = record.get("google_sub") or ""
        if google_sub.startswith("demo:"):
            raise HTTPException(
                status_code=400,
                detail="This is a demo account. Click the Student, Teacher, or Parent button below to log in.",
            )
        raise HTTPException(
            status_code=400,
            detail="This account was registered with Google. Please click 'Sign in with Google' or use Sign Up to set a password.",
        )

    if not verify_password(body.password, record.get("password_hash")):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return _auth_response(record)


@router.post("/api/auth/demo-login", response_model=AuthResponse)
def demo_login(body: DemoLoginRequest):
    ensure_demo_accounts()
    user = get_user_by_sub(DEMO_SUBS[body.role])
    if user is None:
        raise HTTPException(status_code=500, detail="Demo account is missing.")
    return _auth_response(user)


@router.get("/api/auth/me", response_model=AuthUser)
def me(user: dict = Depends(get_current_user)):
    return AuthUser(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user.get("role") or "student",
    )
