from supabase import Client
from typing import Optional, Dict, Any, List


class TrabajadorRepository:
    def __init__(self, db: Client):
        self.db = db

    def get_all(self, filters: Dict[str, Any] = {}) -> List[dict]:
        query = self.db.table("trabajadores").select("*")

        nombre = (filters.get("nombre") or "").strip()
        if nombre:
            query = query.or_(
                f"apellido_paterno.ilike.%{nombre}%,"
                f"apellido_materno.ilike.%{nombre}%,"
                f"nombres.ilike.%{nombre}%"
            )

        if filters.get("dni"):
            query = query.ilike("dni", f"%{filters['dni']}%")
        if filters.get("categoria"):
            query = query.ilike("categoria", f"%{filters['categoria']}%")
        if filters.get("ocupacion"):
            query = query.ilike("ocupacion", f"%{filters['ocupacion']}%")
        if filters.get("frente_trabajo"):
            query = query.ilike("frente_trabajo", f"%{filters['frente_trabajo']}%")
        if filters.get("fecha_ingreso_desde"):
            query = query.gte("fecha_ingreso", filters["fecha_ingreso_desde"])
        if filters.get("fecha_ingreso_hasta"):
            query = query.lte("fecha_ingreso", filters["fecha_ingreso_hasta"])

        result = query.order("created_at", desc=True).execute()
        return result.data or []

    def get_by_id(self, id: str) -> Optional[dict]:
        result = self.db.table("trabajadores").select("*").eq("id", id).execute()
        if not result.data:
            return None

        t = result.data[0]

        edu = self.db.table("educacion").select("*").eq("trabajador_id", id).execute()
        t["educacion"] = edu.data or []

        cony = self.db.table("conyugues").select("*").eq("trabajador_id", id).execute()
        t["conyugue"] = cony.data[0] if cony.data else None

        hijos = self.db.table("hijos").select("*").eq("trabajador_id", id).order("orden").execute()
        t["hijos"] = hijos.data or []

        padres = self.db.table("padres").select("*").eq("trabajador_id", id).order("orden").execute()
        t["padres"] = padres.data or []

        contactos = self.db.table("contactos_emergencia").select("*").eq("trabajador_id", id).order("orden").execute()
        t["contactos_emergencia"] = contactos.data or []

        afp = self.db.table("afp_pension").select("*").eq("trabajador_id", id).execute()
        t["afp_pension"] = afp.data[0] if afp.data else None

        docs = self.db.table("documentos").select("*").eq("trabajador_id", id).order("uploaded_at", desc=True).execute()
        t["documentos"] = docs.data or []

        return t

    def create(self, data: dict) -> dict:
        educacion = data.pop("educacion", []) or []
        conyugue = data.pop("conyugue", None)
        hijos = data.pop("hijos", []) or []
        padres = data.pop("padres", []) or []
        contactos = data.pop("contactos_emergencia", []) or []
        afp = data.pop("afp_pension", None)

        # Serializar fechas
        for key in ("fecha_ingreso", "fecha_nacimiento"):
            if data.get(key) and hasattr(data[key], "isoformat"):
                data[key] = data[key].isoformat()

        result = self.db.table("trabajadores").insert(data).execute()
        tid = result.data[0]["id"]

        for edu in educacion:
            edu_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in edu.items() if v is not None}
            if edu_data.get("centro_estudios") or edu_data.get("fecha_culminacion"):
                self.db.table("educacion").insert({**edu_data, "trabajador_id": tid}).execute()

        if conyugue and conyugue.get("apellidos_nombres"):
            cony_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in conyugue.items() if v is not None}
            self.db.table("conyugues").insert({**cony_data, "trabajador_id": tid}).execute()

        for hijo in hijos:
            hijo_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in hijo.items() if v is not None}
            if hijo_data.get("apellidos_nombres"):
                self.db.table("hijos").insert({**hijo_data, "trabajador_id": tid}).execute()

        for padre in padres:
            padre_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in padre.items() if v is not None}
            if padre_data.get("apellidos_nombres"):
                self.db.table("padres").insert({**padre_data, "trabajador_id": tid}).execute()

        for contacto in contactos:
            cont_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in contacto.items() if v is not None}
            if cont_data.get("apellidos_nombres"):
                self.db.table("contactos_emergencia").insert({**cont_data, "trabajador_id": tid}).execute()

        if afp and afp.get("tipo"):
            afp_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in afp.items() if v is not None}
            self.db.table("afp_pension").insert({**afp_data, "trabajador_id": tid}).execute()

        return self.get_by_id(tid)

    def update(self, id: str, data: dict) -> dict:
        educacion = data.pop("educacion", None)
        conyugue = data.pop("conyugue", None)
        hijos = data.pop("hijos", None)
        padres = data.pop("padres", None)
        contactos = data.pop("contactos_emergencia", None)
        afp = data.pop("afp_pension", None)

        for key in ("fecha_ingreso", "fecha_nacimiento"):
            if data.get(key) and hasattr(data[key], "isoformat"):
                data[key] = data[key].isoformat()

        main_data = {k: v for k, v in data.items() if v is not None}
        if main_data:
            self.db.table("trabajadores").update(main_data).eq("id", id).execute()

        if educacion is not None:
            self.db.table("educacion").delete().eq("trabajador_id", id).execute()
            for edu in educacion:
                edu_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in edu.items() if v is not None}
                if edu_data.get("centro_estudios") or edu_data.get("fecha_culminacion"):
                    self.db.table("educacion").insert({**edu_data, "trabajador_id": id}).execute()

        if conyugue is not None:
            self.db.table("conyugues").delete().eq("trabajador_id", id).execute()
            if conyugue.get("apellidos_nombres"):
                cony_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in conyugue.items() if v is not None}
                self.db.table("conyugues").insert({**cony_data, "trabajador_id": id}).execute()

        if hijos is not None:
            self.db.table("hijos").delete().eq("trabajador_id", id).execute()
            for hijo in hijos:
                hijo_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in hijo.items() if v is not None}
                if hijo_data.get("apellidos_nombres"):
                    self.db.table("hijos").insert({**hijo_data, "trabajador_id": id}).execute()

        if padres is not None:
            self.db.table("padres").delete().eq("trabajador_id", id).execute()
            for padre in padres:
                padre_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in padre.items() if v is not None}
                if padre_data.get("apellidos_nombres"):
                    self.db.table("padres").insert({**padre_data, "trabajador_id": id}).execute()

        if contactos is not None:
            self.db.table("contactos_emergencia").delete().eq("trabajador_id", id).execute()
            for cont in contactos:
                cont_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in cont.items() if v is not None}
                if cont_data.get("apellidos_nombres"):
                    self.db.table("contactos_emergencia").insert({**cont_data, "trabajador_id": id}).execute()

        if afp is not None:
            self.db.table("afp_pension").delete().eq("trabajador_id", id).execute()
            if afp.get("tipo"):
                afp_data = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in afp.items() if v is not None}
                self.db.table("afp_pension").insert({**afp_data, "trabajador_id": id}).execute()

        return self.get_by_id(id)

    def delete(self, id: str) -> bool:
        result = self.db.table("trabajadores").delete().eq("id", id).execute()
        return bool(result.data)
