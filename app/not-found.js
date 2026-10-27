'use client';

import AlpayLogo from '@/components/AlpayLogo';

import Link from 'next/link';
import { ArrowLeft, Home, FileQuestion, QrCode } from 'lucide-react';

const LIME = '#d8f53b';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-2 py-4">
        <Link href="/" className="flex items-center gap-2">
          <AlpayLogo className="h-10 w-10 shadow-md shadow-slate-900/10" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Alpay</span>
        </Link>
      </header>

      {/* Main 404 Card */}
      <main className="mx-auto w-full max-w-md my-auto px-4 py-8">
        <div className="rounded-[28px] bg-white p-7 sm:p-9 text-center shadow-xl shadow-slate-900/5 border border-slate-100 space-y-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white mx-auto shadow-md" style={{ color: LIME }}>
            <FileQuestion className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700">
              ERROR 404
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Halaman Tidak Ditemukan</h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Halaman yang kamu tuju tidak tersedia, URL mungkin salah ketik atau telah dipindahkan.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              href="/donate"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white py-3 text-xs font-bold transition shadow-sm"
            >
              <Home className="h-4 w-4" style={{ color: LIME }} />
              <span>Coba Pembayaran</span>
            </Link>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 text-xs font-bold transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        Alpay &copy; 2026 • 404 Not Found
      </footer>
    </div>
  );
}
