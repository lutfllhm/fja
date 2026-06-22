import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Auth
  login: (username: string, password: string) =>
    apiClient.post('/api/auth/login', { username, password }),

  // Applications
  submitApplication: (formData: ApplicationFormData, files: { foto?: File; cv?: File; ttd?: File } = {}) => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value ?? '');
      }
    });
    if (files.foto) data.append('foto', files.foto);
    if (files.cv) data.append('cv', files.cv);
    if (files.ttd) data.append('ttd', files.ttd);
    return apiClient.post('/api/applications', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getApplications: (page = 1, limit = 10, search = '', status = '') =>
    apiClient.get('/api/applications', {
      params: { page, limit, search, status },
    }),

  getApplicationStats: () =>
    apiClient.get('/api/applications/stats'),

  getApplicationDetail: (id: number) =>
    apiClient.get(`/api/applications/${id}`),

  updateApplicationStatus: (id: number, status: string) =>
    apiClient.patch(`/api/applications/${id}/status`, { status }),

  deleteApplication: (id: number) =>
    apiClient.delete(`/api/applications/${id}`),

  downloadPdf: (id: number) =>
    apiClient.get(`/api/applications/${id}/pdf`, {
      responseType: 'blob',
    }),

  downloadCsv: (id: number) =>
    apiClient.get(`/api/applications/${id}/csv`, {
      responseType: 'blob',
    }),

  exportAllCsv: () =>
    apiClient.get('/api/applications/export/csv', {
      responseType: 'blob',
    }),
};

export default apiClient;

interface ApplicationFormData {
  [key: string]: any;
}
