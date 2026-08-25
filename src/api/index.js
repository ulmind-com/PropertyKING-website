import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pk_token');
      localStorage.removeItem('pk_refresh_token');
      localStorage.removeItem('pk_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authAPI = {
  requestOTP: (data) => api.post('/auth/request-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (token) => api.post('/auth/google', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// ─── Users ───
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  updateFCMToken: (token) => api.put('/users/me/fcm-token', { fcm_token: token }),
  getPublicProfile: (userId) => api.get(`/users/${userId}/public`),
  updateLocation: (data) => api.put('/users/me/location', data),
  deleteAccount: () => api.delete('/users/me'),
};

// ─── Properties ───
export const propertyAPI = {
  list: (params) => api.get('/properties', { params }),
  getBySlug: (slug) => api.get(`/properties/${slug}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  nearby: (params) => api.get('/properties/nearby', { params }),
  locations: (params) => api.get('/properties/locations', { params }),
  recommendations: (params) => api.get('/properties/recommendations', { params }),
  myListings: (params) => api.get('/properties/my-listings', { params }),
  myListingsStats: () => api.get('/properties/my-listings/stats'),
  getViewers: (id, params) => api.get(`/properties/${id}/viewers`, { params }),
  topViewed: (params) => api.get('/properties/top-viewed', { params }),
  toggleStatus: (id) => api.put(`/properties/${id}/toggle-status`),
};

// ─── Distressed property claims ───
// Claiming needs admin approval; once approved the property lands in the
// user's My Listings and their edits go through the approval queue below.
export const claimAPI = {
  submit: (propertyId, data) => api.post(`/claims/${propertyId}`, data),
  mine: (params) => api.get('/claims/my', { params }),
  cancel: (claimId) => api.delete(`/claims/${claimId}`),
};

export const editRequestAPI = {
  submit: (propertyId, data) => api.post(`/edit-requests/${propertyId}`, data),
  mine: (params) => api.get('/edit-requests/my', { params }),
  cancel: (requestId) => api.delete(`/edit-requests/${requestId}`),
};

// ─── Property Types ───
export const propertyTypeAPI = {
  list: () => api.get('/property-types'),
};

// ─── Amenities ───
export const amenityAPI = {
  list: (category) => api.get('/amenities', { params: { category } }),
};

// ─── Favorites ───
export const favoriteAPI = {
  list: (params) => api.get('/favorites', { params }),
  add: (propertyId) => api.post(`/favorites/${propertyId}`),
  remove: (propertyId) => api.delete(`/favorites/${propertyId}`),
};

// ─── Inquiries ───
export const inquiryAPI = {
  create: (data) => api.post('/inquiries', data),
  sent: (params) => api.get('/inquiries/sent', { params }),
  received: (params) => api.get('/inquiries/received', { params }),
  respond: (id, data) => api.put(`/inquiries/${id}/respond`, data),
};

// ─── Reviews ───
export const reviewAPI = {
  getForProperty: (propertyId, params) => api.get(`/reviews/property/${propertyId}`, { params }),
  create: (data) => api.post('/reviews', data),
};

// ─── Notifications ───
export const notificationAPI = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

// ─── Upload ───
export const uploadAPI = {
  image: (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  images: (files, folder) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (folder) formData.append('folder', folder);
    return api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
