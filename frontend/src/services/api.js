import axios from 'axios';
import { storage } from '../utils/storage';

// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Check if Mock API fallback is active
export const isMockEnabled = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper to simulate network latency for mock services
export const mockDelay = (result, delayMs = 350) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Allow throwing simulated errors if result has __error
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
          // Validation errors
          errorMessage = data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : 'Invalid request data.');
          break;

        case 401:
          // Unauthorized / Token expired
          errorMessage = data?.message || 'Session expired. Please log in again.';
          storage.clearSession();
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          break;

        case 403:
          // Forbidden
          errorMessage = data?.message || 'You do not have permission to perform this action.';
          break;

        case 404:
          // Not Found
          errorMessage = data?.message || 'Requested resource was not found.';
          break;

        case 500:
        case 502:
        case 503:
          // Server Errors
          errorMessage = data?.message || 'Internal server error. Please contact system admin.';
          break;

        default:
          errorMessage = data?.message || `Server responded with status ${status}`;
      }
    } else if (error.request) {
      // Network failure / Server down
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
