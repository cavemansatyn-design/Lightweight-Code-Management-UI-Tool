import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('user', JSON.stringify({
        ...response.data.user,
        access_token: response.data.access_token
      }));
    }
    return response.data;
  },
  register: (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }),
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout backend failed", e);
    }
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  getCurrentUser: () => JSON.parse(localStorage.getItem('user')),
};

export const workspace = {
  getProjects: () => api.get('/projects/'),
  getProjectStructure: (projectId) => api.get(`/projects/${projectId}/structure`),
  createFolder: (data) => api.post('/folders/', data),
  deleteFolder: (id) => api.delete(`/folders/${id}`),
  createFile: (data) => api.post('/files/', data),
  deleteFile: (id) => api.delete(`/files/${id}`),
  getFileContent: (id) => api.get(`/files/${id}`),
};

export const lock = {
  // Old declare method maps to new intent endpoint:
  declare: (fileId) => api.post(`/files/${fileId}/intent`, { file_id: fileId }),
  cancel: (fileId) => api.post('/locks/cancel', { file_id: fileId }),
  getStatus: (fileId) => api.get(`/locks/status/${fileId}`),

  // New Intent methods
  getPendingIntents: () => api.get('/intents/pending'),
  approveIntent: (intentId) => api.post(`/intents/${intentId}/approve`),
  rejectIntent: (intentId) => api.post(`/intents/${intentId}/reject`),
};

export const version = {
  save: (fileId, content) => api.post('/versions/save', { file_id: fileId, content }),
  getHistory: (fileId) => api.get(`/versions/history/${fileId}`),
};

export const ai = {
  generateReport: (projectId) => api.post('/ai/generate-ai-report', { project_id: projectId }),
  getReports: (projectId) => api.get('/ai/reports', { params: { project_id: projectId } }),
  getReport: (reportId) => api.get(`/ai/reports/${reportId}`),
};

export const admin = {
  getActiveLocks: () => api.get('/admin/locks'),
  forceUnlock: (lockId) => api.post(`/admin/locks/${lockId}/force-unlock`),

  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getLogs: () => api.get('/admin/logs'),
};

export const attendance = {
  getAll: () => api.get('/attendance/'),
  getActive: () => api.get('/attendance/active'),
  manualCheckout: () => api.post('/attendance/manual-checkout'),
};

export const meet = {
  getActive: () => api.get('/meet/'),
  start: () => api.post('/meet/start'),
  end: () => api.post('/meet/end'),
};

export const progress = {
  getMyProgress: () => api.get('/progress/me'),
};

export const chat = {
  getMessages: () => api.get('/chat/messages'),
  sendMessage: (content) => api.post('/chat/send', { content }),
};

export default api;
