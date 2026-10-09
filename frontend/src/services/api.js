import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 600000 // 10 minutes for heavy wipe operations
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('swp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
