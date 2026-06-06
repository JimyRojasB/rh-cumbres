-- ============================================================
-- SEED: Datos iniciales
-- Empresa + usuario admin
-- Contraseña admin: Admin123!
-- ============================================================

-- Empresa
INSERT INTO empresa (razon_social, ruc, domicilio, distrito, departamento, provincia, actividad_economica)
VALUES (
  'CONSTRUCTORA CUMBRES MONUMENTAL S.A.C.',
  '20607279161',
  'Cal. Alfonso Cobian Nro. 179 Urb. San Luis',
  'San Luis',
  'Lima',
  'Lima',
  'Inmobiliaria, Servicios de Construcción'
) ON CONFLICT (ruc) DO NOTHING;

-- Usuario admin (password: Admin123!)
-- Hash generado con bcrypt factor 12
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
  'Administrador Sistema',
  'admin@cumbres.com',
  '$2b$12$WPIRfidWdbDfWfR8fsX0/ehgpVmC922eXOBcIq3Lqozhr/ALaQWNa',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Usuario RH
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
  'Recursos Humanos',
  'rh@cumbres.com',
  '$2b$12$WPIRfidWdbDfWfR8fsX0/ehgpVmC922eXOBcIq3Lqozhr/ALaQWNa',
  'rh'
) ON CONFLICT (email) DO NOTHING;
