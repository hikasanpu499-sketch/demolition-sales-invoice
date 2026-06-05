"use client";

import { useEffect, useState, FormEvent } from "react";
import type { Invoice } from "@/app/invoices/page";

type Props = {
  editing: Invoice | null;
  onSaved: () => void;
  onCancel: () => void;
};

const empty = {
  invoice_number: "",
  customer_name: "",
  project_name: "",
  project_address: "",
  demolition_type: "木造",
  floor_area: "",
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  subtotal: "",
  tax_rate: "10",
  manifest_number: "",
  registered_invoice_number: "",
  status: "draft",
  notes: ""
};

export default function ItemForm({ editing, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        invoice_number: editing.invoice_number,
        customer_name: editing.customer_name,
        project_name: editing.project_name,
        project_address: editing.project_address ?? "",
        demolition_type: editing.demolition_type ?? "木造",
        floor_area: editing.floor_area?.toString() ?? "",
        issue_date: editing.issue_date,
        due_date: editing.due_date,
        subtotal: editing.subtotal.toString(),
        tax_rate: editing.tax_rate.toString(),
        manifest_number: editing.manifest_number ?? "",
        registered_invoice_number: editing.registered_invoice_number ?? "",
        status: editing.status,
        notes: editing.notes ?? ""
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  const handle = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const subtotalNum = Number(form.subtotal || 0);
  const taxRateNum = Number(form.tax_rate || 0);
  const taxAmount = Math.floor(subtotalNum * (taxRateNum / 100));
  const total = subtotalNum + taxAmount;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editing ? `/api/items/${editing.id}` : "/api/items";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSubmitting(false);
    if (res.ok) {
      setForm(empty);
      onSaved();
    } else {
      const j = await res.json().catch(() => ({}));
      alert("保存に失敗しました: " + (j.error || res.statusText));
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="請求書番号 *">
        <input required value={form.invoice_number} onChange={(e) => handle("invoice_number", e.target.value)} className="input" placeholder="INV-2025-001" />
      </Field>
      <Field label="ステータス">
        <select value={form.status} onChange={(e) => handle("status", e.target.value)} className="input">
          <option value="draft">下書き</option>
          <option value="issued">発行済</option>
          <option value="paid">入金済</option>
          <option value="overdue">期限超過</option>
        </select>
      </Field>
      <Field label="取引先名 *">
        <input required value={form.customer_name} onChange={(e) => handle("customer_name", e.target.value)} className="input" placeholder="株式会社〇〇" />
      </Field>
      <Field label="案件名 *">
        <input required value={form.project_name} onChange={(e) => handle("project_name", e.target.value)} className="input" placeholder="〇〇邸 解体工事" />
      </Field>
      <Field label="工事場所">
        <input value={form.project_address} onChange={(e) => handle("project_address", e.target.value)} className="input" placeholder="東京都..." />
      </Field>
      <Field label="解体種別">
        <select value={form.demolition_type} onChange={(e) => handle("demolition_type", e.target.value)} className="input">
          <option>木造</option>
          <option>鉄骨造</option>
          <option>RC造</option>
          <option>その他</option>
        </select>
      </Field>
      <Field label="延床面積 (㎡)">
        <input type="number" step="0.01" value={form.floor_area} onChange={(e) => handle("floor_area", e.target.value)} className="input" placeholder="120.50" />
      </Field>
      <Field label="マニフェスト番号">
        <input value={form.manifest_number} onChange={(e) => handle("manifest_number", e.target.value)} className="input" placeholder="廃棄物管理票番号" />
      </Field>
      <Field label="発行日 *">
        <input type="date" required value={form.issue_date} onChange={(e) => handle("issue_date", e.target.value)} className="input" />
      </Field>
      <Field label="支払期限 *">
        <input type="date" required value={form.due_date} onChange={(e) => handle("due_date", e.target.value)} className="input" />
      </Field>
      <Field label="小計 (税抜) *">
        <input type="number" required value={form.subtotal} onChange={(e) => handle("subtotal", e.target.value)} className="input" placeholder="1000000" />
      </Field>
      <Field label="消費税率 (%)">
        <input type="number" value={form.tax_rate} onChange={(e) => handle("tax_rate", e.target.value)} className="input" />
      </Field>
      <Field label="適格請求書発行事業者登録番号">
        <input value={form.registered_invoice_number} onChange={(e) => handle("registered_invoice_number", e.target.value)} className="input" placeholder="T1234567890123" />
      </Field>
      <Field label="備考">
        <input value={form.notes} onChange={(e) => handle("notes", e.target.value)} className="input" />
      </Field>

      <div className="md:col-span-2 bg-slate-50 rounded-lg p-4 border border-slate-200 flex justify-end gap-6 text-sm">
        <span>小計: <b>¥{subtotalNum.toLocaleString()}</b></span>
        <span>消費税: <b>¥{taxAmount.toLocaleString()}</b></span>
        <span className="text-lg">合計: <b className="text-emerald-700">¥{total.toLocaleString()}</b></span>
      </div>

      <div className="md:col-span-2 flex gap-3">
        <button type="submit" disabled={submitting} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50">
          {submitting ? "保存中..." : editing ? "更新" : "登録"}
        </button>
        {editing && (
          <button type="button" onClick={onCancel} className="border border-slate-300 px-6 py-2 rounded-lg font-medium hover:bg-slate-50">
            キャンセル
          </button>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #0f172a;
          box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.1);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600 mb-1 block">{label}</span>
      {children}
    </label>
  );
}