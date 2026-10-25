'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, ArrowLeft, QrCode, CheckCircle2, Clock, AlertCircle, 
  RotateCw, Sparkles, MessageSquare, User, ShieldCheck, ChevronRight, XCircle
} from 'lucide-react';

const PRESET_AMOUNTS = [100, 1000, 5000, 10000, 25000, 50000];

export default function DonasiPage() {
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

  const pollTimerRef = useRef(null);

  // Fetch recent donations list
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

  // Countdown timer for active payment
  useEffect(() => {
    if (!paymentData || paidResult) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentData, paidResult]);

  // 15s auto-polling loop
  useEffect(() => {
    if (!paymentData || paidResult) return;

    const checkStatus = async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/donasi/status?id=${paymentData.id}`);
        const data = await res.json();
        if (data.success && data.paid) {
          setPaidResult(data.donation);
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

      setPaymentData(json.data);
      setCountdown(900);
      setPollingCountdown(15);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const manualCheck = async () => {
    if (!paymentData || checking) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/donasi/status?id=${paymentData.id}`);
      const data = await res.json();
      if (data.success && data.paid) {
        setPaidResult(data.donation);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400">Gateway Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
        {/* Banner Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Heart className="h-3.5 w-3.5 fill-emerald-400" />
            <span>Donasi & Sandbox Uji Coba Transaksi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Testing Pembayaran ShopeePay QRIS
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Bisa donasi atau sekadar tes gateway mulai <strong className="text-emerald-400">Rp 100</strong> via e-wallet atau m-banking manapun.
          </p>
        </div>

        {/* Dynamic Card Container */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg mx-auto backdrop-blur">
          {/* STEP 3: LUNAS / SUCCESS SCREEN */}
          {paidResult ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 mb-5 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Status Transaksi</span>
              <h2 className="text-2xl font-black text-white mt-1 mb-2">Alhamdulillah! Lunas</h2>
              <p className="text-xs text-slate-400 mb-6">
                Pembayaran berhasil diverifikasi secara otomatis oleh sistem gateway ShopeePay.
              </p>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2.5 mb-6">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Donatur</span>
                  <span className="font-semibold text-white">{paidResult.donor_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Nominal Lunas</span>
                  <span className="font-bold text-emerald-400 text-sm">Rp {formatRupiah(paidResult.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Metode Bayar (Issuer)</span>
                  <span className="font-semibold text-teal-300">{paidResult.issuer || 'ShopeePay/QRIS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ID Transaksi Shopee</span>
                  <span className="font-mono text-slate-300">{paidResult.transaction_id}</span>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
              >
                Kirim Donasi / Uji Coba Lagi
              </button>
            </div>
          ) : paymentData ? (
            /* STEP 2: ACTIVE QRIS PAYMENT SCREEN */
            <div className="text-center py-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="text-left">
                  <span className="text-xs text-slate-400">Atas Nama</span>
                  <p className="font-bold text-white text-sm">{paymentData.donor_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Sisa Waktu</span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatMinutes(countdown)}</span>
                  </div>
                </div>
              </div>

              {/* QR Image Container */}
              <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mx-auto mb-4 border-4 border-slate-700">
                <img
                  src={paymentData.qr_image}
                  alt="Dynamic QRIS"
                  className="w-64 h-64 sm:w-72 sm:h-72 mx-auto object-contain"
                />
              </div>

              {/* Amount Display */}
              <div className="mb-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Tagihan Pas</span>
                <p className="text-3xl font-black text-emerald-400 tracking-tight mt-0.5">
                  Rp {formatRupiah(paymentData.amount)}
                </p>
                {paymentData.unique_code > 0 && (
                  <p className="text-[11px] text-amber-300/90 mt-1">
                    *Termasuk kode unik <strong>+{paymentData.unique_code}</strong> untuk verifikasi instan
                  </p>
                )}
              </div>

              {/* Polling telemetry notice */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-5 text-xs text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCw className={`h-4 w-4 text-emerald-400 ${checking ? 'animate-spin' : ''}`} />
                  <span>
                    {checking ? 'Sedang mengecek Shopee...' : `Auto-cek status (${pollingCountdown}s)`}
                  </span>
                </div>
                <button
                  onClick={manualCheck}
                  disabled={checking}
                  className="text-xs font-semibold text-emerald-400 hover:underline disabled:opacity-50"
                >
                  Cek Sekarang
                </button>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span>Batalkan Pembayaran & Ganti Nominal</span>
              </button>
            </div>
          ) : (
            /* STEP 1: DONATION FORM */
            <form onSubmit={handleCreateDonation} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Donor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Nama Donatur / Penguji</span>
                </label>
                <input
                  type="text"
                  placeholder="Hamba Allah (Opsional)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
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
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Atau Masukkan Nominal Sendiri
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="100"
                    placeholder="Contoh: 1500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                  <span>Pesan / Doa (Opsional)</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="Semoga lancar dan berkah selalu..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Membuat QRIS Dinamis...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>Lanjut Bayar QRIS</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>QRIS Standard Nasional EMVCo • Merchant: Ngecode Aje</span>
              </div>
            </form>
          )}
        </div>

        {/* FEED DONATUR TERBARU */}
        <section className="mt-14 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Donasi Berhasil Terbaru</span>
            </h3>
            <span className="text-xs text-slate-400">
              Total: <strong className="text-emerald-400">{summary.total_donors}</strong> donasi (Rp {formatRupiah(summary.total_amount)})
            </span>
          </div>

          <div className="space-y-2.5">
            {recentList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-500">
                Belum ada data donasi lunas. Jadilah yang pertama berdonasi!
              </div>
            ) : (
              recentList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{item.donor_name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.issuer || 'QRIS'}
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-slate-400 italic">"{item.message}"</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-400 text-sm">
                      Rp {formatRupiah(item.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        SisforHub Pay &copy; 2026 • Port 3010
      </footer>
    </div>
  );
}
