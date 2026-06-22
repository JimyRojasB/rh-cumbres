import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function WorkerVerify() {
  const { id } = useParams()
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get(`${API}/trabajadores/verificar/${id}`)
      .then(r => setWorker(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const fmt = (d) => {
    if (!d) return '—'
    return new Date(d + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '14pt', marginBottom: '8px' }}>Verificando...</div>
      </div>
    </div>
  )

  if (error || !worker) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Arial, sans-serif' }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '40px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '360px', width: '90%',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>No encontrado</div>
        <div style={{ color: '#666', fontSize: '10pt' }}>El código QR no corresponde a ningún trabajador registrado.</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 60%, #0d6e6e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '380px', width: '100%' }}>

        {/* Encabezado */}
        <div style={{ background: 'linear-gradient(135deg, #0f2744, #1a3a5c)', padding: '24px', textAlign: 'center' }}>
          <img src={`${window.location.origin}/logo-cumbres.png`} alt="Cumbres" style={{ height: '50px', width: 'auto', marginBottom: '8px' }} />
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8pt', letterSpacing: '1px' }}>
            CONSTRUCTORA CUMBRES MONUMENTAL S.A.C.
          </div>
        </div>

        {/* Badge ACTIVO */}
        <div style={{ background: '#dcfce7', borderBottom: '3px solid #16a34a', padding: '16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px rgba(22,163,74,0.3)' }} />
          <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '16pt', letterSpacing: '2px' }}>ACTIVO</span>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px rgba(22,163,74,0.3)' }} />
        </div>

        {/* Datos del trabajador */}
        <div style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#0f2744' }}>
              {worker.apellido_paterno} {worker.apellido_materno}
            </div>
            <div style={{ fontSize: '12pt', color: '#1a3a5c', marginTop: '2px' }}>
              {worker.nombres}
            </div>
            <div style={{
              display: 'inline-block', marginTop: '8px',
              background: '#fef3c7', border: '1px solid #f59e0b',
              borderRadius: '6px', padding: '3px 12px',
              color: '#92400e', fontWeight: 'bold', fontSize: '9pt', fontFamily: 'monospace',
            }}>
              {worker.codigo}
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Categoría', value: worker.categoria },
              { label: 'Ocupación', value: worker.ocupacion },
              { label: 'Empresa', value: worker.empresa || 'Cumbres Monumental SAC' },
              { label: 'Fecha de Ingreso', value: fmt(worker.fecha_ingreso) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '9pt' }}>{label}</span>
                <span style={{ color: '#0f2744', fontWeight: 'bold', fontSize: '9pt' }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div style={{ background: '#f8fafc', padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ color: '#94a3b8', fontSize: '7.5pt' }}>
            Verificación digital — Sistema RH Cumbres
          </div>
          <div style={{ color: '#94a3b8', fontSize: '7pt', marginTop: '2px' }}>
            RUC: 20607279161
          </div>
        </div>
      </div>
    </div>
  )
}
