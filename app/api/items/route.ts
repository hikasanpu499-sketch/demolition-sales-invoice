import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const subtotal = Number(body.subtotal || 0);
  const taxRate = Number(body.tax_rate ?? 10);
  const taxAmount = Math.floor(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  const payload = {
    invoice_number: body.invoice_number,
    customer_name: body.customer_name,
    project_name: body.project_name,
    project_address: body.project_address || null,
    demolition_type: body.demolition_type || null,
    floor_area: body.floor_area ? Number(body.floor_area) : null,
    issue_date: body.issue_date,
    due_date: body.due_date,
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total_amount: total,
    manifest_number: body.manifest_number || null,
    registered_invoice_number: body.registered_invoice_number || null,
    status: body.status || "draft",
    notes: body.notes || null
  };

  const { data, error } = await supabase.from("invoices").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}