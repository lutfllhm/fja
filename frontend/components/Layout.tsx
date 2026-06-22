import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  companyName?: string;
}

export default function Layout({ children, title, companyName = 'CV. Rajawali Bina Maju' }: LayoutProps) {
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      <header className="sticky top-0 z-40 bg-navy-800/90 backdrop-blur-md h-16 flex-shrink-0 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-7 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-lg bg-gold-500/20 blur-md group-hover:bg-gold-500/30 transition-colors" />
              <Image
                src="/rbm-logo.png"
                alt="RBM Logo"
                width={32}
                height={32}
                className="relative h-8 w-auto flex-shrink-0"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-white text-sm font-semibold">Form Jobs Application</span>
              <span className="text-white/40 text-[11px]">{companyName}</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {mounted && admin && (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full pl-1 pr-3.5 py-1">
                  <span className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                    {admin.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                  <span className="text-white text-xs font-medium">{admin.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-white/80 text-xs border border-white/15 rounded-md px-3 py-1.5 hover:bg-white/10 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <i className="ti ti-logout" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {title && (
          <div className="max-w-7xl mx-auto px-4 sm:px-7 pt-8">
            <h1 className="text-2xl text-text-primary mb-6">{title}</h1>
          </div>
        )}
        {children}
      </main>

      <footer className="border-t border-border-light mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 py-5">
          <p className="text-center text-text-muted text-xs">
            © 2026 {companyName}. All rights reserved.
          </p>
        </div>
      </footer>

      <a
        href="https://wa.me/6281249749282"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat kami di WhatsApp"
        className="fixed bottom-5 right-5 flex items-center gap-3 z-50 group"
      >
        <span className="relative bg-white text-text-primary text-xs font-medium px-3.5 py-2.5 rounded-xl shadow-lg whitespace-nowrap hidden sm:block group-hover:-translate-y-0.5 transition-transform">
          <span className="block font-semibold">Ada yang bisa dibantu? 👋</span>
          <span className="block text-text-muted" style={{ fontSize: 10.5 }}>Tinggal chat aja di sini</span>
          <span
            className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45"
            style={{ boxShadow: '2px -2px 2px -1px rgba(0,0,0,0.04)' }}
          />
        </span>
        <span className="relative flex-shrink-0">
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ background: '#25D366' }}
          />
          <span
            className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
            style={{ background: '#25D366' }}
          >
            <i className="ti ti-brand-whatsapp text-white" style={{ fontSize: 28 }} />
          </span>
        </span>
      </a>
    </div>
  );
}
