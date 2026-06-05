'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Pencil, Trash2, X, HardHat, ChevronRight } from 'lucide-react';

type Project = {
  id: string;
  project_code: string;
  customer_name: string;
  customer_id: string | null;
  project_name: string;
  address: string | null;
  demolition_type: string | null;
  floor_area: number | null;
  contract_amount: number | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
  inquiry: { label: '問い合わせ', color: 'bg-gray-100 text-gray-600' },
  negotiating: { label: '商談中', color: 'bg-yellow-100 text-yellow-700' },
  contracted: { label: '契約済', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: '施工中', color: 'bg-orange-100 text-orange-700' },
  completed: { label: '完了', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-600' },
};

const statusOrder = ['inquiry', 'negotiating', 'contracted', 'in_progress', 'completed', 'cancelled'];

const emptyForm = {
  project_code: '',
  customer_name: '',
  project_name: '',
  address: '',
  demolition_type: '',
  floor_area: '',
  contract_amount: '',
  status: 'inquiry',
  start_date: '',
  end_date: '',
  assigned_to: '',
  notes: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProjects(data as Project[]);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter((p) => {
    const matchSearch = p.project_name.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.project_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditing(null);
    const now = new Date();
    setForm({
      ...emptyForm,
      project_code: `PJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    });
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      project_code: p.project_code,
      customer_name: p.customer_name,
      project_name: p.project_name,
      address: p.address || '',
      demolition_type: p.demolition_type || '',
      floor_area: p.floor_area?.toString() || '',
      contract_amount: p.contract_amount?.toString() || '',
      status: p.status,
      start_date: p.start_date || '',
      end_date: p.end_date || '',
      assigned_to: p.assigned_to || '',
      notes: p.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.project_code.trim() || !form.customer_name.trim() || !form.project_name.trim()) {
      return alert('案件コード・顧客名・案件名は必須です');
    }
    setSaving(true);
    const payload = {
      project_code: form.project_code.trim(),
      customer_name: form.customer_name.trim(),
      project_name: form.project_name.trim(),
      address: form.address || null,
      demolition_type: form.demolition_type || null,
      floor_area: form.floor_area ? Number(form.floor_area) : null,
      contract_amount: form.contract_amount ? Number(form.contract_amount) : null,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      assigned_to: form.assigned_to || null,
      notes: form.notes || null,
    };
    if (editing) {
      await supabase.from('projects').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('projects').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setDeleteId(null);
    fetchProjects();
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  // Count by status
  const counts = statusOrder.reduce((acc, s) => {
    acc[s] = projects.filter((p) => p.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">案件管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">解体工事案件の受注・進捗管理</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" /> 案件を追加
        </button>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {statusOrder.map((s, i) => {
          const info = statusMap[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`rounded-xl p-3 text-center transition-all border ${
                filterStatus === s
                  ? 'border-blue-400 shadow-sm shadow-blue-100 bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{counts[s] || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{info.label}</p>
              {i < statusOrder.length - 1 && (
                <ChevronRight className="w-3 h-3 text-gray-300 mx-auto mt-1 hidden md:block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search and filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="案件名・顧客名・案件コードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全ステータス</option>
          {statusOrder.map((s) => (
            <option key={s} value={s}>{statusMap[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <HardHat className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">案件がありません</p>
            <button onClick={openAdd} className="mt-4 text-sm text-blue-600 hover:underline">最初の案件を追加する</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">案件コード</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">案件名</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">顧客名</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">住所</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">請負金額</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">着工日</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const s = statusMap[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.project_code}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{p.project_name}</p>
                        {p.demolition_type && <p className="text-xs text-gray-400">{p.demolition_type}</p>}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-gray-600">{p.customer_name}</td>
                      <td className="px-4 py-4 hidden lg:table-cell text-gray-500 text-xs truncate max-w-[160px]">{p.address || '-'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-right font-medium text-gray-900">
                        {p.contract_amount ? `¥${Number(p.contract_amount).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-gray-500 text-xs">
                        {p.start_date ? new Date(p.start_date).toLocaleDateString('ja-JP') : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
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
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            {filtered.length}件表示 / 合計 {projects.length}件
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? '案件を編集' : '案件を追加'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>案件コード <span className="text-red-500">*</span></label>
                  <input type="text" value={form.project_code} onChange={(e) => setForm({ ...form, project_code: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ステータス</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    {statusOrder.map((s) => <option key={s} value={s}>{statusMap[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>顧客名 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="株式会社〇〇" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>案件名 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="〇〇ビル解体工事" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>住所</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="東京都〇〇区..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>解体種別</label>
                  <input type="text" value={form.demolition_type} onChange={(e) => setForm({ ...form, demolition_type: e.target.value })} placeholder="木造・RC造・鉄骨造 など" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>床面積 (㎡)</label>
                  <input type="number" value={form.floor_area} onChange={(e) => setForm({ ...form, floor_area: e.target.value })} placeholder="150" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>請負金額 (円)</label>
                  <input type="number" value={form.contract_amount} onChange={(e) => setForm({ ...form, contract_amount: e.target.value })} placeholder="1000000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>担当者</label>
                  <input type="text" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} placeholder="担当者名" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>着工日</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>完工日</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>備考</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? '保存中...' : editing ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">案件を削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
