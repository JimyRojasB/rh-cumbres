from fastapi import APIRouter, Depends
from ...core.database import get_supabase
from ...schemas.usuario import LoginRequest, TokenResponse
from ...services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db=Depends(get_supabase)):
    return AuthService(db).login(req)
