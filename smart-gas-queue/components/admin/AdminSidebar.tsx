'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Fuel, LogOut, Menu, X, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Queue', href: '/admin/queue', icon: Users },
  { label: 'Fuel', href: '/admin/fuel', icon: Fuel },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        {/* Logo / station name */}
        <div className="border-b border-gray-950/[0.06] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-brand-glow">
              <Gauge className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-gray-900">
                {user?.stationName ?? 'Station Admin'}
              </p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-premium',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-soft'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-gradient"
                    aria-hidden
                  />
                )}
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                  )}
                  aria-hidden
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-950/[0.06] px-3 py-4">
          <div className="mb-2 px-3 py-2">
            <p className="truncate text-xs font-medium text-gray-900">{user?.fullName}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 ease-premium hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 text-gray-500" aria-hidden />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-gray-950/[0.06] lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="glass fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-gray-950/[0.06] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-brand-glow">
            <Gauge className="h-4 w-4 text-white" aria-hidden />
          </div>
          <span className="max-w-[200px] truncate text-sm font-bold tracking-tight text-gray-900">
            {user?.stationName ?? 'Admin'}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-gray-600 transition-all duration-200 ease-premium hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-premium transition-transform duration-300 ease-premium lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-950/[0.06] px-4 py-3">
          <span className="text-sm font-bold tracking-tight text-gray-900">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-gray-600 transition-all duration-200 ease-premium hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
