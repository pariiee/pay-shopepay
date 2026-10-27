'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  RotateCw, CheckCircle2, Clock, XCircle, Wallet,
  AlertTriangle, ShieldCheck, QrCode, LogOut, Copy, Check, TrendingUp,
  LayoutDashboard, Receipt, Eye, X, ExternalLink, ArrowUpRight, History
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const DAY = 86400;
const WIB = 7 * 3600; // offset WIB (detik)
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const LIME = '#d8f53b';

const dayKey = (ts) => Math.floor((ts + WIB) / DAY);
const rupiah = (v) => new Intl.NumberFormat('id-ID').format(v || 0);
const fmtTime = (ts) =>
  ts
    ? new Date(ts * 1000).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '-';

const formatWebhookDate = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts * 1000);
  const day = d.getDate();
  const m = BULAN[d.getMonth()];
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${m}, ${h}.${min}`;
};

const card = 'rounded-[28px] bg-white p-4 sm:p-6';

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

function TabItem({ active, onClick, Icon, label, spin }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-[66px] flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] font-semibold transition ${
        active ? 'bg-slate-900 text-white' : 'text-slate-500'
      }`}
    >
      <Icon className={`h-5 w-5 ${spin ? 'animate-spin' : ''}`} style={active ? { color: LIME } : undefined} />
      {label}
    </button>
  );
}

function Chart({ series }) {
  const [hover, setHover] = useState(null);
  const W = 600, H = 190, PX = 16, PT = 34, PB = 26;
  const max = Math.max(1, ...series.map((d) => d.total));
  const step = (W - PX * 2) / (series.length - 1);
  const y = (v) => PT + (H - PT - PB) * (1 - v / max);
  const pts = series.map((d, i) => ({ x: PX + i * step, y: y(d.total), yp: y(d.paid) }));
  const curve = (key) =>
    pts
      .map((p, i) => {
        if (i === 0) return `M${p.x},${p[key]}`;
        const q = pts[i - 1];
        const mx = (q.x + p.x) / 2;
        return `C${mx},${q[key]} ${mx},${p[key]} ${p.x},${p[key]}`;
      })
      .join(' ');
  const line = curve('y');
  const area = `${line} L${pts[pts.length - 1].x},${H - PB} L${pts[0].x},${H - PB} Z`;
  const h = hover !== null ? pts[hover] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Grafik transaksi 14 hari terakhir">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LIME} stopOpacity="0.9" />
            <stop offset="100%" stopColor={LIME} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={PX} x2={W - PX} y1={PT + (H - PT - PB) * t} y2={PT + (H - PT - PB) * t} stroke="#e2e8f0" strokeDasharray="3 5" />
        ))}
        <path d={area} fill="url(#areaFill)" />
        <path d={curve('yp')} fill="none" stroke="#0f172a" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 5" />
        <path d={line} fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        {h && <line x1={h.x} x2={h.x} y1={PT - 6} y2={H - PB} stroke="#0f172a" strokeWidth="1" />}
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(i)} tabIndex={0}>
            <circle cx={p.x} cy={H / 2} r={step / 2} fill="transparent" />
            <rect x={p.x - step / 2} y={0} width={step} height={H} fill="transparent" />
            {hover === i && <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke="#0f172a" strokeWidth="2.5" />}
          </g>
        ))}
        {[0, 6, 13].map((i) => (
          <text key={i} x={pts[i].x} y={H - 6} fontSize="15" fill="#64748b" textAnchor={i === 0 ? 'start' : i === 13 ? 'end' : 'middle'}>
            {series[i].label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex justify-center">
        <span className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold" style={{ color: LIME }}>
          {hover !== null
            ? `${series[hover].label}: ${series[hover].total} trx, ${series[hover].paid} lunas`
            : 'Sentuh titik grafik untuk lihat detail'}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchWebhookLogs = async () => {
    setWebhookLoading(true);
    try {
      const res = await fetch('/api/webhook/logs');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setWebhookLogs(json.data.logs || []);
      }
    } catch (_) {}
    finally {
      setWebhookLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) {
        window.location.href = '/macuk';
        return;
      }
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchWebhookLogs();
    const interval = setInterval(() => {
      fetchStats();
      fetchWebhookLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const txs = data?.transactions || [];
  const stats = data?.stats || {};

  // Seri 14 hari dihitung dari daftar transaksi (zona waktu WIB)
  const { series, todayRev, todayPaid, rev14 } = useMemo(() => {
    const today = dayKey(Date.now() / 1000);
    const map = {};
    for (let i = 13; i >= 0; i--) {
      const k = today - i;
      const d = new Date(k * DAY * 1000);
      map[k] = { label: `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]}`, total: 0, paid: 0, rev: 0 };
    }
    txs.forEach((t) => {
      const b = map[dayKey(t.created_at)];
      if (!b) return;
      b.total += 1;
      if (t.status === 'paid') {
        b.paid += 1;
        b.rev += t.amount || 0;
      }
    });
    const list = Object.values(map);
    return {
      series: list,
      todayRev: list[13].rev,
      todayPaid: list[13].paid,
      rev14: list.reduce((s, d) => s + d.rev, 0),
    };
  }, [txs]);

  const paid = stats.total_paid || 0;
  const total = stats.total_tx || 0;
  const pending = stats.total_pending || 0;
  const expired = stats.total_expired || 0;
  const cancelled = stats.total_cancelled || 0;
  const rate = total > 0 ? Math.round((paid / total) * 100) : 0;

  const filtered = txs.filter((t) => filter === 'all' || t.status === filter);
  const recentTen = filtered.slice(0, 10); // Strictly 10 transaksi terakhir
  const recentFifteenLogs = webhookLogs.slice(0, 15); // Strictly 15 log webhook terakhir
  const tokenOk = data?.token_status === 'valid';

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900">
      {/* Universal Navbar */}
      <Navbar 
        active="dashboard" 
        storeName="Ngecode Aje" 
        tokenOk={tokenOk} 
        onRefresh={fetchStats} 
        loading={loading} 
      />

      <main className="mx-auto max-w-7xl space-y-4 px-4 pb-12 sm:px-6">
        <div className="px-1 pb-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau performa pembayaran QRIS kamu.</p>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Total revenue: kartu hitam */}
          <div className="rounded-[28px] bg-slate-900 p-4 text-white sm:p-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Total uang masuk</span>
              <Wallet className="h-4 w-4" style={{ color: LIME }} />
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight sm:text-3xl">Rp {rupiah(stats.total_volume)}</p>
            <p className="mt-1 text-xs text-slate-400">Dari {paid} transaksi lunas</p>

            <div className="mt-6 text-xs text-slate-400">Tingkat sukses {rate}%</div>
            <div
              className="mt-2 h-3 overflow-hidden rounded-full"
              style={{ background: 'repeating-linear-gradient(135deg,#475569 0 3px,transparent 3px 7px)' }}
            >
              <div className="h-full rounded-full" style={{ width: `${rate}%`, background: LIME }} />
            </div>
          </div>

          {/* Hari ini: kartu lime */}
          <div className="rounded-[28px] p-4 sm:p-6" style={{ background: LIME }}>
            <div className="flex items-center justify-between text-sm text-slate-800/70">
              <span>Pemasukan hari ini</span>
              <TrendingUp className="h-4 w-4 text-slate-900" />
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight sm:text-3xl">Rp {rupiah(todayRev)}</p>
            <p className="mt-1 text-xs text-slate-800/70">{todayPaid} transaksi lunas hari ini</p>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Menunggu bayar</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight sm:text-3xl">{pending}</p>
            <p className="mt-1 text-xs text-slate-500">Aktif dalam masa berlaku</p>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Expired / Batal</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight sm:text-3xl">{expired + cancelled}</p>
            <p className="mt-1 text-xs text-slate-500">{expired} expired, {cancelled} batal</p>
          </div>
        </div>

        {/* Grafik Tren 14 Hari */}
        <section className={card}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">14 hari terakhir</h2>
              <p className="mt-0.5 text-xs text-slate-500">Garis tebal: semua transaksi. Garis putus-putus: yang lunas.</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-bold" style={{ color: LIME }}>
              Rp {rupiah(rev14)}
            </span>
          </div>
          <div className="mt-4">
            <Chart series={series} />
          </div>
        </section>

        {/* Riwayat Transaksi (Strictly 10 Terakhir) */}
        <section id="riwayat" className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-900 text-base sm:text-lg">Riwayat Transaksi</h2>
              <p className="mt-0.5 text-xs text-slate-500">10 mutasi transaksi terbaru yang masuk ke database gateway.</p>
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
                  className={`rounded-full px-3.5 py-1.5 font-medium transition shrink-0 ${filter === k ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop & Mobile: Clean Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Donatur dan pesan</th>
                  <th className="px-5 py-3 text-right font-medium">Total bayar</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Waktu</th>
                  <th className="px-5 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTen.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-slate-400">Tidak ada transaksi untuk filter ini.</td>
                  </tr>
                ) : (
                  recentTen.map((t) => (
                    <tr key={t.id} className="transition hover:bg-slate-50/80">
                      {/* ID */}
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <button onClick={() => copyId(t.id)} className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900" title="Salin ID">
                          <span>{t.id}</span>
                          {copied === t.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                        </button>
                      </td>

                      {/* Donatur & Pesan */}
                      <td className="px-5 py-3.5">
                        <span className="block font-semibold text-slate-900">{t.donor_name || 'Hamba Allah'}</span>
                        {t.message && <span className="text-xs italic text-slate-500 line-clamp-1">&quot;{t.message}&quot;</span>}
                      </td>

                      {/* Total Bayar */}
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        Rp {rupiah(t.amount)}
                        {t.unique_code > 0 && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            kode unik +{t.unique_code}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <StatusPill status={t.status} />
                      </td>

                      {/* Waktu */}
                      <td className="px-5 py-3.5 text-right text-xs text-slate-500 whitespace-nowrap">
                        {fmtTime(t.created_at)}
                      </td>

                      {/* Aksi Button */}
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

          {/* Footer Link to /riwayat */}
          <div className="bg-slate-50/80 p-4 text-center border-t border-slate-100">
            <Link 
              href="/riwayat" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:underline"
            >
              <span>Lihat Semua Transaksi ({txs.length}) di Halaman Riwayat</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Webhook logs Panel (15 Terakhir) */}
        <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <History className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Webhook Logs</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    15 Terakhir
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Riwayat pengiriman webhook callback ke server merchant.</p>
              </div>
            </div>

            <Link
              href="/riwayat?tab=webhook"
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition"
            >
              <span>Buka Tab Webhook</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-4 sm:p-6">
            {recentFifteenLogs.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">
                {webhookLoading ? 'Memuat log webhook...' : 'Belum ada pengiriman webhook yang tercatat. (Atur Webhook URL di menu Settings)'}
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentFifteenLogs.map((log) => {
                  const isSuccess = log.response_code >= 200 && log.response_code < 300;
                  return (
                    <div key={log.id} className="py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className={`h-2.5 w-2.5 rounded-sm mt-1 shrink-0 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{log.event}</span>
                            {!isSuccess && (
                              <span className="font-bold text-rose-600 text-[11px]">
                                HTTP {log.response_code}
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-slate-500 truncate mt-0.5 max-w-md sm:max-w-xl">
                            {log.url}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 shrink-0 font-mono">
                        {isSuccess && (
                          <span className="text-slate-600 font-sans font-medium">HTTP {log.response_code}</span>
                        )}
                        <span>{log.attempts || 1}×</span>
                        <span>{log.latency_ms} ms</span>
                        <span className="font-sans text-slate-400">{formatWebhookDate(log.created_at)}</span>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="rounded bg-slate-100 hover:bg-slate-900 hover:text-white px-2 py-0.5 text-[10px] font-sans font-bold transition"
                        >
                          Lihat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="pb-28 text-center text-xs text-slate-400 md:pb-8">
        Alpay Gateway Dashboard &copy; 2026
      </footer>

      {/* MODAL DETAIL TRANSAKSI */}
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
                  onClick={() => copyId(selectedTx.id)}
                  className="font-mono font-bold text-slate-900 inline-flex items-center gap-1 hover:underline"
                >
                  <span>{selectedTx.id}</span>
                  {copied === selectedTx.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
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

      {/* MODAL DETAIL WEBHOOK */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-slate-900" />
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
    </div>
  );
}
