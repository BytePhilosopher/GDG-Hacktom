'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, RegisterInput } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // loading=false by default so pages render immediately.
  // Only set true while verifying a stored token.
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    authService
      .verifyToken(token)
      .then((userData) => setUser(userData))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials: LoginCredentials) {
    const { user: userData, token } = await authService.login(credentials);
    localStorage.setItem('token', token);
    setUser(userData);
  }

  async function register(data: RegisterInput) {
    const { user: userData, token } = await authService.register(data);
    localStorage.setItem('token', token);
    setUser(userData);
  }

  async function logout() {
    await authService.logout();
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
