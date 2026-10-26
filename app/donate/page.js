'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, ArrowLeft, QrCode, CheckCircle2, Clock, AlertCircle, 
  RotateCw, Sparkles, MessageSquare, User, ShieldCheck, XCircle
} from 'lucide-react';

const PRESET_AMOUNTS = [100, 1000, 5000, 10000, 25000, 50000];
const LIME = '#d8f53b';
const card = 'rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5';

export default function DonasiPage() {
  const router = useRouter();
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active payment state
  const [paymentData, setPaymentData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [paidResult, setPaidResult] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 mins
  const [pollingCountdown, setPollingCountdown] = useState(15);

  // Recent donations feed
  const [recentList, setRecentList] = useState([]);
  const [summary, setSummary] = useState({ total_donors: 0, total_amount: 0 });

  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/donasi/list');
      const json = await res.json();
      if (json.success) {
        setRecentList(json.data.donations || []);
        setSummary(json.data.summary || { total_donors: 0, total_amount: 0 });
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!paymentData || paidResult) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentData, paidResult]);

  // 15s auto-polling
  useEffect(() => {
    if (!paymentData || paidResult) return;

    const checkStatus = async () => {
      setChecking(true);
      try {
        const res = await fetch(`/payments/${paymentData.id}/status`);
        const data = await res.json();
        if (data.success && data.paid) {
          setPaidResult(data.data || data.donation);
          fetchRecent();
          return;
        }
      } catch (err) {
        console.error('Polling error:', err);
      } finally {
        setChecking(false);
        setPollingCountdown(15);
      }
    };

    const ticker = setInterval(() => {
      setPollingCountdown((prev) => {
        if (prev <= 1) {
          checkStatus();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [paymentData, paidResult]);

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setError('');

    const targetAmount = customAmount ? parseInt(customAmount, 10) : amount;
    if (isNaN(targetAmount) || targetAmount < 100) {
      setError('Minimal donasi adalah Rp 100');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/donasi/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: targetAmount,
          donor_name: donorName,
          message: message
        })
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Gagal membuat QRIS donasi');
      }

      router.push(`/payin/${json.data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const manualCheck = async () => {
    if (!paymentData || checking) return;
    setChecking(true);
    try {
      const res = await fetch(`/payments/${paymentData.id}/status`);
      const data = await res.json();
      if (data.success && data.paid) {
        setPaidResult(data.data || data.donation);
        fetchRecent();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const resetForm = () => {
    setPaymentData(null);
    setPaidResult(null);
    setCustomAmount('');
    setMessage('');
  };

  const handleCancel = async () => {
    if (!paymentData) return;
    try {
      await fetch('/api/donasi/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentData.id })
      });
    } catch (_) {}
    resetForm();
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

  const formatMinutes = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Link 
          href="/" 
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600">Gateway Standby</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-4 sm:py-6 flex-1">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm mb-3">
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>Sandbox & Donasi Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Uji Pembayaran QRIS ShopeePay
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Mulai <strong className="text-slate-900 font-bold">Rp 100</strong> via e-wallet atau m-banking manapun
          </p>
        </div>

        {/* Dynamic Card */}
        <div className={card}>
          {/* STEP 3: LUNAS / SUCCESS */}
          {paidResult ? (
            <div className="text-center py-4">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{ background: LIME, color: '#0f172a' }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status Pembayaran</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5 mb-1">Alhamdulillah! Lunas</h2>
              <p className="text-xs text-slate-500 mb-6">
                Pembayaran otomatis terverifikasi lunas dari mutasi ShopeePay.
              </p>

              <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs space-y-2.5 mb-6 border border-slate-100">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Donatur</span>
                  <span className="font-semibold text-slate-900">{paidResult.donor_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Nominal Lunas</span>
                  <span className="font-bold text-slate-900 text-sm">Rp {formatRupiah(paidResult.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Metode (Issuer)</span>
                  <span className="font-bold text-emerald-600">{paidResult.issuer || 'QRIS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Transaksi</span>
                  <span className="font-mono text-slate-600">{paidResult.transaction_id}</span>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Kirim Donasi / Uji Coba Lagi
              </button>
            </div>
          ) : paymentData ? (
            /* STEP 2: ACTIVE QRIS PAYMENT */
            <div className="text-center py-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">Atas Nama</span>
                  <p className="font-bold text-slate-900 text-xs">{paymentData.donor_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Batas Waktu</span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatMinutes(countdown)}</span>
                  </div>
                </div>
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-900 p-4 rounded-3xl inline-block mx-auto mb-4 shadow-xl">
                <img
                  src={paymentData.qr_image}
                  alt="Dynamic QRIS"
                  className="w-60 h-60 sm:w-64 sm:h-64 mx-auto rounded-xl object-contain bg-white"
                />
              </div>

              {/* Amount Display */}
              <div className="mb-5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Tagihan Pas</span>
                <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  Rp {formatRupiah(paymentData.amount)}
                </p>
                {paymentData.unique_code > 0 && (
                  <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: LIME, color: '#0f172a' }}>
                    Termasuk kode unik +{paymentData.unique_code}
                  </span>
                )}
              </div>

              {/* Auto-polling badge */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 mb-4 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCw className={`h-3.5 w-3.5 text-slate-700 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Mengecek mutasi...' : `Cek otomatis (${pollingCountdown}s)`}</span>
                </div>
                <button
                  onClick={manualCheck}
                  disabled={checking}
                  className="font-bold text-slate-900 hover:underline disabled:opacity-50"
                >
                  Cek Sekarang
                </button>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Batalkan Pembayaran</span>
              </button>
            </div>
          ) : (
            /* STEP 1: DONATION FORM */
            <form onSubmit={handleCreateDonation} className="space-y-4">
              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Donor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Nama Donatur</span>
                </label>
                <input
                  type="text"
                  placeholder="Hamba Allah (Opsional)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Nominal Cepat (Min Rp 100)
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atau Ketik Nominal Sendiri
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="100"
                    placeholder="Contoh: 1500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                  <span>Pesan / Doa (Opsional)</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="Semoga lancar dan berkah..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" style={{ color: LIME }} />
                    <span>Membuat QRIS Dinamis...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" style={{ color: LIME }} />
                    <span>Lanjut Bayar QRIS</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>QRIS Standard Nasional EMVCo • Ngecode Aje</span>
              </div>
            </form>
          )}
        </div>

        {/* FEED DONATUR TERBARU */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-slate-900" />
              <span>Donasi Berhasil Terbaru</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Total: <strong className="text-slate-900">{summary.total_donors}</strong> donasi
            </span>
          </div>

          <div className="rounded-[28px] bg-white p-4 shadow-sm border border-slate-200/50">
            {recentList.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                Belum ada data donasi lunas.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentList.map((item) => (
                  <li key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.donor_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {item.issuer || 'QRIS'}
                        </span>
                      </div>
                      {item.message && (
                        <p className="text-slate-500 text-[11px] mt-0.5 italic truncate">"{item.message}"</p>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      Rp {formatRupiah(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026
      </footer>
    </div>
  );
}
