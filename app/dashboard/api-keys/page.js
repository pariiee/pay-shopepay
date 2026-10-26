'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, KeyRound, Copy, Check, Eye, EyeOff, 
  Terminal, ShieldCheck, BookOpen, RotateCw 
} from 'lucide-react';

const LIME = '#d8f53b';

export default function ApiKeyPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) setApiKey(data.data.api_key);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mx-auto pt-4 flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-bold text-slate-700">API Credentials</span>
      </div>

      <main className="w-full max-w-2xl mx-auto my-6 flex-1 space-y-4">
        {/* API Key Box */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white" style={{ color: LIME }}>
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">API Key Gateway</h1>
              <p className="text-xs text-slate-500 mt-0.5">Kunci rahasia untuk memproteksi panggilan REST API</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Secret Token</span>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm tracking-wide overflow-x-auto select-all">
                {loading ? 'Memuat...' : showKey ? apiKey : '••••••••••••••••••••••••••••••••'}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Cara Penggunaan di Header HTTP:</span>
            </div>
            <code className="block p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
              X-API-Key: {apiKey || 'YOUR_API_KEY'}
            </code>
            <p className="text-slate-500 text-[11px]">
              Kirim header di atas pada setiap request ke endpoint gateway Anda.
            </p>
          </div>
        </div>

        {/* Example cURL */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-700" />
              <span>Contoh cURL Create QRIS</span>
            </h2>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Buka Dokumentasi Lengkap</span>
            </Link>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X POST https://pay.sisforhub.web.id/api/payments/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}" \
  -d '{
    "amount": 10000,
    "customer_name": "Budi Santoso",
    "valid_minutes": 5
  }'`}
          </pre>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • API Keys Module
      </footer>
    </div>
  );
}
