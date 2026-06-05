'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { appConfig } from '@/lib/app-config';

export default function DashboardPage() {
  const navItems = appConfig.navItems;

  const placeholderCards = [
    { label: '機能1', path: '#', icon: 'FileText' },
    { label: '機能2', path: '#', icon: 'Package' },
    { label: '機能3', path: '#', icon: 'BarChart2' },
  ];

  const cards = navItems.length > 0 ? navItems.slice(0, 3) : placeholderCards;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {appConfig.appName} へようこそ
        </h1>
        <p className="text-gray-500 mt-1">{appConfig.description}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((item) => {
          const Icon = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">管理</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick start */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">クイックスタート</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Icons.Settings size={16} />
            会社設定を行う
          </Link>
          <Link
            href="/how-to-use"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Icons.HelpCircle size={16} />
            使い方を確認する
          </Link>
        </div>
      </div>
    </div>
  );
}
