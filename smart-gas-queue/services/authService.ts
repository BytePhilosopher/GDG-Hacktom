import { AuthResponse, LoginCredentials, RegisterInput, User } from '@/types';

// Mock auth service - replace with real API calls
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (credentials.email && credentials.password) {
      const user: User = {
        id: 'user-1',
        fullName: 'John Doe',
        email: credentials.email,
        phone: '+251912345678',
        vehicleInfo: {
          plateNumber: 'AA-12345',
          vehicleType: 'sedan',
          licenseNumber: 'LIC-98765',
        },
        createdAt: new Date(),
      };
      return { user, token: 'mock-jwt-token-' + Date.now() };
    }
    throw new Error('Invalid credentials');
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user: User = {
      id: 'user-' + Date.now(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      vehicleInfo: {
        plateNumber: data.plateNumber,
        vehicleType: data.vehicleType,
        licenseNumber: data.licenseNumber,
      },
      createdAt: new Date(),
    };
    return { user, token: 'mock-jwt-token-' + Date.now() };
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  async verifyToken(token: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (token.startsWith('mock-jwt-token-')) {
      return {
        id: 'user-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+251912345678',
        vehicleInfo: {
          plateNumber: 'AA-12345',
          vehicleType: 'sedan',
          licenseNumber: 'LIC-98765',
        },
        createdAt: new Date(),
      };
    }
    throw new Error('Invalid token');
  }
}

export const authService = new AuthService();
