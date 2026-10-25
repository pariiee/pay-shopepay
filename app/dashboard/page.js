'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, RotateCw, CheckCircle2, Clock, XCircle, 
  Wallet, TrendingUp, AlertTriangle, ShieldCheck, QrCode, Filter, LogOut
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s auto refresh
    return () => clearInterval(interval);
  }, []);

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

  const formatTime = (ts) => {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  const filteredTx = data?.transactions?.filter((tx) => {
    if (filter === 'all') return true;
    return tx.status === filter;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <QrCode className="h-4 w-4" />
            </div>
            <span className="font-bold text-base text-white">
              Dashboard <span className="text-emerald-400">Gateway</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 hover:text-rose-200 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Token Status & Merchant Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400">Merchant Terhubung:</span>
            <strong className="text-white">Ngecode Aje (ShopeePay Partner)</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Token Status:</span>
            {data?.token_status === 'valid' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Aktif & Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="h-3 w-3" />
                Perlu Update
              </span>
            )}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total Uang Masuk</span>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-400">
              Rp {formatRupiah(data?.stats?.total_volume)}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Dari {data?.stats?.total_paid || 0} transaksi lunas
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Transaksi Sukses</span>
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {data?.stats?.total_paid || 0}
            </p>
            <span className="text-[11px] text-teal-400 mt-1 block">
              Tercatat otomatis
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Menunggu Bayar</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-400">
              {data?.stats?.total_pending || 0}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Aktif dalam 15 menit
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Dibatalkan / Kadaluarsa</span>
              <XCircle className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-400">
              {data?.stats?.total_cancelled || 0}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Oleh user atau timeout
            </span>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Riwayat Transaksi & Kode Unik</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daftar transaksi mutasi yang masuk ke database gateway</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sukses
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'cancelled' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Batal
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">ID / Ref</th>
                  <th className="py-3 px-4">Donatur & Pesan</th>
                  <th className="py-3 px-4 text-right">Nominal Asli</th>
                  <th className="py-3 px-4 text-center">Kode Unik</th>
                  <th className="py-3 px-4 text-right">Total Bayar</th>
                  <th className="py-3 px-4 text-center">Metode (Issuer)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTx.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans text-xs">
                      Tidak ada data transaksi yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-300 font-bold">{tx.id}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-white block">{tx.donor_name}</span>
                        {tx.message && <span className="text-slate-400 text-[11px] italic">"{tx.message}"</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        Rp {formatRupiah(tx.base_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tx.unique_code > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            +{tx.unique_code}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        Rp {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                          {tx.issuer || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {tx.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Lunas
                          </span>
                        ) : tx.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Batal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px] font-sans">
                        {formatTime(tx.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        SisforHub Pay Gateway Dashboard &copy; 2026
      </footer>
    </div>
  );
}
