'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { appConfig } from '@/lib/app-config';

type Mode = 'admin' | 'invite';

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('admin');
  const [inviteCode, setInviteCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400';

  async function handleAdminRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (signUpError || !authData.user) {
        setError(signUpError?.message || '登録に失敗しました');
        return;
      }
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'admin',
        email,
        display_name: displayName,
      });
      if (companyName) {
        await supabase.from('company_settings').upsert({ company_name: companyName });
      }
      router.push('/dashboard');
    } catch {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: inviteData, error: inviteError } = await supabase
        .from('invite_codes')
        .select('role')
        .eq('code', inviteCode.trim().toUpperCase())
        .single();
      if (inviteError || !inviteData) {
        setError('招待コードが正しくありません。管理者に確認してください。');
        return;
      }
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (signUpError || !authData.user) {
        setError(signUpError?.message || '登録に失敗しました');
        return;
      }
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: inviteData.role,
        email,
        display_name: displayName,
      });
      router.push('/dashboard');
    } catch {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <span className="text-white text-3xl font-bold">{appConfig.appName.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{appConfig.appName}</h1>
          <p className="text-gray-500 mt-1 text-sm">新規アカウント登録</p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => { setMode('admin'); setError(''); }}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'admin'
                ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <Building2 className="w-6 h-6" />
            <div>
              <div className="text-sm font-semibold leading-tight">会社として登録</div>
              <div className={`text-xs mt-0.5 ${mode === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                管理者として新規作成
              </div>
            </div>
          </button>
          <button
            onClick={() => { setMode('invite'); setError(''); }}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'invite'
                ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <Users className="w-6 h-6" />
            <div>
              <div className="text-sm font-semibold leading-tight">招待コードで参加</div>
              <div className={`text-xs mt-0.5 ${mode === 'invite' ? 'text-blue-200' : 'text-gray-400'}`}>
                チームに参加する
              </div>
            </div>
          </button>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'admin' ? (
            <form onSubmit={handleAdminRegister} className="space-y-4">
              <p className="text-sm text-gray-500 pb-4 border-b border-gray-100">
                会社・組織の管理者として新規登録します。登録後に招待コードを発行してスタッフを招待できます。
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  会社名 <span className="text-gray-400 font-normal text-xs">（任意）</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="株式会社〇〇"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">お名前</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="山田 太郎"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="8文字以上"
                  minLength={8}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                {loading ? '登録中...' : '管理者として登録する'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleInviteRegister} className="space-y-4">
              <p className="text-sm text-gray-500 pb-4 border-b border-gray-100">
                管理者から共有された招待コードを入力してチームに参加します。
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">招待コード</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  placeholder="STAFF-XXXXXXXX"
                  className={`${inputClass} font-mono tracking-widest uppercase`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">お名前</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="山田 太郎"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="8文字以上"
                  minLength={8}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                {loading ? '参加中...' : 'チームに参加する'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
