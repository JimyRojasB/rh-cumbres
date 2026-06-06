from supabase import Client
from typing import Optional, List
from uuid import uuid4, UUID


def _valid_uuid(val) -> Optional[str]:
    try:
        return str(UUID(str(val)))
    except (ValueError, AttributeError, TypeError):
        return None


BUCKET = "documentos-pdfs"


class DocumentoRepository:
    def __init__(self, db: Client):
        self.db = db

    def upload(self, trabajador_id: str, file_bytes: bytes, filename: str,
               content_type: str, tipo_documento: Optional[str], subido_por: str,
               tamano: int) -> dict:
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "pdf"
        path = f"{trabajador_id}/{uuid4()}.{ext}"

        try:
            self.db.storage.from_(BUCKET).upload(
                path, file_bytes, {"content-type": content_type, "upsert": False}
            )
        except Exception as e:
            raise Exception(f"Error en storage Supabase: {str(e)}")

        url = self.db.storage.from_(BUCKET).get_public_url(path)

        result = self.db.table("documentos").insert({
            "trabajador_id": trabajador_id,
            "subido_por": _valid_uuid(subido_por),
            "nombre_archivo": filename,
            "tipo_documento": tipo_documento,
            "url_storage": url,
            "tamano_bytes": tamano,
        }).execute()
        return result.data[0]

    def get_by_trabajador(self, trabajador_id: str) -> List[dict]:
        result = (
            self.db.table("documentos")
            .select("*")
            .eq("trabajador_id", trabajador_id)
            .order("uploaded_at", desc=True)
            .execute()
        )
        return result.data or []

    def delete(self, doc_id: str) -> bool:
        result = self.db.table("documentos").select("url_storage").eq("id", doc_id).execute()
        if not result.data:
            return False

        # Extraer el path relativo desde la URL pública
        # URL formato: https://.../storage/v1/object/public/documentos-pdfs/{path}
        url = result.data[0]["url_storage"]
        marker = f"/object/public/{BUCKET}/"
        if marker in url:
            storage_path = url.split(marker, 1)[1]
            try:
                self.db.storage.from_(BUCKET).remove([storage_path])
            except Exception:
                pass  # Si falla el storage igual borramos el registro

        self.db.table("documentos").delete().eq("id", doc_id).execute()
        return True
