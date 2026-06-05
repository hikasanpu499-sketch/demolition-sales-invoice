import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/AuthGuard';
import PageWrapper from '@/components/PageWrapper';
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
        <AuthGuard>
          <Navigation />
          <PageWrapper>{children}</PageWrapper>
        </AuthGuard>
      </body>
    </html>
  );
}
