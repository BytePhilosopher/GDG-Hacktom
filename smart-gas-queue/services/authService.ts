import { AuthResponse, LoginCredentials, RegisterInput, User } from '@/types';

// ─── Mock Users ───────────────────────────────────────────────────────────────
// Station admin accounts are developer-provisioned — no self-registration.
// Driver accounts can self-register (handled by register()).

type MockUser = Omit<User, 'createdAt'> & { password: string; createdAt: string };

const MOCK_USERS: MockUser[] = [
  // ── Drivers ──────────────────────────────────────────────────────────────
  {
    id: 'driver-1',
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
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'driver-2',
    fullName: 'Sara Mulugeta',
    email: 'sara@test.com',
    password: '123456',
    role: 'driver',
    phone: '+251922345678',
    vehicleInfo: {
      plateNumber: 'AA-5678',
      vehicleType: 'suv',
      licenseNumber: 'LIC-9012',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
  },

  // ── Station Admins (developer-provisioned) ────────────────────────────────
  {
    id: 'admin-1',
    fullName: 'Total Station Admin',
    email: 'admin@totalstation.com',
    password: 'admin123',
    role: 'station_admin',
    stationId: 'station-1',
    stationName: 'Total Station — Bole',
    phone: '+251911000001',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-2',
    fullName: 'NOC Station Admin',
    email: 'admin@nocstation.com',
    password: 'noc2024',
    role: 'station_admin',
    stationId: 'station-2',
    stationName: 'NOC Station — Kazanchis',
    phone: '+251911000002',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSafeUser(mock: MockUser): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = mock;
  return safe as User;
}

function makeToken(id: string): string {
  return `mock-token-${id}`;
}

function findByToken(token: string): MockUser | undefined {
  const id = token.replace('mock-token-', '');
  return MOCK_USERS.find((u) => u.id === id);
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

class AuthService {
  /**
   * Authenticate a user. Uses mock data — no API call.
   * Swap the body with a real API call when the backend is ready:
   *   const { data } = await api.post<AuthResponse>('/auth/login', credentials);
   *   return data;
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 500));

    const found = MOCK_USERS.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );
    if (!found) throw new Error('Invalid email or password');

    return { user: toSafeUser(found), token: makeToken(found.id) };
  }

  /**
   * Register a new driver account. Uses mock data — no API call.
   * Swap with: const { data } = await api.post<AuthResponse>('/auth/register', data);
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 600));

    const exists = MOCK_USERS.find((u) => u.email === data.email);
    if (exists) throw new Error('Email already registered');

    const newUser: MockUser = {
      id: `driver-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: 'driver',
      vehicleInfo: {
        plateNumber: data.plateNumber,
        vehicleType: data.vehicleType,
        licenseNumber: data.licenseNumber,
      },
      createdAt: new Date().toISOString(),
    };

    // Add to in-memory list so the session works until page refresh
    MOCK_USERS.push(newUser);

    return { user: toSafeUser(newUser), token: makeToken(newUser.id) };
  }

  /**
   * Sign out. No API call needed for mock auth.
   */
  async logout(): Promise<void> {
    // No-op for mock — caller clears localStorage
  }

  /**
   * Verify a stored token and return the user.
   * Swap with: const { data } = await api.get<User>('/auth/me');
   */
  async verifyToken(token: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 100));

    const found = findByToken(token);
    if (!found) throw new Error('Invalid or expired session');

    return toSafeUser(found);
  }
}

export const authService = new AuthService();
