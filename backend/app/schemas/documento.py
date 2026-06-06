from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentoResponse(BaseModel):
    id: str
    trabajador_id: str
    nombre_archivo: str
    tipo_documento: Optional[str]
    url_storage: str
    tamaño_bytes: Optional[int] = None
    uploaded_at: Optional[str]
