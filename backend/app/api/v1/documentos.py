from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import Optional
from ...core.database import get_supabase
from ...core.dependencies import get_current_user, require_rh_or_admin
from ...services.documento_service import DocumentoService

router = APIRouter(tags=["Documentos"])


@router.post("/trabajadores/{trabajador_id}/documentos", status_code=201)
async def upload_documento(
    trabajador_id: str,
    file: UploadFile = File(...),
    tipo_documento: Optional[str] = Form(None),
    db=Depends(get_supabase),
    current_user: dict = Depends(require_rh_or_admin),
):
    return await DocumentoService(db).upload(
        trabajador_id=trabajador_id,
        file=file,
        tipo_documento=tipo_documento,
        user_id=current_user["sub"],
    )


@router.get("/trabajadores/{trabajador_id}/documentos")
def list_documentos(
    trabajador_id: str,
    db=Depends(get_supabase),
    current_user: dict = Depends(get_current_user),
):
    return DocumentoService(db).list(trabajador_id)


@router.delete("/documentos/{doc_id}")
def delete_documento(
    doc_id: str,
    db=Depends(get_supabase),
    current_user: dict = Depends(require_rh_or_admin),
):
    return DocumentoService(db).delete(doc_id)
