import { apiClient } from '../api-client';
import { ENDPOINTS } from '../../constants/endpoints';
import { AuthResponse, LoginCredentials, User } from '../../types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
