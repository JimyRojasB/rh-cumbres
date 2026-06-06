-- ============================================================
-- APP RH - CONSTRUCTORA CUMBRES MONUMENTAL S.A.C.
-- Schema completo de base de datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── EMPRESA ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresa (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razon_social     VARCHAR(200) NOT NULL,
  ruc              VARCHAR(11)  NOT NULL UNIQUE,
  domicilio        TEXT         NOT NULL,
  distrito         VARCHAR(100),
  departamento     VARCHAR(100),
  provincia        VARCHAR(100),
  actividad_economica TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── USUARIOS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        VARCHAR(200) NOT NULL,
  email         VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'consulta'
                CHECK (rol IN ('admin', 'rh', 'consulta')),
  activo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── TRABAJADORES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trabajadores (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Personal Obrero
  codigo             VARCHAR(20)  NOT NULL UNIQUE,
  categoria          VARCHAR(100) NOT NULL,
  ocupacion          VARCHAR(100) NOT NULL,
  frente_trabajo     VARCHAR(100),
  partida            VARCHAR(20),
  empresa            VARCHAR(200) NOT NULL,
  fecha_ingreso      DATE         NOT NULL,
  jornada_laboral    VARCHAR(300) DEFAULT '48 horas semanales en el horario que determine la empresa',
  huella_digital_url TEXT,
  foto_url           TEXT,
  -- Datos Personales
  apellido_paterno   VARCHAR(100) NOT NULL,
  apellido_materno   VARCHAR(100) NOT NULL,
  nombres            VARCHAR(150) NOT NULL,
  domicilio          TEXT,
  distrito           VARCHAR(100),
  provincia          VARCHAR(100),
  telefono           VARCHAR(20),
  dni                VARCHAR(20) UNIQUE,
  pasaporte          VARCHAR(30),
  fecha_nacimiento   DATE,
  correo_electronico VARCHAR(200),
  nombre_banco       VARCHAR(100),
  numero_cuenta      VARCHAR(50),
  nombre_afp         VARCHAR(100),
  empresa_id         UUID REFERENCES empresa(id),
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── EDUCACION ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS educacion (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabajador_id     UUID NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE,
  nivel             VARCHAR(30) NOT NULL
                    CHECK (nivel IN ('primaria','secundaria','superior_tecnico_otros')),
  centro_estudios   VARCHAR(200),
  fecha_culminacion VARCHAR(10),
  grado_obtenido    VARCHAR(20) CHECK (grado_obtenido IN ('completa','incompleta')),
  grado_academico   VARCHAR(100),
  UNIQUE (trabajador_id, nivel)
);

-- ── CONYUGUES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conyugues (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabajador_id        UUID NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE UNIQUE,
  apellidos_nombres    VARCHAR(200),
  fecha_nacimiento     DATE,
  edad                 INTEGER,
  telefono             VARCHAR(20),
  grado_instruccion    VARCHAR(50),
  ocupacion            VARCHAR(100),
  n_partida_matrimonio VARCHAR(50),
  dni                  VARCHAR(20)
);

-- ── HIJOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hijos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabajador_id     UUID NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE,
  orden             INTEGER NOT NULL CHECK (orden BETWEEN 1 AND 8),
  apellidos_nombres VARCHAR(200),
  fecha_nacimiento  DATE,
  edad              INTEGER,
  telefono          VARCHAR(20),
  UNIQUE (trabajador_id, orden)
);

-- ── PADRES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS padres (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabajador_id     UUID NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE,
  orden             INTEGER NOT NULL CHECK (orden IN (1,2)),
  apellidos_nombres VARCHAR(200),
  fecha_nacimiento  DATE,
  nivel_instruccion VARCHAR(50),
  ocupacion         VARCHAR(100),
  UNIQUE (trabajador_id, orden)
);

-- ── CONTACTOS EMERGENCIA ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS contactos_emergencia (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabajador_id     UUID NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE,
  orden             INTEGER NOT NULL CHECK (orden BETWEEN 1 AND 3),
  apellidos_nombres VARCHAR(200),
  parentesco        VARCHAR(50),
  telefono          VARCHAR(20),
  otro              VARCHAR(100),
  UNIQUE (trabajador_id, orden)
);

-- ── AFP PENSION ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS afp_pension (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabajador_id UUID NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE UNIQUE,
  tipo          VARCHAR(50) NOT NULL,
  afp_actual    VARCHAR(100)
);

-- ── DOCUMENTOS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documentos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabajador_id   UUID NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE,
  subido_por      UUID REFERENCES usuarios(id),
  nombre_archivo  VARCHAR(200) NOT NULL,
  tipo_documento  VARCHAR(100),
  url_storage     TEXT NOT NULL,
  tamano_bytes    INTEGER,
  uploaded_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trabajadores_dni       ON trabajadores(dni);
CREATE INDEX IF NOT EXISTS idx_trabajadores_nombres   ON trabajadores(apellido_paterno, apellido_materno, nombres);
CREATE INDEX IF NOT EXISTS idx_trabajadores_categoria ON trabajadores(categoria);
CREATE INDEX IF NOT EXISTS idx_trabajadores_ocupacion ON trabajadores(ocupacion);
CREATE INDEX IF NOT EXISTS idx_trabajadores_frente    ON trabajadores(frente_trabajo);
CREATE INDEX IF NOT EXISTS idx_trabajadores_empresa   ON trabajadores(empresa_id);

-- ── TRIGGER updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trabajadores_updated_at
  BEFORE UPDATE ON trabajadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
