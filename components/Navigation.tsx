'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { appConfig } from '@/lib/app-config';

const baseItems = [{ label: 'ダッシュボード', path: '/dashboard', icon: 'LayoutDashboard' }];
const bottomItems = [
  { label: '設定', path: '/settings', icon: 'Settings' },
  { label: '使い方', path: '/how-to-use', icon: 'HelpCircle' },
  { label: 'ユーザー', path: '/users', icon: 'Users2' },
];

export default function Navigation() {
  const pathname = usePathname();
  if (pathname.startsWith('/auth')) return null;

  const mainItems = [...baseItems, ...appConfig.navItems];
  const allItems = [...mainItems, ...bottomItems];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const NavLink = ({ item, compact = false }: { item: typeof allItems[0]; compact?: boolean }) => {
    const Icon = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;
    const active = isActive(item.path);
    return (
      <Link
        href={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          active
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
        }`}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
        {!compact && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* PC Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-slate-900 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-slate-800/80">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow">
            {appConfig.appName.charAt(0)}
          </div>
          <span className="font-semibold text-white text-sm leading-tight truncate">{appConfig.appName}</span>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {mainItems.map((item) => <NavLink key={item.path} item={item} />)}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-4 border-t border-slate-800/80 space-y-0.5">
          {bottomItems.map((item) => <NavLink key={item.path} item={item} />)}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 safe-area-bottom">
        <div className={`grid`} style={{ gridTemplateColumns: `repeat(${Math.min(allItems.length, 5)}, 1fr)` }}>
          {allItems.slice(0, 5).map((item) => {
            const Icon = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-[10px] leading-none font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
