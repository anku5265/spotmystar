import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Inject artist token on every request
api.interceptors.request.use(
  (config) => {
    const artistToken = localStorage.getItem('artistToken');
    if (artistToken) config.headers.Authorization = `Bearer ${artistToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('artistToken');
      localStorage.removeItem('artistData');

      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath === '/login' || currentPath === '/register';
      if (!isOnAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
