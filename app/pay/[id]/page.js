'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Clock, RotateCw, XCircle, 
  ShieldCheck, AlertCircle, Store, User, QrCode
} from 'lucide-react';

const LIME = '#d8f53b';

export default function PaymentCheckoutPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 mins
  const [pollingCountdown, setPollingCountdown] = useState(15);

  const fetchPayment = async () => {
    try {
      const res = await fetch(`/api/payments/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Tagihan tidak ditemukan');
      setPayment(json.data);

      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, json.data.expires_at - now);
      setCountdown(remaining);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!payment || payment.status !== 'pending') return;
    const ticker = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPayment((p) => (p ? { ...p, status: 'expired' } : null));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [payment]);

  // 15s auto-polling
  useEffect(() => {
    if (!payment || payment.status !== 'pending') return;

    const checkStatus = async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/donasi/status?id=${id}`);
        const data = await res.json();
        if (data.success && data.paid) {
          setPayment((prev) => ({
            ...prev,
            status: 'paid',
            issuer: data.donation.issuer,
            transaction_id: data.donation.transaction_id,
            paid_at: data.donation.paid_at
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
        setPollingCountdown(15);
      }
    };

    const pollInterval = setInterval(() => {
      setPollingCountdown((prev) => {
        if (prev <= 1) {
          checkStatus();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [payment, id]);

  const handleCancel = async () => {
    try {
      await fetch('/api/donasi/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setPayment((p) => (p ? { ...p, status: 'cancelled' } : null));
    } catch (_) {}
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

  const formatMinutes = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold shadow-sm">
          <RotateCw className="h-4 w-4 animate-spin text-slate-900" />
          <span>Memuat tagihan QRIS...</span>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between items-center p-4">
        <div className="w-full max-w-sm pt-6 flex justify-start">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="w-full max-w-sm rounded-[28px] bg-white p-6 sm:p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Tagihan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'Link pembayaran mungkin sudah kadaluarsa atau salah.'}</p>
          <Link href="/" className="inline-block w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
            Kembali ke Beranda
          </Link>
        </div>
        <footer className="py-4 text-xs text-slate-400">SisforHub Pay &copy; 2026</footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4">
      {/* Header */}
      <div className="w-full max-w-md mx-auto pt-4 flex items-center justify-between">
        <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm">
          <Store className="h-3.5 w-3.5 text-slate-700" />
          <span>{payment.store_name}</span>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto my-6">
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-center">
          {payment.status === 'paid' ? (
            /* PAID SCREEN */
            <div className="py-4">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{ background: LIME, color: '#0f172a' }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status Pembayaran</span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5 mb-1">Pembayaran Lunas!</h1>
              <p className="text-xs text-slate-500 mb-6">Terverifikasi otomatis oleh sistem ShopeePay Partner.</p>

              <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs space-y-2.5 mb-6 border border-slate-100 font-sans">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Pelanggan</span>
                  <span className="font-semibold text-slate-900">{payment.customer_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Total Dibayar</span>
                  <span className="font-bold text-slate-900 text-sm">Rp {formatRupiah(payment.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Metode (Issuer)</span>
                  <span className="font-bold text-emerald-600">{payment.issuer || 'QRIS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Transaksi</span>
                  <span className="font-mono text-slate-600">{payment.transaction_id || '-'}</span>
                </div>
              </div>

              <Link
                href="/"
                className="block w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Kembali ke Beranda
              </Link>
            </div>
          ) : payment.status === 'cancelled' ? (
            /* CANCELLED SCREEN */
            <div className="py-6">
              <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pembayaran Dibatalkan</h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">Tagihan ini sudah dibatalkan dan tidak lagi menerima pembayaran.</p>
              <Link href="/" className="block w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
                Kembali
              </Link>
            </div>
          ) : payment.status === 'expired' ? (
            /* EXPIRED SCREEN */
            <div className="py-6">
              <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Waktu Pembayaran Habis</h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">QRIS dinamis berlaku selama 5 menit. Silakan buat tagihan baru.</p>
              <Link href="/pay" className="block w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
                Buat Tagihan Baru
              </Link>
            </div>
          ) : (
            /* ACTIVE PAYMENT */
            <div className="py-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block">Pelanggan</span>
                  <p className="font-bold text-slate-900 text-xs">{payment.customer_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Sisa Waktu (5 Mnt)</span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatMinutes(countdown)}</span>
                  </div>
                </div>
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-900 p-4 rounded-3xl inline-block mx-auto mb-4 shadow-xl">
                <img
                  src={payment.qr_image}
                  alt="Dynamic QRIS"
                  className="w-60 h-60 sm:w-64 sm:h-64 mx-auto rounded-xl object-contain bg-white"
                />
              </div>

              {/* Amount Display */}
              <div className="mb-5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Tagihan Pas</span>
                <p className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  Rp {formatRupiah(payment.amount)}
                </p>
                {payment.unique_code > 0 && (
                  <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: LIME, color: '#0f172a' }}>
                    Termasuk kode unik +{payment.unique_code}
                  </span>
                )}
                {payment.note && (
                  <p className="text-xs text-slate-500 mt-2 italic">"{payment.note}"</p>
                )}
              </div>

              {/* Polling Notice */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 mb-4 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCw className={`h-3.5 w-3.5 text-slate-700 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Mengecek mutasi...' : `Cek otomatis (${pollingCountdown}s)`}</span>
                </div>
                <button
                  onClick={fetchPayment}
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
          )}
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • Powered by ShopeePay Partner
      </footer>
    </div>
  );
}
