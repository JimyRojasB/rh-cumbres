from fastapi import HTTPException, UploadFile, status
from supabase import Client
from ..repositories.documento_repo import DocumentoRepository
from typing import List, Optional

MAX_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png"}


class DocumentoService:
    def __init__(self, db: Client):
        self.repo = DocumentoRepository(db)

    async def upload(self, trabajador_id: str, file: UploadFile,
                     tipo_documento: Optional[str], user_id: str) -> dict:
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de archivo no permitido. Solo PDF, JPG o PNG.",
            )

        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo supera el límite de 10 MB.",
            )

        return self.repo.upload(
            trabajador_id=trabajador_id,
            file_bytes=content,
            filename=file.filename,
            content_type=file.content_type,
            tipo_documento=tipo_documento,
            subido_por=user_id,
            tamano=len(content),
        )

    def list(self, trabajador_id: str) -> List[dict]:
        return self.repo.get_by_trabajador(trabajador_id)

    def delete(self, doc_id: str) -> dict:
        ok = self.repo.delete(doc_id)
        if not ok:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
        return {"message": "Documento eliminado"}
