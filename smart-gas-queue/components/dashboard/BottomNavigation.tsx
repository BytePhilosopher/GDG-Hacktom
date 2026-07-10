'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, LayoutDashboard, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Map, label: 'Map' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/history', icon: History, label: 'History' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-area-pb glass fixed bottom-0 left-0 right-0 z-30 border-t border-gray-950/[0.06]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 ease-premium',
                isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ease-premium',
                  isActive
                    ? 'bg-red-50 ring-1 ring-inset ring-red-600/15'
                    : 'group-hover:bg-gray-900/5'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} aria-hidden />
              </span>
              <span className={cn('text-[11px] font-medium', isActive && 'font-semibold')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
