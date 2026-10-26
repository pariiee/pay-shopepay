'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, QrCode, PlusCircle, Copy, Check, ExternalLink, 
  RotateCw, AlertCircle, Clock, ShieldCheck, User, MessageSquare
} from 'lucide-react';

const PRESETS = [5000, 10000, 25000, 50000, 100000, 250000];
const LIME = '#d8f53b';

export default function CreatePaymentPage() {
  const [amount, setAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [validMinutes, setValidMinutes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const targetAmount = customAmount ? parseInt(customAmount, 10) : amount;
    if (isNaN(targetAmount) || targetAmount < 100) {
      setError('Minimal nominal tagihan adalah Rp 100');
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
          note: note,
          valid_minutes: validMinutes
        })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal membuat tagihan');

      setResult(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.payment_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4">
      {/* Header */}
      <div className="w-full max-w-xl mx-auto pt-4 flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-bold text-slate-700">Buat Tagihan QRIS</span>
      </div>

      <main className="w-full max-w-xl mx-auto my-6 flex-1 space-y-4">
        {result ? (
          /* RESULT CARD */
          <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-center">
            <div 
              className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: LIME, color: '#0f172a' }}
            >
              <QrCode className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Tagihan Siap Dibagikan!</h1>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Link pembayaran instan berlaku selama {result.valid_minutes} menit.
            </p>

            <div className="bg-slate-900 p-4 rounded-3xl inline-block mx-auto mb-5 shadow-xl">
              <img
                src={result.qr_image}
                alt="QRIS"
                className="w-56 h-56 mx-auto rounded-xl object-contain bg-white"
              />
            </div>

            <div className="mb-5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Tagihan</span>
              <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                Rp {formatRupiah(result.amount)}
              </p>
              {result.unique_code > 0 && (
                <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: LIME, color: '#0f172a' }}>
                  Termasuk kode unik +{result.unique_code}
                </span>
              )}
            </div>

            {/* Link box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left mb-5">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Link Pembayaran (Share ke Pembeli):</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-800 truncate">{result.payment_url}</span>
                <button
                  onClick={copyLink}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={result.payment_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Buka Halaman Bayar</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => setResult(null)}
                className="py-3 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Buat Lagi
              </button>
            </div>
          </div>
        ) : (
          /* FORM CARD */
          <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900" style={{ color: LIME }}>
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Create Payment</h1>
                <p className="text-xs text-slate-500 mt-0.5">Generate an instant payment link + QRIS. Valid for 5 minutes.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Nominal Cepat</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((amt) => {
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
                    placeholder="Contoh: 15000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Nama Pelanggan (Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Pelanggan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                  <span>Catatan Invoice (Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Order #1024"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              {/* Validity duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Masa Berlaku Tagihan</span>
                </label>
                <select
                  value={validMinutes}
                  onChange={(e) => setValidMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition"
                >
                  <option value={5}>5 Menit (Standar Cepat)</option>
                  <option value={15}>15 Menit</option>
                  <option value={30}>30 Menit</option>
                  <option value={60}>1 Jam</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" style={{ color: LIME }} />
                    <span>Membuat Link Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" style={{ color: LIME }} />
                    <span>Generate Instant Payment Link</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • Instant Payment Generator
      </footer>
    </div>
  );
}
