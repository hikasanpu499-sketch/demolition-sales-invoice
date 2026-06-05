import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { appConfig } from '@/lib/app-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: appConfig.appName,
  description: appConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50`}>
        <Navigation />
        <main className="md:ml-64 min-h-screen pt-14 md:pt-0 pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
