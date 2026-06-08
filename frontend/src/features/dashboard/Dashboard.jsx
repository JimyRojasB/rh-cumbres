import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { workerService } from '../workers/workerService'
import { useAuth } from '../../context/AuthContext'
import {
  Users, HardHat, Plus, TrendingUp, Building2,
  Eye, Printer, Calendar, AlertCircle
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color = 'text-navy-700', bg = 'bg-navy-50', border = 'border-navy-100' }) {
  return (
    <div className={`${bg} border ${border} rounded-xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}

function Badge({ text, color }) {
  const palettes = {
    amber:  'bg-amber-100 text-amber-700',
    navy:   'bg-navy-100 text-navy-700',
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray:   'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${palettes[color] || palettes.gray}`}>
      {text}
    </span>
  )
}

const CATEGORY_COLORS = {
  'Oficial': 'amber', 'Operario': 'navy', 'Peón': 'gray',
  'Capataz': 'green', 'Maestro de Obra': 'purple',
  'Técnico': 'red', 'Ingeniero': 'navy',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    workerService.list()
      .then(setWorkers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* ── Stats derivadas ── */
  const total = workers.length

  const porCategoria = workers.reduce((acc, w) => {
    acc[w.categoria] = (acc[w.categoria] || 0) + 1
    return acc
  }, {})

  const porFrente = workers.reduce((acc, w) => {
    const f = w.frente_trabajo || 'Sin asignar'
    acc[f] = (acc[f] || 0) + 1
    return acc
  }, {})

  const recientes = [...workers]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)

  const ingresadosEsteMes = workers.filter(w => {
    if (!w.fecha_ingreso) return false
    const ing = new Date(w.fecha_ingreso + 'T00:00:00')
    const hoy = new Date()
    return ing.getMonth() === hoy.getMonth() && ing.getFullYear() === hoy.getFullYear()
  }).length

  const fmt = (d) => d ? new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-PE') : '—'

  return (
    <div className="space-y-6">

      {/* ── Bienvenida ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 flex items-center gap-2">
            <Building2 size={24} className="text-amber-500" />
            Panel de Control
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Bienvenido, <span className="font-semibold text-navy-700">{user?.nombre}</span> — {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {(user?.rol === 'admin' || user?.rol === 'rh') && (
          <Link to="/trabajadores/nuevo" className="btn-amber">
            <Plus size={16} /> Nuevo Trabajador
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-navy-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : (
        <>
          {/* ── Tarjetas de estadísticas ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}      label="Total Trabajadores"    value={total}             color="text-navy-700"  bg="bg-navy-50"   border="border-navy-100" />
            <StatCard icon={HardHat}    label="Categorías"            value={Object.keys(porCategoria).length} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
            <StatCard icon={Building2}  label="Frentes de Trabajo"    value={Object.keys(porFrente).filter(k => k !== 'Sin asignar').length} color="text-green-600" bg="bg-green-50" border="border-green-100" />
            <StatCard icon={Calendar}   label="Ingresos este mes"     value={ingresadosEsteMes} color="text-purple-600" bg="bg-purple-50" border="border-purple-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Distribución por categoría ── */}
            <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
              <div className="bg-navy-700 text-white px-4 py-2.5 flex items-center gap-2">
                <TrendingUp size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Por Categoría</span>
              </div>
              <div className="p-4 space-y-2">
                {total === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Sin datos</p>
                ) : (
                  Object.entries(porCategoria)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 w-36 truncate">{cat}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-400 h-2 rounded-full transition-all"
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-navy-700 w-8 text-right">{count}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* ── Distribución por frente ── */}
            <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
              <div className="bg-navy-600 text-white px-4 py-2.5 flex items-center gap-2">
                <Building2 size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Por Frente de Trabajo</span>
              </div>
              <div className="p-4 space-y-2">
                {total === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Sin datos</p>
                ) : (
                  Object.entries(porFrente)
                    .sort((a, b) => b[1] - a[1])
                    .map(([frente, count]) => (
                      <div key={frente} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-700">{frente}</span>
                        <span className="text-xs font-bold bg-navy-100 text-navy-700 px-2 py-0.5 rounded">
                          {count} {count === 1 ? 'trabajador' : 'trabajadores'}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* ── Accesos rápidos ── */}
            <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
              <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center gap-2">
                <AlertCircle size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Accesos Rápidos</span>
              </div>
              <div className="p-4 space-y-2">
                <Link to="/trabajadores" className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy-50 transition-colors group">
                  <div className="w-9 h-9 bg-navy-100 rounded-lg flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                    <Users size={16} className="text-navy-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-700">Todos los Trabajadores</p>
                    <p className="text-xs text-gray-400">Ver lista completa</p>
                  </div>
                </Link>
                {(user?.rol === 'admin' || user?.rol === 'rh') && (
                  <Link to="/trabajadores/nuevo" className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors group">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <Plus size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-700">Registrar Trabajador</p>
                      <p className="text-xs text-gray-400">Agregar nuevo registro</p>
                    </div>
                  </Link>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Constructora Cumbres</p>
                    <p className="text-xs text-gray-400">RUC: 20607279161</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Trabajadores recientes ── */}
          <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
            <div className="bg-navy-700 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardHat size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Trabajadores Registrados Recientemente</span>
              </div>
              <Link to="/trabajadores" className="text-xs text-amber-300 hover:text-amber-200 font-medium">
                Ver todos →
              </Link>
            </div>
            {recientes.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Users size={32} className="mx-auto mb-2 text-navy-200" />
                <p>No hay trabajadores registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trabajador</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Frente</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingreso</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.map((w, idx) => (
                      <tr key={w.id} className={`border-b border-gray-50 hover:bg-navy-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-navy-100 text-navy-700 px-2 py-0.5 rounded">{w.codigo}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-navy-800 text-sm">{w.apellido_paterno} {w.apellido_materno}</p>
                          <p className="text-gray-400 text-xs">{w.nombres}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge text={w.categoria} color={CATEGORY_COLORS[w.categoria] || 'gray'} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{w.frente_trabajo || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{fmt(w.fecha_ingreso)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/trabajadores/${w.id}`)}
                              className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-md transition-colors"
                              title="Ver ficha"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => navigate(`/trabajadores/${w.id}/imprimir`)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Imprimir ficha"
                            >
                              <Printer size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
