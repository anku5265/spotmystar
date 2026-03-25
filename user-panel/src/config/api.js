import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Inject auth token on every request
api.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('userToken');
    const artistToken = localStorage.getItem('artistToken');
    const token = userToken || artistToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear everything and redirect to login
      const hadUserToken = !!localStorage.getItem('userToken');

      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('artistToken');
      localStorage.removeItem('artistData');

      // Redirect to appropriate login page
      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath === '/' || currentPath.includes('/login') || currentPath.includes('/register');

      if (!isOnAuthPage && hadUserToken) {
        window.location.href = '/user/login';
      }
    } else if (error.response?.status === 403) {
      const userToken = localStorage.getItem('userToken');
      const currentPath = window.location.pathname;
      console.warn('RBAC: Access denied -', error.response.data?.message);
      if (userToken && !currentPath.startsWith('/user')) {
        window.location.href = '/user/dashboard';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
