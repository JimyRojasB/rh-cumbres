import { useEffect, useState } from 'react'
import { documentService } from './documentService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FileText, Trash2, Download, File } from 'lucide-react'

const ICONS = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
}

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function DocumentList({ trabajadorId }) {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    documentService.list(trabajadorId)
      .then(setDocs)
      .catch(() => toast.error('Error al cargar documentos'))
      .finally(() => setLoading(false))
  }, [trabajadorId])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await documentService.delete(id)
      setDocs(prev => prev.filter(d => d.id !== id))
      toast.success('Documento eliminado')
    } catch {
      toast.error('Error al eliminar documento')
    }
  }

  if (loading) return <p className="text-xs text-gray-400 text-center py-4">Cargando...</p>

  if (!docs.length) return (
    <div className="text-center py-6 text-gray-300">
      <FileText size={32} className="mx-auto mb-2" />
      <p className="text-xs text-gray-400">Sin documentos cargados</p>
    </div>
  )

  return (
    <div className="space-y-2">
      {docs.map(doc => (
        <div key={doc.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 group">
          <span className="text-base">📄</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-navy-700 truncate">{doc.nombre_archivo}</p>
            <div className="flex items-center gap-2">
              {doc.tipo_documento && (
                <span className="text-xs text-amber-600 font-medium">{doc.tipo_documento}</span>
              )}
              <span className="text-xs text-gray-400">{fmtSize(doc.tamano_bytes)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={doc.url_storage}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-navy-500 hover:text-navy-700"
              title="Abrir"
            >
              <Download size={13} />
            </a>
            {(user?.rol === 'admin' || user?.rol === 'rh') && (
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1 text-red-400 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
