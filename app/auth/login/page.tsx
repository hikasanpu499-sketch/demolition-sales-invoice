'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { appConfig } from '@/lib/app-config';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('メールアドレスまたはパスワードが正しくありません');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <span className="text-white text-3xl font-bold">{appConfig.appName.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{appConfig.appName}</h1>
          <p className="text-gray-500 mt-1 text-sm">アカウントにログイン</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">パスワード</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" className={inputClass} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm">
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">新規登録</Link>
        </p>
      </div>
    </div>
  );
}
