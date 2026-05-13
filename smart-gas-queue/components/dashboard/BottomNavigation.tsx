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
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-pb"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px]',
                isActive
                  ? 'text-red-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className={cn('text-xs font-medium', isActive && 'font-semibold')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
