import axios from 'axios';
import { storage } from '../utils/storage';

// Base API URL explicitly configured for Django REST Framework (Port 8000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';


// Disable Mock API fallback so real Django REST API / MySQL database is always used
export const isMockEnabled = false;


export const mockDelay = (result, delayMs = 350) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (result && result.__error) {
        reject(new Error(result.__error));
      } else {
        resolve(result);
      }
    }, delayMs);
  });
};

// Create Central Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
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
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data?.message) {
            errorMessage = data.message;
          } else if (data?.errors) {
            errorMessage = typeof data.errors === 'string' ? data.errors : Object.values(data.errors).flat().join(', ');
          } else if (data && typeof data === 'object') {
            const formatted = Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
              .join('; ');
            if (formatted) errorMessage = formatted;
            else errorMessage = 'Invalid request data.';
          } else {
            errorMessage = 'Invalid request data.';
          }
          break;

        case 401:
          errorMessage = data?.message || 'Session expired. Please log in again.';
          storage.clearSession();
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          break;

        case 403:
          errorMessage = data?.message || 'You do not have permission to perform this action.';
          break;

        case 404:
          errorMessage = data?.message || 'Requested resource was not found.';
          break;

        case 500:
        case 502:
        case 503:
          errorMessage = data?.message || 'Internal server error. Please contact system admin.';
          break;

        default:
          errorMessage = data?.message || `Server responded with status ${status}`;
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to the CRM server. Please check your internet connection.';
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
