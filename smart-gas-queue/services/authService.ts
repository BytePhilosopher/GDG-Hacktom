import api from '@/lib/axios';
import { AuthResponse, LoginCredentials, RegisterInput, User } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const { data: res } = await api.post<AuthResponse>('/auth/register', data);
    return res;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async verifyToken(_token: string): Promise<User> {
    // Token is sent via the axios interceptor Authorization header
    const { data } = await api.get<User>('/auth/me');
    return data;
  }
}

export const authService = new AuthService();
