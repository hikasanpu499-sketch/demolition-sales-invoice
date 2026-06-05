'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ShieldCheck, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type UserRole = { id: string; user_id: string; role: 'admin' | 'staff'; email: string; display_name: string };
type InviteCode = { id: string; code: string; role: 'admin' | 'staff'; description: string };

export default function UsersPage() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('user_roles').select('*').then(({ data }) => { if (data) setUserRoles(data as UserRole[]); });
    supabase.from('invite_codes').select('*').order('role').then(({ data }) => { if (data) setInviteCodes(data as InviteCode[]); });
  }, []);

  async function handleCopy(code: string, id: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleRoleChange(userId: string, newRole: 'admin' | 'staff') {
    const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
    if (!error) setUserRoles((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
  }

  const adminCode = inviteCodes.find((c) => c.role === 'admin');
  const staffCode = inviteCodes.find((c) => c.role === 'staff');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ユーザー管理</h1>
        <p className="text-sm text-gray-500 mt-1">招待コードの共有とスタッフの権限管理</p>
      </div>

      {/* Invite Codes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">招待コード</h2>
          <p className="text-xs text-gray-500 mt-0.5">永続コード・何人でも登録可能です</p>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-4">
          {/* Admin code */}
          <div className="rounded-xl border-2 border-purple-100 bg-purple-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">管理者用招待コード</span>
            </div>
            {adminCode ? (
              <>
                <p className="font-mono text-2xl font-bold text-gray-900 tracking-widest mb-3">{adminCode.code}</p>
                <button
                  onClick={() => handleCopy(adminCode.code, adminCode.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                >
                  {copiedId === adminCode.id ? <><Check className="w-4 h-4" />コピー済み</> : <><Copy className="w-4 h-4" />コピー</>}
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">コードがありません</p>
            )}
          </div>

          {/* Staff code */}
          <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">スタッフ用招待コード</span>
            </div>
            {staffCode ? (
              <>
                <p className="font-mono text-2xl font-bold text-gray-900 tracking-widest mb-3">{staffCode.code}</p>
                <button
                  onClick={() => handleCopy(staffCode.code, staffCode.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {copiedId === staffCode.id ? <><Check className="w-4 h-4" />コピー済み</> : <><Copy className="w-4 h-4" />コピー</>}
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">コードがありません</p>
            )}
          </div>
        </div>
      </div>

      {/* Staff list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">スタッフ一覧</h2>
          <p className="text-xs text-gray-500 mt-0.5">{userRoles.length}名登録済み</p>
        </div>
        <div className="divide-y divide-gray-50">
          {userRoles.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              まだユーザーが登録されていません
            </div>
          ) : (
            userRoles.map((u) => (
              <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(u.display_name || u.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.display_name || '名前未設定'}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {u.role === 'admin' ? '管理者' : 'スタッフ'}
                </span>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.user_id, e.target.value as 'admin' | 'staff')}
                  className="flex-shrink-0 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                >
                  <option value="admin">管理者に変更</option>
                  <option value="staff">スタッフに変更</option>
                </select>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
