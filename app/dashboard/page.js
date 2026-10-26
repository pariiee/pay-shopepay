'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RotateCw, CheckCircle2, Clock, XCircle, Wallet,
  AlertTriangle, ShieldCheck, QrCode, LogOut, Copy, Check, TrendingUp,
  LayoutDashboard, Receipt, PlusCircle, Link2, KeyRound, Settings, BookOpen
} from 'lucide-react';

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
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
      <XCircle className="h-3 w-3" /> Batal
    </span>
  );
}

function RoundBtn({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
    >
      {children}
    </button>
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

  useEffect(() => {
    const el = document.getElementById('riwayat');
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setTab(e.isIntersecting ? 'riwayat' : 'dashboard'),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) {
        window.location.href = '/login';
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
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
    const interval = setInterval(fetchStats, 30000);
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
  const pending = stats.total_pending || 0;
  const cancelled = stats.total_cancelled || 0;
  const totalTrx = paid + pending + cancelled;
  const rate = totalTrx ? Math.round((paid / totalTrx) * 100) : 0;

  const filtered = txs.filter((t) => filter === 'all' || t.status === filter);
  const recent = txs.slice(0, 5);
  const tokenOk = data?.token_status === 'valid';

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Kembali" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 transition hover:bg-slate-900 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900" style={{ color: LIME }}>
              <QrCode className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">SisforHub Pay</span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full bg-white p-1 text-xs font-semibold md:flex">
          <Link href="/dashboard" className="rounded-full bg-slate-900 px-3.5 py-1.5 text-white">Dashboard</Link>
          <Link href="/link/4253472e" target="_blank" className="rounded-full px-3 py-1.5 text-slate-600 transition hover:text-slate-900">Link Statis</Link>
          <Link href="/dashboard/transactions" className="rounded-full px-3 py-1.5 text-slate-600 transition hover:text-slate-900">Transaksi</Link>
          <Link href="/dashboard/api-keys" className="rounded-full px-3 py-1.5 text-slate-600 transition hover:text-slate-900">API Key</Link>
          <Link href="/dashboard/settings" className="rounded-full px-3 py-1.5 text-slate-600 transition hover:text-slate-900">Settings</Link>
          <Link href="/docs" className="rounded-full px-3 py-1.5 text-slate-600 transition hover:text-slate-900">Docs</Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-white p-2.5 text-xs sm:py-2 sm:pl-3 sm:pr-4">
            {tokenOk ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-500" />}
            <span className="hidden font-semibold sm:inline">Ngecode Aje</span>
            <span className={`hidden sm:inline ${tokenOk ? 'text-emerald-600' : 'text-rose-500'}`}>{tokenOk ? 'Token valid' : 'Token perlu update'}</span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <RoundBtn onClick={fetchStats} disabled={loading} aria-label="Refresh">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </RoundBtn>
            <RoundBtn onClick={handleLogout} aria-label="Keluar">
              <LogOut className="h-4 w-4" />
            </RoundBtn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 pb-10 sm:px-6">
        <div className="px-1 pb-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau performa pembayaran QRIS kamu.</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/link/4253472e" target="_blank" className={`${card} group hover:border-slate-300 border border-transparent transition`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">Static Payment Link</span>
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition" style={{ color: LIME }}>
                <Link2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              /link/4253472e — Link permanen publik tanpa login.
            </p>
          </Link>

          <Link href="/dashboard/transactions" className={`${card} group hover:border-slate-300 border border-transparent transition`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">Transactions</span>
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Riwayat transaksi mutasi QRIS lengkap dengan filter.
            </p>
          </Link>

          <Link href="/dashboard/api-keys" className={`${card} group hover:border-slate-300 border border-transparent transition`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">API Key</span>
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
                <KeyRound className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This key is sent in the X-API-Key on every request.
            </p>
          </Link>

          <Link href="/docs" className={`${card} group hover:border-slate-300 border border-transparent transition`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">Docs & Settings</span>
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dokumentasi integrasi cURL, Node.js, PHP & atur toko.
            </p>
          </Link>
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
            <p className="mt-1 text-xs text-slate-500">Aktif dalam 15 menit</p>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Batal atau kedaluwarsa</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight sm:text-3xl">{cancelled}</p>
            <p className="mt-1 text-xs text-slate-500">Dibatalkan user atau timeout</p>
          </div>
        </div>

        {/* Grafik + transaksi terbaru */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className={`${card} lg:col-span-7`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">14 hari terakhir</h2>
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

          <section className={`${card} lg:col-span-5`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Transaksi terbaru</h2>
              <a href="#riwayat" className="text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-900">Lihat semua</a>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {recent.length === 0 && <li className="py-8 text-center text-sm text-slate-400">Belum ada transaksi.</li>}
              {recent.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold" style={{ color: LIME }}>
                    {(t.donor_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.donor_name}</p>
                    <p className="text-xs text-slate-500">{t.issuer || 'Belum dibayar'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.status === 'paid' ? 'text-emerald-600' : 'text-slate-400 line-through'}`}>
                      {t.status === 'paid' ? '+' : ''}Rp {rupiah(t.amount)}
                    </p>
                    <p className="text-[11px] text-slate-400">{fmtTime(t.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Riwayat lengkap */}
        <section id="riwayat" className="overflow-hidden rounded-[28px] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div>
              <h2 className="font-semibold">Riwayat transaksi dan kode unik</h2>
              <p className="mt-0.5 text-xs text-slate-500">Semua mutasi yang masuk ke database gateway.</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs">
              {[['all', 'Semua'], ['paid', 'Sukses'], ['pending', 'Pending'], ['cancelled', 'Batal']].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`rounded-full px-3.5 py-1.5 font-medium transition ${filter === k ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: daftar kartu */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {filtered.length === 0 && (
              <li className="py-10 text-center text-sm text-slate-400">Tidak ada transaksi untuk filter ini.</li>
            )}
            {filtered.map((t) => (
              <li key={t.id} className="space-y-2 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t.donor_name}</p>
                    {t.message && <p className="truncate text-xs italic text-slate-500">"{t.message}"</p>}
                  </div>
                  <StatusPill status={t.status} />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0 text-xs text-slate-500">
                    <button onClick={() => copyId(t.id)} className="inline-flex items-center gap-1 font-mono">
                      {t.id}
                      {copied === t.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
                    </button>
                    <p className="mt-0.5">{t.issuer || '-'}, {fmtTime(t.created_at)} WIB</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold">Rp {rupiah(t.amount)}</p>
                    {t.unique_code > 0 && (
                      <span className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: LIME }}>
                        kode unik +{t.unique_code}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: tabel */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Donatur dan pesan</th>
                  <th className="px-5 py-3 text-right font-medium">Nominal asli</th>
                  <th className="px-5 py-3 text-center font-medium">Kode unik</th>
                  <th className="px-5 py-3 text-right font-medium">Total bayar</th>
                  <th className="px-5 py-3 text-center font-medium">Metode</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">Tidak ada transaksi untuk filter ini.</td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <button onClick={() => copyId(t.id)} className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 hover:text-slate-900" title="Salin ID">
                          {t.id}
                          {copied === t.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block font-semibold">{t.donor_name}</span>
                        {t.message && <span className="text-xs italic text-slate-500">"{t.message}"</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600">Rp {rupiah(t.base_amount)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {t.unique_code > 0 ? (
                          <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: LIME }}>+{t.unique_code}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold">Rp {rupiah(t.amount)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{t.issuer || '-'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center"><StatusPill status={t.status} /></td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-500">{fmtTime(t.created_at)} WIB</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="pb-28 text-center text-xs text-slate-400 md:pb-8">SisforHub Pay Gateway Dashboard &copy; 2026</footer>

      {/* Tab bar melayang (mobile) */}
      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 z-50 flex justify-center px-4 md:hidden"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5">
          <TabItem
            Icon={LayoutDashboard}
            label="Dashboard"
            active={tab === 'dashboard'}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          <TabItem
            Icon={Receipt}
            label="Transaksi"
            active={tab === 'riwayat'}
            onClick={() => document.getElementById('riwayat')?.scrollIntoView({ behavior: 'smooth' })}
          />
          <TabItem Icon={RotateCw} label="Refresh" spin={loading} onClick={fetchStats} />
          <TabItem Icon={LogOut} label="Keluar" onClick={handleLogout} />
        </div>
      </nav>
    </div>
  );
}
