import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// ─── Jobs ──────────────────────────────────────────────────
export const jobsAPI = {
  getAll: (params) => API.get('/jobs', { params }),
  getOne: (id) => API.get(`/jobs/${id}`),
  create: (data) => API.post('/jobs', data),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  delete: (id) => API.delete(`/jobs/${id}`),
  getMyJobs: () => API.get('/jobs/my-jobs'),
  generateJD: (data) => API.post('/jobs/generate-jd', data),
};

// ─── Applications ──────────────────────────────────────────
export const applicationsAPI = {
  apply: (jobId, data) => API.post(`/applications/${jobId}/apply`, data),
  getMyApplications: () => API.get('/applications/my'),
  getJobApplications: (jobId) => API.get(`/applications/job/${jobId}`),
  updateStatus: (id, data) => API.put(`/applications/${id}/status`, data),
  analyze: (id) => API.post(`/applications/${id}/analyze`),
};

// ─── Resume ────────────────────────────────────────────────
export const resumeAPI = {
  upload: (formData) =>
    API.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyResumes: () => API.get('/resume/my'),
  getOne: (id) => API.get(`/resume/${id}`),
  delete: (id) => API.delete(`/resume/${id}`),
  setDefault: (id) => API.put(`/resume/${id}/set-default`),
};

export default API;
