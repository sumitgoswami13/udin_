import axios from 'axios';
import { store } from '../index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { accessToken } = response.data.data;
          
          // Update token in store
          store.dispatch({
            type: 'auth/setCredentials',
            payload: {
              ...state.auth.user,
              accessToken,
            },
          });
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch({ type: 'auth/logout' });
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    pinCode: string;
    password: string;
  }) => apiClient.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  adminLogin: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/admin-login', credentials),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh-token', { refreshToken }),

  logout: () => apiClient.post('/auth/logout'),
};

export default apiClient;