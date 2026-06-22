import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workerService } from './workerService'
import { documentService } from '../documents/documentService'
import toast from 'react-hot-toast'
import { Printer, ArrowLeft } from 'lucide-react'

/* ── Logo real de la empresa ────────────────────────────────────── */
function LogoCumbres({ height = 56 }) {
  return (
    <img
      src="/logo-cumbres.png"
      alt="Cumbres"
      style={{ height: `${height}px`, width: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
    />
  )
}

/* ── Estilos base ────────────────────────────────────────────────── */
const base = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '8pt',
}
const tbl = { borderCollapse: 'collapse', width: '100%' }
const hdr = {
  backgroundColor: '#1a3a5c', color: 'white',
  fontWeight: 'bold', fontSize: '7.5pt',
  padding: '3px 6px', border: '1px solid #1a3a5c',
  textTransform: 'uppercase', letterSpacing: '0.3px',
}
const th = {
  border: '1px solid #555', padding: '2px 4px',
  fontSize: '6.5pt', color: '#444', fontWeight: 'normal',
  verticalAlign: 'middle', backgroundColor: '#f5f5f5',
}
const td = {
  border: '1px solid #555', padding: '2px 5px',
  fontSize: '8pt', verticalAlign: 'top',
}
const lbl = { fontSize: '6pt', color: '#666', display: 'block', lineHeight: '1.2' }
const val = { fontSize: '8.5pt', fontWeight: '500', display: 'block', minHeight: '11px' }

/* ── Componentes auxiliares ──────────────────────────────────────── */
function Hdr({ cols, children }) {
  return <tr><td colSpan={cols} style={hdr}>{children}</td></tr>
}
function Th({ children, style = {}, colSpan, rowSpan }) {
  return <td colSpan={colSpan} rowSpan={rowSpan} style={{ ...th, ...style }}>{children}</td>
}
function Td({ children, style = {}, colSpan, rowSpan }) {
  return <td colSpan={colSpan} rowSpan={rowSpan} style={{ ...td, ...style }}>{children}</td>
}
function F({ label, value, style = {}, colSpan, rowSpan }) {
  return (
    <td colSpan={colSpan} rowSpan={rowSpan} style={{ ...td, ...style }}>
      <span style={lbl}>{label}</span>
      <span style={val}>{value || ''}</span>
    </td>
  )
}
function Check({ checked }) {
  return (
    <span style={{
      display: 'inline-block', width: '12px', height: '12px',
      border: '1px solid #333', marginRight: '4px',
      textAlign: 'center', lineHeight: '12px', fontSize: '10pt', fontWeight: 'bold',
    }}>{checked ? '✓' : ''}</span>
  )
}

/* ── Componente principal ────────────────────────────────────────── */
export default function WorkerPrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker] = useState(null)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [huellaUrl, setHuellaUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      workerService.get(id),
      documentService.list(id),
    ]).then(([w, docs]) => {
      setWorker(w)
      const foto = docs.find(d => d.tipo_documento === 'Foto')
      const huella = docs.find(d => d.tipo_documento === 'Huella Digital')
      setFotoUrl(foto?.url_storage || null)
      setHuellaUrl(huella?.url_storage || null)
    }).catch(() => toast.error('Trabajador no encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando ficha...</div>
  if (!worker) return <div className="p-8 text-center text-gray-400">Trabajador no encontrado.</div>

  const fmt = (d) => {
    if (!d) return ''
    const s = d.includes('T') ? d : d + 'T12:00:00'
    return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  const edad = (fn) => {
    if (!fn) return ''
    const h = new Date(), n = new Date(fn + 'T12:00:00')
    let e = h.getFullYear() - n.getFullYear()
    if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--
    return String(e)
  }

  // el form guarda 'superior_tecnico_otros', la API puede devolver ambas formas
  const edu = (nivel) => {
    const map = { superior: 'superior_tecnico_otros' }
    return worker.educacion?.find(e => e.nivel === nivel || e.nivel === map[nivel]) || {}
  }
  const hijos = worker.hijos || []
  const padres = worker.padres || []
  const contactos = worker.contactos_emergencia || []
  const cony = worker.conyugue || {}
  const afp = worker.afp_pension || {}

  const hijoRows = Array.from({ length: 8 }, (_, i) => hijos[i] || null)
  const padreRows = Array.from({ length: 2 }, (_, i) => padres[i] || null)
  const ctcRows = Array.from({ length: 3 }, (_, i) => contactos[i] || null)

  // mapeo de valores del formulario → fila del PDF
  const afpTipo = afp.tipo || ''
  const esAfpPrivada = ['afiliarme_habitat','afiliarme_integra','afiliarme_prima','afiliarme_profuturo'].includes(afpTipo)
  const afpNombreElegido = afpTipo.startsWith('afiliarme_')
    ? afpTipo.replace('afiliarme_', '').toUpperCase()
    : (afp.afp_actual || '')

  const afpOpts = [
    {
      label: 'DESEO AFILIARME AL SISTEMA PRIVADO DE PENSIONES AFP HABITAT.',
      tag: 'INTEGRA',
      leftCheck: esAfpPrivada,
      extraLabel: afpNombreElegido,
    },
    {
      label: 'ESTOY ACTUALMENTE AFILIADO A LA AFP.',
      tag: 'PROFUTURO',
      leftCheck: afpTipo === 'afp_actual',
      extraLabel: afp.afp_actual || '',
    },
    {
      label: 'DESEO AFILIARME AL SISTEMA NACIONAL DE PENSIONES.',
      tag: 'PRIMA',
      leftCheck: afpTipo === 'snp_nuevo',
    },
    {
      label: 'DESEO PERMANECER EN EL SISTEMA NACIONAL DE PENSIONES.',
      tag: 'HABITAT',
      leftCheck: afpTipo === 'snp_permanece',
    },
  ]

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, header { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          body { margin: 0; background: white; }
          .ficha-wrap { padding: 5mm 7mm; max-width: 100% !important; box-shadow: none !important; }
          @page { margin: 8mm; size: A4; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        .ficha-wrap { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; }
      `}</style>

      {/* Botones pantalla */}
      <div className="no-print flex gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} /> Volver
        </button>
        <button onClick={() => window.print()} className="btn-amber py-2 px-5">
          <Printer size={16} /> Imprimir Ficha
        </button>
      </div>

      {/* ════════════════════════════════════════════════════
          FICHA — PÁGINA 1
      ════════════════════════════════════════════════════ */}
      <div className="ficha-wrap bg-white max-w-4xl mx-auto p-4 shadow-sm border border-gray-200">

        {/* ── ENCABEZADO ──────────────────────────────────── */}
        <table style={{ ...tbl, marginBottom: '-1px' }}>
          <tbody>
            <tr>
              {/* Logo */}
              <td style={{
                border: '2px solid #333', padding: '6px 12px',
                width: '110px', verticalAlign: 'middle', textAlign: 'center',
              }}>
                <LogoCumbres height={70} />
              </td>
              {/* Título */}
              <td style={{
                border: '2px solid #333', borderLeft: 'none',
                textAlign: 'center', verticalAlign: 'middle', padding: '6px',
              }}>
                <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#1a3a5c', letterSpacing: '1px' }}>
                  DATOS GENERALES DEL TRABAJADOR
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── TABLA PRINCIPAL ─────────────────────────────── */}
        <table style={{ ...tbl, borderTop: 'none' }}>
          <tbody>

            {/* ═══ DATOS DEL EMPLEADOR ═══ */}
            <Hdr cols={8}>DATOS DEL EMPLEADOR</Hdr>
            <tr>
              <Th colSpan={2} style={{ width: '22%' }}>RAZÓN SOCIAL O<br />DENOMINACIÓN SOCIAL</Th>
              <Th style={{ width: '10%' }}>RUC</Th>
              <Th colSpan={2} style={{ width: '30%', textAlign: 'center' }}>
                DOMICILIO<br /><span style={{ fontSize: '5.5pt' }}>(Dirección, distrito, departamento, provincia)</span>
              </Th>
              <Th colSpan={3} style={{ textAlign: 'center' }}>ACTIVIDAD ECONÓMICA</Th>
            </tr>
            <tr>
              <Td colSpan={2}><span style={val}>CONSTRUCTORA CUMBRES MONUMENTAL S.A.C.</span></Td>
              <Td><span style={val}>20607279161</span></Td>
              <Td colSpan={2}><span style={val}>CAL. ALFONSO COBIAN NRO. 179 URB. SAN LUIS</span></Td>
              <Td colSpan={3}><span style={val}>INMOBILIARIA, SERVICIOS DE CONSTRUCCIÓN</span></Td>
            </tr>

            {/* ═══ PERSONAL OBRERO ═══ */}
            <tr>
              <td colSpan={5} style={hdr}>PERSONAL OBRERO</td>
              {/* Huella + Foto — rowSpan cubre toda la sección Personal Obrero */}
              <td colSpan={3} rowSpan={10} style={{ ...td, verticalAlign: 'top', padding: '4px' }}>
                <div style={{ display: 'flex', gap: '6px', height: '100%', minHeight: '130px' }}>
                  <div style={{ flex: 1, border: '1px solid #888', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
                    {huellaUrl
                      ? <img src={huellaUrl} alt="Huella" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '6pt', color: '#666', marginTop: 'auto', marginBottom: '4px' }}>HUELLA DIGITAL</span>
                    }
                  </div>
                  <div style={{ flex: 1, border: '1px solid #888', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
                    {fotoUrl
                      ? <img src={fotoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '6pt', color: '#666', marginTop: 'auto', marginBottom: '4px' }}>FOTO</span>
                    }
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <Th colSpan={2}>CODIGO:</Th>
              <Td colSpan={3}><span style={val}>{worker.codigo}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>CATEGORÍA:</Th>
              <Td colSpan={3}><span style={val}>{worker.categoria}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>OCUPACIÓN:</Th>
              <Td colSpan={3}><span style={val}>{worker.ocupacion}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>FRENTE DE TRABAJO:</Th>
              <Td colSpan={3}><span style={val}>{worker.frente_trabajo}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>PARTIDA:</Th>
              <Td colSpan={3}><span style={val}>{worker.partida}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>EMPRESA:</Th>
              <Td colSpan={3}><span style={val}>{worker.empresa}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>FECHA DE INGRESO:</Th>
              <Td colSpan={3}><span style={val}>{fmt(worker.fecha_ingreso)}</span></Td>
            </tr>
            <tr>
              <Td colSpan={5} style={{ fontSize: '7.5pt', fontStyle: 'italic', padding: '3px 5px' }}>
                JORNADA LABORAL, 48 HORAS SEMANAL EN EL HORARIO QUE DETERMINE LA EMPRESA
              </Td>
            </tr>
            {/* fila vacía para rellenar rowspan */}
            <tr><td colSpan={5} style={{ ...td, padding: '0', border: 'none', height: '0' }}></td></tr>

            {/* ═══ DATOS PERSONALES ═══ */}
            <Hdr cols={8}>DATOS PERSONALES</Hdr>
            <tr>
              <Th colSpan={2} style={{ width: '28%' }}>APELLIDO PATERNO</Th>
              <Th colSpan={3} style={{ width: '36%' }}>APELLIDO MATERNO</Th>
              <Th colSpan={3}>NOMBRES</Th>
            </tr>
            <tr>
              <Td colSpan={2} style={{ fontSize: '11pt', fontWeight: 'bold', padding: '3px 5px' }}>
                {worker.apellido_paterno}
              </Td>
              <Td colSpan={3} style={{ fontSize: '11pt', fontWeight: 'bold', padding: '3px 5px' }}>
                {worker.apellido_materno}
              </Td>
              <Td colSpan={3} style={{ fontSize: '11pt', fontWeight: 'bold', padding: '3px 5px' }}>
                {worker.nombres}
              </Td>
            </tr>
            <tr>
              <Th colSpan={4}>DOMICILIO</Th>
              <Th colSpan={2}>DISTRITO</Th>
              <Th>PROV.</Th>
              <Th>TELÉFONO</Th>
            </tr>
            <tr>
              <Td colSpan={4}><span style={val}>{worker.domicilio}</span></Td>
              <Td colSpan={2}><span style={val}>{worker.distrito}</span></Td>
              <Td><span style={val}>{worker.provincia}</span></Td>
              <Td><span style={val}>{worker.telefono}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>DNI Y/O CE</Th>
              <Th>PASAPORTE</Th>
              <Th>EDAD</Th>
              <Th colSpan={2}>FECHA DE NACIMIENTO</Th>
              <Th>DISTRITO</Th>
              <Th>PROV. / TELÉFONO</Th>
            </tr>
            <tr>
              <Td colSpan={2}><span style={val}>{worker.dni}</span></Td>
              <Td><span style={val}>{worker.pasaporte}</span></Td>
              <Td><span style={val}>{edad(worker.fecha_nacimiento)}</span></Td>
              <Td colSpan={2}><span style={val}>{fmt(worker.fecha_nacimiento)}</span></Td>
              <Td><span style={val}>{worker.distrito}</span></Td>
              <Td><span style={val}>{worker.provincia} {worker.telefono}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>CORREO ELECTRÓNICO</Th>
              <Th colSpan={2}>NOMBRE DEL BANCO</Th>
              <Th colSpan={2}>N° DE CUENTA</Th>
              <Th colSpan={2}>NOMBRE DE AFP</Th>
            </tr>
            <tr>
              <Td colSpan={2}><span style={val}>{worker.correo_electronico}</span></Td>
              <Td colSpan={2}><span style={val}>{worker.nombre_banco}</span></Td>
              <Td colSpan={2}><span style={val}>{worker.numero_cuenta}</span></Td>
              <Td colSpan={2}><span style={val}>{worker.nombre_afp}</span></Td>
            </tr>

            {/* ═══ GRADO DE INSTRUCCIÓN ═══ */}
            <Hdr cols={8}>GRADO DE INSTRUCCIÓN</Hdr>
            <tr>
              <Th colSpan={2}></Th>
              <Th colSpan={3}>CENTRO DE ESTUDIOS</Th>
              <Th colSpan={2}>FECHA DE CULMINACIÓN</Th>
              <Th>GRADO OBTENIDO</Th>
            </tr>
            {[
              { key: 'primaria', label: 'PRIMARIA:' },
              { key: 'secundaria', label: 'SECUNDARIA:' },
              { key: 'superior', label: 'SUPERIOR / TÉCNICO / OTROS:' },
            ].map(({ key, label }) => (
              <tr key={key}>
                <Td colSpan={2} style={{ fontWeight: 'bold', fontSize: '7.5pt' }}>{label}</Td>
                <Td colSpan={3}><span style={val}>{edu(key).centro_estudios}</span></Td>
                <Td colSpan={2}><span style={val}>{edu(key).fecha_culminacion}</span></Td>
                <Td><span style={val}>{edu(key).grado_obtenido}</span></Td>
              </tr>
            ))}
            <tr>
              <Td colSpan={8} style={{ fontSize: '6pt', color: '#555', lineHeight: '1.5' }}>
                <strong>1</strong> INDICAR COMPLETA O INCOMPLETA.&nbsp;&nbsp;
                <strong>2</strong> INDICAR GRADO ACADÉMICO ALCANZADO EL MAX. SUPERIOR OBTENIDO.
              </Td>
            </tr>

            {/* ═══ DATOS DE LOS FAMILIARES ═══ */}
            <Hdr cols={8}>
              DATOS DE LOS FAMILIARES (INGRESAR LOS DATOS COMPLETOS PARA EL PROG. DE DECLA. TELEM. PDT)
            </Hdr>

            {/* Cónyuge */}
            <tr>
              <Th colSpan={4}>APELLIDOS Y NOMBRES DE LA CONYUGUE</Th>
              <Th colSpan={2}>FECHA DE NACIMIENTO</Th>
              <Th>EDAD</Th>
              <Th>TELÉFONO</Th>
            </tr>
            <tr>
              <Td colSpan={4}><span style={val}>{cony.apellidos_nombres}</span></Td>
              <Td colSpan={2}><span style={val}>{fmt(cony.fecha_nacimiento)}</span></Td>
              <Td><span style={val}>{edad(cony.fecha_nacimiento)}</span></Td>
              <Td><span style={val}>{cony.telefono}</span></Td>
            </tr>
            <tr>
              <Th colSpan={2}>GRADO DE INSTRUCCIÓN</Th>
              <Th colSpan={2}>OCUPACIÓN</Th>
              <Th colSpan={2}>N° PARTIDA DE MATRIMONIO</Th>
              <Th colSpan={2}>DNI Y/O CE</Th>
            </tr>
            <tr>
              <Td colSpan={2}><span style={val}>{cony.grado_instruccion}</span></Td>
              <Td colSpan={2}><span style={val}>{cony.ocupacion}</span></Td>
              <Td colSpan={2}><span style={val}>{cony.n_partida_matrimonio}</span></Td>
              <Td colSpan={2}><span style={val}>{cony.dni}</span></Td>
            </tr>

            {/* Hijos */}
            <tr>
              <Th colSpan={4}>APELLIDOS Y NOMBRES DE LOS HIJOS (MENORES DE 18 AÑOS)</Th>
              <Th colSpan={2}>FECHA DE NACIMIENTO</Th>
              <Th>EDAD</Th>
              <Th>TELÉFONO</Th>
            </tr>
            {hijoRows.map((h, i) => (
              <tr key={i}>
                <Td style={{ width: '4%', color: '#555', fontSize: '7.5pt' }}>{i + 1}.-</Td>
                <Td colSpan={3}><span style={val}>{h?.apellidos_nombres}</span></Td>
                <Td colSpan={2}><span style={val}>{h ? fmt(h.fecha_nacimiento) : ''}</span></Td>
                <Td><span style={val}>{h ? edad(h.fecha_nacimiento) : ''}</span></Td>
                <Td><span style={val}>{h?.telefono}</span></Td>
              </tr>
            ))}

            {/* Padres */}
            <tr>
              <Th colSpan={4}>APELLIDOS Y NOMBRES DE LOS PADRES DEL COLABORADOR</Th>
              <Th colSpan={2}>FECHA DE NACIMIENTO</Th>
              <Th colSpan={2}>NIVEL DE INSTRUCCIÓN &nbsp;|&nbsp; OCUPACIÓN</Th>
            </tr>
            {padreRows.map((p, i) => (
              <tr key={i}>
                <Td style={{ width: '4%', color: '#555', fontSize: '7.5pt' }}>{i + 1}.-</Td>
                <Td colSpan={3}><span style={val}>{p?.apellidos_nombres}</span></Td>
                <Td colSpan={2}><span style={val}>{p ? fmt(p.fecha_nacimiento) : ''}</span></Td>
                <Td><span style={val}>{p?.nivel_instruccion}</span></Td>
                <Td><span style={val}>{p?.ocupacion}</span></Td>
              </tr>
            ))}

          {/* ══ CONTINÚA: AFP, CONTACTOS, FIRMAS ══ */}

              {/* Encabezado NO APLICA */}
              <tr>
                <Td colSpan={8} style={{ fontWeight: 'bold', fontSize: '8pt', backgroundColor: '#e8e8e8' }}>
                  NO APLICA EN EL CASO DE PRACTICANTES
                </Td>
              </tr>

              {/* Nombre del trabajador */}
              <tr>
                <Td colSpan={4}>
                  <span style={lbl}>YO,</span>
                  <span style={{ ...val, fontSize: '9pt', fontWeight: 'bold' }}>
                    {worker.apellido_paterno} {worker.apellido_materno} {worker.nombres}
                  </span>
                </Td>
                <Td colSpan={4}>
                  <span style={lbl}>IDENTIFICADO CON DNI,</span>
                  <span style={{ ...val, fontSize: '9pt', fontWeight: 'bold' }}>{worker.dni}</span>
                </Td>
              </tr>
              <tr>
                <Td colSpan={8}>
                  <span style={lbl}>Y DOMICILIO EN,</span>
                  <span style={val}>{worker.domicilio} {worker.distrito} {worker.provincia}</span>
                </Td>
              </tr>

              {/* AFP */}
              <Hdr cols={8}>COMUNICO A USTEDES CONSTRUCTORA CUMBRES MONUMENTAL SAC LO SIGUIENTE:</Hdr>

              {afpOpts.map((opt, i) => (
                <tr key={i}>
                  <Td style={{ width: '4%', textAlign: 'center', fontSize: '7.5pt', color: '#555' }}>
                    {i + 1}.-
                  </Td>
                  <Td style={{ width: '8%', textAlign: 'center', verticalAlign: 'middle' }}>
                    <Check checked={opt.leftCheck} />
                  </Td>
                  <Td colSpan={4} style={{ fontSize: '8pt' }}>
                    {opt.label}
                    {opt.extraLabel ? <strong> {opt.extraLabel.toUpperCase()}</strong> : ''}
                  </Td>
                  <Td style={{ width: '10%', textAlign: 'center', fontWeight: 'bold', fontSize: '8pt' }}>
                    {opt.tag}
                  </Td>
                  <Td style={{ width: '8%', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ width: '16px', height: '16px', border: '1px solid #333', margin: '0 auto' }}></div>
                  </Td>
                </tr>
              ))}

              {/* Contactos de Emergencia */}
              <Hdr cols={8}>EN CASO DE EMERGENCIA PERSONA DE CONTACTO</Hdr>
              <tr>
                <Th style={{ width: '4%' }}></Th>
                <Th colSpan={3}>APELLIDOS Y NOMBRES</Th>
                <Th colSpan={2}>PARENTESCO</Th>
                <Th>TELÉFONO</Th>
                <Th>OTRO</Th>
              </tr>
              {ctcRows.map((c, i) => (
                <tr key={i}>
                  <Td style={{ color: '#555', fontSize: '7.5pt' }}>{i + 1}.-</Td>
                  <Td colSpan={3}><span style={val}>{c?.apellidos_nombres}</span></Td>
                  <Td colSpan={2}><span style={val}>{c?.parentesco}</span></Td>
                  <Td><span style={val}>{c?.telefono}</span></Td>
                  <Td></Td>
                </tr>
              ))}

              {/* Texto consentimiento */}
              <tr>
                <Td colSpan={8} style={{ fontSize: '6.5pt', lineHeight: '1.6', padding: '6px 5px' }}>
                  EL TRABAJADOR brinda su consentimiento para que LA EMPRESA permita el acceso a su información a empresas a las cuales sub contrata a efectos de cumplir con sus obligaciones laborales
                  así como también comparta su información personal con empresas relacionadas del sistema financiero y que estas lo contacten para ofrecerle productos que puedan ser de su interés.
                  Esta información recogida a través del presente formulario o cualquier otro documento a través del cual EL TRABAJADOR brinda información personal será almacenada en una base de datos
                  administrada por la EMPRESA que se encuentra protegida de acuerdo con la Política de Privacidad y de Protección de Datos Personales que éste mantiene en concordancia con la
                  Ley N° 29733, su Reglamento, aprobado por Decreto Supremo N° 003-2013-JUS y la Directiva de Seguridad aprobada por la Autoridad Nacional de Protección de Datos Personales -
                  en adelante las normas de protección de bases de datos personales.
                </Td>
              </tr>
              <tr>
                <Td colSpan={8} style={{ fontSize: '7.5pt', fontWeight: 'bold', padding: '6px 5px' }}>
                  DEJO CONSTANCIA QUE LOS DATOS CONSIGNADOS EN LA PRESENTE FICHA SON VERACES, ASUMIENDO LA RESPONSABILIDAD EN CASO SER FALSOS.
                </Td>
              </tr>

              {/* Firmas */}
              <tr>
                <td colSpan={5} style={{ ...td, height: '90px', verticalAlign: 'bottom', padding: '4px 6px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ borderTop: '1px solid #333', paddingTop: '3px', textAlign: 'center' }}>
                        <div style={{ fontSize: '7pt' }}>FIRMA DEL TRABAJADOR</div>
                        <div style={{ fontSize: '7pt' }}>COMO INDICA SU DNI Y/O CE</div>
                      </div>
                    </div>
                    <div style={{
                      width: '80px', height: '60px',
                      border: '1px solid #888',
                      display: 'flex', alignItems: 'flex-end',
                      justifyContent: 'center', paddingBottom: '3px',
                    }}>
                      <span style={{ fontSize: '6pt', color: '#888' }}>HUELLA DIGITAL</span>
                    </div>
                  </div>
                </td>
                <td colSpan={3} style={{ ...td, height: '90px', verticalAlign: 'bottom', padding: '4px 6px' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '3px', textAlign: 'center', marginTop: '60px' }}>
                    <div style={{ fontSize: '7pt' }}>FIRMA DEL JEFE DE PERSONAL Y/O</div>
                    <div style={{ fontSize: '7pt' }}>ADMINISTRADOR DE OBRA</div>
                  </div>
                </td>
              </tr>

          </tbody>
        </table>
      </div>
    </>
  )
}
