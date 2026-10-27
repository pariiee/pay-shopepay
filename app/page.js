import Link from 'next/link';
import { 
  ArrowRight, QrCode, Zap, RefreshCw, Smartphone, 
  HeartHandshake, CheckCircle2, Store
} from 'lucide-react';

const LIME = '#d8f53b';
const card = 'rounded-[28px] bg-white p-6 sm:p-7 transition-all hover:shadow-xl hover:shadow-slate-900/5 border border-slate-100 flex flex-col justify-between';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      {/* Header - No Dashboard Link */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 shadow-md shadow-slate-900/10" style={{ color: LIME }}>
            <QrCode className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Alpay</span>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/donate"
            className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition hover:opacity-95 shadow-sm"
            style={{ background: LIME, color: '#0f172a' }}
          >
            <span>Coba Bayar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 flex-1">
        {/* Hero Card - No Dashboard Button */}
        <div className="rounded-[36px] bg-slate-900 p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 px-3.5 py-1.5 text-xs font-semibold mb-6 border border-slate-700/50">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: LIME }} />
              <span className="text-slate-200">Sistem QRIS Otomatis & Cepat</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.18]">
              Terima Pembayaran QRIS Cepat, Otomatis & Bebas Ribet
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Buat tagihan QRIS dengan nominal yang otomatis pas. Pembeli tinggal scan dari aplikasi perbankan atau e-wallet mana saja, pembayaran langsung terdeteksi lunas seketika tanpa perlu cek bukti transfer manual.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.02] shadow-lg shadow-lime-300/10"
                style={{ background: LIME }}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>Coba Bayar QRIS Sekarang</span>
              </Link>
            </div>
          </div>

          {/* Decorative Background Shapes */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: LIME, filter: 'blur(60px)' }} />
        </div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={card}>
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 mb-5" style={{ color: LIME }}>
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Nominal Otomatis Terkunci</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Pelanggan tidak perlu mengetik jumlah uang manual. Nominal tagihan sudah langsung ada di dalam QR, meminimalisir salah ketik atau kurang bayar.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Pasti pas sampai ke rupiah</span>
            </div>
          </div>

          <div className={card}>
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl mb-5 text-slate-900" style={{ background: LIME }}>
                <RefreshCw className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Deteksi Lunas Seketika</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Sistem mendeteksi transaksi secara real-time. Begitu pembeli berhasil bayar di HP mereka, layar invoice seketika berubah menjadi Lunas tanpa perlu refresh.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Verifikasi otomatis dalam detik</span>
            </div>
          </div>

          <div className={card}>
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 mb-5">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Bisa dari Semua Bank & E-Wallet</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Mendukung seluruh aplikasi yang memiliki fitur scan QRIS: BCA Mobile, Livin Mandiri, BRImo, BNI, Dana, GoPay, OVO, ShopeePay, LinkAja, dan lainnya.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Standar nasional QRIS resmi</span>
            </div>
          </div>
        </div>

        {/* Showcase Banner */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cocok untuk Berbagai Kebutuhan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mulai dari pembayaran kasir toko, donasi online, tagihan invoice, hingga otomatisasi bisnis.
              </p>
            </div>
          </div>
          <Link
            href="/donate"
            className="w-full sm:w-auto text-center rounded-full bg-slate-900 px-6 py-3 text-xs font-bold text-white transition hover:bg-slate-800 shrink-0 shadow-sm"
          >
            Mulai Coba Sekarang
          </Link>
        </div>
      </main>

      {/* Footer - No Dashboard Link */}
      <footer className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-300/60">
        <p>© 2026 Alpay • Solusi Pembayaran QRIS Praktis</p>
        <div className="flex items-center gap-3">
          <Link href="/donate" className="hover:text-slate-900 transition">Coba Bayar</Link>
        </div>
      </footer>
    </div>
  );
}
