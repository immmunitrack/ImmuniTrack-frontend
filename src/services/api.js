import axios from 'axios';

console.log("Current API URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.VITE_API_URL || window.ENV?.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5050/api')
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('immunitrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default api;
