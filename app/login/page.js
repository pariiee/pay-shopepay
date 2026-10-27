'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowLeft, AlertCircle, RotateCw, Eye, EyeOff } from 'lucide-react';

const LIME = '#d8f53b';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Auto-fill token from query param if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qToken = params.get('token');
      if (qToken) setToken(qToken);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Masukkan token akses admin');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Token akses salah atau tidak terdaftar');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between items-center p-4 sm:p-6">
      <div className="w-full max-w-sm pt-4 flex justify-start">
        <Link 
          href="/" 
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="w-full max-w-sm rounded-[28px] bg-white p-7 sm:p-9 shadow-xl shadow-slate-900/5 border border-slate-100">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-3 shadow-md" style={{ color: LIME }}>
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Gateway</h1>
          <p className="text-xs text-slate-500 mt-1">Masukkan satu token akses admin untuk mengelola gateway</p>
        </div>

        {error && (
          <div className="p-3 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Admin Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                required
                autoFocus
                placeholder="alpay-sec-••••••••••••"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Hanya membutuhkan token akses rahasia (tanpa username &amp; password).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" style={{ color: LIME }} />
                <span>Memverifikasi Token...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>
      </div>

      <footer className="py-4 text-center text-xs text-slate-400">
        Alpay &copy; 2026 • Single-Token Protected
      </footer>
    </div>
  );
}
