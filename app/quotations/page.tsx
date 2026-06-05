'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Pencil, Trash2, X, FileText, Printer } from 'lucide-react';

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
};

type Quotation = {
  id: string;
  quotation_number: string;
  project_id: string | null;
  customer_name: string;
  project_name: string;
  issue_date: string;
  valid_until: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes: string | null;
  line_items: LineItem[];
  created_at: string;
};

type CompanySettings = {
  company_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  registered_invoice_number?: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-600' },
  sent: { label: '送付済', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: '承諾済', color: 'bg-green-100 text-green-700' },
  rejected: { label: '却下', color: 'bg-red-100 text-red-600' },
  expired: { label: '期限切れ', color: 'bg-yellow-100 text-yellow-700' },
};

const emptyLineItem: LineItem = { description: '', quantity: 1, unit: '式', unit_price: 0, amount: 0 };

const emptyForm = {
  quotation_number: '',
  customer_name: '',
  project_name: '',
  issue_date: new Date().toISOString().split('T')[0],
  valid_until: '',
  tax_rate: 10,
  status: 'draft',
  notes: '',
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...emptyLineItem }]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [printTarget, setPrintTarget] = useState<Quotation | null>(null);
  const [company, setCompany] = useState<CompanySettings>({});

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: qData }, { data: sData }] = await Promise.all([
      supabase.from('quotations').select('*').order('created_at', { ascending: false }),
      supabase.from('company_settings').select('*').limit(1).single(),
    ]);
    if (qData) setQuotations(qData as Quotation[]);
    if (sData) setCompany(sData as CompanySettings);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const calcItems = (items: LineItem[]) =>
    items.map((item) => ({ ...item, amount: item.quantity * item.unit_price }));

  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const taxAmount = Math.floor(subtotal * Number(form.tax_rate) / 100);
  const totalAmount = subtotal + taxAmount;

  const filtered = quotations.filter((q) =>
    q.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    q.project_name.toLowerCase().includes(search.toLowerCase()) ||
    q.quotation_number.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    const now = new Date();
    const num = `Q-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setForm({ ...emptyForm, quotation_number: num, issue_date: now.toISOString().split('T')[0] });
    setLineItems([{ ...emptyLineItem }]);
    setShowModal(true);
  };

  const openEdit = (q: Quotation) => {
    setEditing(q);
    setForm({
      quotation_number: q.quotation_number,
      customer_name: q.customer_name,
      project_name: q.project_name,
      issue_date: q.issue_date,
      valid_until: q.valid_until || '',
      tax_rate: q.tax_rate,
      status: q.status,
      notes: q.notes || '',
    });
    setLineItems(q.line_items?.length ? q.line_items : [{ ...emptyLineItem }]);
    setShowModal(true);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = lineItems.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      newItem.amount = newItem.quantity * newItem.unit_price;
      return newItem;
    });
    setLineItems(updated);
  };

  const handleSave = async () => {
    if (!form.quotation_number.trim() || !form.customer_name.trim()) return alert('見積番号・顧客名は必須です');
    setSaving(true);
    const sub = lineItems.reduce((s, i) => s + i.amount, 0);
    const tax = Math.floor(sub * Number(form.tax_rate) / 100);
    const payload = {
      quotation_number: form.quotation_number.trim(),
      customer_name: form.customer_name.trim(),
      project_name: form.project_name.trim(),
      issue_date: form.issue_date,
      valid_until: form.valid_until || null,
      subtotal: sub,
      tax_rate: Number(form.tax_rate),
      tax_amount: tax,
      total_amount: sub + tax,
      status: form.status,
      notes: form.notes || null,
      line_items: lineItems,
    };
    if (editing) {
      await supabase.from('quotations').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('quotations').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('quotations').delete().eq('id', id);
    setDeleteId(null);
    fetchAll();
  };

  const handlePrint = (q: Quotation) => {
    setPrintTarget(q);
    setTimeout(() => window.print(), 300);
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">見積書</h1>
          <p className="text-sm text-gray-500 mt-0.5">見積書の作成・管理・PDF出力</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" /> 見積書を作成
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="顧客名・案件名・見積番号で検索..."
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
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">見積書がありません</p>
            <button onClick={openAdd} className="mt-4 text-sm text-blue-600 hover:underline">最初の見積書を作成する</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">見積番号</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">顧客名</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">案件名</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">発行日</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">合計金額</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((q) => {
                  const s = statusMap[q.status] || { label: q.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{q.quotation_number}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{q.customer_name}</td>
                      <td className="px-4 py-4 hidden md:table-cell text-gray-600">{q.project_name}</td>
                      <td className="px-4 py-4 hidden md:table-cell text-gray-500 text-xs">{new Date(q.issue_date).toLocaleDateString('ja-JP')}</td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900">¥{Number(q.total_amount).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handlePrint(q)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="印刷">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(q)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(q.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? '見積書を編集' : '見積書を作成'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>見積番号 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.quotation_number} onChange={(e) => setForm({ ...form, quotation_number: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ステータス</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>顧客名 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="株式会社〇〇" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>案件名</label>
                  <input type="text" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="〇〇ビル解体工事" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>発行日</label>
                  <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>有効期限</label>
                  <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>消費税率 (%)</label>
                  <select value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} className={inputClass}>
                    <option value={10}>10%</option>
                    <option value={8}>8%（軽減）</option>
                    <option value={0}>0%（非課税）</option>
                  </select>
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">明細</h3>
                  <button
                    onClick={() => setLineItems([...lineItems, { ...emptyLineItem }])}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> 行を追加
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">摘要</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 w-20">数量</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-16">単位</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 w-28">単価</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 w-28">金額</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                              placeholder="解体工事費"
                              className="w-full border-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(i, 'quantity', Number(e.target.value))}
                              className="w-full border-0 bg-transparent text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => updateLineItem(i, 'unit', e.target.value)}
                              className="w-full border-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateLineItem(i, 'unit_price', Number(e.target.value))}
                              className="w-full border-0 bg-transparent text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium text-gray-700">
                            ¥{item.amount.toLocaleString()}
                          </td>
                          <td className="px-2 py-2">
                            {lineItems.length > 1 && (
                              <button
                                onClick={() => setLineItems(lineItems.filter((_, idx) => idx !== i))}
                                className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>小計</span>
                      <span>¥{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>消費税 ({form.tax_rate}%)</span>
                      <span>¥{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                      <span>合計</span>
                      <span>¥{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>備考</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="お支払い条件など" className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? '保存中...' : editing ? '更新する' : '作成する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">見積書を削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">削除する</button>
            </div>
          </div>
        </div>
      )}

      {/* Printable quotation */}
      {printTarget && (
        <div className="printable" style={{ display: 'none' }}>
          <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.1em' }}>見　積　書</h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px' }}>{printTarget.customer_name} 御中</p>
                <p style={{ marginTop: '8px', fontSize: '14px' }}>件名：{printTarget.project_name}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '13px' }}>
                <p>見積番号：{printTarget.quotation_number}</p>
                <p>発行日：{new Date(printTarget.issue_date).toLocaleDateString('ja-JP')}</p>
                {printTarget.valid_until && <p>有効期限：{new Date(printTarget.valid_until).toLocaleDateString('ja-JP')}</p>}
                <div style={{ marginTop: '12px', borderTop: '1px solid #ccc', paddingTop: '12px' }}>
                  <p style={{ fontWeight: 'bold' }}>{company.company_name || '（会社名未設定）'}</p>
                  {company.address && <p>{company.address}</p>}
                  {company.phone && <p>TEL: {company.phone}</p>}
                  {company.registered_invoice_number && <p>登録番号: {company.registered_invoice_number}</p>}
                </div>
              </div>
            </div>
            <div style={{ background: '#f0f4ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', color: '#666' }}>お見積金額（税込）</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold' }}>¥{Number(printTarget.total_amount).toLocaleString()}</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px' }}>摘要</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', width: '80px' }}>数量</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', width: '60px' }}>単位</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', width: '120px' }}>単価</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', width: '120px' }}>金額</th>
                </tr>
              </thead>
              <tbody>
                {printTarget.line_items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd', background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{item.description}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{item.quantity}</td>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{item.unit}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>¥{Number(item.unit_price).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>¥{Number(item.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <table style={{ width: '260px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 12px', fontSize: '13px', color: '#666' }}>小計</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: '13px' }}>¥{Number(printTarget.subtotal).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 12px', fontSize: '13px', color: '#666' }}>消費税 ({printTarget.tax_rate}%)</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: '13px' }}>¥{Number(printTarget.tax_amount).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderTop: '2px solid #1e3a5f', background: '#f0f4ff' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '14px' }}>合計金額</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>¥{Number(printTarget.total_amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {printTarget.notes && (
              <div style={{ marginTop: '24px', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', color: '#666', fontWeight: 'bold', marginBottom: '4px' }}>備考</p>
                <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{printTarget.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
