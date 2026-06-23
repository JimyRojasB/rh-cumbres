from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import Groq
from ...core.database import get_supabase
from ...core.dependencies import get_current_user
from ...core.config import settings

router = APIRouter(prefix="/ai", tags=["IA"])


class ChatRequest(BaseModel):
    pregunta: str


def build_context(workers: list) -> str:
    lines = ["CODIGO|NOMBRE_COMPLETO|CATEGORIA|OCUPACION|FRENTE_TRABAJO|FECHA_INGRESO|ESTADO|AFP|TELEFONO|DNI"]
    for w in workers:
        nombre = f"{w.get('apellido_paterno','')} {w.get('apellido_materno','')} {w.get('nombres','')}".strip()
        afp = (w.get("afp_pension") or {}).get("afp_actual", "")
        lines.append(
            f"{w.get('codigo','')}|{nombre}|{w.get('categoria','')}|{w.get('ocupacion','')}|"
            f"{w.get('frente_trabajo','')}|{w.get('fecha_ingreso','')}|{w.get('estado','Activo')}|"
            f"{afp}|{w.get('telefono','')}|{w.get('dni','')}"
        )
    return "\n".join(lines)


@router.post("/chat")
def chat(
    body: ChatRequest,
    db=Depends(get_supabase),
    current_user: dict = Depends(get_current_user),
):
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY no configurada")

    result = db.table("trabajadores").select("*").execute()
    workers = result.data or []
    context = build_context(workers)

    from datetime import date
    hoy = date.today().strftime("%Y-%m-%d")
    mes_actual = date.today().strftime("%Y-%m")

    system_prompt = f"""Eres un asistente de Recursos Humanos de Constructora Cumbres Monumental S.A.C.
Fecha de hoy: {hoy}. Mes actual: {mes_actual}.
Tienes acceso a la base de datos completa del personal ({len(workers)} trabajadores).
Los datos están en formato CSV con columnas separadas por | (pipe).
La columna FECHA_INGRESO usa formato YYYY-MM-DD.

Instrucciones:
- Responde SOLO usando los datos proporcionados
- Si te piden una lista, muéstrala ordenada y numerada
- Si te piden un conteo, da el número exacto
- Responde en español, de forma concisa y profesional
- Si la pregunta no tiene relación con el personal, indícalo amablemente

DATOS DEL PERSONAL:
{context}"""

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": body.pregunta},
            ],
            temperature=0.1,
            max_tokens=1024,
        )
        return {"respuesta": response.choices[0].message.content}
    except Exception as e:
        print(f"[AI ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=502, detail=f"{type(e).__name__}: {str(e)}")
