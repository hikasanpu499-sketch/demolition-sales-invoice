'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Pencil, Trash2, X, Building2, Phone, Mail, Shield } from 'lucide-react';

type Customer = {
  id: string;
  name: string;
  company_type: string | null;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

const emptyForm = {
  name: '',
  company_type: '法人',
  phone: '',
  email: '',
  license_number: '',
  address: '',
  notes: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCustomers(data as Customer[]);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      company_type: c.company_type || '法人',
      phone: c.phone || '',
      email: c.email || '',
      license_number: c.license_number || '',
      address: c.address || '',
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('会社名・顧客名は必須です');
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      company_type: form.company_type,
      phone: form.phone || null,
      email: form.email || null,
      license_number: form.license_number || null,
      address: form.address || null,
      notes: form.notes || null,
    };
    if (editing) {
      await supabase.from('customers').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('customers').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('customers').delete().eq('id', id);
    setDeleteId(null);
    fetchCustomers();
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">顧客管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">取引先・顧客情報の管理</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" /> 顧客を追加
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="顧客名・メールで検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">顧客がありません</p>
            <button onClick={openAdd} className="mt-4 text-sm text-blue-600 hover:underline">最初の顧客を追加する</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">顧客名</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">区分</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">電話番号</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">メール</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">解体業許可番号</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">登録日</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-semibold text-sm">{c.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          {c.address && <p className="text-xs text-gray-400 truncate max-w-[180px]">{c.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${c.company_type === '個人' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.company_type || '法人'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {c.phone}
                        </div>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {c.email ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-[160px]">{c.email}</span>
                        </div>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {c.license_number ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Shield className="w-3.5 h-3.5 text-gray-400" />
                          {c.license_number}
                        </div>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            {filtered.length}件表示 / 合計 {customers.length}件
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? '顧客を編集' : '顧客を追加'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>会社名・顧客名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="株式会社〇〇"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>区分</label>
                  <select
                    value={form.company_type}
                    onChange={(e) => setForm({ ...form, company_type: e.target.value })}
                    className={inputClass}
                  >
                    <option value="法人">法人</option>
                    <option value="個人">個人</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>電話番号</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="03-0000-0000"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>メールアドレス</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@company.co.jp"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>解体業許可番号</label>
                  <input
                    type="text"
                    value={form.license_number}
                    onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                    placeholder="第〇〇号"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>住所</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="東京都〇〇区..."
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>備考</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="備考・メモ"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving ? '保存中...' : editing ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">顧客を削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
