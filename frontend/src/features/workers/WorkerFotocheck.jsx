import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workerService } from './workerService'
import { documentService } from '../documents/documentService'
import toast from 'react-hot-toast'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function WorkerFotocheck() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker] = useState(null)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      workerService.get(id),
      documentService.list(id),
    ]).then(([w, docs]) => {
      setWorker(w)
      const foto = docs.find(d => d.tipo_documento === 'Foto')
      setFotoUrl(foto?.url_storage || null)
    }).catch(() => toast.error('Trabajador no encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando fotocheck...</div>
  if (!worker) return <div className="p-8 text-center text-gray-400">Trabajador no encontrado.</div>

  const iniciales = `${worker.nombres?.[0] || ''}${worker.apellido_paterno?.[0] || ''}`
  const verifyUrl = `${window.location.origin}/verificar/${worker.id}`

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, header { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          body { margin: 0; background: white; }
          .fotocheck-page {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 100vh !important;
            gap: 20mm !important;
            padding: 10mm !important;
          }
          @page { margin: 6mm; size: A4; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Botones pantalla */}
      <div className="no-print flex gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} /> Volver
        </button>
        <button onClick={() => window.print()} className="btn-amber py-2 px-5">
          <CreditCard size={16} /> Imprimir Fotocheck
        </button>
      </div>

      {/* Contenedor de cards */}
      <div className="fotocheck-page flex flex-col items-center gap-10">

        {/* Etiqueta frente */}
        <div className="no-print text-xs text-gray-400 uppercase tracking-widest -mb-6">— Anverso —</div>

        {/* ══════════════════════════════════
            FRENTE
        ══════════════════════════════════ */}
        <div style={{
          width: '85.6mm', height: '54mm',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 50%, #0d6e6e 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>
          {/* Círculos decorativos fondo */}
          <div style={{
            position: 'absolute', top: '-18mm', right: '-10mm',
            width: '40mm', height: '40mm', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-12mm', left: '-8mm',
            width: '30mm', height: '30mm', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          {/* Barra amarilla izquierda */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '3mm',
            background: 'linear-gradient(180deg, #f59e0b, #d97706)',
          }} />

          {/* Contenido */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', padding: '3mm 3mm 3mm 5mm', gap: '3mm' }}>

            {/* Columna izquierda — foto */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '22mm' }}>
              <div style={{
                width: '20mm', height: '20mm', borderRadius: '50%',
                border: '2px solid #f59e0b',
                overflow: 'hidden',
                background: '#1a3a5c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {fotoUrl
                  ? <img src={fotoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#f59e0b', fontSize: '14pt', fontWeight: 'bold' }}>{iniciales}</span>
                }
              </div>
            </div>

            {/* Columna derecha — datos */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5mm' }}>
              {/* Logo + empresa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginBottom: '1mm' }}>
                <img src="/logo-cumbres.png" alt="Logo" style={{ height: '7mm', width: 'auto' }} />
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '5pt', lineHeight: '1.3' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '5.5pt', color: 'white' }}>CUMBRES</div>
                  <div>MONUMENTAL S.A.C.</div>
                </div>
              </div>

              {/* Nombre */}
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '9pt', lineHeight: '1.2' }}>
                {worker.apellido_paterno} {worker.apellido_materno}
              </div>
              <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '7.5pt' }}>
                {worker.nombres}
              </div>

              {/* Separador */}
              <div style={{ height: '0.3mm', background: 'rgba(245,158,11,0.5)', margin: '1mm 0' }} />

              {/* Cargo */}
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {worker.categoria}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '5.5pt' }}>
                {worker.ocupacion}
              </div>

              {/* Código */}
              <div style={{
                marginTop: '1.5mm',
                display: 'inline-block',
                background: 'rgba(245,158,11,0.2)',
                border: '1px solid rgba(245,158,11,0.5)',
                borderRadius: '2px',
                padding: '0.5mm 2mm',
                color: '#f59e0b', fontSize: '5.5pt', fontWeight: 'bold', fontFamily: 'monospace',
                alignSelf: 'flex-start',
              }}>
                {worker.codigo}
              </div>
            </div>
          </div>
        </div>

        {/* Etiqueta reverso */}
        <div className="no-print text-xs text-gray-400 uppercase tracking-widest -mb-6">— Reverso —</div>

        {/* ══════════════════════════════════
            REVERSO
        ══════════════════════════════════ */}
        <div style={{
          width: '85.6mm', height: '54mm',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 60%, #0d6e6e 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}>
          {/* Círculos decorativos */}
          <div style={{
            position: 'absolute', top: '-15mm', left: '-10mm',
            width: '35mm', height: '35mm', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10mm', right: '-8mm',
            width: '28mm', height: '28mm', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          {/* Barra amarilla derecha */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: '3mm',
            background: 'linear-gradient(180deg, #f59e0b, #d97706)',
          }} />

          {/* Contenido */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '3mm 6mm 3mm 4mm', gap: '3mm' }}>

            {/* Izquierda — Logo + datos */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5mm' }}>
              <img src="/logo-cumbres.png" alt="Logo" style={{ height: '8mm', width: 'auto', maxWidth: '24mm', objectFit: 'contain' }} />
              <div style={{ height: '0.3mm', background: 'rgba(245,158,11,0.5)', margin: '0.5mm 0' }} />
              {[
                { icon: '📍', text: 'Cal. Alfonso Cobian 179, San Luis' },
                { icon: '🏢', text: 'RUC: 20607279161' },
                { icon: '📋', text: `Frente: ${worker.frente_trabajo || '—'}` },
                { icon: '📅', text: `Ingreso: ${worker.fecha_ingreso ? new Date(worker.fecha_ingreso + 'T12:00:00').toLocaleDateString('es-PE') : '—'}` },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5mm' }}>
                  <span style={{ fontSize: '6pt' }}>{item.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '5pt', lineHeight: '1.3' }}>{item.text}</span>
                </div>
              ))}
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '4pt', marginTop: '1mm' }}>
                CONSTRUCTORA CUMBRES MONUMENTAL S.A.C.
              </div>
            </div>

            {/* Derecha — QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5mm', flexShrink: 0 }}>
              <div style={{ background: 'white', padding: '2mm', borderRadius: '4px' }}>
                <QRCodeSVG value={verifyUrl} size={80} level="M" />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '4.5pt', textAlign: 'center' }}>Escanear para{'\n'}verificar</span>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
