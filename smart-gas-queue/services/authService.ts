import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { AuthResponse, LoginCredentials, RegisterInput, User } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    } catch (e) {
      throw new Error(getApiErrorMessage(e));
    }
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      const { data: res } = await api.post<AuthResponse>('/auth/register', data);
      return res;
    } catch (e) {
      throw new Error(getApiErrorMessage(e));
    }
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async verifyToken(_token: string): Promise<User> {
    try {
      const { data } = await api.get<User>('/auth/me');
      return data;
    } catch (e) {
      throw new Error(getApiErrorMessage(e));
    }
  }
}

export const authService = new AuthService();
