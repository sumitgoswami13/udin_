import { api, ApiResponse } from '../../utils/api';

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
  }): Promise<ApiResponse> => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  adminLogin: (credentials: { username: string; password: string }) =>
    api.post('/auth/admin-login', credentials),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),

  logout: () => apiClient.post('/auth/logout'),
};
