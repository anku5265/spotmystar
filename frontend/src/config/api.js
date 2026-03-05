import axios from 'axios';
import { getAuthToken } from '../hooks/useAuth';

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
    const token = getAuthToken();
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
      // Token expired or invalid
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('artistToken');
      localStorage.removeItem('artistData');
      
      // Redirect to home page
      window.location.href = '/';
    } else if (error.response?.status === 403) {
      // Role-based access denied
      console.warn('Access denied:', error.response.data);
      
      // Show error message but don't redirect (let component handle it)
      if (error.response.data.code === 'ROLE_VIOLATION') {
        console.error('Role violation detected:', error.response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

// Role-specific API helpers
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.patch('/api/user/profile', data),
  getBookings: () => api.get('/api/user/bookings'),
  getWishlist: () => api.get('/api/user/wishlist'),
  addToWishlist: (artistId) => api.post(`/api/user/wishlist/${artistId}`),
  removeFromWishlist: (artistId) => api.delete(`/api/user/wishlist/${artistId}`),
  getDashboardStats: () => api.get('/api/user/dashboard-stats'),
};

export const artistAPI = {
  getProfile: () => api.get('/api/artist/profile'),
  updateProfile: (data) => api.patch('/api/artist/profile', data),
  getBookings: () => api.get('/api/artist/bookings'),
  updateBookingStatus: (bookingId, status) => api.patch(`/api/artist/bookings/${bookingId}/status`, { status }),
  getDashboardStats: () => api.get('/api/artist/dashboard-stats'),
  getAnalytics: (period = '30') => api.get(`/api/artist/analytics?period=${period}`),
  updateAvailability: (data) => api.patch('/api/artist/availability', data),
};

export const publicAPI = {
  searchArtists: (params) => api.get('/api/artists/search', { params }),
  getArtist: (id) => api.get(`/api/artists/${id}`),
  getCategories: () => api.get('/api/categories'),
};

export const bookingAPI = {
  create: (data) => api.post('/api/bookings', data), // User-only
};

export default api;
