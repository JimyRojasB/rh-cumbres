import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './features/auth/Login'
import Dashboard from './features/dashboard/Dashboard'
import WorkerList from './features/workers/WorkerList'
import WorkerForm from './features/workers/WorkerForm'
import WorkerDetail from './features/workers/WorkerDetail'
import WorkerPrint from './features/workers/WorkerPrint'
import WorkerFotocheck from './features/workers/WorkerFotocheck'
import WorkerVerify from './features/workers/WorkerVerify'
import Reports from './features/reports/Reports'
import Navbar from './shared/components/Navbar'
import AiChat from './features/ai/AiChat'

function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) return null
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuth } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/verificar/:id" element={<WorkerVerify />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex">
              <Navbar />
              <main className="flex-1 ml-60 min-h-screen">
                <div className="max-w-6xl mx-auto px-6 py-6">
                  <Routes>
                    <Route path="/"                          element={<Dashboard />} />
                    <Route path="/trabajadores"              element={<WorkerList />} />
                    <Route path="/trabajadores/nuevo"        element={<WorkerForm />} />
                    <Route path="/trabajadores/:id"          element={<WorkerDetail />} />
                    <Route path="/trabajadores/:id/editar"   element={<WorkerForm />} />
                    <Route path="/trabajadores/:id/imprimir"   element={<WorkerPrint />} />
                    <Route path="/trabajadores/:id/fotocheck" element={<WorkerFotocheck />} />
                    <Route path="/reportes"                  element={<Reports />} />
                    <Route path="*"                          element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
              <AiChat />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
