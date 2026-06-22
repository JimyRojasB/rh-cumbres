import { useEffect, useState } from 'react'
import { workerService } from '../workers/workerService'
import { BarChart2, Download, FileText, Filter, Users, RefreshCw } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const CATEGORIAS = ['', 'Oficial', 'Operario', 'Peón', 'Capataz', 'Técnico', 'Maestro de Obra']
const FRENTES = ['', 'Torre A', 'Torre B', 'Torre C', 'Sótano', 'Acabados']

const fmt = (d) => {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Reports() {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    categoria: '',
    frente_trabajo: '',
    fecha_ingreso_desde: '',
    fecha_ingreso_hasta: '',
  })

  const fetchWorkers = () => {
    setLoading(true)
    workerService.list(filters)
      .then(setWorkers)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchWorkers() }, [])

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))

  const exportExcel = () => {
    const rows = workers.map((w, i) => ({
      '#': i + 1,
      'Código': w.codigo,
      'Apellido Paterno': w.apellido_paterno,
      'Apellido Materno': w.apellido_materno,
      'Nombres': w.nombres,
      'DNI': w.dni,
      'Categoría': w.categoria,
      'Ocupación': w.ocupacion,
      'Frente de Trabajo': w.frente_trabajo,
      'Empresa': w.empresa,
      'Fecha de Ingreso': fmt(w.fecha_ingreso),
      'Teléfono': w.telefono,
      'Banco': w.nombre_banco,
      'AFP': w.nombre_afp,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 4 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 20 },
      { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 28 },
      { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Personal')
    const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-')
    XLSX.writeFile(wb, `Reporte_Personal_${fecha}.xlsx`)
  }

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

    // Encabezado
    doc.setFillColor(15, 39, 68)
    doc.rect(0, 0, 297, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('CONSTRUCTORA CUMBRES MONUMENTAL S.A.C.', 14, 9)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Reporte de Personal', 14, 15)
    doc.text(`Fecha: ${fecha}  |  Total: ${workers.length} trabajadores`, 297 - 14, 15, { align: 'right' })

    // Filtros aplicados
    const filtrosTexto = []
    if (filters.categoria) filtrosTexto.push(`Categoría: ${filters.categoria}`)
    if (filters.frente_trabajo) filtrosTexto.push(`Frente: ${filters.frente_trabajo}`)
    if (filters.fecha_ingreso_desde) filtrosTexto.push(`Desde: ${fmt(filters.fecha_ingreso_desde)}`)
    if (filters.fecha_ingreso_hasta) filtrosTexto.push(`Hasta: ${fmt(filters.fecha_ingreso_hasta)}`)
    if (filtrosTexto.length) {
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(7.5)
      doc.text(`Filtros: ${filtrosTexto.join('  |  ')}`, 14, 26)
    }

    autoTable(doc, {
      startY: filtrosTexto.length ? 30 : 24,
      head: [['#', 'Código', 'Apellidos y Nombres', 'DNI', 'Categoría', 'Ocupación', 'Frente', 'Fecha Ingreso', 'Teléfono']],
      body: workers.map((w, i) => [
        i + 1,
        w.codigo,
        `${w.apellido_paterno} ${w.apellido_materno}, ${w.nombres}`,
        w.dni || '—',
        w.categoria,
        w.ocupacion,
        w.frente_trabajo || '—',
        fmt(w.fecha_ingreso),
        w.telefono || '—',
      ]),
      headStyles: { fillColor: [15, 39, 68], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 18 },
        2: { cellWidth: 55 },
        3: { cellWidth: 20 },
        4: { cellWidth: 22 },
        5: { cellWidth: 30 },
        6: { cellWidth: 22 },
        7: { cellWidth: 24 },
        8: { cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
    })

    // Pie de página
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(`Página ${i} de ${pages}  —  Sistema RH Cumbres  —  RUC: 20607279161`, 148.5, 205, { align: 'center' })
    }

    const fechaFile = new Date().toLocaleDateString('es-PE').replace(/\//g, '-')
    doc.save(`Reporte_Personal_${fechaFile}.pdf`)
  }

  const resumen = {
    total: workers.length,
    categorias: [...new Set(workers.map(w => w.categoria).filter(Boolean))].length,
    frentes: [...new Set(workers.map(w => w.frente_trabajo).filter(Boolean))].length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center">
            <BarChart2 size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-700">Reportes</h1>
            <p className="text-xs text-gray-400">Filtra y exporta el listado de personal</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} disabled={!workers.length}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors">
            <Download size={14} /> Exportar Excel
          </button>
          <button onClick={exportPDF} disabled={!workers.length}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors">
            <FileText size={14} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-card p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} className="text-navy-500" />
          <span className="text-xs font-semibold text-navy-700 uppercase tracking-wide">Filtros</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoría</label>
            <select value={filters.categoria} onChange={e => setFilter('categoria', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-navy-400">
              {CATEGORIAS.map(c => <option key={c} value={c}>{c || 'Todas'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Frente de Trabajo</label>
            <select value={filters.frente_trabajo} onChange={e => setFilter('frente_trabajo', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-navy-400">
              {FRENTES.map(f => <option key={f} value={f}>{f || 'Todos'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ingreso desde</label>
            <input type="date" value={filters.fecha_ingreso_desde}
              onChange={e => setFilter('fecha_ingreso_desde', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-navy-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ingreso hasta</label>
            <input type="date" value={filters.fecha_ingreso_hasta}
              onChange={e => setFilter('fecha_ingreso_hasta', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-navy-400" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={fetchWorkers}
            className="flex items-center gap-2 bg-navy-700 hover:bg-navy-600 text-white text-xs font-semibold py-2 px-5 rounded-lg transition-colors">
            <RefreshCw size={13} /> Aplicar filtros
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total trabajadores', value: resumen.total, icon: Users, color: 'text-navy-700' },
          { label: 'Categorías', value: resumen.categorias, icon: BarChart2, color: 'text-amber-600' },
          { label: 'Frentes de trabajo', value: resumen.frentes, icon: Filter, color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-navy-100 shadow-card p-4 flex items-center gap-4">
            <Icon size={22} className={color} />
            <div>
              <p className="text-2xl font-bold text-navy-800">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
        <div className="bg-navy-700 text-white px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide">Personal ({workers.length})</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Cargando...</div>
        ) : workers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No hay trabajadores con los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">
                  {['#', 'Código', 'Apellidos y Nombres', 'DNI', 'Categoría', 'Ocupación', 'Frente', 'Ingreso', 'Teléfono'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-navy-600 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workers.map((w, i) => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-amber-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs bg-navy-100 text-navy-700 px-2 py-0.5 rounded">{w.codigo}</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-navy-800 whitespace-nowrap">
                      {w.apellido_paterno} {w.apellido_materno}, <span className="font-normal text-gray-600">{w.nombres}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 font-mono">{w.dni || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded">{w.categoria}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{w.ocupacion}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{w.frente_trabajo || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{fmt(w.fecha_ingreso)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{w.telefono || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
