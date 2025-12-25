import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle network errors (backend spinning up)
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        toast.error('Backend is waking up. Please wait a few seconds and retry.');
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
      return Promise.reject(error);
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only show toast if not on login/signup pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment and try again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Please check if the backend is running.');
    }
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  async signup(userData) {
    const response = await api.post('/auth/signup', userData);
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    const { user } = response.data;
    
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

// Feedback service
export const feedbackService = {
  async createFeedback(feedbackData) {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },

  async getAllFeedback(params = {}) {
    const response = await api.get('/feedback', { params });
    return response.data;
  },

  async getFeedbackById(id) {
    const response = await api.get(`/feedback/${id}`);
    return response.data;
  },

  async updateFeedbackStatus(id, statusData) {
    const response = await api.patch(`/feedback/${id}/status`, statusData);
    return response.data;
  },

  async resolveFeedback(id) {
    const response = await api.patch(`/feedback/${id}/resolve`);
    return response.data;
  },

  async deleteFeedback(id) {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  },

  async getFeedbackStats() {
    const response = await api.get('/feedback/stats');
    return response.data;
  }
};

// Insights service
export const insightsService = {
  async getInsights() {
    const response = await api.get('/insights');
    return response.data;
  },

  async getAIStatus() {
    const response = await api.get('/insights/status');
    return response.data;
  }
};

// Utility functions
export const apiUtils = {
  // Format error message for display
  formatError(error) {
    if (error.response?.data?.errors) {
      return error.response.data.errors.map(err => err.msg).join(', ');
    }
    return error.response?.data?.message || error.message || 'An error occurred';
  },

  // Handle API loading states
  async withLoading(apiCall, loadingSetter) {
    try {
      loadingSetter(true);
      const result = await apiCall();
      return result;
    } finally {
      loadingSetter(false);
    }
  },

  // Retry API call with exponential backoff
  async retryApiCall(apiCall, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        if (attempt === maxRetries || error.response?.status < 500) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

export default api;