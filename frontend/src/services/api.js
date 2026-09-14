import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://grab-n-go-1.onrender.com/api';
};

const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('grabngo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const cafeteriaAPI = {
  getAll: () => api.get('/cafeterias'),
  getById: (id) => api.get(`/cafeterias/${id}`)
};

export const menuAPI = {
  getMenuByCafeteria: (cafeteriaId) => api.get(`/cafeterias/${cafeteriaId}/menu`),
  getCategories: () => api.get('/categories'),
  createItem: (data) => api.post('/menu', data),
  updateItem: (id, data) => api.put(`/menu/${id}`, data),
  toggleAvailability: (id, isAvailable) => api.patch(`/menu/${id}/availability`, { is_available: isAvailable })
};

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getVendorOrders: (cafeteriaId) => api.get('/orders/vendor', { params: { cafeteriaId } }),
  getAdminOrders: () => api.get('/orders/admin'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  verifyPickup: (pickupCode) => api.post('/orders/verify-pickup', { pickupCode }),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`)
};

export const analyticsAPI = {
  getVendorAnalytics: (cafeteriaId) => api.get('/analytics/vendor', { params: { cafeteriaId } }),
  getAdminAnalytics: () => api.get('/analytics/admin')
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`)
};

export default api;
