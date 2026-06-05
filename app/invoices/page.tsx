"use client";

import { useEffect, useState } from "react";
import ItemForm from "@/components/ItemForm";
import ItemList from "@/components/ItemList";
import { supabase } from "@/lib/supabase";

export type Invoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  project_name: string;
  project_address: string | null;
  demolition_type: string | null;
  floor_area: number | null;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  manifest_number: string | null;
  registered_invoice_number: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setInvoices(data as Invoice[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalAmount = invoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
  const unpaidAmount = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">請求書管理</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <p className="text-xs text-slate-500">請求書件数</p>
          <p className="text-2xl font-bold mt-1">{invoices.length} 件</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <p className="text-xs text-slate-500">請求総額</p>
          <p className="text-2xl font-bold mt-1">¥{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <p className="text-xs text-slate-500">未入金額</p>
          <p className="text-2xl font-bold mt-1 text-rose-600">¥{unpaidAmount.toLocaleString()}</p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "請求書を編集" : "新規請求書を作成"}
        </h2>
        <ItemForm
          editing={editing}
          onSaved={() => { setEditing(null); fetchInvoices(); }}
          onCancel={() => setEditing(null)}
        />
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <h2 className="text-lg font-semibold mb-4">請求書一覧</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">読み込み中...</p>
        ) : (
          <ItemList
            invoices={invoices}
            onEdit={(inv) => setEditing(inv)}
            onDeleted={fetchInvoices}
          />
        )}
      </section>
    </div>
  );
}
