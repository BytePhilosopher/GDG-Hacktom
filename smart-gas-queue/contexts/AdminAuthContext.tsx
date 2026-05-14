'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>(null!);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        const user = await adminService.verifyToken(token);
        setAdminUser(user);
      }
    } catch {
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { user, token } = await adminService.login(email, password);
    localStorage.setItem('admin_token', token);
    setAdminUser(user);
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setAdminUser(null);
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
}
