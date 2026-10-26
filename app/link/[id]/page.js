'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, QrCode, ShieldCheck, RotateCw, 
  Store, User, MessageSquare, AlertCircle, Sparkles, Copy, Check
} from 'lucide-react';

const PRESET_AMOUNTS = [1000, 5000, 10000, 20000, 50000, 100000];
const LIME = '#d8f53b';

export default function PublicStaticLinkPage({ params }) {
  const unwrappedParams = use(params);
  const linkId = unwrappedParams.id;

  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');

    const targetAmount = customAmount ? parseInt(customAmount, 10) : amount;
    if (isNaN(targetAmount) || targetAmount < 100) {
      setError('Minimal pembayaran adalah Rp 100');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: targetAmount,
          customer_name: customerName || 'Pelanggan',
          note: note ? `[Link ${linkId}] ${note}` : `[Link ${linkId}]`,
          valid_minutes: 5
        })
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal membuat QRIS pembayaran');
      }

      router.push(`/pay/${json.data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4">
      {/* Header */}
      <div className="w-full max-w-md mx-auto pt-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <button
          onClick={copyUrl}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm hover:bg-slate-900 hover:text-white transition"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          <span>{copied ? 'Link Disalin' : 'Bagikan Link'}</span>
        </button>
      </div>

      <main className="w-full max-w-md mx-auto my-6">
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          {/* Top Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-3" style={{ background: LIME, color: '#0f172a' }}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Link Pembayaran Resmi</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ngecode Aje</h1>
            <p className="text-xs text-slate-500 mt-1">
              Link statis permanen. Masukkan nominal tagihan untuk bayar via QRIS otomatis.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Nominal</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = !customAmount && amount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Rp {formatRupiah(amt)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Atau Nominal Sendiri</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="100"
                  placeholder="Contoh: 25000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Nama Anda (Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                <span>Catatan (Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Order Layanan / Barang"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" style={{ color: LIME }} />
                  <span>Membuat QRIS Dinamis 5 Menit...</span>
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" style={{ color: LIME }} />
                  <span>Bayar Sekarang via QRIS</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Link ID: #{linkId} • ShopeePay QRIS Dinamis</span>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • Static Payment Gateway Link
      </footer>
    </div>
  );
}
