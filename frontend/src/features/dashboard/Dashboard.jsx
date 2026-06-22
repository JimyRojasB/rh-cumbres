import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { workerService } from '../workers/workerService'
import { useAuth } from '../../context/AuthContext'
import {
  Users, HardHat, Plus, TrendingUp, Building2,
  Eye, Printer, Calendar, AlertCircle
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts'

const CATEGORY_COLORS = {
  'Oficial': '#f59e0b',
  'Operario': '#1a3a5c',
  'Peón': '#6b7280',
  'Capataz': '#16a34a',
  'Técnico': '#7c3aed',
  'Maestro de Obra': '#0d6e6e',
  'Ingeniero': '#dc2626',
}

const FRENTE_COLORS = ['#0f2744', '#1a3a5c', '#f59e0b', '#16a34a', '#7c3aed', '#0d6e6e']

const BADGE_PALETTES = {
  amber:  'bg-amber-100 text-amber-700',
  navy:   'bg-navy-100 text-navy-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  gray:   'bg-gray-100 text-gray-600',
}

const CATEGORY_BADGE = {
  'Oficial': 'amber', 'Operario': 'navy', 'Peón': 'gray',
  'Capataz': 'green', 'Maestro de Obra': 'purple', 'Técnico': 'red',
}

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

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-navy-700">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value} trabajadores</p>
    </div>
  )
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-navy-700">{label}</p>
      <p className="text-gray-500">{payload[0].value} trabajadores</p>
    </div>
  )
}

const CustomAreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-navy-700">{label}</p>
      <p className="text-amber-600">{payload[0].value} ingresaron</p>
    </div>
  )
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

  const total = workers.length

  const porCategoria = workers.reduce((acc, w) => {
    if (w.categoria) acc[w.categoria] = (acc[w.categoria] || 0) + 1
    return acc
  }, {})

  const porFrente = workers.reduce((acc, w) => {
    const f = w.frente_trabajo || 'Sin asignar'
    acc[f] = (acc[f] || 0) + 1
    return acc
  }, {})

  const ingresadosEsteMes = workers.filter(w => {
    if (!w.fecha_ingreso) return false
    const ing = new Date(w.fecha_ingreso + 'T00:00:00')
    const hoy = new Date()
    return ing.getMonth() === hoy.getMonth() && ing.getFullYear() === hoy.getFullYear()
  }).length

  // Últimos 6 meses de ingresos
  const ingresosPorMes = (() => {
    const meses = []
    const hoy = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const mes = d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' })
      const count = workers.filter(w => {
        if (!w.fecha_ingreso) return false
        const ing = new Date(w.fecha_ingreso + 'T00:00:00')
        return ing.getMonth() === d.getMonth() && ing.getFullYear() === d.getFullYear()
      }).length
      meses.push({ mes, count })
    }
    return meses
  })()

  const pieData = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const barData = Object.entries(porFrente)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const recientes = [...workers]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)

  const fmt = (d) => d ? new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-PE') : '—'

  return (
    <div className="space-y-6">

      {/* Bienvenida */}
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
          {/* Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}     label="Total Trabajadores"  value={total}             color="text-navy-700"   bg="bg-navy-50"   border="border-navy-100" />
            <StatCard icon={HardHat}   label="Categorías"          value={Object.keys(porCategoria).length} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
            <StatCard icon={Building2} label="Frentes de Trabajo"  value={Object.keys(porFrente).filter(k => k !== 'Sin asignar').length} color="text-green-600" bg="bg-green-50" border="border-green-100" />
            <StatCard icon={Calendar}  label="Ingresos este mes"   value={ingresadosEsteMes} color="text-purple-600" bg="bg-purple-50" border="border-purple-100" />
          </div>

          {/* Gráficas fila 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Donut — Por Categoría */}
            <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
              <div className="bg-navy-700 text-white px-4 py-2.5 flex items-center gap-2">
                <TrendingUp size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Distribución por Categoría</span>
              </div>
              <div className="p-4" style={{ height: 260 }}>
                {pieData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center pt-10">Sin datos</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="45%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value) => <span style={{ fontSize: '11px', color: '#374151' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bar — Por Frente */}
            <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
              <div className="bg-navy-600 text-white px-4 py-2.5 flex items-center gap-2">
                <Building2 size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Personal por Frente de Trabajo</span>
              </div>
              <div className="p-4" style={{ height: 260 }}>
                {barData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center pt-10">Sin datos</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} width={72} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={800}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={FRENTE_COLORS[i % FRENTE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Area — Ingresos por mes */}
          <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
            <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center gap-2">
              <Calendar size={15} />
              <span className="text-xs font-semibold uppercase tracking-wide">Ingresos de Personal — Últimos 6 Meses</span>
            </div>
            <div className="p-4" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ingresosPorMes} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fill="url(#areaGradient)"
                    animationDuration={800}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#d97706' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de recientes */}
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
                      {['Código', 'Trabajador', 'Categoría', 'Frente', 'Ingreso', 'Acciones'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
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
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${BADGE_PALETTES[CATEGORY_BADGE[w.categoria]] || BADGE_PALETTES.gray}`}>
                            {w.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{w.frente_trabajo || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{fmt(w.fecha_ingreso)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => navigate(`/trabajadores/${w.id}`)}
                              className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-md transition-colors" title="Ver ficha">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => navigate(`/trabajadores/${w.id}/imprimir`)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Imprimir ficha">
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
