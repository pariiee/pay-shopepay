'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, Clock, XCircle, RotateCw, 
  Copy, Check, ArrowUpRight, TrendingUp,
  Receipt, Eye, X, ExternalLink, ShieldCheck,
  KeyRound, Settings, BookOpen
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

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_tx: 0,
    total_paid: 0,
    total_pending: 0,
    total_expired: 0,
    total_cancelled: 0,
    total_volume: 0,
    total_unique_fees: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [resStats, resLogs] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/webhook/logs')
      ]);

      if (resStats.status === 401) {
        window.location.href = '/login';
        return;
      }

      const jsonStats = await resStats.json();
      if (jsonStats.success) {
        setStats(jsonStats.data.stats || {});
        setTransactions(jsonStats.data.transactions || []);
      }

      const jsonLogs = await resLogs.json();
      if (jsonLogs.success) {
        setWebhookLogs(jsonLogs.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  // Strict 10 transaksi terakhir
  const recentTenTx = filtered.slice(0, 10);
  // Strict 15 log webhook terakhir
  const recentFifteenLogs = webhookLogs.slice(0, 15);

  const statCard = "rounded-[28px] bg-white p-5 sm:p-6 shadow-xl shadow-slate-900/5";

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold" style={{ color: LIME }}>
            SP
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">SisforHub Pay</span>
            <span className="text-[11px] font-medium text-slate-500">Merchant Gateway Dashboard</span>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold">
          <Link href="/riwayat" className="rounded-full px-3.5 py-1.5 text-slate-700 bg-white shadow-sm hover:bg-slate-900 hover:text-white transition">
            Riwayat
          </Link>
          <Link href="/api-keys" className="rounded-full px-3.5 py-1.5 text-slate-700 bg-white shadow-sm hover:bg-slate-900 hover:text-white transition">
            API Key
          </Link>
          <Link href="/settings" className="rounded-full px-3.5 py-1.5 text-slate-700 bg-white shadow-sm hover:bg-slate-900 hover:text-white transition">
            Settings
          </Link>
          <Link href="/docs" className="rounded-full px-3.5 py-1.5 text-slate-700 bg-white shadow-sm hover:bg-slate-900 hover:text-white transition">
            Docs
          </Link>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
            title="Refresh Data"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6 flex-1">
        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className={statCard}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Volume</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Rp {rupiah(stats.total_volume)}
            </div>
            <p className="mt-1 text-xs text-slate-500">Uang masuk berhasil diproses.</p>
          </div>

          <div className={statCard}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaksi Sukses</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-600 flex items-center gap-1.5">
              <span>{stats.total_paid || 0}</span>
              <span className="text-xs font-semibold text-slate-400">/ {stats.total_tx || 0} tx</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Tagihan lunas terverifikasi.</p>
          </div>

          <div className={statCard}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-amber-600">
              {stats.total_pending || 0}
            </div>
            <p className="mt-1 text-xs text-slate-500">Menunggu pembayaran pembeli.</p>
          </div>

          <div className={statCard}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expired / Batal</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-500 flex items-center gap-2">
              <span>{stats.total_expired || 0}</span>
              <span className="text-xs text-rose-500 font-bold">({stats.total_cancelled || 0} batal)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Kadaluarsa atau dibatalkan.</p>
          </div>
        </div>

        {/* RIWAYAT TRANSAKSI (10 TERAKHIR) */}
        <section className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Riwayat Transaksi</h2>
              <p className="mt-0.5 text-xs text-slate-500">10 mutasi transaksi terbaru yang masuk ke gateway.</p>
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

          {/* Table */}
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
                {recentTenTx.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      Tidak ada transaksi pada filter ini.
                    </td>
                  </tr>
                ) : (
                  recentTenTx.map((t) => (
                    <tr key={t.id} className="transition hover:bg-slate-50/80">
                      {/* 1. ID */}
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <button
                          onClick={() => copyText(t.id, t.id)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                          title="Salin ID"
                        >
                          <span>{t.id}</span>
                          {copied === t.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
                        </button>
                      </td>

                      {/* 2. Donatur & Pesan */}
                      <td className="px-5 py-3.5">
                        <span className="block font-semibold text-slate-900">{t.donor_name || 'Hamba Allah'}</span>
                        {t.message && <span className="text-xs italic text-slate-500 line-clamp-1">&quot;{t.message}&quot;</span>}
                      </td>

                      {/* 3. Total Bayar */}
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        Rp {rupiah(t.amount)}
                        {t.unique_code > 0 && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            unik +{t.unique_code}
                          </span>
                        )}
                      </td>

                      {/* 4. Status */}
                      <td className="px-5 py-3.5 text-center">
                        <StatusPill status={t.status} />
                      </td>

                      {/* 5. Waktu */}
                      <td className="px-5 py-3.5 text-right text-xs text-slate-500 whitespace-nowrap">
                        {fmtTime(t.created_at)}
                      </td>

                      {/* 6. Aksi (Detail Modal Trigger) */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => setSelectedTx(t)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition"
                          title="Detail Transaksi"
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

          {/* Footer Link to /riwayat */}
          <div className="bg-slate-50/80 p-4 text-center border-t border-slate-100">
            <Link 
              href="/riwayat" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:underline"
            >
              <span>Lihat Semua Transaksi ({transactions.length}) di Halaman Riwayat</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* WEBHOOK LOGS (15 TERAKHIR) */}
        <section className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Webhook Logs</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  15 Terakhir
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Riwayat callback otomatis yang dikirim ke endpoint merchant.</p>
            </div>

            <Link
              href="/riwayat?tab=webhook"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline"
            >
              <span>Semua Log</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Event</th>
                  <th className="px-5 py-2.5 font-semibold">Target URL</th>
                  <th className="px-5 py-2.5 text-center font-semibold">HTTP Status</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Latency</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Waktu</th>
                  <th className="px-5 py-2.5 text-center font-semibold">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFifteenLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      Belum ada callback webhook yang dikirimkan.
                    </td>
                  </tr>
                ) : (
                  recentFifteenLogs.map((log) => {
                    const isSuccess = log.response_code >= 200 && log.response_code < 300;
                    return (
                      <tr key={log.id} className="transition hover:bg-slate-50/80">
                        <td className="px-5 py-2.5">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {log.event}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 font-mono text-xs text-slate-600 max-w-xs truncate" title={log.url}>
                          {log.url}
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                            isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.response_code || 500}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-xs text-slate-500">
                          {log.latency_ms || 0} ms
                        </td>
                        <td className="px-5 py-2.5 text-right text-xs text-slate-500 whitespace-nowrap">
                          {fmtTime(log.created_at)}
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-900 hover:text-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition"
                          >
                            <Eye className="h-3 w-3" />
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
        </section>
      </main>

      {/* DETAIL TRANSAKSI MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-slate-900" />
                <h3 className="font-bold text-base text-slate-900">Rincian Transaksi</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <span className="text-xs text-slate-400">Total Pembayaran</span>
                <div className="text-xl font-extrabold text-slate-900">Rp {rupiah(selectedTx.amount)}</div>
              </div>
              <StatusPill status={selectedTx.status} />
            </div>

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

      {/* DETAIL WEBHOOK MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-900" />
                <h3 className="font-bold text-base text-slate-900">Rincian Callback Webhook</h3>
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

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        SisforHub Pay &copy; 2026 • ShopeePay Dynamic QRIS Gateway
      </footer>
    </div>
  );
}
