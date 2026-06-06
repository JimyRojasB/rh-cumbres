from fastapi import HTTPException, status
from supabase import Client
from ..repositories.trabajador_repo import TrabajadorRepository
from ..schemas.trabajador import TrabajadorCreate, TrabajadorUpdate
from typing import Dict, Any, List, Optional


class TrabajadorService:
    def __init__(self, db: Client):
        self.repo = TrabajadorRepository(db)

    def list(self, filters: Dict[str, Any]) -> List[dict]:
        return self.repo.get_all(filters)

    def get(self, id: str) -> dict:
        t = self.repo.get_by_id(id)
        if not t:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trabajador no encontrado")
        return t

    def create(self, data: TrabajadorCreate) -> dict:
        payload = data.model_dump()
        # Serialize nested models
        if payload.get("conyugue"):
            payload["conyugue"] = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in payload["conyugue"].items()}
        return self.repo.create(payload)

    def update(self, id: str, data: TrabajadorUpdate) -> dict:
        self.get(id)
        payload = data.model_dump(exclude_none=True)
        return self.repo.update(id, payload)

    def delete(self, id: str) -> dict:
        self.get(id)
        self.repo.delete(id)
        return {"message": "Trabajador eliminado correctamente"}
