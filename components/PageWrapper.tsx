'use client';

import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/' || pathname.startsWith('/auth');

  return (
    <main
      className={
        isPublic
          ? 'min-h-screen'
          : 'md:ml-64 min-h-screen pt-14 md:pt-0 pb-20 md:pb-0'
      }
    >
      {children}
    </main>
  );
}
