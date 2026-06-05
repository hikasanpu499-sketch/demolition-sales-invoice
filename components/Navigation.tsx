'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { appConfig } from '@/lib/app-config';

const baseItems = [
  { label: 'ダッシュボード', path: '/dashboard', icon: 'LayoutDashboard' },
];

const bottomItems = [
  { label: '設定', path: '/settings', icon: 'Settings' },
  { label: '使い方', path: '/how-to-use', icon: 'HelpCircle' },
  { label: 'ユーザー', path: '/users', icon: 'Users2' },
];

export default function Navigation() {
  const pathname = usePathname();

  if (pathname.startsWith('/auth')) return null;

  const allItems = [...baseItems, ...appConfig.navItems, ...bottomItems];

  function NavLink({
    item,
    className,
  }: {
    item: { label: string; path: string; icon: string };
    className?: string;
  }) {
    const Icon = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;
    const isActive = pathname === item.path;
    return (
      <Link
        href={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        } ${className ?? ''}`}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      {/* PC sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white z-40 flex-col">
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {appConfig.appName.charAt(0)}
          </div>
          <span className="font-semibold text-white truncate">{appConfig.appName}</span>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {baseItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
          {appConfig.navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
          {bottomItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200">
        <div className="flex">
          {allItems.slice(0, 5).map((item) => {
            const Icon = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
