import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { workerService } from './workerService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Search, Plus, Eye, Pencil, Trash2, Users,
  Filter, X, ChevronDown, Building2, HardHat
} from 'lucide-react'

const CATEGORIAS = ['Oficial', 'Operario', 'Peón', 'Capataz', 'Maestro de Obra', 'Técnico', 'Ingeniero']

export default function WorkerList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [filters, setFilters] = useState({
    nombre: '', dni: '', categoria: '', ocupacion: '',
    frente_trabajo: '', fecha_ingreso_desde: '', fecha_ingreso_hasta: ''
  })

  const fetchWorkers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await workerService.list(filters)
      setWorkers(data)
    } catch {
      toast.error('Error al cargar trabajadores')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchWorkers() }, [fetchWorkers])

  const handleFilter = (e) => {
    e.preventDefault()
    fetchWorkers()
  }

  const clearFilters = () => {
    setFilters({ nombre: '', dni: '', categoria: '', ocupacion: '', frente_trabajo: '', fecha_ingreso_desde: '', fecha_ingreso_hasta: '' })
  }

  const confirmDelete = async () => {
    try {
      await workerService.delete(deleteId)
      toast.success('Trabajador eliminado')
      setDeleteId(null)
      fetchWorkers()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 flex items-center gap-2">
            <HardHat size={24} className="text-amber-500" />
            Gestión de Trabajadores
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {workers.length} trabajador{workers.length !== 1 ? 'es' : ''} registrado{workers.length !== 1 ? 's' : ''}
          </p>
        </div>
        {(user?.rol === 'admin' || user?.rol === 'rh') && (
          <Link to="/trabajadores/nuevo" className="btn-amber">
            <Plus size={16} />
            Nuevo Trabajador
          </Link>
        )}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-card mb-6">
        <div className="p-4 flex gap-3 items-center border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.nombre}
              onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && fetchWorkers()}
              placeholder="Buscar por nombre o apellido..."
              className="field-input pl-9"
            />
          </div>
          <input
            value={filters.dni}
            onChange={e => setFilters(f => ({ ...f, dni: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && fetchWorkers()}
            placeholder="DNI..."
            className="field-input w-36"
          />
          <button onClick={fetchWorkers} className="btn-primary py-2">
            <Search size={15} /> Buscar
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary py-2 relative ${activeFilters > 0 ? 'border-amber-400 text-amber-600' : ''}`}
          >
            <Filter size={15} />
            Filtros
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-gray-400 hover:text-red-500 p-2" title="Limpiar filtros">
              <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="field-label">Categoría</label>
                <select
                  value={filters.categoria}
                  onChange={e => setFilters(f => ({ ...f, categoria: e.target.value }))}
                  className="field-input"
                >
                  <option value="">Todas</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Ocupación</label>
                <input
                  value={filters.ocupacion}
                  onChange={e => setFilters(f => ({ ...f, ocupacion: e.target.value }))}
                  placeholder="Ej: Albañil"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Frente de Trabajo</label>
                <input
                  value={filters.frente_trabajo}
                  onChange={e => setFilters(f => ({ ...f, frente_trabajo: e.target.value }))}
                  placeholder="Ej: Torre A"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Ingreso Desde</label>
                <input
                  type="date"
                  value={filters.fecha_ingreso_desde}
                  onChange={e => setFilters(f => ({ ...f, fecha_ingreso_desde: e.target.value }))}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-700 text-white">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Trabajador</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">DNI</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Ocupación</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Frente</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Ingreso</th>
                <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-navy-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Cargando trabajadores...
                    </div>
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={40} className="text-navy-200" />
                      <p className="font-medium text-gray-500">No se encontraron trabajadores</p>
                      <p className="text-xs">Intenta con otros filtros o registra un nuevo trabajador</p>
                    </div>
                  </td>
                </tr>
              ) : (
                workers.map((w, idx) => (
                  <tr key={w.id} className={`border-b border-gray-100 hover:bg-navy-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-navy-100 text-navy-700 px-2 py-0.5 rounded">
                        {w.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-navy-800">
                          {w.apellido_paterno} {w.apellido_materno}
                        </p>
                        <p className="text-gray-500 text-xs">{w.nombres}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{w.dni || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded">
                        {w.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{w.ocupacion}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{w.frente_trabajo || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {w.fecha_ingreso ? new Date(w.fecha_ingreso).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/trabajadores/${w.id}`)}
                          className="p-1.5 text-navy-600 hover:bg-navy-100 rounded-md transition-colors"
                          title="Ver ficha"
                        >
                          <Eye size={15} />
                        </button>
                        {(user?.rol === 'admin' || user?.rol === 'rh') && (
                          <button
                            onClick={() => navigate(`/trabajadores/${w.id}/editar`)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {user?.rol === 'admin' && (
                          <button
                            onClick={() => setDeleteId(w.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {workers.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            Mostrando {workers.length} resultado{workers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Modal Eliminar */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Eliminar Trabajador</h3>
                <p className="text-gray-500 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary py-2">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="btn-danger">
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
