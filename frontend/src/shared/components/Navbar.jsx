import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Users, Plus, LayoutDashboard, BarChart2, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'

function NavLink({ to, Icon, label, exact }) {
  const location = useLocation()
  const active = exact
    ? location.pathname === to
    : location.pathname.startsWith(to)
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-amber-500 text-white'
          : 'text-navy-200 hover:bg-navy-700 hover:text-white'
      }`}
    >
      <Icon size={17} />
      {label}
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-navy-800 flex flex-col z-40 shadow-xl">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <img src="/logo-cumbres.png" alt="Logo" className="h-9 w-auto" />
          <div>
            <p className="text-white text-xs font-bold leading-tight">CUMBRES</p>
            <p className="text-navy-300 text-xs leading-tight">MONUMENTAL S.A.C.</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-navy-400 text-xs uppercase tracking-widest px-4 mb-2">Menú</p>
        <NavLink to="/" Icon={LayoutDashboard} label="Inicio" exact />
        <NavLink to="/trabajadores" Icon={Users} label="Trabajadores" />
        <NavLink to="/reportes" Icon={FileSpreadsheet} label="Reportes" />
      </nav>

      {/* Nuevo trabajador */}
      {(user?.rol === 'admin' || user?.rol === 'rh') && (
        <div className="px-3 pb-3">
          <Link
            to="/trabajadores/nuevo"
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nuevo Trabajador
          </Link>
        </div>
      )}

      {/* Usuario + logout */}
      <div className="border-t border-navy-700 px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">
            {user?.nombre?.[0]?.toUpperCase() || 'A'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{user?.nombre}</p>
          <p className="text-navy-400 text-xs capitalize">{user?.rol}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 text-navy-400 hover:text-white hover:bg-navy-700 rounded-md transition-colors shrink-0"
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
