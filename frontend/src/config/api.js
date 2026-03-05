import axios from 'axios';

// Use environment variable for API URL in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userToken = localStorage.getItem('userToken');
    const artistToken = localStorage.getItem('artistToken');
    const token = userToken || artistToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage but don't auto-redirect
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('artistToken');
      localStorage.removeItem('artistData');
      
      console.warn('Authentication failed - tokens cleared');
    } else if (error.response?.status === 403) {
      // Role-based access denied
      console.warn('Access denied:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
