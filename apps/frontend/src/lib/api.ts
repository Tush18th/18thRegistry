import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || (typeof window !== 'undefined' ? '/api/v1' : 'http://127.0.0.1:3001/api/v1'),
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
  async (error) => {
    let message = error.response?.data?.error || error.message;

    // Extract JSON error text when responseType='blob' blocks standard serialization
    if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        message = json.error || message;
        // Inject parsed JSON back so downstream catch blocks can read the actual message
        error.response.data = json;
      } catch (e) {}
    }

    const status = error.response?.status;
    const isSilent = error.config?.silentErrors?.includes(status);

    if (status === 401) {
      // Clear token and redirect to login if unauthorized
      if (typeof window !== 'undefined') {
         console.warn('Session expired, clearing credentials...');
         localStorage.removeItem('token');
         // window.location.href = '/login';
      }
    } else if (status >= 500 && !isSilent) {
       console.error(`[CRITICAL_API_ERROR]: ${message}`);
    } else if (status >= 400 && !isSilent) {
       console.warn(`[API_WARNING]: ${message}`);
    }

    return Promise.reject(error);
  }
);

export default api;
