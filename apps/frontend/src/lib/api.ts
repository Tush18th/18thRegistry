import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the access token to the headers
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle standardized backend format and unauthorized errors
api.interceptors.response.use(
  (response) => {
    // If the response follows the { data, meta, timestamp } pattern, unwrap it
    if (response.data && response.data.data) {
      return {
        ...response,
        data: response.data.data,
        meta: response.data.meta,
        timestamp: response.data.timestamp,
      } as any;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    if (status === 401) {
      // Clear token and redirect to login if unauthorized
      if (typeof window !== 'undefined') {
         console.warn('Session expired, clearing credentials...');
         localStorage.removeItem('token');
         // window.location.href = '/login';
      }
    } else if (status >= 500) {
       console.error(`[CRITICAL_API_ERROR]: ${message}`);
    } else if (status >= 400) {
       console.warn(`[API_WARNING]: ${message}`);
    }

    return Promise.reject(error);
  }
);

export default api;
