import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workerService } from './workerService'
import DocumentUpload from '../documents/DocumentUpload'
import DocumentList from '../documents/DocumentList'
import { documentService } from '../documents/documentService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Pencil, User, Briefcase, GraduationCap,
  Heart, Users, Phone, CreditCard, FileText, Building2, Printer, BadgeCheck
} from 'lucide-react'

function InfoRow({ label, value }) {
  return (
    <div className="flex border-b border-gray-50 py-1.5 last:border-0">
      <span className="text-xs text-gray-400 font-medium w-40 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-300">—</span>}</span>
    </div>
  )
}

function Section({ icon: Icon, title, color = 'bg-navy-700', children }) {
  return (
    <div className="form-section">
      <div className={`${color} text-white px-4 py-2.5 flex items-center gap-2 rounded-t-lg`}>
        <Icon size={15} />
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>
      <div className="bg-white p-4">{children}</div>
    </div>
  )
}

export default function WorkerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [docsKey, setDocsKey] = useState(0)
  const [fotoUrl, setFotoUrl] = useState(null)

  useEffect(() => {
    workerService.get(id)
      .then(setWorker)
      .catch((err) => {
        if (err.response?.status === 404) toast.error('Trabajador no encontrado')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    documentService.list(id).then(docs => {
      const foto = docs.find(d => d.tipo_documento === 'Foto')
      setFotoUrl(foto?.url_storage || null)
    }).catch(() => {})
  }, [id, docsKey])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-navy-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  if (!worker) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Trabajador no encontrado.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-4 mx-auto">Volver</button>
    </div>
  )

  const fmt = (date) => date ? new Date(date).toLocaleDateString('es-PE') : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary py-2 px-3">
            <ArrowLeft size={16} />
          </button>
          {/* Foto del trabajador */}
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-navy-200 bg-navy-100 flex items-center justify-center shrink-0">
            {fotoUrl
              ? <img src={fotoUrl} alt="Foto" className="w-full h-full object-cover" />
              : <User size={24} className="text-navy-400" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-amber-500" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Ficha del Trabajador</span>
            </div>
            <h1 className="text-2xl font-bold text-navy-700">
              {worker.apellido_paterno} {worker.apellido_materno}, {worker.nombres}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-xs bg-navy-100 text-navy-700 px-2 py-0.5 rounded">{worker.codigo}</span>
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded">{worker.categoria}</span>
              <span className="text-xs text-gray-500">{worker.ocupacion}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/trabajadores/${id}/fotocheck`)} className="btn-secondary py-2">
            <BadgeCheck size={15} /> Fotocheck
          </button>
          <button onClick={() => navigate(`/trabajadores/${id}/imprimir`)} className="btn-secondary py-2">
            <Printer size={15} /> Imprimir
          </button>
          {(user?.rol === 'admin' || user?.rol === 'rh') && (
            <button onClick={() => navigate(`/trabajadores/${id}/editar`)} className="btn-amber">
              <Pencil size={15} /> Editar Ficha
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-0">

          <Section icon={Briefcase} title="Personal Obrero">
            <InfoRow label="Código" value={worker.codigo} />
            <InfoRow label="Categoría" value={worker.categoria} />
            <InfoRow label="Ocupación" value={worker.ocupacion} />
            <InfoRow label="Frente de Trabajo" value={worker.frente_trabajo} />
            <InfoRow label="Partida" value={worker.partida} />
            <InfoRow label="Empresa" value={worker.empresa} />
            <InfoRow label="Fecha de Ingreso" value={fmt(worker.fecha_ingreso)} />
            <InfoRow label="Jornada Laboral" value={worker.jornada_laboral} />
          </Section>

          <Section icon={User} title="Datos Personales" color="bg-navy-600">
            <InfoRow label="Apellido Paterno" value={worker.apellido_paterno} />
            <InfoRow label="Apellido Materno" value={worker.apellido_materno} />
            <InfoRow label="Nombres" value={worker.nombres} />
            <InfoRow label="DNI / CE" value={worker.dni} />
            <InfoRow label="Pasaporte" value={worker.pasaporte} />
            <InfoRow label="Fecha de Nacimiento" value={fmt(worker.fecha_nacimiento)} />
            <InfoRow label="Domicilio" value={worker.domicilio} />
            <InfoRow label="Distrito" value={worker.distrito} />
            <InfoRow label="Provincia" value={worker.provincia} />
            <InfoRow label="Teléfono" value={worker.telefono} />
            <InfoRow label="Correo Electrónico" value={worker.correo_electronico} />
          </Section>

          <Section icon={CreditCard} title="Datos Financieros" color="bg-navy-500">
            <InfoRow label="Banco" value={worker.nombre_banco} />
            <InfoRow label="N° de Cuenta" value={worker.numero_cuenta} />
            <InfoRow label="AFP" value={worker.nombre_afp} />
          </Section>

          {worker.educacion?.length > 0 && (
            <Section icon={GraduationCap} title="Grado de Instrucción" color="bg-amber-600">
              {worker.educacion.map(edu => (
                <div key={edu.nivel} className="mb-2">
                  <p className="text-xs font-bold text-amber-600 uppercase mb-1">
                    {edu.nivel === 'primaria' ? 'Primaria' : edu.nivel === 'secundaria' ? 'Secundaria' : 'Superior / Técnico'}
                  </p>
                  <InfoRow label="Centro de Estudios" value={edu.centro_estudios} />
                  <InfoRow label="Fecha Culminación" value={edu.fecha_culminacion} />
                  <InfoRow label="Grado Obtenido" value={edu.grado_obtenido} />
                </div>
              ))}
            </Section>
          )}

          {worker.conyugue && (
            <Section icon={Heart} title="Datos del Cónyuge" color="bg-navy-700">
              <InfoRow label="Apellidos y Nombres" value={worker.conyugue.apellidos_nombres} />
              <InfoRow label="Fecha de Nacimiento" value={fmt(worker.conyugue.fecha_nacimiento)} />
              <InfoRow label="Teléfono" value={worker.conyugue.telefono} />
              <InfoRow label="Grado de Instrucción" value={worker.conyugue.grado_instruccion} />
              <InfoRow label="Ocupación" value={worker.conyugue.ocupacion} />
              <InfoRow label="N° Partida de Matrimonio" value={worker.conyugue.n_partida_matrimonio} />
              <InfoRow label="DNI" value={worker.conyugue.dni} />
            </Section>
          )}

          {worker.hijos?.length > 0 && (
            <Section icon={Users} title="Hijos" color="bg-navy-600">
              {worker.hijos.map((h, i) => (
                <div key={i} className="border-b border-gray-100 pb-2 mb-2 last:border-0">
                  <p className="text-xs font-bold text-navy-600 mb-1">{i + 1}. {h.apellidos_nombres}</p>
                  <InfoRow label="Fecha de Nacimiento" value={fmt(h.fecha_nacimiento)} />
                  <InfoRow label="Teléfono" value={h.telefono} />
                </div>
              ))}
            </Section>
          )}

          {worker.padres?.length > 0 && (
            <Section icon={Users} title="Padres del Colaborador" color="bg-navy-500">
              {worker.padres.map((p, i) => (
                <div key={i} className="border-b border-gray-100 pb-2 mb-2 last:border-0">
                  <p className="text-xs font-bold text-navy-500 mb-1">{p.orden === 1 ? 'Padre' : 'Madre'}: {p.apellidos_nombres}</p>
                  <InfoRow label="Fecha de Nacimiento" value={fmt(p.fecha_nacimiento)} />
                  <InfoRow label="Nivel Instrucción" value={p.nivel_instruccion} />
                  <InfoRow label="Ocupación" value={p.ocupacion} />
                </div>
              ))}
            </Section>
          )}

          {worker.contactos_emergencia?.length > 0 && (
            <Section icon={Phone} title="Contactos de Emergencia">
              {worker.contactos_emergencia.map((c, i) => (
                <div key={i} className="border-b border-gray-100 pb-2 mb-2 last:border-0">
                  <p className="text-xs font-bold text-navy-700 mb-1">{c.apellidos_nombres}</p>
                  <InfoRow label="Parentesco" value={c.parentesco} />
                  <InfoRow label="Teléfono" value={c.telefono} />
                </div>
              ))}
            </Section>
          )}

          {worker.afp_pension && (
            <Section icon={CreditCard} title="AFP / Pensiones" color="bg-amber-600">
              <InfoRow label="Tipo" value={worker.afp_pension.tipo?.replace(/_/g, ' ')} />
              <InfoRow label="AFP Actual" value={worker.afp_pension.afp_actual} />
            </Section>
          )}
        </div>

        {/* Columna lateral — Documentos */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden sticky top-4">
            <div className="bg-navy-700 text-white px-4 py-2.5 flex items-center gap-2">
              <FileText size={15} />
              <span className="text-xs font-semibold uppercase tracking-wide">Documentos</span>
            </div>
            <div className="p-4">
              {(user?.rol === 'admin' || user?.rol === 'rh') && (
                <div className="mb-4">
                  <DocumentUpload trabajadorId={id} onUploaded={() => setDocsKey(k => k + 1)} />
                </div>
              )}
              <DocumentList key={docsKey} trabajadorId={id} />
            </div>
          </div>

          <div className="bg-navy-50 rounded-xl border border-navy-100 p-4 text-xs text-navy-600 space-y-1">
            <p className="font-semibold text-navy-700 mb-2">Información del Registro</p>
            <p><span className="font-medium">Registrado:</span> {fmt(worker.created_at)}</p>
            <p><span className="font-medium">Actualizado:</span> {fmt(worker.updated_at)}</p>
            <p><span className="font-medium">ID:</span> <span className="font-mono text-xs">{worker.id?.slice(0,8)}...</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
