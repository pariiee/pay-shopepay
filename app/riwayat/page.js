'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Check, Copy, Clock, CheckCircle2, 
  XCircle, RotateCw, Receipt, ShieldCheck, Eye, ExternalLink, X
} from 'lucide-react';
import Navbar from '@/components/Navbar';

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
  if (status === 'expired')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
        <Clock className="h-3 w-3 text-slate-400" /> Expired
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
      <XCircle className="h-3 w-3" /> Batal
    </span>
  );
}

export default function RiwayatPage() {
  const [activeTab, setActiveTab] = useState('qris'); // 'qris' | 'webhook'
  const [transactions, setTransactions] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, logRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/webhook/logs')
      ]);

      if (txRes.status === 401 || logRes.status === 401) {
        window.location.href = '/login';
        return;
      }

      const txJson = await txRes.json();
      if (txJson.success) setTransactions(txJson.data.transactions || []);

      const logJson = await logRes.json();
      if (logJson.success) setWebhookLogs(logJson.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Read ?tab= query parameter if present
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'webhook') setActiveTab('webhook');
    fetchData();
  }, []);

  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {}
  };

  const rupiah = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

  const fmtTime = (ts) => {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTx = transactions.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.id?.toLowerCase().includes(q) ||
      t.donor_name?.toLowerCase().includes(q) ||
      t.message?.toLowerCase().includes(q) ||
      t.issuer?.toLowerCase().includes(q)
    );
  });

  const filteredLogs = webhookLogs.filter((l) => {
    if (filter === 'success' && (l.response_code < 200 || l.response_code >= 300)) return false;
    if (filter === 'failed' && (l.response_code >= 200 && l.response_code < 300)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.url?.toLowerCase().includes(q) ||
      l.event?.toLowerCase().includes(q) ||
      String(l.response_code).includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      <Navbar active="riwayat" onRefresh={fetchData} loading={loading} />

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-16 sm:px-6 flex-1">
        <div className="px-1 pt-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Riwayat Gateway</h1>
          <p className="mt-1 text-sm text-slate-500">Mutasi transaksi QRIS dan log pengiriman webhook callback.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => { setActiveTab('qris'); setFilter('all'); setSearch(''); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition ${
              activeTab === 'qris'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" style={{ color: activeTab === 'qris' ? LIME : undefined }} />
            <span>Transaksi QRIS ({transactions.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('webhook'); setFilter('all'); setSearch(''); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition ${
              activeTab === 'webhook'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: activeTab === 'webhook' ? LIME : undefined }} />
            <span>Webhook Logs ({webhookLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: TRANSAKSI QRIS */}
        {activeTab === 'qris' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID, nama donatur, pesan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-slate-200 text-xs focus:outline-none focus:border-slate-900 shadow-sm transition"
                />
              </div>

              <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs overflow-x-auto">
                {[
                  ['all', 'Semua'],
                  ['paid', 'Sukses'],
                  ['pending', 'Pending'],
                  ['expired', 'Expired'],
                  ['cancelled', 'Batal']
                ].map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`rounded-full px-3.5 py-1.5 font-medium transition shrink-0 ${
                      filter === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
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
                      <th className="px-5 py-3 font-semibold">ID</th>
                      <th className="px-5 py-3 font-semibold">Donatur dan pesan</th>
                      <th className="px-5 py-3 text-right font-semibold">Total bayar</th>
                      <th className="px-5 py-3 text-center font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Waktu</th>
                      <th className="px-5 py-3 text-center font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTx.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                          Tidak ada transaksi yang cocok dengan pencarian / filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredTx.map((t) => (
                        <tr key={t.id} className="transition hover:bg-slate-50/80">
                          <td className="px-5 py-3.5 font-mono text-xs">
                            <button
                              onClick={() => copyText(t.id, t.id)}
                              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
                              title="Salin ID"
                            >
                              <span>{t.id}</span>
                              {copied === t.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="block font-semibold text-slate-900">{t.donor_name || 'Hamba Allah'}</span>
                            {t.message && <span className="text-xs italic text-slate-500 line-clamp-1">&quot;{t.message}&quot;</span>}
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                            Rp {rupiah(t.amount)}
                            {t.unique_code > 0 && (
                              <span className="block text-[10px] font-normal text-slate-400">
                                unik +{t.unique_code}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <StatusPill status={t.status} />
                          </td>
                          <td className="px-5 py-3.5 text-right text-xs text-slate-500 whitespace-nowrap">
                            {fmtTime(t.created_at)}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => setSelectedTx(t)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition"
                              title="Lihat Detail Transaksi"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Detail</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEBHOOK LOGS */}
        {activeTab === 'webhook' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari URL, status code, event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-slate-200 text-xs focus:outline-none focus:border-slate-900 shadow-sm transition"
                />
              </div>

              <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs">
                {[
                  ['all', 'Semua'],
                  ['success', 'Sukses (2xx)'],
                  ['failed', 'Gagal (4xx/5xx)']
                ].map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                      filter === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs Table Card */}
            <div className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Event</th>
                      <th className="px-5 py-3 font-semibold">Target URL</th>
                      <th className="px-5 py-3 text-center font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Latency</th>
                      <th className="px-5 py-3 text-right font-semibold">Waktu</th>
                      <th className="px-5 py-3 text-center font-semibold">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                          Tidak ada log webhook yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((l) => {
                        const isSuccess = l.response_code >= 200 && l.response_code < 300;
                        return (
                          <tr key={l.id} className="transition hover:bg-slate-50/80">
                            <td className="px-5 py-3.5">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {l.event}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600 max-w-xs truncate" title={l.url}>
                              {l.url}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                                isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {l.response_code || 500}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-500">
                              {l.latency_ms || 0} ms
                            </td>
                            <td className="px-5 py-3.5 text-right text-xs text-slate-500 whitespace-nowrap">
                              {fmtTime(l.created_at)}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => setSelectedLog(l)}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Lihat</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETAIL TRANSAKSI */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-900" />
                  <h3 className="font-bold text-base text-slate-900">Rincian Lengkap Transaksi</h3>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400">Total Pembayaran</span>
                  <div className="text-xl font-extrabold text-slate-900">Rp {rupiah(selectedTx.amount)}</div>
                </div>
                <StatusPill status={selectedTx.status} />
              </div>

              {/* Data Table */}
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">ID Transaksi</span>
                  <button
                    onClick={() => copyText(selectedTx.id, 'modal_id')}
                    className="font-mono font-bold text-slate-900 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>{selectedTx.id}</span>
                    {copied === 'modal_id' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
                  </button>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Nama Pelanggan</span>
                  <span className="font-semibold text-slate-900">{selectedTx.donor_name || '-'}</span>
                </div>
                {selectedTx.message && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Catatan / Pesan</span>
                    <span className="font-medium text-slate-800 text-right italic">{selectedTx.message}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Nominal Pokok</span>
                  <span className="text-slate-900">Rp {rupiah(selectedTx.base_amount)}</span>
                </div>
                {selectedTx.fee > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Biaya Layanan (Fee)</span>
                    <span className="font-semibold text-slate-900">+Rp {rupiah(selectedTx.fee)}</span>
                  </div>
                )}
                {selectedTx.unique_code > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Kode Unik Anti-Kembar</span>
                    <span className="font-semibold text-emerald-600">+{selectedTx.unique_code}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Metode / Issuer</span>
                  <span className="font-semibold text-slate-900">{selectedTx.issuer || 'QRIS ShopeePay'}</span>
                </div>
                {selectedTx.transaction_id && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Shopee Mutasi ID</span>
                    <span className="font-mono text-slate-700">{selectedTx.transaction_id}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Waktu Dibuat</span>
                  <span className="text-slate-700">{fmtTime(selectedTx.created_at)} WIB</span>
                </div>
                {selectedTx.paid_at && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Waktu Lunas</span>
                    <span className="font-bold text-emerald-600">{fmtTime(selectedTx.paid_at)} WIB</span>
                  </div>
                )}
              </div>

              {/* Invoice Link Action */}
              <div className="pt-2">
                <Link
                  href={`/payin/${selectedTx.id}`}
                  target="_blank"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" style={{ color: LIME }} />
                  <span>Buka Halaman Invoice QRIS</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETAIL WEBHOOK */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-900" />
                  <h3 className="font-bold text-base text-slate-900">Rincian Webhook Callback</h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Target URL</span>
                  <div className="rounded-xl bg-slate-50 p-2.5 font-mono text-slate-800 break-all border border-slate-200">
                    {selectedLog.url}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Response Code: </span>
                    <span className="font-mono font-bold text-slate-900">{selectedLog.response_code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Latency: </span>
                    <span className="font-mono text-slate-700">{selectedLog.latency_ms} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Waktu: </span>
                    <span className="text-slate-700">{fmtTime(selectedLog.created_at)} WIB</span>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Payload Dikirim (Body)</span>
                  <pre className="rounded-xl bg-slate-950 p-3 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.payload), null, 2);
                      } catch (_) {
                        return selectedLog.payload;
                      }
                    })()}
                  </pre>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Response Server Merchant</span>
                  <pre className="rounded-xl bg-slate-100 p-3 text-slate-800 font-mono text-[11px] overflow-x-auto max-h-32 border border-slate-200">
                    {selectedLog.response_body || '(Kosong / 200 OK)'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="pb-28 text-center text-xs text-slate-400 md:pb-8">
        SisforHub Pay Gateway Riwayat &copy; 2026
      </footer>
    </div>
  );
}
