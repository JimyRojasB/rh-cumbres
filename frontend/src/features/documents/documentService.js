import api from '../../config/axiosConfig'

export const documentService = {
  upload: (trabajadorId, file, tipoDocumento) => {
    const form = new FormData()
    form.append('file', file)
    if (tipoDocumento) form.append('tipo_documento', tipoDocumento)
    return api.post(`/trabajadores/${trabajadorId}/documentos`, form).then(r => r.data)
  },
  list: (trabajadorId) =>
    api.get(`/trabajadores/${trabajadorId}/documentos`).then(r => r.data),
  delete: (docId) =>
    api.delete(`/documentos/${docId}`).then(r => r.data),
}
