'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Settings, Save, RotateCw, CheckCircle2, 
  Store, Hash, KeyRound, AlertCircle, ShieldCheck, 
  QrCode, Plus, Trash2, Palette
} from 'lucide-react';

const LIME = '#d8f53b';

const SOLID_COLORS = [
  { label: 'Hitam Pekat', hex: '#0f172a' },
  { label: 'Shopee Orange', hex: '#ee4d2d' },
  { label: 'Emerald Green', hex: '#059669' }
];

const QR_STYLES = [
  { id: 'classic', label: 'Classic Sharp', desc: 'Kotak standar presisi tinggi' },
  { id: 'dots', label: 'Modern Dots', desc: 'Titik bulat halus & modern' },
  { id: 'rounded', label: 'Smooth Rounded', desc: 'Sudut modul melengkung rapi' },
  { id: 'classy', label: 'Classy Eyes', desc: 'Bingkai sudut anggun & elegan' },
  { id: 'minimal', label: 'Minimalist', desc: 'Format ramping modern' }
];

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Ngecode Aje');
  const [uniqueEnabled, setUniqueEnabled] = useState(true);
  const [uniqueMax, setUniqueMax] = useState(99);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrls, setWebhookUrls] = useState(['']);
  const [qrStyle, setQrStyle] = useState('classic');
  const [qrColor, setQrColor] = useState('#0f172a');
  const [customColor, setCustomColor] = useState('#2563eb');

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
        
        let urls = json.data.webhook_urls || [];
        if (urls.length === 0 && json.data.webhook_url) {
          urls = [json.data.webhook_url];
        }
        if (urls.length === 0) urls = [''];
        setWebhookUrls(urls);

        if (json.data.qr_style) setQrStyle(json.data.qr_style);
        if (json.data.qr_color) {
          setQrColor(json.data.qr_color);
          if (!SOLID_COLORS.some(c => c.hex.toLowerCase() === json.data.qr_color.toLowerCase())) {
            setCustomColor(json.data.qr_color);
          }
        }
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

  const addWebhookUrl = () => {
    if (webhookUrls.length < 5) {
      setWebhookUrls([...webhookUrls, '']);
    }
  };

  const removeWebhookUrl = (index) => {
    const updated = webhookUrls.filter((_, i) => i !== index);
    setWebhookUrls(updated.length > 0 ? updated : ['']);
  };

  const updateWebhookUrl = (index, val) => {
    const updated = [...webhookUrls];
    updated[index] = val;
    setWebhookUrls(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const cleanUrls = webhookUrls.map(u => u.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          unique_code_enabled: uniqueEnabled,
          unique_code_max: uniqueMax,
          api_key: apiKey,
          webhook_urls: cleanUrls,
          webhook_url: cleanUrls[0] || '',
          qr_style: qrStyle,
          qr_color: qrColor
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
              <p className="text-xs text-slate-500 mt-0.5">Atur profil merchant, Webhook multi-URL, style QRIS, dan API key</p>
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
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
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

              {/* Multi-Webhook URLs (Max 5) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-500" />
                    <span>Webhook URLs (Callback Multi-Project, Max 5)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {webhookUrls.filter(u => u.trim()).length} / 5 URL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Setiap transaksi lunas/expired akan otomatis dikirim serentak ke semua URL webhook di bawah ini (disertai HMAC-SHA256 signature).
                </p>

                <div className="space-y-2">
                  {webhookUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="url"
                        placeholder="https://proyek-kamu.com/api/payment/webhook"
                        value={url}
                        onChange={(e) => updateWebhookUrl(idx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900 transition"
                      />
                      {webhookUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWebhookUrl(idx)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus URL"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {webhookUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={addWebhookUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Webhook URL</span>
                  </button>
                )}
              </div>

              {/* QR Code Style & Custom Color */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-slate-500" />
                  <label className="text-xs font-bold text-slate-900">Style & Warna QRIS Dinamis</label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pilih bentuk modul QRIS (5 gaya) dan tentukan warna tema pembayaran.
                </p>

                {/* 5 Styles Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {QR_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setQrStyle(st.id)}
                      className={`text-left p-3 rounded-2xl border transition ${
                        qrStyle === st.id 
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm' 
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs">{st.label}</div>
                      <div className={`text-[10px] mt-0.5 ${qrStyle === st.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {st.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Colors Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-slate-500" />
                    <span>Pilihan Warna QRIS</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* 3 Solid Color Presets */}
                    {SOLID_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setQrColor(c.hex)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                          qrColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white text-slate-900 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                        <span>{c.label}</span>
                      </button>
                    ))}

                    {/* 1 Custom Color Picker */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setQrColor(e.target.value);
                        }}
                        className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
                        title="Pilih warna bebas"
                      />
                      <input
                        type="text"
                        value={qrColor}
                        onChange={(e) => {
                          setQrColor(e.target.value);
                          if (e.target.value.startsWith('#')) setCustomColor(e.target.value);
                        }}
                        className="w-20 bg-transparent font-mono text-xs font-semibold text-slate-800 uppercase focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400">Custom</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
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
