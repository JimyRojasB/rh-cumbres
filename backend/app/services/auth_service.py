from fastapi import HTTPException, status
from supabase import Client
from ..core.security import verify_password, create_access_token
from ..schemas.usuario import LoginRequest, TokenResponse


class AuthService:
    def __init__(self, db: Client):
        self.db = db

    def login(self, req: LoginRequest) -> TokenResponse:
        result = self.db.table("usuarios").select("*").eq("email", req.email).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        user = result.data[0]
        if not user.get("activo"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cuenta desactivada",
            )

        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        token = create_access_token({
            "sub": user["id"],
            "email": user["email"],
            "nombre": user["nombre"],
            "rol": user["rol"],
        })

        return TokenResponse(
            access_token=token,
            user={
                "id": user["id"],
                "nombre": user["nombre"],
                "email": user["email"],
                "rol": user["rol"],
            },
        )
