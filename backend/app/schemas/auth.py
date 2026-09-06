from pydantic import BaseModel, Field


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(min_length=20)


class AuthUser(BaseModel):
    id: str
    name: str
    email: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser
