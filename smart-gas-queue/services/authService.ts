import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { AuthResponse, LoginCredentials, RegisterInput, User } from '@/types';

// ─── Mock users (developer-provisioned — no self-registration for stations) ──

const mockUsers: (Omit<User, 'createdAt'> & { password: string; createdAt: string })[] = [
  {
    id: 'u1',
    fullName: 'Abebe Kebede',
    email: 'driver@test.com',
    password: 'driver123',
    role: 'driver',
    phone: '+251911234567',
    vehicleInfo: {
      plateNumber: 'AA-1234',
      vehicleType: 'sedan',
      licenseNumber: 'LIC-5678',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sa1',
    fullName: 'Total Station Admin',
    email: 'admin@totalstation.com',
    password: 'total2024',
    role: 'station_admin',
    stationId: 'st1',
    stationName: 'Total Station — Bole',
    phone: '+251911000001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sa2',
    fullName: 'NOC Station Admin',
    email: 'admin@nocstation.com',
    password: 'noc2024',
    role: 'station_admin',
    stationId: 'st2',
    stationName: 'NOC Station — Kazanchis',
    phone: '+251911000002',
    createdAt: new Date().toISOString(),
  },
];

function mockLogin(email: string, password: string): AuthResponse {
  const found = mockUsers.find((u) => u.email === email && u.password === password);
  if (!found) throw new Error('Invalid email or password');
  const { password: _pw, ...safeUser } = found;
  void _pw;
  return { user: safeUser as User, token: `mock-token-${found.id}` };
}

function mockVerify(token: string): User {
  const id = token.replace('mock-token-', '');
  const found = mockUsers.find((u) => u.id === id);
  if (!found) throw new Error('Invalid token');
  const { password: _pw, ...safeUser } = found;
  void _pw;
  return safeUser as User;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    } catch {
      // Fall back to mock when API is unavailable (dev mode)
      return mockLogin(credentials.email, credentials.password);
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
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — we always clear local state
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const { data } = await api.get<User>('/auth/me');
      return data;
    } catch {
      // Fall back to mock token verification
      return mockVerify(token);
    }
  }
}

export const authService = new AuthService();
