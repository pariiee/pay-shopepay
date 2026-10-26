'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, RotateCw, CheckCircle2, Clock, XCircle, 
  Copy, Check, Search, Receipt, Filter, Download
} from 'lucide-react';

const LIME = '#d8f53b';

function StatusPill({ status }) {
  if (status === 'paid')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
        <CheckCircle2 className="h-3 w-3" style={{ color: LIME }} /> Lunas
      </span>
    );
  if (status === 'pending')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
      <XCircle className="h-3 w-3" /> Batal
    </span>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {}
  };

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

  const filtered = transactions.filter((tx) => {
    const matchStatus = filter === 'all' || tx.status === filter;
    const q = search.toLowerCase();
    const matchSearch = 
      !search ||
      tx.id.toLowerCase().includes(q) ||
      (tx.donor_name && tx.donor_name.toLowerCase().includes(q)) ||
      (tx.transaction_id && tx.transaction_id.toLowerCase().includes(q)) ||
      (tx.issuer && tx.issuer.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const totalPaid = transactions.filter((t) => t.status === 'paid').length;
  const totalVolume = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Riwayat Transaksi QRIS
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {transactions.length} total · {totalPaid} lunas (Rp {formatRupiah(totalVolume)})
            </p>
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <main className="mx-auto w-full max-w-7xl space-y-4 flex-1">
        {/* Search & Filter Bar */}
        <div className="rounded-[28px] bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, nama pelanggan, resi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
            />
          </div>

          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs w-full sm:w-auto overflow-x-auto">
            {[
              ['all', 'Semua'],
              ['paid', 'Sukses'],
              ['pending', 'Pending'],
              ['cancelled', 'Batal']
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full px-3.5 py-1.5 font-medium transition shrink-0 ${
                  filter === k ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-medium">ID Tagihan</th>
                  <th className="px-5 py-3 font-medium">Pelanggan & Pesan</th>
                  <th className="px-5 py-3 text-right font-medium">Nominal Asli</th>
                  <th className="px-5 py-3 text-center font-medium">Kode Unik</th>
                  <th className="px-5 py-3 text-right font-medium">Total Bayar</th>
                  <th className="px-5 py-3 text-center font-medium">Metode</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-sans text-xs">
                      {loading ? 'Memuat transaksi...' : 'Tidak ada transaksi yang cocok.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => copyId(t.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                          title="Salin ID"
                        >
                          <span>{t.id}</span>
                          {copied === t.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 font-sans">
                        <span className="block font-semibold text-slate-900">{t.donor_name}</span>
                        {t.message && <span className="text-xs italic text-slate-500">"{t.message}"</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600">
                        Rp {formatRupiah(t.base_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {t.unique_code > 0 ? (
                          <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: LIME }}>
                            +{t.unique_code}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        Rp {formatRupiah(t.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center font-sans">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {t.issuer || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-sans">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-500 font-sans">
                        {formatTime(t.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • Transactions Log
      </footer>
    </div>
  );
}
