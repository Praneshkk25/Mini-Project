from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    specialty_or_info: Optional[str] = None
    token: str

@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (req.username.strip(), req.password.strip()))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Generate token (simplified JWT-like token for portal verification)
    role_token = f"TOKEN_{user['role'].upper()}_{user['id']}_2026"

    return UserResponse(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        role=user["role"],
        specialty_or_info=user["specialty_or_info"],
        token=role_token
    )

@router.get("/me")
def get_current_user(token: str):
    if not token or not token.startswith("TOKEN_"):
        raise HTTPException(status_code=401, detail="Invalid auth token")
    
    parts = token.split("_")
    if len(parts) < 3:
        raise HTTPException(status_code=401, detail="Malformed auth token")
    
    user_id = parts[2]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, name, role, specialty_or_info FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return dict(user)
