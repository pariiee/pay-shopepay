'use client';

import AlpayLogo from '@/components/AlpayLogo';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Clock, RotateCw, XCircle, 
  Receipt, Copy, Check, Store, User, ShieldCheck, AlertCircle, RefreshCw, QrCode
} from 'lucide-react';

const LIME = '#d8f53b';

function StatusBadge({ status }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1 text-xs font-bold text-white shadow-sm">
        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: LIME }} />
        <span>LUNAS</span>
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-3.5 py-1 text-xs font-bold shadow-sm">
        <Clock className="h-3.5 w-3.5 text-amber-600" />
        <span>MENUNGGU PEMBAYARAN</span>
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-600 px-3.5 py-1 text-xs font-bold shadow-sm">
        <XCircle className="h-3.5 w-3.5 text-rose-500" />
        <span>DIBATALKAN</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 px-3.5 py-1 text-xs font-bold shadow-sm">
      <Clock className="h-3.5 w-3.5 text-slate-500" />
      <span>KADALUARSA</span>
    </span>
  );
}

export default function InvoicePage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 mins
  const [pollingCountdown, setPollingCountdown] = useState(15);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/payments/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Invoice tidak ditemukan');
      setInvoice(json.data);

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
    fetchInvoice();
  }, [id]);

  // Countdown timer for pending status
  useEffect(() => {
    if (!invoice || invoice.status !== 'pending') return;
    const ticker = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setInvoice((inv) => (inv ? { ...inv, status: 'expired' } : null));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [invoice]);

  // 15s auto-polling loop
  useEffect(() => {
    if (!invoice || invoice.status !== 'pending') return;

    const checkStatus = async () => {
      setChecking(true);
      try {
        const res = await fetch(`/payments/${id}/status`);
        const data = await res.json();
        if (data.success && data.paid) {
          const tx = data.data || data.donation || {};
          setInvoice((prev) => ({
            ...prev,
            status: 'paid',
            issuer: tx.issuer || prev?.issuer || 'QRIS',
            transaction_id: tx.transaction_id || prev?.transaction_id,
            paid_at: tx.paid_at || Math.floor(Date.now() / 1000)
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
  }, [invoice, id]);

  const handleCancel = async () => {
    try {
      await fetch('/api/donasi/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setInvoice((inv) => (inv ? { ...inv, status: 'cancelled' } : null));
    } catch (_) {}
  };

  const copyInvoiceUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

  const formatMinutes = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTime = (ts) => {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short'
    }) + ' WIB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold shadow-sm">
          <RotateCw className="h-4 w-4 animate-spin text-slate-900" />
          <span>Memuat invoice #{id}...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between items-center p-4">
        <div className="w-full max-w-md pt-6 flex justify-start">
          <Link href="/donate" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="w-full max-w-md rounded-[28px] bg-white p-6 sm:p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Invoice Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'ID tagihan tidak terdaftar di database.'}</p>
          <Link href="/donate" className="inline-block w-full py-3 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
            Buat Pembayaran Baru
          </Link>
        </div>
        <footer className="py-4 text-xs text-slate-400">Alpay &copy; 2026</footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 pt-2">
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <AlpayLogo className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Alpay</span>
        </Link>
        <button
          onClick={copyInvoiceUrl}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm hover:bg-slate-900 hover:text-white transition"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          <span>{copied ? 'Tersalin' : 'Bagikan Invoice'}</span>
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto my-6 flex-1 space-y-4">
        {/* INVOICE CARD */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          {/* Header Invoice */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-4 w-4 text-slate-700" />
                <span className="font-mono text-xs text-slate-400">INVOICE #{invoice.id}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{invoice.store_name}</h1>
              <span className="text-[11px] text-slate-400">{formatTime(invoice.created_at)}</span>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          {/* STATUS VIEWS */}
          {invoice.status === 'paid' ? (
            /* LUNAS VIEW */
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center mb-6">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2 shadow"
                style={{ background: LIME, color: '#0f172a' }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Pembayaran Berhasil Diverifikasi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dibayar melalui <strong>{invoice.issuer || 'QRIS'}</strong> • {formatTime(invoice.paid_at)}
              </p>
              {invoice.transaction_id && (
                <span className="inline-block mt-2 font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                  Resi: {invoice.transaction_id}
                </span>
              )}
            </div>
          ) : invoice.status === 'cancelled' ? (
            /* CANCELLED VIEW */
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center mb-6">
              <XCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
              <h2 className="text-base font-bold text-rose-800">Invoice Ini Telah Dibatalkan</h2>
              <p className="text-xs text-rose-600 mt-0.5">
                Transaksi tidak dilanjutkan dan QRIS sudah dinonaktifkan.
              </p>
            </div>
          ) : invoice.status === 'expired' ? (
            /* EXPIRED VIEW */
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center mb-6">
              <Clock className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <h2 className="text-base font-bold text-amber-800">Invoice Telah Kadaluarsa</h2>
              <p className="text-xs text-amber-600 mt-0.5">
                Batas waktu pembayaran 5 menit telah berakhir.
              </p>
            </div>
          ) : (
            /* PENDING / ACTIVE QRIS VIEW */
            <div className="text-center mb-6">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4 text-xs">
                <span className="text-slate-500">Sisa Waktu Bayar</span>
                <div className="flex items-center gap-1 font-mono font-bold text-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatMinutes(countdown)}</span>
                </div>
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-900 p-4 rounded-3xl inline-block mx-auto mb-4 shadow-xl">
                <img
                  src={invoice.qr_image}
                  alt="Dynamic QRIS"
                  className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-xl object-contain bg-white"
                />
              </div>

              {/* Polling Notice */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCw className={`h-3.5 w-3.5 text-slate-700 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Mengecek mutasi...' : `Cek otomatis (${pollingCountdown}s)`}</span>
                </div>
                <button
                  onClick={fetchInvoice}
                  disabled={checking}
                  className="font-bold text-slate-900 hover:underline disabled:opacity-50"
                >
                  Cek Sekarang
                </button>
              </div>
            </div>
          )}

          {/* RINCIAN TAGIHAN */}
          <div className="space-y-3 border-t border-slate-100 pt-5 text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
              Rincian Pembayaran
            </span>

            <div className="flex justify-between text-slate-600">
              <span>Nama Pelanggan / Donatur</span>
              <span className="font-semibold text-slate-900">{invoice.customer_name}</span>
            </div>

            {invoice.note && (
              <div className="flex justify-between text-slate-600">
                <span>Catatan</span>
                <span className="font-medium text-slate-700 italic truncate max-w-[200px]">"{invoice.note}"</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-2">
              <span>Nominal Tagihan</span>
              <span>Rp {formatRupiah(invoice.base_amount)}</span>
            </div>

            {invoice.fee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan (Fee)</span>
                <span className="font-semibold text-slate-900">+Rp {formatRupiah(invoice.fee)}</span>
              </div>
            )}

            {invoice.unique_code > 0 && (
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Kode Unik</span>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">*Verifikasi</span>
                </span>
                <span className="font-bold text-slate-900">+{invoice.unique_code}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-900 border-t border-slate-200/80 pt-3 text-sm font-bold">
              <span>Total yang Harus Dibayar</span>
              <span className="text-base text-slate-900 font-black">Rp {formatRupiah(invoice.amount)}</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            {invoice.status === 'pending' ? (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Batalkan Invoice</span>
              </button>
            ) : (
              <Link
                href="/donate"
                className="block w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition"
              >
                Buat Pembayaran Baru
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>QRIS Standar Nasional EMVCo • Alpay</span>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        Alpay &copy; 2026 • Official Invoice Tracker
      </footer>
    </div>
  );
}
