"use client";

import type { Invoice } from "@/app/invoices/page";

type Props = {
  invoices: Invoice[];
  onEdit: (inv: Invoice) => void;
  onDeleted: () => void;
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    draft: "bg-slate-200 text-slate-700",
    issued: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-rose-100 text-rose-700"
  };
  const label: Record<string, string> = {
    draft: "下書き",
    issued: "発行済",
    paid: "入金済",
    overdue: "期限超過"
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[s] || map.draft}`}>{label[s] || s}</span>;
};

export default function ItemList({ invoices, onEdit, onDeleted }: Props) {
  const del = async (id: string) => {
    if (!confirm("この請求書を削除しますか？")) return;
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
    else alert("削除に失敗しました");
  };

  if (invoices.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-12">請求書がまだ登録されていません。</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
            <th className="py-3 px-2">請求書番号</th>
            <th className="py-3 px-2">取引先 / 案件</th>
            <th className="py-3 px-2">解体種別</th>
            <th className="py-3 px-2">発行日</th>
            <th className="py-3 px-2">支払期限</th>
            <th className="py-3 px-2 text-right">合計</th>
            <th className="py-3 px-2">状態</th>
            <th className="py-3 px-2"></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 font-medium">{inv.invoice_number}</td>
              <td className="py-3 px-2">
                <div className="font-medium">{inv.customer_name}</div>
                <div className="text-xs text-slate-500">{inv.project_name}</div>
              </td>
              <td className="py-3 px-2">{inv.demolition_type || "-"}</td>
              <td className="py-3 px-2">{inv.issue_date}</td>
              <td className="py-3 px-2">{inv.due_date}</td>
              <td className="py-3 px-2 text-right font-semibold">¥{Number(inv.total_amount).toLocaleString()}</td>
              <td className="py-3 px-2">{statusBadge(inv.status)}</td>
              <td className="py-3 px-2 text-right whitespace-nowrap">
                <button onClick={() => onEdit(inv)} className="text-blue-600 hover:underline mr-3">編集</button>
                <button onClick={() => del(inv.id)} className="text-rose-600 hover:underline">削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}