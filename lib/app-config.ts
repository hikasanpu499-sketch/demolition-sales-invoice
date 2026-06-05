export const appConfig = {
  appName: 'KAITAI CLOUD',
  description: '解体業向けクラウド管理システム',
  navItems: [
    { label: '顧客管理', path: '/customers', icon: 'Building2' },
    { label: '案件管理', path: '/projects', icon: 'HardHat' },
    { label: '見積書', path: '/quotations', icon: 'FileText' },
    { label: '請求書', path: '/invoices', icon: 'Receipt' },
    { label: '契約書', path: '/contracts', icon: 'FileSignature' },
  ] as { label: string; path: string; icon: string }[],
};
