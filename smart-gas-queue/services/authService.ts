/**
 * authService — thin wrapper kept for backward compatibility.
 * Auth is now handled by Supabase directly in AuthContext.
 * These stubs are no longer called but kept so any remaining imports don't break.
 */
import { AuthResponse, LoginCredentials, RegisterInput, User } from '@/types';

class AuthService {
  async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    throw new Error('Use AuthContext.login() instead');
  }

  async register(_data: RegisterInput): Promise<AuthResponse> {
    throw new Error('Use AuthContext.register() instead');
  }

  async logout(): Promise<void> {
    // No-op — Supabase handles this via AuthContext
  }

  async verifyToken(_token: string): Promise<User> {
    throw new Error('Use Supabase session instead');
  }
}

export const authService = new AuthService();
