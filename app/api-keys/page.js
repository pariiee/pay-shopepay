'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, KeyRound, Copy, Check, Eye, EyeOff, 
  Terminal, ShieldCheck, BookOpen, RotateCw, Save, Sparkles, AlertCircle
} from 'lucide-react';

const LIME = '#d8f53b';
const PREFIX = 'al-';

export default function ApiKeyPage() {
  const [apiKey, setApiKey] = useState('');
  const [suffix, setSuffix] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchKey = () => {
    setLoading(true);
    fetch('/api/settings')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          const current = data.data.api_key || 'al-yra7890ia8';
          setApiKey(current);
          if (current.startsWith(PREFIX)) {
            setSuffix(current.slice(PREFIX.length));
          } else {
            setSuffix(current);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKey();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleGenerateRandom = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSuffix(res);
  };

  const handleSaveCustomKey = async (e) => {
    e.preventDefault();
    const cleanSuffix = suffix.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanSuffix) {
      setError('Karakter token setelah al- tidak boleh kosong');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    const fullKey = `${PREFIX}${cleanSuffix}`;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: fullKey })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal menyimpan API Key');

      setApiKey(fullKey);
      setSuffix(cleanSuffix);
      setMessage(`API Key berhasil diubah ke: ${fullKey}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
        {/* Active API Key Box */}
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Token</span>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm tracking-wide overflow-x-auto select-all">
                {loading ? 'Memuat...' : showKey ? apiKey : `${PREFIX}••••••••••`}
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

          {/* CUSTOM API KEY FORM */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Custom Token Belakang</h2>
            <p className="text-xs text-slate-500 mb-4">
              Prefix <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">{PREFIX}</code> terkunci permanen. Kamu bebas mengganti token belakangnya:
            </p>

            {message && (
              <div className="p-3 mb-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3 mb-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveCustomKey} className="space-y-3">
              <div className="flex items-center gap-1.5">
                {/* Locked Prefix */}
                <span className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm shrink-0 border border-slate-800 select-none">
                  {PREFIX}
                </span>

                {/* Editable Suffix */}
                <input
                  type="text"
                  required
                  placeholder="yra7890ia8"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900 transition"
                />

                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0 transition"
                  title="Generate Token Acak"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={saving || !suffix}
                className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" style={{ color: LIME }} />
                    <span>Menyimpan Token...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" style={{ color: LIME }} />
                    <span>Simpan API Key Baru</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Cara Penggunaan di Header HTTP:</span>
            </div>
            <code className="block p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
              X-API-Key: {apiKey || `${PREFIX}YOUR_TOKEN`}
            </code>
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
  -H "X-API-Key: ${apiKey || `${PREFIX}YOUR_TOKEN`}" \
  -d '{
    "amount": 10000,
    "customer_name": "Budi Santoso",
    "valid_minutes": 5
  }'`}
          </pre>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • Custom API Key Module
      </footer>
    </div>
  );
}
