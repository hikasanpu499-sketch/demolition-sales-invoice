import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "解体業 販売請求管理",
  description: "解体業者向け法令対応 販売請求管理システム"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-800 min-h-screen">
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">🏗️ 解体業 販売請求管理</h1>
            <span className="text-xs text-slate-500">建設業法・解体工事業法・インボイス対応</span>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}