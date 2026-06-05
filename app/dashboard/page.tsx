'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { appConfig } from '@/lib/app-config';

export default function DashboardPage() {
  const featureItems = appConfig.navItems.slice(0, 3);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <p className="text-blue-200 text-sm font-medium mb-1">ようこそ</p>
        <h1 className="text-2xl font-bold tracking-tight">{appConfig.appName}</h1>
        <p className="text-blue-100 text-sm mt-1">{appConfig.description}</p>
      </div>

      {/* Quick access */}
      {featureItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">クイックアクセス</h2>
          <div className={`grid gap-4 ${featureItems.length === 1 ? 'grid-cols-1 max-w-sm' : featureItems.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {featureItems.map((item) => {
              const Icon = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                    開く <Icons.ArrowRight className="w-3 h-3" />
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Setup checklist */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">セットアップ</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {[
            { label: '自社情報を設定する', desc: '会社名・住所・インボイス番号を登録', path: '/settings', icon: 'Settings' },
            { label: 'スタッフを招待する', desc: '招待コードを共有してチームを作成', path: '/users', icon: 'Users2' },
            { label: '使い方を確認する', desc: 'このシステムの機能と操作方法', path: '/how-to-use', icon: 'HelpCircle' },
          ].map((item) => {
            const Icon = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;
            return (
              <Link key={item.path} href={item.path} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
