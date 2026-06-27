import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Injeta token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meetup_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trata 401 globalmente
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('meetup_token');
      localStorage.removeItem('meetup_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ====== Auth ======
export const authApi = {
  cadastrarUsuario: (data) => api.post('/auth/usuario/cadastro', data),
  loginUsuario: (data) => api.post('/auth/usuario/login', data),
  cadastrarEstabelecimento: (data) => api.post('/auth/estabelecimento/cadastro', data),
  loginEstabelecimento: (data) => api.post('/auth/estabelecimento/login', data),
};

// ====== Roles ======
export const rolesApi = {
  listar: (params) => api.get('/roles', { params }),
  getById: (id) => api.get(`/roles/${id}`),
  criar: (data) => api.post('/roles', data),
  editar: (id, data) => api.put(`/roles/${id}`, data),
  deletar: (id) => api.delete(`/roles/${id}`),
  inscrever: (id) => api.post(`/roles/${id}/inscrever`),
  cancelar: (id) => api.delete(`/roles/${id}/inscrever`),
  comentar: (id, texto) => api.post(`/roles/${id}/comentar`, { texto }),
  mapa: () => api.get('/roles/mapa'),
};

// ====== Usuários ======
export const usuariosApi = {
  me: () => api.get('/usuarios/me'),
  editar: (data) => api.put('/usuarios/me', data),
  historico: () => api.get('/usuarios/historico'),
  perfil: (id) => api.get(`/usuarios/${id}`),
};

// ====== Estabelecimentos ======
export const estabelecimentosApi = {
  me: () => api.get('/estabelecimentos/me'),
  editar: (data) => api.put('/estabelecimentos/me', data),
  criarEvento: (data) => api.post('/estabelecimentos/eventos', data),
  listarEventos: () => api.get('/estabelecimentos/eventos'),
  meusEventos: () => api.get('/estabelecimentos/meus-eventos'),
  inscritos: (id) => api.get(`/estabelecimentos/eventos/${id}/inscritos`),
  inscreverEvento: (id) => api.post(`/estabelecimentos/eventos/${id}/inscrever`),
};

export default api;
