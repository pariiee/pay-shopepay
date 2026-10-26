'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Settings, Save, RotateCw, CheckCircle2, 
  Store, Hash, KeyRound, AlertCircle, ShieldCheck
} from 'lucide-react';

const LIME = '#d8f53b';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Ngecode Aje');
  const [uniqueEnabled, setUniqueEnabled] = useState(true);
  const [uniqueMax, setUniqueMax] = useState(99);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const json = await res.json();
      if (json.success) {
        setStoreName(json.data.store_name);
        setUniqueEnabled(json.data.unique_code_enabled);
        setUniqueMax(json.data.unique_code_max);
        setApiKey(json.data.api_key);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          unique_code_enabled: uniqueEnabled,
          unique_code_max: uniqueMax,
          api_key: apiKey
        })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal menyimpan pengaturan');
      setMessage('Pengaturan berhasil diperbarui!');
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
        <span className="text-sm font-bold text-slate-700">Pengaturan Gateway</span>
      </div>

      <main className="w-full max-w-2xl mx-auto my-6 flex-1">
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white" style={{ color: LIME }}>
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pengaturan Toko & Gateway</h1>
              <p className="text-xs text-slate-500 mt-0.5">Atur profil merchant, toleransi kode unik, dan API key</p>
            </div>
          </div>

          {message && (
            <div className="p-3 mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RotateCw className="h-4 w-4 animate-spin text-slate-900" />
              <span>Memuat konfigurasi...</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Store Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Store className="h-4 w-4 text-slate-500" />
                  <span>Nama Toko / Merchant</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition"
                />
                <p className="text-[11px] text-slate-400">Nama toko yang ditampilkan di halaman checkout & receipt.</p>
              </div>

              {/* Unique Code Settings */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-slate-500" />
                      <span>Kode Unik Otomatis (Anti-Collision)</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tambahkan kode acak Rp 1 - 99 jika ada transaksi kembar pending bersamaan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUniqueEnabled(!uniqueEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      uniqueEnabled ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        uniqueEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {uniqueEnabled && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Maksimal Nilai Kode Unik</label>
                    <input
                      type="number"
                      min="10"
                      max="999"
                      value={uniqueMax}
                      onChange={(e) => setUniqueMax(parseInt(e.target.value, 10) || 99)}
                      className="w-32 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition"
                    />
                    <span className="text-[11px] text-slate-400 ml-2">Maksimal penambahan kode unik (default: 99).</span>
                  </div>
                )}
              </div>

              {/* API Key */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  <span>Kunci API Gateway (X-API-Key)</span>
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-slate-900 transition"
                />
                <p className="text-[11px] text-slate-400">Header wajib pada setiap pemanggilan endpoint REST API.</p>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" style={{ color: LIME }} />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" style={{ color: LIME }} />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        SisforHub Pay &copy; 2026 • Settings Module
      </footer>
    </div>
  );
}
