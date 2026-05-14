'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, RegisterInput } from '@/types';
import { authService } from '@/services/authService';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token    = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    // Optimistically restore from cache so the UI doesn't flash
    if (userJson) {
      try {
        setUser(JSON.parse(userJson) as User);
      } catch {
        // corrupted — ignore, will re-verify below
      }
    }

    // Verify the token is still valid
    authService
      .verifyToken(token)
      .then((verified) => {
        setUser(verified);
        localStorage.setItem(USER_KEY, JSON.stringify(verified));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  async function login(credentials: LoginCredentials): Promise<User> {
    const { user: userData, token } = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }

  async function register(data: RegisterInput): Promise<void> {
    const { user: userData, token } = await authService.register(data);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  async function logout(): Promise<void> {
    await authService.logout();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
