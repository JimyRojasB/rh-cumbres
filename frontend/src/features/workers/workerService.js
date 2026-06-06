import api from '../../config/axiosConfig'

export const workerService = {
  list: (filters = {}) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    return api.get('/trabajadores', { params }).then(r => r.data)
  },
  get: (id) => api.get(`/trabajadores/${id}`).then(r => r.data),
  create: (data) => api.post('/trabajadores', data).then(r => r.data),
  update: (id, data) => api.put(`/trabajadores/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/trabajadores/${id}`).then(r => r.data),
}
