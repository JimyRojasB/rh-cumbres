from fastapi import APIRouter, Depends, Query
from typing import Optional
from ...core.database import get_supabase
from ...core.dependencies import get_current_user, require_rh_or_admin, require_admin
from ...schemas.trabajador import TrabajadorCreate, TrabajadorUpdate
from ...services.trabajador_service import TrabajadorService

router = APIRouter(prefix="/trabajadores", tags=["Trabajadores"])


@router.get("")
def list_trabajadores(
    nombre: Optional[str] = Query(None),
    dni: Optional[str] = Query(None),
    categoria: Optional[str] = Query(None),
    ocupacion: Optional[str] = Query(None),
    frente_trabajo: Optional[str] = Query(None),
    fecha_ingreso_desde: Optional[str] = Query(None),
    fecha_ingreso_hasta: Optional[str] = Query(None),
    db=Depends(get_supabase),
    current_user: dict = Depends(get_current_user),
):
    filters = {
        "nombre": nombre,
        "dni": dni,
        "categoria": categoria,
        "ocupacion": ocupacion,
        "frente_trabajo": frente_trabajo,
        "fecha_ingreso_desde": fecha_ingreso_desde,
        "fecha_ingreso_hasta": fecha_ingreso_hasta,
    }
    return TrabajadorService(db).list(filters)


@router.post("", status_code=201)
def create_trabajador(
    data: TrabajadorCreate,
    db=Depends(get_supabase),
    current_user: dict = Depends(require_rh_or_admin),
):
    return TrabajadorService(db).create(data)


@router.get("/verificar/{id}")
def verificar_trabajador(id: str, db=Depends(get_supabase)):
    """Endpoint público — no requiere autenticación. Solo devuelve datos básicos."""
    worker = TrabajadorService(db).get(id)
    return {
        "nombres": worker.get("nombres"),
        "apellido_paterno": worker.get("apellido_paterno"),
        "apellido_materno": worker.get("apellido_materno"),
        "codigo": worker.get("codigo"),
        "categoria": worker.get("categoria"),
        "ocupacion": worker.get("ocupacion"),
        "empresa": worker.get("empresa"),
        "fecha_ingreso": worker.get("fecha_ingreso"),
        "estado": "ACTIVO",
    }


@router.get("/{id}")
def get_trabajador(
    id: str,
    db=Depends(get_supabase),
    current_user: dict = Depends(get_current_user),
):
    return TrabajadorService(db).get(id)


@router.put("/{id}")
def update_trabajador(
    id: str,
    data: TrabajadorUpdate,
    db=Depends(get_supabase),
    current_user: dict = Depends(require_rh_or_admin),
):
    return TrabajadorService(db).update(id, data)


@router.delete("/{id}")
def delete_trabajador(
    id: str,
    db=Depends(get_supabase),
    current_user: dict = Depends(require_admin),
):
    return TrabajadorService(db).delete(id)
