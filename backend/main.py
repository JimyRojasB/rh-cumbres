from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, trabajadores, documentos, ai

app = FastAPI(
    title="RH Cumbres Monumental API",
    description="Sistema de Recursos Humanos - Constructora Cumbres Monumental S.A.C.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(trabajadores.router, prefix=API_PREFIX)
app.include_router(documentos.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {"message": "RH Cumbres Monumental API - OK", "docs": "/docs"}
