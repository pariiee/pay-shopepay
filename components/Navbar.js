'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, QrCode, ShieldCheck, AlertTriangle, LogOut, RotateCw,
  LayoutDashboard, Receipt, KeyRound, Settings, BookOpen 
} from 'lucide-react';

const LIME = '#d8f53b';

export default function Navbar({ active = '', storeName = 'Ngecode Aje', tokenOk = true, onRefresh, loading = false }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    window.location.href = '/macuk';
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
    { href: '/riwayat', label: 'Riwayat', key: 'riwayat' },
    { href: '/settings', label: 'Settings', key: 'settings' },
    { href: '/docs', label: 'Docs', key: 'docs' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-[#e9edf2]/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-2 sm:py-2.5' 
          : 'bg-transparent py-4 sm:py-5'
      }`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 transition hover:opacity-90 shrink-0">
            <div className={`flex items-center justify-center bg-slate-900 shadow-md shadow-slate-900/10 transition-all duration-300 ${
              scrolled ? 'h-8 w-8 rounded-xl' : 'h-10 w-10 rounded-2xl'
            }`} style={{ color: LIME }}>
              <QrCode className={`transition-all duration-300 ${scrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>
            <span className={`font-extrabold tracking-tight text-slate-900 transition-all duration-300 ${
              scrolled ? 'text-lg' : 'text-xl'
            }`}>Alpay</span>
          </Link>

        {/* Pill Navigation Bar */}
        <nav className="hidden items-center gap-1 rounded-full bg-white p-1 text-xs font-semibold md:flex shadow-sm">
          {navItems.map((item) => {
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  isActive 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-white p-2.5 text-xs sm:py-2 sm:pl-3 sm:pr-4 shadow-sm">
            {tokenOk ? (
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            )}
            <span className="hidden font-semibold text-slate-900 sm:inline">{storeName}</span>
            <span className={`hidden sm:inline ${tokenOk ? 'text-emerald-600' : 'text-rose-500'}`}>
              {tokenOk ? 'Token valid' : 'Token perlu update'}
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={handleLogout}
            aria-label="Keluar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-rose-600 hover:text-white"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        </div>
      </header>

      {/* Floating Pill Nav Bar for Mobile */}
      <nav
        aria-label="Menu navigasi mobile"
        className="fixed inset-x-0 z-50 flex justify-center px-4 md:hidden pointer-events-none"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 pointer-events-auto">
          <Link
            href="/dashboard"
            className={`flex min-w-[54px] flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition ${
              active === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" style={active === 'dashboard' ? { color: LIME } : undefined} />
            <span>Dash</span>
          </Link>
          <Link
            href="/riwayat"
            className={`flex min-w-[62px] flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
              active === 'riwayat' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Receipt className="h-4 w-4" style={active === 'riwayat' ? { color: LIME } : undefined} />
            <span>Riwayat</span>
          </Link>
          <Link
            href="/settings"
            className={`flex min-w-[62px] flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
              active === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" style={active === 'settings' ? { color: LIME } : undefined} />
            <span>Settings</span>
          </Link>
          <Link
            href="/docs"
            className={`flex min-w-[62px] flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
              active === 'docs' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" style={active === 'docs' ? { color: LIME } : undefined} />
            <span>Docs</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
