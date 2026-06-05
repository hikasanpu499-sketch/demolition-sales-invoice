'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TrendingUp, FileText, Building2, Clock, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const BarChartComponent = dynamic(
  () => import('recharts').then((mod) => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
    return function Chart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} />
            <Tooltip formatter={(v: any) => [`¥${Number(v).toLocaleString()}`, '売上']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false }
);

export default function DashboardPage() {
  const [stats, setStats] = useState({ invoices: 0, projects: 0, customers: 0, revenue: 0, unpaid: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [inv, proj, cust] = await Promise.all([
        supabase.from('invoices').select('total_amount, status, created_at'),
        supabase.from('projects').select('id, project_name, customer_name, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('customers').select('id'),
      ]);

      const invoices = inv.data || [];
      const totalRevenue = invoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
      const unpaid = invoices.filter((i: any) => i.status !== 'paid').reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);

      setStats({
        invoices: invoices.length,
        projects: proj.data?.length || 0,
        customers: cust.data?.length || 0,
        revenue: totalRevenue,
        unpaid,
      });
      setRecentProjects(proj.data || []);

      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const m = d.toISOString().slice(0, 7);
        const label = `${d.getMonth() + 1}月`;
        const amount = invoices
          .filter((inv: any) => inv.created_at?.startsWith(m))
          .reduce((s: number, inv: any) => s + Number(inv.total_amount || 0), 0);
        return { month: label, amount };
      });
      setChartData(months);
    }
    load();
  }, []);

  const statusMap: Record<string, { label: string; color: string }> = {
    inquiry: { label: '問い合わせ', color: 'bg-gray-100 text-gray-600' },
    negotiating: { label: '商談中', color: 'bg-yellow-100 text-yellow-700' },
    contracted: { label: '契約済', color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: '施工中', color: 'bg-orange-100 text-orange-700' },
    completed: { label: '完了', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-600' },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">KAITAI CLOUD</p>
            <h1 className="text-2xl font-bold mt-1">ダッシュボード</h1>
            <p className="text-blue-100 text-sm mt-1">解体業向けクラウド管理システム</p>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/quotations" className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> 見積書作成
            </Link>
            <Link href="/invoices" className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-medium transition-colors shadow">
              <Plus className="w-4 h-4" /> 請求書作成
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '請求書', value: `${stats.invoices}件`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '案件数', value: `${stats.projects}件`, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: '売上総額', value: `¥${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '未入金', value: `¥${stats.unpaid.toLocaleString()}`, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">月別売上推移</h2>
          <BarChartComponent data={chartData} />
        </div>

        {/* Recent projects */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">最近の案件</h2>
            <Link href="/projects" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              すべて見る <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProjects.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-400">案件がありません</div>
            ) : (
              recentProjects.map((p) => {
                const s = statusMap[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <div key={p.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.project_name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.customer_name}</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '顧客管理', path: '/customers', desc: '顧客一覧' },
          { label: '案件管理', path: '/projects', desc: '受注管理' },
          { label: '見積書', path: '/quotations', desc: 'PDF出力' },
          { label: '請求書', path: '/invoices', desc: 'インボイス対応' },
          { label: '契約書', path: '/contracts', desc: '建設業法対応' },
        ].map((item) => (
          <Link key={item.path} href={item.path} className="group bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 hover:shadow-md transition-all">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
