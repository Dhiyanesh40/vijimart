import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transform MongoDB _id to id
const transformData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(transformData);
  }
  if (data && typeof data === 'object') {
    const transformed: any = {};
    for (const key in data) {
      if (key === '_id') {
        transformed.id = data[key];
        transformed._id = data[key]; // Keep _id as well for compatibility
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        transformed[key] = transformData(data[key]);
      } else {
        transformed[key] = data[key];
      }
    }
    return transformed;
  }
  return data;
};

// Handle response errors
api.interceptors.response.use(
  (response) => {
    // Transform _id to id in all responses
    if (response.data) {
      response.data = transformData(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { fullName: string; email: string; password: string; phone?: string; address?: string; interests?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: { fullName?: string; phone?: string; address?: string; interests?: string }) =>
    api.put('/auth/profile', data),
  
  deleteAccount: () =>
    api.delete('/auth/account'),
};

// Products API
export const productsAPI = {
  getAll: (params?: { category?: string; search?: string; featured?: boolean; inStock?: boolean }) =>
    api.get('/products', { params }),
  
  getByCategory: (categoryId: string) =>
    api.get('/products', { params: { category: categoryId } }),
  
  search: (query: string) =>
    api.get('/products', { params: { search: query } }),
  
  getById: (id: string) =>
    api.get(`/products/${id}`),
  
  create: (data: any) =>
    api.post('/products', data),
  
  update: (id: string, data: any) =>
    api.put(`/products/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () =>
    api.get('/categories'),
  
  create: (data: { name: string; slug: string; icon?: string; sortOrder?: number }) =>
    api.post('/categories', data),
  
  update: (id: string, data: any) =>
    api.put(`/categories/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  get: () =>
    api.get('/cart'),
  
  add: (data: { productId: string; quantity?: number }) =>
    api.post('/cart/add', data),
  
  update: (data: { productId: string; quantity: number }) =>
    api.put('/cart/update', data),
  
  remove: (productId: string) =>
    api.delete(`/cart/remove/${productId}`),
  
  clear: () =>
    api.delete('/cart/clear'),
};

// Payment API
export const paymentAPI = {
  createOrder: (data: {
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: 'cod' | 'razorpay';
  }) => api.post('/payment/create-order', data),

  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => api.post('/payment/verify', data),

  reportFailure: (orderId: string) =>
    api.post('/payment/failure', { orderId }),

  getRazorpayKey: () => api.get('/payment/razorpay-key'),

  markRefunded: (orderId: string, notes: string, refundAmount?: number) =>
    api.post(`/payment/refund/${orderId}`, { notes, refundAmount }),
};

// Orders API
export const ordersAPI = {
  create: (data: { customerName: string; phone: string; address: string; paymentMethod?: string }) =>
    api.post('/orders', data),
  
  getAll: () =>
    api.get('/orders'),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  getAllAdmin: () =>
    api.get('/orders/admin/all'),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  
  cancel: (id: string, reason?: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),
  
  return: (id: string, reason?: string) =>
    api.put(`/orders/${id}/return`, { reason }),
};

// Favorites API
export const favoritesAPI = {
  getAll: () =>
    api.get('/favorites'),
  
  add: (productId: string) =>
    api.post('/favorites', { productId }),
  
  remove: (productId: string) =>
    api.delete(`/favorites/${productId}`),
  
  check: (productId: string) =>
    api.get(`/favorites/check/${productId}`),
};

// Admin API
export const adminAPI = {
  getAnalytics: () =>
    api.get('/admin/analytics'),
  
  getUsers: () =>
    api.get('/admin/users'),
  
  getOrders: () =>
    api.get('/orders/admin/all'),
  
  // Product management
  createProduct: (data: any) =>
    api.post('/products', data),
  
  updateProduct: (id: string, data: any) =>
    api.put(`/products/${id}`, data),
  
  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),
  
  // Category management
  createCategory: (data: any) =>
    api.post('/categories', data),
  
  updateCategory: (id: string, data: any) =>
    api.put(`/categories/${id}`, data),
  
  deleteCategory: (id: string) =>
    api.delete(`/categories/${id}`),
  
  // Order management
  updateOrderStatus: (orderId: string, status: string) =>
    api.put(`/orders/${orderId}/status`, { status }),
};

// Public stats API
export const statsAPI = {
  get: () => api.get('/stats'),
};

export default api;
