'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'staff';
  email: string;
  display_name: string;
};

type InviteCode = {
  id: string;
  code: string;
  role: 'admin' | 'staff';
  description: string;
};

export default function UsersPage() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('user_roles')
      .select('*')
      .then(({ data }) => {
        if (data) setUserRoles(data as UserRole[]);
      });

    supabase
      .from('invite_codes')
      .select('*')
      .then(({ data }) => {
        if (data) setInviteCodes(data as InviteCode[]);
      });
  }, []);

  async function handleCopy(code: string, id: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleRoleChange(userId: string, newRole: 'admin' | 'staff') {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);
    if (!error) {
      setUserRoles((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
    }
  }

  const roleBadge = (role: 'admin' | 'staff') =>
    role === 'admin'
      ? 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700'
      : 'inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700';

  const roleLabel = (role: 'admin' | 'staff') => (role === 'admin' ? '管理者' : 'スタッフ');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>

      {/* Invite codes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">招待コード</h2>
        <p className="text-sm text-gray-500 mb-5">永続コード・何人でも登録可能です</p>

        {inviteCodes.length === 0 ? (
          <p className="text-sm text-gray-400">招待コードがありません</p>
        ) : (
          <div className="space-y-4">
            {inviteCodes.map((ic) => (
              <div
                key={ic.id}
                className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="min-w-0">
                  <span className={roleBadge(ic.role)}>{roleLabel(ic.role)}</span>
                  {ic.description && (
                    <p className="text-xs text-gray-500 mt-1">{ic.description}</p>
                  )}
                  <p className="font-mono text-xl font-bold text-gray-800 mt-2 tracking-widest">
                    {ic.code}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(ic.code, ic.id)}
                  className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {copiedId === ic.id ? '✓ コピー済み' : 'コピー'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">スタッフ一覧</h2>

        {userRoles.length === 0 ? (
          <p className="text-sm text-gray-400">まだユーザーが登録されていません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">名前</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">メール</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">権限</th>
                  <th className="text-left py-2 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userRoles.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4 text-gray-800">{u.display_name || '—'}</td>
                    <td className="py-3 pr-4 text-gray-600">{u.email || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={roleBadge(u.role)}>{roleLabel(u.role)}</span>
                    </td>
                    <td className="py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.user_id, e.target.value as 'admin' | 'staff')
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="admin">管理者</option>
                        <option value="staff">スタッフ</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
