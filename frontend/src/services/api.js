import axios from 'axios';
import { storage } from '../utils/storage';

// Base API URL pointing to the live Django REST Framework backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Live mode active: Mock engine is completely disabled
export const isMockEnabled = false;

// Create Central Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Ensure trailing slash for DRF and attach Access Token
api.interceptors.request.use(
  (config) => {
    // Django REST Framework routers require trailing slashes on endpoints
    if (config.url) {
      if (!config.url.endsWith('/') && !config.url.includes('?')) {
        config.url = `${config.url}/`;
      } else if (config.url.includes('?') && !config.url.split('?')[0].endsWith('/')) {
        const [path, query] = config.url.split('?');
        config.url = `${path}/?${query}`;
      }
    }

    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized Error Handling
api.interceptors.response.use(
  (response) => {
    // 200, 201 responses return parsed body
    return response.data;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let status = null;

    if (error.response) {
      status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          // Validation errors from DRF
          if (data?.detail) {
            errorMessage = data.detail;
          } else if (typeof data === 'object') {
            const messages = Object.entries(data).map(([field, errs]) => {
              const errText = Array.isArray(errs) ? errs.join(' ') : String(errs);
              return `${field}: ${errText}`;
            });
            errorMessage = messages.join(' | ') || 'Invalid request data.';
          } else {
            errorMessage = 'Invalid request data.';
          }
          break;

        case 401:
          // Unauthorized / Token expired or invalid credentials
          if (data?.detail) {
            errorMessage = data.detail;
          } else {
            errorMessage = 'Invalid credentials or session expired. Please sign in.';
          }
          // Only emit unauthorized event if not already on the login endpoint
          if (!error.config?.url?.includes('/auth/token')) {
            storage.clearSession();
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
          break;

        case 403:
          errorMessage = data?.detail || 'You do not have permission to perform this action.';
          break;

        case 404:
          errorMessage = data?.detail || 'Requested resource was not found.';
          break;

        case 500:
        case 502:
        case 503:
          errorMessage = 'Backend server error. Please ensure the Django server is running on port 8000.';
          break;

        default:
          errorMessage = data?.detail || data?.message || `Server responded with status ${status}`;
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to the backend server at ' + API_BASE_URL + '. Please verify the backend is running.';
    } else {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.status = status;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
