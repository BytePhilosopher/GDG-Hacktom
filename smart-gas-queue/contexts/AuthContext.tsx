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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.verifyToken(token);
        setUser(userData);
      }
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

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
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
