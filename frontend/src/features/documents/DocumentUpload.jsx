import { useRef, useState } from 'react'
import { documentService } from './documentService'
import toast from 'react-hot-toast'
import { Upload, FileUp } from 'lucide-react'

const TIPOS = ['Foto', 'Huella Digital', 'Contrato', 'DNI', 'Ficha personal', 'Certificado', 'Constancia', 'Otro']

export default function DocumentUpload({ trabajadorId, onUploaded }) {
  const inputRef = useRef()
  const [tipo, setTipo] = useState('')
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo supera 10 MB')
      return
    }
    setUploading(true)
    try {
      await documentService.upload(trabajadorId, file, tipo || null)
      toast.success('Documento subido correctamente')
      onUploaded?.()
      setTipo('')
      inputRef.current.value = ''
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al subir documento')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={tipo}
        onChange={e => setTipo(e.target.value)}
        className="field-input text-xs"
      >
        <option value="">Tipo de documento...</option>
        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
          ${drag ? 'border-amber-400 bg-amber-50' : 'border-navy-200 hover:border-navy-400 hover:bg-navy-50'}
          ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-1 text-navy-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-xs">Subiendo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-navy-400">
            <FileUp size={20} />
            <p className="text-xs font-medium text-navy-600">Subir documento</p>
            <p className="text-xs text-gray-400">PDF, JPG, PNG · máx 10 MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={['Foto', 'Huella Digital'].includes(tipo) ? '.jpg,.jpeg,.png,.webp' : '.pdf,.jpg,.jpeg,.png'}
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )
}
