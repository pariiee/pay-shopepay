'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCw, History, ExternalLink, Globe } from 'lucide-react';

const LIME = '#d8f53b';

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhook/logs');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) setLogs(json.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month}, ${hours}.${mins}`;
  };

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Navbar */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 pt-2 pb-4">
        <Link 
          href="/dashboard" 
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-bold text-slate-700">Webhook Monitor</span>
      </div>

      <main className="mx-auto w-full max-w-5xl space-y-4 flex-1">
        {/* Webhook logs Panel matching exact UI */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          {/* Header Panel */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <History className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900">Webhook logs</h1>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    30 days
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Riwayat pengiriman webhook 30 days terakhir.</p>
              </div>
            </div>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* List of Webhook Logs */}
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {loading ? 'Memuat log webhook...' : 'Belum ada pengiriman webhook yang tercatat.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => {
                const isSuccess = log.response_code >= 200 && log.response_code < 300;
                return (
                  <div key={log.id} className="py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Square Status Indicator */}
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
                      <span className="font-sans text-slate-400">{formatDate(log.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • Webhook Delivery Logs
      </footer>
    </div>
  );
}
