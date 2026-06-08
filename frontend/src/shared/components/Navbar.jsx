import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Users, Plus, Building2, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-navy-700 shadow-lg">
      {/* Top strip — branding */}
      <div className="bg-navy-900 px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Cumbres — edificios SVG */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect x="4"  y="18" width="8"  height="18" rx="1" fill="#f59e0b"/>
            <rect x="14" y="10" width="10" height="26" rx="1" fill="#fbbf24"/>
            <rect x="26" y="14" width="10" height="22" rx="1" fill="#f59e0b"/>
            <rect x="6"  y="22" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
            <rect x="9"  y="22" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
            <rect x="16" y="14" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
            <rect x="20" y="14" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
            <rect x="16" y="20" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
            <rect x="20" y="20" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
            <rect x="28" y="18" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
            <rect x="32" y="18" width="2" height="3" rx="0.5" fill="#1e3a5c"/>
          </svg>
          <div>
            <span className="text-white font-bold text-sm tracking-widest uppercase">Cumbres</span>
            <span className="text-amber-400 text-xs block leading-none font-light italic">
              Cumplimos contigo
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-navy-300">
          <Building2 size={12} />
          <span>Constructora Cumbres Monumental S.A.C.</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="px-6 py-0 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive('/')
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-navy-200 hover:text-white hover:border-navy-400'
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link
            to="/trabajadores"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              location.pathname.startsWith('/trabajadores')
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-navy-200 hover:text-white hover:border-navy-400'
            }`}
          >
            <Users size={16} />
            Trabajadores
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {(user?.rol === 'admin' || user?.rol === 'rh') && (
            <Link to="/trabajadores/nuevo" className="btn-amber text-xs py-1.5 px-3">
              <Plus size={14} />
              Nuevo Trabajador
            </Link>
          )}

          <div className="flex items-center gap-2 pl-3 border-l border-navy-600">
            <div className="text-right">
              <p className="text-white text-xs font-semibold">{user?.nombre}</p>
              <p className="text-navy-300 text-xs capitalize">{user?.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-600 rounded-md transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
