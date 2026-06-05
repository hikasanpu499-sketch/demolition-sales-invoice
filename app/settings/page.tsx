'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, Copy, Check, ShieldCheck, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Tab = 'company' | 'invite' | 'users';

type CompanySettings = {
  id?: string;
  company_name: string;
  postal_code: string;
  address: string;
  phone: string;
  email: string;
  invoice_number: string;
  bank_info: string;
};

type UserRole = { id: string; user_id: string; role: 'admin' | 'staff'; email: string; display_name: string };
type InviteCode = { id: string; code: string; role: 'admin' | 'staff'; description: string };

const EMPTY: CompanySettings = {
  company_name: '', postal_code: '', address: '',
  phone: '', email: '', invoice_number: '', bank_info: '',
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('company');
  const [settings, setSettings] = useState<CompanySettings>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('company_settings').select('*').single().then(({ data }) => {
      if (data) setSettings(data as CompanySettings);
    });
    supabase.from('user_roles').select('*').then(({ data }) => {
      if (data) setUserRoles(data as UserRole[]);
    });
    supabase.from('invite_codes').select('*').order('role').then(({ data }) => {
      if (data) setInviteCodes(data as InviteCode[]);
    });
  }, []);

  const set = (key: keyof CompanySettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { id, ...rest } = settings;
    if (id) {
      await supabase.from('company_settings').update(rest).eq('id', id);
    } else {
      const { data } = await supabase.from('company_settings').insert(rest).select().single();
      if (data) setSettings(data as CompanySettings);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

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

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'company', label: '自社情報' },
    { id: 'invite', label: '招待コード' },
    { id: 'users', label: 'ユーザー管理' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">設定</h1>
        <p className="text-sm text-gray-500 mt-1">自社情報・招待コード・スタッフ管理</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 自社情報 */}
      {tab === 'company' && (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">自社情報</h2>
              <p className="text-xs text-gray-500 mt-0.5">入力した情報は書類（見積書・請求書・契約書）に自動反映されます</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">会社名</label>
                <input type="text" value={settings.company_name} onChange={set('company_name')} placeholder="株式会社〇〇" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">郵便番号</label>
                  <input type="text" value={settings.postal_code} onChange={set('postal_code')} placeholder="000-0000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">電話番号</label>
                  <input type="text" value={settings.phone} onChange={set('phone')} placeholder="03-0000-0000" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">住所</label>
                <input type="text" value={settings.address} onChange={set('address')} placeholder="東京都〇〇区〇〇1-2-3" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                <input type="email" value={settings.email} onChange={set('email')} placeholder="info@company.com" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">請求・税務情報</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  インボイス登録番号
                  <span className="ml-2 text-xs font-normal text-gray-400">（T + 13桁）</span>
                </label>
                <input type="text" value={settings.invoice_number} onChange={set('invoice_number')} placeholder="T1234567890123" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">振込先口座情報</label>
                <textarea
                  value={settings.bank_info}
                  onChange={(e) => setSettings((prev) => ({ ...prev, bank_info: e.target.value }))}
                  placeholder={"〇〇銀行 〇〇支店\n普通 1234567\n口座名義：カ）〇〇"}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存する'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                保存しました
              </span>
            )}
          </div>
        </form>
      )}

      {/* 招待コード */}
      {tab === 'invite' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">招待コード</h2>
            <p className="text-xs text-gray-500 mt-0.5">永続コード・何人でも登録可能です</p>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-4">
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
      )}

      {/* ユーザー管理 */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">ユーザー管理</h2>
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
      )}
    </div>
  );
}
