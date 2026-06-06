import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './features/auth/Login'
import WorkerList from './features/workers/WorkerList'
import WorkerForm from './features/workers/WorkerForm'
import WorkerDetail from './features/workers/WorkerDetail'
import Navbar from './shared/components/Navbar'

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
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 py-6">
                <Routes>
                  <Route path="/"                         element={<WorkerList />} />
                  <Route path="/trabajadores/nuevo"       element={<WorkerForm />} />
                  <Route path="/trabajadores/:id"         element={<WorkerDetail />} />
                  <Route path="/trabajadores/:id/editar"  element={<WorkerForm />} />
                  <Route path="*"                         element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
