'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Settings, Save, RotateCw, CheckCircle2, 
  Store, Hash, KeyRound, AlertCircle, ShieldCheck, 
  QrCode, Plus, Trash2, Palette, Image as ImageIcon, X, UploadCloud,
  Eye, EyeOff, Copy, Check, Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const LIME = '#d8f53b';
const PREFIX = 'al-';

const SOLID_COLORS = [
  { label: 'Hitam Pekat', hex: '#0f172a' },
  { label: 'Shopee Orange', hex: '#ee4d2d' },
  { label: 'Emerald Green', hex: '#059669' }
];

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Ngecode Aje');
  const [uniqueEnabled, setUniqueEnabled] = useState(true);
  const [uniqueMax, setUniqueMax] = useState(99);
  const [apiKey, setApiKey] = useState('');
  const [suffix, setSuffix] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrls, setWebhookUrls] = useState(['']);
  const [adminToken, setAdminToken] = useState('alpay-sec-9a8b7c6d5e4f');
  const [showAdminToken, setShowAdminToken] = useState(false);
  const [copiedAdminToken, setCopiedAdminToken] = useState(false);

  // Modular QR Customizer
  const [qrBody, setQrBody] = useState('square');
  const [qrEyeFrame, setQrEyeFrame] = useState('square');
  const [qrEyeBall, setQrEyeBall] = useState('square');
  const [qrColor, setQrColor] = useState('#0f172a');
  const [customColor, setCustomColor] = useState('#2563eb');
  const [qrLogo, setQrLogo] = useState('');
  const [qrLogoBg, setQrLogoBg] = useState('circle');

  const [previewQr, setPreviewQr] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Live real-time preview updater
  useEffect(() => {
    let active = true;
    const fetchPreview = async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch('/api/settings/qr-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: qrBody,
            eyeFrame: qrEyeFrame,
            eyeBall: qrEyeBall,
            color: qrColor,
            logo: qrLogo || null,
            logoBg: qrLogoBg
          })
        });
        const json = await res.json();
        if (active && json.success) setPreviewQr(json.qr_image);
      } catch (_) {}
      finally {
        if (active) setPreviewLoading(false);
      }
    };
    const t = setTimeout(fetchPreview, 100);
    return () => { active = false; clearTimeout(t); };
  }, [qrBody, qrEyeFrame, qrEyeBall, qrColor, qrLogo, qrLogoBg]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.status === 401) {
        window.location.href = '/macuk';
        return;
      }
      const json = await res.json();
      if (json.success) {
        setStoreName(json.data.store_name || 'Ngecode Aje');
        setUniqueEnabled(json.data.unique_code_enabled ?? true);
        setUniqueMax(json.data.unique_code_max || 99);
        
        const key = json.data.api_key || '';
        setApiKey(key);
        setSuffix(key.startsWith(PREFIX) ? key.slice(PREFIX.length) : key);

        let urls = json.data.webhook_urls || [];
        if (!urls.length && json.data.webhook_url) {
          urls = [json.data.webhook_url];
        }
        if (urls.length === 0) urls = [''];
        setWebhookUrls(urls);

        if (json.data.admin_token) setAdminToken(json.data.admin_token);
        if (json.data.qr_body) setQrBody(json.data.qr_body);
        if (json.data.qr_eye_frame) setQrEyeFrame(json.data.qr_eye_frame);
        if (json.data.qr_eye_ball) setQrEyeBall(json.data.qr_eye_ball);
        if (json.data.qr_logo) setQrLogo(json.data.qr_logo);
        if (json.data.qr_logo_bg) setQrLogoBg(json.data.qr_logo_bg);

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

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file logo maksimal 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setQrLogo(ev.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (_) {}
  };

  const handleGenerateAdminToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminToken(`alpay-sec-${res}`);
  };

  const handleCopyAdminToken = async () => {
    try {
      await navigator.clipboard.writeText(adminToken);
      setCopiedAdminToken(true);
      setTimeout(() => setCopiedAdminToken(false), 2000);
    } catch (_) {}
  };

  const handleGenerateRandom = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSuffix(res);
    setApiKey(`${PREFIX}${res}`);
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
          admin_token: adminToken,
          webhook_urls: cleanUrls,
          webhook_url: cleanUrls[0] || '',
          qr_body: qrBody,
          qr_eye_frame: qrEyeFrame,
          qr_eye_ball: qrEyeBall,
          qr_color: qrColor,
          qr_logo: qrLogo,
          qr_logo_bg: qrLogoBg
        })
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal menyimpan pengaturan');
      setMessage('Semua pengaturan berhasil disimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper tile classes for icon buttons
  const tileBtn = (isActive) =>
    `flex h-12 w-12 items-center justify-center rounded-2xl bg-white transition shadow-sm ${
      isActive 
        ? 'ring-2 ring-sky-500 border-2 border-sky-500 text-slate-900 bg-sky-50/50 scale-105' 
        : 'border border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
    }`;

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      <Navbar active="settings" onRefresh={fetchSettings} loading={loading} />

      <main className="w-full max-w-6xl mx-auto px-4 pb-28 sm:px-6 flex-1 space-y-6">
        {/* Top Header & Fast Save */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm" style={{ color: LIME }}>
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Pengaturan Gateway</h1>
              <p className="text-xs text-slate-500 mt-0.5">Kelola profil toko, integrasi webhook, style visual QRIS, dan API key</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-xs font-bold transition shadow-sm hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" style={{ color: LIME }} />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" style={{ color: LIME }} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RotateCw className="h-5 w-5 animate-spin text-slate-800" />
            <span>Memuat data konfigurasi...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* 2-COLUMN SIDE-BY-SIDE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* KOLOM KIRI (5 cols): Profil, Webhook, API Key */}
              <div className="lg:col-span-5 space-y-6">
                {/* CARD 1: Profil Toko & Kode Unik */}
                <div className="rounded-[28px] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Store className="h-4 w-4 text-slate-600" />
                    <h2 className="font-bold text-sm text-slate-900">Profil & Anti-Kembar</h2>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Toko / Merchant</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition"
                    />
                    <p className="text-[10px] text-slate-400">Nama toko yang tampil di invoice pembayaran & checkout.</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block">Kode Unik Otomatis</label>
                        <p className="text-[10px] text-slate-400">Cegah salah verifikasi jika ada nominal kembar.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUniqueEnabled(!uniqueEnabled)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          uniqueEnabled ? 'bg-slate-900' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            uniqueEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {uniqueEnabled && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] text-slate-600 font-medium">Maksimal:</span>
                        <input
                          type="number"
                          min="10"
                          max="999"
                          value={uniqueMax}
                          onChange={(e) => setUniqueMax(parseInt(e.target.value, 10) || 99)}
                          className="w-24 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                        />
                        <span className="text-[10px] text-slate-400">Rp (default 99)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD 2: Multi-Webhook Callback */}
                <div className="rounded-[28px] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-slate-600" />
                      <h2 className="font-bold text-sm text-slate-900">Webhook Multi-URL</h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {webhookUrls.filter(u => u.trim()).length} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Callback otomatis dikirim ke seluruh URL di bawah ini saat status tagihan lunas.
                  </p>

                  <div className="space-y-2">
                    {webhookUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-400 w-4 text-right">{idx + 1}.</span>
                        <input
                          type="url"
                          placeholder="https://domain-kamu.com/api/webhook"
                          value={url}
                          onChange={(e) => updateWebhookUrl(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900 transition"
                        />
                        {webhookUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWebhookUrl(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus URL"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {webhookUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={addWebhookUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Tambah Webhook URL</span>
                    </button>
                  )}
                </div>

                {/* CARD 3: API Key Gateway */}
                <div className="rounded-[28px] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <KeyRound className="h-4 w-4 text-slate-600" />
                    <h2 className="font-bold text-sm text-slate-900">API Key Gateway</h2>
                  </div>

                  {/* Active Token Box */}
                  <div className="rounded-2xl bg-slate-900 p-3.5 text-white space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Token</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs tracking-wide overflow-x-auto select-all">
                        {loading ? 'Memuat...' : showKey ? apiKey : `${PREFIX}${'•'.repeat(Math.max(8, (apiKey || '').length - 3))}`}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyApiKey}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                        >
                          {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedKey ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Custom Suffix */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-slate-700 block">Custom Token Belakang</label>
                    <div className="flex items-center gap-1.5">
                      <span className="px-3 py-2 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs shrink-0 select-none">
                        {PREFIX}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="ez7dpzxdh6"
                        value={suffix}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                          setSuffix(clean);
                          setApiKey(`${PREFIX}${clean}`);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 transition"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRandom}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0 transition"
                        title="Generate Token Acak"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Header info */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                    <span className="font-semibold text-slate-600 block">Header Request:</span>
                    <code className="block p-1.5 rounded-lg bg-white border border-slate-200 font-mono text-[10px] text-slate-800 truncate">
                      X-API-Key: {apiKey || `${PREFIX}YOUR_TOKEN`}
                    </code>
                  </div>
                </div>

                {/* CARD 4: Token Akses Login Admin */}
                <div className="rounded-[28px] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-slate-600" />
                      <h2 className="font-bold text-sm text-slate-900">Token Akses Login Admin</h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      1-Kolom Auth
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Token rahasia untuk login ke dashboard admin tanpa perlu username atau password.
                  </p>

                  {/* Active Admin Token Box */}
                  <div className="rounded-2xl bg-slate-900 p-3.5 text-white space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Login Token</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs tracking-wide overflow-x-auto select-all">
                        {loading ? 'Memuat...' : showAdminToken ? adminToken : (adminToken ? `${adminToken.slice(0, 8)}••••••••••••` : 'Belum diatur')}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowAdminToken(!showAdminToken)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title={showAdminToken ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {showAdminToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyAdminToken}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                        >
                          {copiedAdminToken ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedAdminToken ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit or Generate New Token */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-slate-700 block">Ubah atau Acak Token Baru</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="alpay-sec-..."
                        value={adminToken}
                        onChange={(e) => setAdminToken(e.target.value.trim())}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 transition"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAdminToken}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0 transition"
                        title="Generate Token Acak"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Acak</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN (7 cols): Desain & Live Preview QRIS */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-[28px] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-slate-600" />
                      <h2 className="font-bold text-sm text-slate-900">Kustomisasi Desain QRIS</h2>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      EMVCo Compliant
                    </span>
                  </div>

                  {/* LIVE PREVIEW BOX BESAR & MENCOLOK */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 shrink-0 relative flex items-center justify-center">
                      {previewLoading && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                          <RotateCw className="h-5 w-5 animate-spin text-slate-800" />
                        </div>
                      )}
                      {previewQr ? (
                        <img src={previewQr} alt="Preview QRIS" className="w-44 h-44 object-contain rounded-lg" />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                          Memuat QR...
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                        <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white capitalize">
                          Body: {qrBody}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 capitalize">
                          Frame: {qrEyeFrame}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 capitalize">
                          Ball: {qrEyeBall}
                        </span>
                        {qrLogo && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            Logo Center
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Preview Real-Time QRIS Dinamis</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Tampilan nyata invoice saat pelanggan membayar. Tetap kompatibel dan terbaca instan oleh aplikasi perbankan & e-wallet.
                      </p>
                      <div className="text-[11px] font-mono text-slate-400">
                        Warna tema: <strong className="text-slate-800">{qrColor}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 1. Body Shape */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      1. Body Shape (Pola Modul)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        title="Square (Kotak)"
                        onClick={() => setQrBody('square')}
                        className={tileBtn(qrBody === 'square')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <rect x="3" y="3" width="7" height="7" fill="currentColor" />
                          <rect x="14" y="3" width="7" height="7" fill="currentColor" />
                          <rect x="3" y="14" width="7" height="7" fill="currentColor" />
                          <rect x="14" y="14" width="7" height="7" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Dots (Titik Bulat)"
                        onClick={() => setQrBody('dots')}
                        className={tileBtn(qrBody === 'dots')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <circle cx="6.5" cy="6.5" r="3.5" fill="currentColor" />
                          <circle cx="17.5" cy="6.5" r="3.5" fill="currentColor" />
                          <circle cx="6.5" cy="17.5" r="3.5" fill="currentColor" />
                          <circle cx="17.5" cy="17.5" r="3.5" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Rounded (Kotak Tumpul)"
                        onClick={() => setQrBody('rounded')}
                        className={tileBtn(qrBody === 'rounded')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <rect x="3" y="3" width="7" height="7" rx="2.5" fill="currentColor" />
                          <rect x="14" y="3" width="7" height="7" rx="2.5" fill="currentColor" />
                          <rect x="3" y="14" width="7" height="7" rx="2.5" fill="currentColor" />
                          <rect x="14" y="14" width="7" height="7" rx="2.5" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Diamond (Belah Ketupat)"
                        onClick={() => setQrBody('diamond')}
                        className={tileBtn(qrBody === 'diamond')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <polygon points="6.5,2.5 10.5,6.5 6.5,10.5 2.5,6.5" fill="currentColor" />
                          <polygon points="17.5,2.5 21.5,6.5 17.5,10.5 13.5,6.5" fill="currentColor" />
                          <polygon points="6.5,13.5 10.5,17.5 6.5,21.5 2.5,17.5" fill="currentColor" />
                          <polygon points="17.5,13.5 21.5,17.5 17.5,21.5 13.5,17.5" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Star (Bintang 4 Sisi)"
                        onClick={() => setQrBody('star')}
                        className={tileBtn(qrBody === 'star')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <polygon points="6.5,2.5 8,5 10.5,6.5 8,8 6.5,10.5 5,8 2.5,6.5 5,5" fill="currentColor" />
                          <polygon points="17.5,2.5 19,5 21.5,6.5 19,8 17.5,10.5 16,8 13.5,6.5 16,5" fill="currentColor" />
                          <polygon points="6.5,13.5 8,16 10.5,17.5 8,19 6.5,21.5 5,19 2.5,17.5 5,16" fill="currentColor" />
                          <polygon points="17.5,13.5 19,16 21.5,17.5 19,19 17.5,21.5 16,19 13.5,17.5 16,16" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Leaf (Sudut Daun)"
                        onClick={() => setQrBody('leaf')}
                        className={tileBtn(qrBody === 'leaf')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path d="M 5.5 3 H 10 V 7.5 A 2.5 2.5 0 0 1 7.5 10 H 3 V 5.5 A 2.5 2.5 0 0 1 5.5 3 Z" fill="currentColor" />
                          <path d="M 16.5 3 H 21 V 7.5 A 2.5 2.5 0 0 1 18.5 10 H 14 V 5.5 A 2.5 2.5 0 0 1 16.5 3 Z" fill="currentColor" />
                          <path d="M 5.5 14 H 10 V 18.5 A 2.5 2.5 0 0 1 7.5 21 H 3 V 16.5 A 2.5 2.5 0 0 1 5.5 14 Z" fill="currentColor" />
                          <path d="M 16.5 14 H 21 V 18.5 A 2.5 2.5 0 0 1 18.5 21 H 14 V 16.5 A 2.5 2.5 0 0 1 16.5 14 Z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 2. Eye Frame Shape */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 block">
                      2. Eye Frame Shape (Bingkai Sudut Luar)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        title="Square Frame (Kotak)"
                        onClick={() => setQrEyeFrame('square')}
                        className={tileBtn(qrEyeFrame === 'square')}
                      >
                        <svg viewBox="0 0 24 24" className="w-7 h-7">
                          <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Rounded Frame (Melengkung)"
                        onClick={() => setQrEyeFrame('rounded')}
                        className={tileBtn(qrEyeFrame === 'rounded')}
                      >
                        <svg viewBox="0 0 24 24" className="w-7 h-7">
                          <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Circle Frame (Cincin)"
                        onClick={() => setQrEyeFrame('circle')}
                        className={tileBtn(qrEyeFrame === 'circle')}
                      >
                        <svg viewBox="0 0 24 24" className="w-7 h-7">
                          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Leaf Frame (Daun)"
                        onClick={() => setQrEyeFrame('leaf')}
                        className={tileBtn(qrEyeFrame === 'leaf')}
                      >
                        <svg viewBox="0 0 24 24" className="w-7 h-7">
                          <path d="M 8.5 3.5 H 20.5 V 15.5 A 5 5 0 0 1 15.5 20.5 H 3.5 V 8.5 A 5 5 0 0 1 8.5 3.5 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Teardrop Frame (Tetesan)"
                        onClick={() => setQrEyeFrame('teardrop')}
                        className={tileBtn(qrEyeFrame === 'teardrop')}
                      >
                        <svg viewBox="0 0 24 24" className="w-7 h-7">
                          <path d="M 3.5 3.5 H 15.5 A 5 5 0 0 1 20.5 8.5 V 15.5 A 5 5 0 0 1 15.5 20.5 H 8.5 A 5 5 0 0 1 3.5 15.5 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 3. Eye Ball Shape */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 block">
                      3. Eye Ball Shape (Inti Sudut Dalam)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        title="Square Core (Kotak)"
                        onClick={() => setQrEyeBall('square')}
                        className={tileBtn(qrEyeBall === 'square')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <rect x="5" y="5" width="14" height="14" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Circle Core (Bulat)"
                        onClick={() => setQrEyeBall('circle')}
                        className={tileBtn(qrEyeBall === 'circle')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <circle cx="12" cy="12" r="7" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Rounded Core (Tumpul)"
                        onClick={() => setQrEyeBall('rounded')}
                        className={tileBtn(qrEyeBall === 'rounded')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <rect x="5" y="5" width="14" height="14" rx="4" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Diamond Core (Belah Ketupat)"
                        onClick={() => setQrEyeBall('diamond')}
                        className={tileBtn(qrEyeBall === 'diamond')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <polygon points="12,3.5 20.5,12 12,20.5 3.5,12" fill="currentColor" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        title="Leaf Core (Daun)"
                        onClick={() => setQrEyeBall('leaf')}
                        className={tileBtn(qrEyeBall === 'leaf')}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path d="M 8.5 5 H 19 V 15.5 A 3.5 3.5 0 0 1 15.5 19 H 5 V 8.5 A 3.5 3.5 0 0 1 8.5 5 Z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 4. Logo Center & Background Mode */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-slate-500" />
                        <span>4. Logo Center di Tengah QR (Opsional)</span>
                      </label>
                      {qrLogo && (
                        <button
                          type="button"
                          onClick={() => setQrLogo('')}
                          className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          <span>Hapus Logo</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition"
                      >
                        <UploadCloud className="h-4 w-4 text-slate-600" />
                        <span>{qrLogo ? 'Ganti File Logo...' : 'Upload Logo Toko (PNG/SVG)...'}</span>
                      </button>

                      {qrLogo && (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <img src={qrLogo} alt="Logo" className="h-6 w-6 rounded object-contain bg-white" />
                          <span className="text-xs text-emerald-600 font-semibold">Logo Aktif</span>
                        </div>
                      )}
                    </div>

                    {qrLogo && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-600">Bentuk Background:</span>
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium">
                          <button
                            type="button"
                            onClick={() => setQrLogoBg('circle')}
                            className={`rounded-md px-2.5 py-1 transition ${qrLogoBg === 'circle' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          >
                            Lingkaran (Bulat Halus)
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrLogoBg('none')}
                            className={`rounded-md px-2.5 py-1 transition ${qrLogoBg === 'none' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          >
                            Transparan (Tanpa Box)
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrLogoBg('square')}
                            className={`rounded-md px-2.5 py-1 transition ${qrLogoBg === 'square' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          >
                            Kotak
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Colors Section */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-slate-500" />
                      <span>5. Warna Tema QRIS</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-2.5">
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
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.hex }} />
                          <span>{c.label}</span>
                        </button>
                      ))}

                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => {
                            setCustomColor(e.target.value);
                            setQrColor(e.target.value);
                          }}
                          className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
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
              </div>
            </div>

            {/* Bottom Floating/Bar Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-sm font-bold transition shadow-md hover:scale-[1.01] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" style={{ color: LIME }} />
                    <span>Menyimpan Pengaturan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" style={{ color: LIME }} />
                    <span>Simpan Semua Pengaturan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="pb-28 text-center text-xs text-slate-400 md:pb-8">
        Alpay &copy; 2026 • Settings Module
      </footer>
    </div>
  );
}
