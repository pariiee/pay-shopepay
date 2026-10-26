import Link from 'next/link';
import { 
  ArrowRight, QrCode, Zap, RefreshCw, ShieldCheck, 
  HeartHandshake, CheckCircle2, Lock, ArrowUpRight
} from 'lucide-react';

const LIME = '#d8f53b';
const card = 'rounded-[28px] bg-white p-6 transition-all hover:shadow-xl hover:shadow-slate-900/5';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 shadow-md shadow-slate-900/10" style={{ color: LIME }}>
            <QrCode className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">SisforHub Pay</span>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/donasi"
            className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition hover:opacity-95 shadow-sm"
            style={{ background: LIME, color: '#0f172a' }}
          >
            <span>Uji Transaksi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 flex-1">
        {/* Hero Card */}
        <div className="rounded-[36px] bg-slate-900 p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 px-3.5 py-1.5 text-xs font-semibold mb-6 border border-slate-700/50">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: LIME }} />
              <span className="text-slate-200">Gateway ShopeePay Partner • Live Active</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Payment Gateway QRIS Instan Tanpa Biaya Ribet
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Platform mutasi QRIS ShopeePay dinamis berbasis EMVCo. Hasilkan QR code tagihan unik per-transaksi dan nikmati auto-polling verifikasi lunas hanya dalam 15 detik.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/donasi"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.02] shadow-lg shadow-lime-300/10"
                style={{ background: LIME }}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>Coba Donasi (Min Rp 100)</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white px-5 py-3.5 text-sm font-semibold transition"
              >
                <span>Buka Dashboard</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Decorative Background Shapes */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: LIME, filter: 'blur(60px)' }} />
        </div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={card}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 mb-5" style={{ color: LIME }}>
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Dynamic EMVCo Injector</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Injeksi nominal otomatis pada Tag 54 QRIS statis dan rekalkulasi checksum CRC16-CCITT in-memory tanpa merubah merchant master.
            </p>
          </div>

          <div className={card}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl mb-5 text-slate-900" style={{ background: LIME }}>
              <RefreshCw className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Auto Polling 15 Detik</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Pengecekan transaksi pasif dan akurat langsung ke endpoint ShopeePay Partner saat pembeli berada di halaman pembayaran.
            </p>
          </div>

          <div className={card}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 mb-5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Anti Double-Claim</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Dilengkapi kode unik otomatis dan deduplikasi database SQLite untuk mencegah klaim ganda dari nominal transfer kembar.
            </p>
          </div>
        </div>

        {/* Showcase Banner */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Terhubung ke ShopeePay Partner</h3>
              <p className="text-xs text-slate-500 mt-0.5">Mendukung pembayaran dari semua bank dan e-wallet (GoPay, OVO, DANA, BCA, BRI, dll).</p>
            </div>
          </div>
          <Link
            href="/donasi"
            className="w-full sm:w-auto text-center rounded-full bg-slate-900 px-6 py-3 text-xs font-bold text-white transition hover:bg-slate-800 shrink-0"
          >
            Mulai Uji Coba Sekarang
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-300/60">
        <p>© 2026 SisforHub Pay • Merchant: Ngecode Aje</p>
        <div className="flex items-center gap-3">
          <Link href="/donasi" className="hover:text-slate-900 transition">Donasi</Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:text-slate-900 transition">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
