import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mamacare_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default api;
