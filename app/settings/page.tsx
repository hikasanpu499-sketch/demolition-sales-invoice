'use client';

import { useState, useEffect } from 'react';
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

const defaultSettings: Settings = {
  company_name: '',
  postal_code: '',
  address: '',
  phone: '',
  email: '',
  invoice_number: '',
  bank_info: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from('company_settings')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as Settings);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({ ...settings });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  const fields: { key: keyof Settings; label: string; placeholder?: string; multiline?: boolean }[] = [
    { key: 'company_name', label: '会社名', placeholder: '株式会社〇〇' },
    { key: 'postal_code', label: '郵便番号', placeholder: '000-0000' },
    { key: 'address', label: '住所', placeholder: '東京都〇〇区...' },
    { key: 'phone', label: '電話番号', placeholder: '03-0000-0000' },
    { key: 'email', label: 'メール', placeholder: 'info@example.com' },
    { key: 'invoice_number', label: 'インボイス登録番号', placeholder: 'T0000000000000' },
    { key: 'bank_info', label: '振込先口座情報', placeholder: '〇〇銀行 〇〇支店 普通 0000000', multiline: true },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">会社設定</h1>
      <p className="text-sm text-gray-500 mb-6">
        入力した情報は見積書・請求書・契約書に自動反映されます
      </p>

      {saved && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          設定を保存しました
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {fields.map(({ key, label, placeholder, multiline }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {multiline ? (
              <textarea
                value={(settings[key] as string) || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={(settings[key] as string) || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </form>
    </div>
  );
}
