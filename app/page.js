import Link from 'next/link';
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Zap, HeartHandshake, RefreshCw, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SisforHub<span className="text-emerald-400">Pay</span>
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/donasi"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Donasi & Uji Coba
            </Link>
            <Link
              href="/donasi"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>Mulai Test</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16 sm:py-24 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ShopeePay Partner Gateway Engine • Live Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Payment Gateway QRIS Instan Tanpa Biaya Ribet
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
            Platform verifikasi mutasi QRIS ShopeePay dinamis berbasis EMVCo. Hasilkan QR code tagihan unik per-transaksi dan nikmati auto-polling verifikasi lunas hanya dalam 15 detik.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/donasi"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <HeartHandshake className="h-5 w-5" />
              <span>Coba Donasi (Min Rp 100)</span>
            </Link>
            <a
              href="#fitur"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-colors"
            >
              <span>Lihat Spesifikasi</span>
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="fitur" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dynamic EMVCo Injector</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Injeksi nominal otomatis pada Tag 54 QRIS statis dan rekalkulasi checksum CRC16-CCITT in-memory tanpa merubah merchant master.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Auto Polling 15 Detik</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pengecekan transaksi pasif dan akurat langsung ke endpoint ShopeePay Partner saat pembeli berada di halaman pembayaran.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Anti Double-Claim</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dilengkapi kode unik otomatis dan deduplikasi database SQLite untuk mencegah klaim ganda dari nominal transfer kembar.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SisforHub Pay • Powered by ShopeePay Partner (Ngecode Aje)</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/donasi" className="hover:text-emerald-400 transition-colors">Halaman Donasi</Link>
            <span>•</span>
            <span className="text-emerald-400 font-mono">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
