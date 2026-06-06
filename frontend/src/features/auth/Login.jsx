import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../config/axiosConfig'
import toast from 'react-hot-toast'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data)
      login(res.data.access_token, res.data.user)
      toast.success(`Bienvenido, ${res.data.user.nombre}`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — imagen/branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 relative overflow-hidden flex-col justify-between">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)`,
            backgroundSize: '20px 20px'
          }}
        />
        {/* Edificios decorativos */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-2 opacity-20">
          {[60,100,140,120,80,110,90].map((h, i) => (
            <div key={i} className="bg-amber-400 w-12 rounded-t-sm" style={{ height: `${h}px` }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center flex-1 px-12">
          {/* Logo grande */}
          <div className="mb-8">
            <svg width="80" height="80" viewBox="0 0 40 40" fill="none">
              <rect x="4"  y="18" width="8"  height="18" rx="1" fill="#f59e0b"/>
              <rect x="14" y="10" width="10" height="26" rx="1" fill="#fbbf24"/>
              <rect x="26" y="14" width="10" height="22" rx="1" fill="#f59e0b"/>
              <rect x="6"  y="22" width="2" height="3" rx="0.5" fill="#1e3a5c" opacity="0.6"/>
              <rect x="9"  y="22" width="2" height="3" rx="0.5" fill="#1e3a5c" opacity="0.6"/>
              <rect x="16" y="14" width="2" height="3" rx="0.5" fill="#1e3a5c" opacity="0.6"/>
              <rect x="20" y="14" width="2" height="3" rx="0.5" fill="#1e3a5c" opacity="0.6"/>
              <rect x="16" y="20" width="2" height="3" rx="0.5" fill="#1e3a5c" opacity="0.6"/>
              <rect x="20" y="20" width="2" height="3" rx="0.5" fill="#1e3a5c" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-white text-4xl font-bold tracking-wider mb-2">CUMBRES</h1>
          <p className="text-amber-400 text-lg italic font-light mb-8">Cumplimos contigo</p>
          <div className="w-16 h-0.5 bg-amber-400 mb-8" />
          <p className="text-navy-300 text-center text-sm leading-relaxed max-w-sm">
            Sistema de Gestión de Recursos Humanos<br />
            <span className="text-navy-200 font-medium">Constructora Cumbres Monumental S.A.C.</span>
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-xs">
            {[
              { label: 'Trabajadores', color: 'bg-amber-500' },
              { label: 'Documentos', color: 'bg-navy-600' },
              { label: 'Reportes', color: 'bg-navy-500' },
            ].map(({ label, color }) => (
              <div key={label} className={`${color} rounded-lg p-3 text-center`}>
                <p className="text-white text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 px-12 pb-6 text-navy-500 text-xs text-center">
          RUC: 20607279161 · Lima, Perú
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4"  y="18" width="8"  height="18" rx="1" fill="#1e3a5c"/>
              <rect x="14" y="10" width="10" height="26" rx="1" fill="#1e3a5c"/>
              <rect x="26" y="14" width="10" height="22" rx="1" fill="#f59e0b"/>
            </svg>
            <div>
              <p className="text-navy-700 font-bold text-xl tracking-widest">CUMBRES</p>
              <p className="text-amber-500 text-xs italic">Cumplimos contigo</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-8 border border-navy-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-700">Iniciar Sesión</h2>
              <p className="text-gray-500 text-sm mt-1">Sistema de Recursos Humanos</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="field-label">Correo Electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email', {
                      required: 'El correo es obligatorio',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' }
                    })}
                    type="email"
                    placeholder="usuario@cumbres.com"
                    className="field-input pl-9"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="field-label">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password', { required: 'La contraseña es obligatoria' })}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="field-input pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary justify-center py-3 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Ingresando...
                  </span>
                ) : 'Ingresar al Sistema'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Acceso restringido a personal autorizado de Cumbres Monumental
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 Constructora Cumbres Monumental S.A.C. · RH System v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
