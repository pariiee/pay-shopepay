'use client';

import AlpayLogo from '@/components/AlpayLogo';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowLeft, AlertCircle, RotateCw, Eye, EyeOff, ShieldCheck, Smartphone, QrCode } from 'lucide-react';

const LIME = '#d8f53b';

export default function MacukPage() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [require2fa, setRequire2fa] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  // Auto-redirect if already logged in
  useEffect(() => {
    let active = true;
    fetch('/api/settings')
      .then(res => {
        if (active) {
          if (res.ok) {
            router.replace('/dashboard');
          } else {
            setCheckingSession(false);
          }
        }
      })
      .catch(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Masukkan token akses admin');
      return;
    }

    if (require2fa && !totpCode.trim()) {
      setError('Masukkan 6 digit kode Authenticator');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = { token: token.trim() };
      if (require2fa) {
        payload.totp_code = totpCode.trim();
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Autentikasi gagal');
      }

      // Check if server asks for 2FA
      if (data.require_2fa) {
        setRequire2fa(true);
        setTotpCode('');
        setLoading(false);
        return;
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
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between p-4 sm:p-6">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-2 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <AlpayLogo className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Alpay</span>
        </Link>
      </header>

      <div className="w-full max-w-sm mx-auto my-auto rounded-[28px] bg-white p-7 sm:p-9 shadow-xl shadow-slate-900/5 border border-slate-100">
        {checkingSession ? (
          <div className="py-12 text-center space-y-3">
            <RotateCw className="h-6 w-6 animate-spin mx-auto text-slate-800" style={{ color: LIME }} />
            <p className="text-xs text-slate-500 font-semibold">Memeriksa status sesi...</p>
          </div>
        ) : !require2fa ? (
          // STEP 1: TOKEN INPUT
          <>
            <div className="text-center mb-6">
              <div className="h-14 w-14 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-3 shadow-md" style={{ color: LIME }}>
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Gateway</h1>
              <p className="text-xs text-slate-500 mt-1">Masukkan token akses admin rahasia</p>
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
                    autoComplete="off"
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
                  Autentikasi 1-kolom aman tanpa URL parameter.
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
                  <span>Lanjutkan</span>
                )}
              </button>
            </form>
          </>
        ) : (
          // STEP 2: 2FA TOTP INPUT
          <>
            <div className="text-center mb-6">
              <div className="h-14 w-14 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-3 shadow-md" style={{ color: LIME }}>
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Verifikasi 2-Faktor</h1>
              <p className="text-xs text-slate-500 mt-1">
                Buka aplikasi Google Authenticator / Authy di HP kamu dan masukkan 6 digit kode yang muncul.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 mb-2">
                  6-Digit OTP Authenticator
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center text-2xl font-black tracking-[0.4em] focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" style={{ color: LIME }} />
                    <span>Memverifikasi 2FA...</span>
                  </>
                ) : (
                  <span>Verifikasi &amp; Masuk</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setRequire2fa(false); setTotpCode(''); setError(''); }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  &larr; Ganti Token
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <footer className="py-4 text-center text-xs text-slate-400">
        Alpay &copy; 2026 • 2FA Protected Area
      </footer>
    </div>
  );
}
