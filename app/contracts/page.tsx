'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Pencil, Trash2, X, FileSignature, Printer } from 'lucide-react';

type Contract = {
  id: string;
  contract_number: string;
  project_id: string | null;
  customer_name: string;
  project_name: string;
  project_address: string | null;
  contract_amount: number;
  start_date: string | null;
  end_date: string | null;
  demolition_type: string | null;
  floor_area: number | null;
  manifest_number: string | null;
  registered_invoice_number: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

type CompanySettings = {
  company_name?: string;
  address?: string;
  phone?: string;
  representative_name?: string;
  registered_invoice_number?: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-600' },
  sent: { label: '送付済', color: 'bg-blue-100 text-blue-700' },
  signed: { label: '締結済', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-600' },
};

const emptyForm = {
  contract_number: '',
  customer_name: '',
  project_name: '',
  project_address: '',
  contract_amount: '',
  start_date: '',
  end_date: '',
  demolition_type: '',
  floor_area: '',
  manifest_number: '',
  registered_invoice_number: '',
  status: 'draft',
  notes: '',
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [printTarget, setPrintTarget] = useState<Contract | null>(null);
  const [company, setCompany] = useState<CompanySettings>({});

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: cData }, { data: sData }] = await Promise.all([
      supabase.from('contracts').select('*').order('created_at', { ascending: false }),
      supabase.from('company_settings').select('*').limit(1).single(),
    ]);
    if (cData) setContracts(cData as Contract[]);
    if (sData) setCompany(sData as CompanySettings);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = contracts.filter((c) =>
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.project_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contract_number.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    const now = new Date();
    setForm({
      ...emptyForm,
      contract_number: `C-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    });
    setShowModal(true);
  };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({
      contract_number: c.contract_number,
      customer_name: c.customer_name,
      project_name: c.project_name,
      project_address: c.project_address || '',
      contract_amount: c.contract_amount?.toString() || '',
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      demolition_type: c.demolition_type || '',
      floor_area: c.floor_area?.toString() || '',
      manifest_number: c.manifest_number || '',
      registered_invoice_number: c.registered_invoice_number || '',
      status: c.status,
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.contract_number.trim() || !form.customer_name.trim()) return alert('契約番号・顧客名は必須です');
    setSaving(true);
    const payload = {
      contract_number: form.contract_number.trim(),
      customer_name: form.customer_name.trim(),
      project_name: form.project_name.trim(),
      project_address: form.project_address || null,
      contract_amount: form.contract_amount ? Number(form.contract_amount) : 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      demolition_type: form.demolition_type || null,
      floor_area: form.floor_area ? Number(form.floor_area) : null,
      manifest_number: form.manifest_number || null,
      registered_invoice_number: form.registered_invoice_number || null,
      status: form.status,
      notes: form.notes || null,
    };
    if (editing) {
      await supabase.from('contracts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('contracts').insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contracts').delete().eq('id', id);
    setDeleteId(null);
    fetchAll();
  };

  const handlePrint = (c: Contract) => {
    setPrintTarget(c);
    setTimeout(() => window.print(), 300);
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">契約書</h1>
          <p className="text-sm text-gray-500 mt-0.5">建設業法対応の工事請負契約書管理</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" /> 契約書を作成
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="顧客名・案件名・契約番号で検索..."
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
            <FileSignature className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">契約書がありません</p>
            <button onClick={openAdd} className="mt-4 text-sm text-blue-600 hover:underline">最初の契約書を作成する</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">契約番号</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">顧客名</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">工事名</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">請負代金</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">着工日</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const s = statusMap[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{c.contract_number}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{c.customer_name}</td>
                      <td className="px-4 py-4 hidden md:table-cell text-gray-600">{c.project_name}</td>
                      <td className="px-4 py-4 hidden md:table-cell text-right font-semibold text-gray-900">¥{Number(c.contract_amount).toLocaleString()}</td>
                      <td className="px-4 py-4 hidden lg:table-cell text-gray-500 text-xs">
                        {c.start_date ? new Date(c.start_date).toLocaleDateString('ja-JP') : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handlePrint(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="印刷">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? '契約書を編集' : '契約書を作成'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>契約番号 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.contract_number} onChange={(e) => setForm({ ...form, contract_number: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ステータス</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>顧客名（発注者）<span className="text-red-500">*</span></label>
                  <input type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="株式会社〇〇" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>工事名</label>
                  <input type="text" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="〇〇ビル解体工事" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>工事場所</label>
                  <input type="text" value={form.project_address} onChange={(e) => setForm({ ...form, project_address: e.target.value })} placeholder="東京都〇〇区..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>請負代金（円）</label>
                  <input type="number" value={form.contract_amount} onChange={(e) => setForm({ ...form, contract_amount: e.target.value })} placeholder="1000000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>解体種別</label>
                  <input type="text" value={form.demolition_type} onChange={(e) => setForm({ ...form, demolition_type: e.target.value })} placeholder="木造2階建て" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>着工日</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>完工日</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>床面積（㎡）</label>
                  <input type="number" value={form.floor_area} onChange={(e) => setForm({ ...form, floor_area: e.target.value })} placeholder="150" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>廃棄物管理票（マニフェスト）番号</label>
                  <input type="text" value={form.manifest_number} onChange={(e) => setForm({ ...form, manifest_number: e.target.value })} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>適格請求書発行事業者登録番号</label>
                  <input type="text" value={form.registered_invoice_number} onChange={(e) => setForm({ ...form, registered_invoice_number: e.target.value })} placeholder="T-000000000000" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>特記事項・備考</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className={inputClass} />
                </div>
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
            <h3 className="font-semibold text-gray-900 mb-1">契約書を削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">キャンセル</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">削除する</button>
            </div>
          </div>
        </div>
      )}

      {/* Printable contract (建設業法14項目) */}
      {printTarget && (
        <div className="printable" style={{ display: 'none' }}>
          <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px', fontSize: '13px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '3px solid #1e3a5f', paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.15em' }}>工　事　請　負　契　約　書</h1>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>（建設業法第19条に基づく書面）</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <p>契約番号：{printTarget.contract_number}</p>
                <p style={{ marginTop: '4px' }}>契約日：　　　　年　　月　　日</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 'bold' }}>{company.company_name || '（会社名）'}</p>
                {company.address && <p>{company.address}</p>}
                {company.registered_invoice_number && <p>登録番号：{company.registered_invoice_number}</p>}
              </div>
            </div>

            <div style={{ background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 12px', fontWeight: 'bold', width: '160px', color: '#1e3a5f' }}>発注者（甲）</td>
                    <td style={{ padding: '6px 12px' }}>{printTarget.customer_name}</td>
                    <td style={{ padding: '6px 12px', fontWeight: 'bold', width: '160px', color: '#1e3a5f' }}>受注者（乙）</td>
                    <td style={{ padding: '6px 12px' }}>{company.company_name || '　　　　　　　　'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ marginBottom: '16px', lineHeight: '1.8' }}>
              上記当事者間において、下記の通り工事請負契約を締結する。
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', border: '1px solid #ccc' }}>
              <tbody>
                {[
                  { label: '① 工事名', value: printTarget.project_name },
                  { label: '② 工事場所', value: printTarget.project_address || '　' },
                  { label: '③ 解体種別・構造', value: `${printTarget.demolition_type || '　'}${printTarget.floor_area ? `　床面積：${printTarget.floor_area}㎡` : ''}` },
                  { label: '④ 工事着手時期', value: printTarget.start_date ? new Date(printTarget.start_date).toLocaleDateString('ja-JP') : '　　　年　　月　　日' },
                  { label: '⑤ 工事完成時期', value: printTarget.end_date ? new Date(printTarget.end_date).toLocaleDateString('ja-JP') : '　　　年　　月　　日' },
                  { label: '⑥ 請負代金の額', value: `¥${Number(printTarget.contract_amount).toLocaleString()}　（うち消費税等：¥${Math.floor(Number(printTarget.contract_amount) * 10 / 110).toLocaleString()}）` },
                  { label: '⑦ 廃棄物管理票番号', value: printTarget.manifest_number || '　' },
                  { label: '⑧ 登録番号（インボイス）', value: printTarget.registered_invoice_number || '　' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd', background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold', width: '200px', color: '#1e3a5f', borderRight: '1px solid #ddd' }}>{row.label}</td>
                    <td style={{ padding: '10px 14px' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a5f', borderLeft: '4px solid #3b82f6', paddingLeft: '10px' }}>
              建設業法第19条第1項各号に基づく記載事項
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', border: '1px solid #ccc', fontSize: '12px' }}>
              <tbody>
                {[
                  { num: '第1号', title: '工事の請負代金の支払方法及びその時期', content: '請負代金は、工事完成・引き渡し後30日以内に銀行振込にて支払うものとする。' },
                  { num: '第2号', title: '天災その他不可抗力による工期変更又は損害の負担及びその額の算定方法', content: '天災その他不可抗力によって工事に損害が生じたとき、その損害は甲乙協議のうえ負担を定める。' },
                  { num: '第3号', title: '価格等の変動若しくは変更に基づく請負代金の額又は工事内容の変更', content: '著しい物価変動等が生じた場合、甲乙協議のうえ請負代金の額又は工事内容を変更できる。' },
                  { num: '第4号', title: '工事の施工により第三者が損害を受けた場合における賠償金の負担', content: '施工により第三者に損害を与えた場合、その賠償は原則として乙が負担する。ただし甲の責に帰すべき事由による場合はこの限りでない。' },
                  { num: '第5号', title: '注文者が工事に使用する資材を提供し、又は建設機械その他の機械を貸与するときの条件', content: '甲が資材等を提供する場合、その品名・数量・価格・引渡時期・場所等を別途書面により定める。' },
                  { num: '第6号', title: '注文者が工事の全部又は一部の完成を確認するための検査の時期及び方法並びに引渡しの時期', content: '工事完成後、甲の立ち会いのもと検査を実施し、合格後に引き渡す。引渡し日は完成通知後14日以内とする。' },
                  { num: '第7号', title: '工事完成後における請負代金の支払の時期及び方法', content: '引き渡し完了後、甲は30日以内に所定の銀行口座に振込にて支払うものとする。' },
                  { num: '第8号', title: '工事の目的物の瑕疵を担保すべき責任又は当該責任の履行に関して講ずべき保証保険契約の締結その他の措置に関する定め', content: '乙は引渡し後2年間、工事の瑕疵について無償で補修する責任を負う。' },
                  { num: '第9号', title: '各当事者の履行の遅滞その他債務の不履行の場合における遅延利息、違約金その他の損害金', content: '甲が支払を遅延した場合、年14.6%の割合による遅延損害金を支払うものとする。乙が工期を遅延した場合も同様とする。' },
                  { num: '第10号', title: '契約に関する紛争の解決方法', content: '本契約に関する紛争は、建設業法に基づく建設工事紛争審査会の調停・仲裁、または管轄裁判所の裁判によって解決する。' },
                  { num: '第11号', title: '工事の目的物の引渡し前における損壊・滅失のリスクの負担', content: '工事目的物の引き渡し前に生じた損傷・滅失のリスクは乙が負担する。ただし甲の責に帰すべき場合を除く。' },
                  { num: '第12号', title: '設計変更若しくは工事着手の延期又は工事の全部若しくは一部の中止の申し出があった場合における工期の変更', content: '設計変更・工事中止等の場合、甲乙協議のうえ工期・請負代金を変更できる。変更内容は書面にて確認する。' },
                  { num: '第13号', title: '前各号に掲げるもののほか、国土交通省令で定める事項', content: '本契約に定めのない事項については、建設業法及び関係法令に従い、甲乙誠意をもって協議解決する。' },
                  { num: '第14号（産廃）', title: '産業廃棄物の処理に関する特約', content: '解体工事に伴い発生する産業廃棄物は適正に処理する。廃棄物管理票（マニフェスト）を交付・保管し、法令を遵守する。' },
                ].map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd', background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 'bold', width: '110px', verticalAlign: 'top', borderRight: '1px solid #ddd', color: '#1e3a5f', fontSize: '11px' }}>{item.num}</td>
                    <td style={{ padding: '8px 12px', verticalAlign: 'top', borderRight: '1px solid #ddd', fontWeight: 'bold', width: '160px', fontSize: '11px' }}>{item.title}</td>
                    <td style={{ padding: '8px 12px', fontSize: '11px', lineHeight: '1.6' }}>{item.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {printTarget.notes && (
              <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '6px', color: '#1e3a5f' }}>特記事項</p>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{printTarget.notes}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px', gap: '40px' }}>
              <div style={{ flex: 1, borderTop: '1px solid #333', paddingTop: '8px', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold' }}>発注者（甲）</p>
                <p style={{ marginTop: '4px' }}>{printTarget.customer_name}</p>
                <p style={{ marginTop: '40px', fontSize: '12px', color: '#999' }}>住所：</p>
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>氏名：　　　　　　　　　　　　　　　　　㊞</p>
              </div>
              <div style={{ flex: 1, borderTop: '1px solid #333', paddingTop: '8px', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold' }}>受注者（乙）</p>
                <p style={{ marginTop: '4px' }}>{company.company_name || '（会社名）'}</p>
                {company.address && <p style={{ fontSize: '12px', marginTop: '4px' }}>{company.address}</p>}
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>代表者：　　　　　　　　　　　　　　　　㊞</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
