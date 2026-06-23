from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date


class EducacionSchema(BaseModel):
    nivel: str
    centro_estudios: Optional[str] = None
    fecha_culminacion: Optional[str] = None
    grado_obtenido: Optional[str] = None
    grado_academico: Optional[str] = None


class ConyugueSchema(BaseModel):
    apellidos_nombres: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    telefono: Optional[str] = None
    grado_instruccion: Optional[str] = None
    ocupacion: Optional[str] = None
    n_partida_matrimonio: Optional[str] = None
    dni: Optional[str] = None


class HijoSchema(BaseModel):
    orden: int
    apellidos_nombres: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    telefono: Optional[str] = None


class PadreSchema(BaseModel):
    orden: int
    apellidos_nombres: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    nivel_instruccion: Optional[str] = None
    ocupacion: Optional[str] = None


class ContactoEmergenciaSchema(BaseModel):
    orden: int
    apellidos_nombres: Optional[str] = None
    parentesco: Optional[str] = None
    telefono: Optional[str] = None
    otro: Optional[str] = None


class AFPPensionSchema(BaseModel):
    tipo: str
    afp_actual: Optional[str] = None


class TrabajadorCreate(BaseModel):
    # Personal Obrero
    codigo: str
    categoria: str
    ocupacion: str
    frente_trabajo: Optional[str] = None
    partida: Optional[str] = None
    empresa: str
    fecha_ingreso: date
    jornada_laboral: Optional[str] = None
    # Datos Personales
    apellido_paterno: str
    apellido_materno: str
    nombres: str
    domicilio: Optional[str] = None
    distrito: Optional[str] = None
    provincia: Optional[str] = None
    telefono: Optional[str] = None
    dni: Optional[str] = None
    pasaporte: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    correo_electronico: Optional[str] = None
    nombre_banco: Optional[str] = None
    numero_cuenta: Optional[str] = None
    nombre_afp: Optional[str] = None
    # Relacionados
    educacion: Optional[List[EducacionSchema]] = []
    conyugue: Optional[ConyugueSchema] = None
    hijos: Optional[List[HijoSchema]] = []
    padres: Optional[List[PadreSchema]] = []
    contactos_emergencia: Optional[List[ContactoEmergenciaSchema]] = []
    afp_pension: Optional[AFPPensionSchema] = None


class TrabajadorUpdate(BaseModel):
    codigo: Optional[str] = None
    estado: Optional[str] = None
    categoria: Optional[str] = None
    ocupacion: Optional[str] = None
    frente_trabajo: Optional[str] = None
    partida: Optional[str] = None
    empresa: Optional[str] = None
    fecha_ingreso: Optional[date] = None
    jornada_laboral: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    nombres: Optional[str] = None
    domicilio: Optional[str] = None
    distrito: Optional[str] = None
    provincia: Optional[str] = None
    telefono: Optional[str] = None
    dni: Optional[str] = None
    pasaporte: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    correo_electronico: Optional[str] = None
    nombre_banco: Optional[str] = None
    numero_cuenta: Optional[str] = None
    nombre_afp: Optional[str] = None
    educacion: Optional[List[EducacionSchema]] = None
    conyugue: Optional[ConyugueSchema] = None
    hijos: Optional[List[HijoSchema]] = None
    padres: Optional[List[PadreSchema]] = None
    contactos_emergencia: Optional[List[ContactoEmergenciaSchema]] = None
    afp_pension: Optional[AFPPensionSchema] = None
