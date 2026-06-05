'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Settings = {
  id?: string;
  company_name: string;
  postal_code: string;
  address: string;
  phone: string;
  email: string;
  invoice_number: string;
  bank_info: string;
};

const EMPTY: Settings = {
  company_name: '', postal_code: '', address: '',
  phone: '', email: '', invoice_number: '', bank_info: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('company_settings').select('*').single().then(({ data }) => {
      if (data) setSettings(data as Settings);
    });
  }, []);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { id, ...rest } = settings;
    if (id) {
      await supabase.from('company_settings').update(rest).eq('id', id);
    } else {
      const { data } = await supabase.from('company_settings').insert(rest).select().single();
      if (data) setSettings(data as Settings);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">設定</h1>
        <p className="text-sm text-gray-500 mt-1">入力した情報は見積書・請求書・契約書に自動反映されます</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">自社情報</h2>
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-5">
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

        <div className="mt-6 flex items-center gap-4">
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
    </div>
  );
}
