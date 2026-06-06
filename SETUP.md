# Setup — App RH Cumbres Monumental

## 1. Supabase (Base de Datos)

1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto
3. Ir a SQL Editor y ejecutar:
   - `database/schema.sql`  (tablas e índices)
   - `database/seeds/001_seed.sql`  (empresa + usuarios iniciales)
4. Crear Storage buckets en Storage > New bucket:
   - `documentos-pdfs`  → Public: ON
   - `trabajadores-fotos`  → Public: ON
5. Copiar: Settings > API > Project URL y service_role key

## 2. Backend (FastAPI)

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de Supabase

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Docs en: http://localhost:8000/docs

## 3. Frontend (React)

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api/v1

npm install
npm run dev
```

App en: http://localhost:5173

## Credenciales iniciales

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Admin | admin@cumbres.com | Admin123! | admin |
| RH    | rh@cumbres.com    | Admin123! | rh    |

## Estructura de roles

- **admin**: acceso total (ver, crear, editar, eliminar)
- **rh**: crear, editar, subir documentos (no eliminar trabajadores)
- **consulta**: solo lectura

## Deploy

- Frontend: conectar repo a Vercel, variable VITE_API_URL = URL de Render
- Backend: conectar repo a Render (Web Service, Python), variable .env completo
