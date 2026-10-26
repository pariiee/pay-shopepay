'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Settings, Save, RotateCw, CheckCircle2, 
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
        window.location.href = '/login';
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
      setMessage('Pengaturan berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper tile classes
  const tileBtn = (isActive) =>
    `flex h-14 w-14 items-center justify-center rounded-2xl bg-white transition shadow-sm ${
      isActive 
        ? 'ring-2 ring-sky-500 border-2 border-sky-500 text-slate-900 bg-sky-50/50 scale-105' 
        : 'border border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
    }`;

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      <Navbar active="settings" onRefresh={fetchSettings} loading={loading} />

      <main className="w-full max-w-3xl mx-auto px-4 pb-20 sm:px-6 flex-1">
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white" style={{ color: LIME }}>
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pengaturan Toko & Gateway</h1>
              <p className="text-xs text-slate-500 mt-0.5">Atur profil merchant, Webhook multi-URL, style visual QRIS, logo, dan API key</p>
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
                <p className="text-[11px] text-slate-400">Nama toko yang ditampilkan di invoice pembayaran & checkout.</p>
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

              {/* Multi-Webhook URLs */}
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
                  Notifikasi mutasi lunas otomatis dikirim ke semua URL ini bersama signature HMAC-SHA256.
                </p>

                <div className="space-y-2">
                  {webhookUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="url"
                        placeholder="https://domain-kamu.com/api/payment/webhook"
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

              {/* CUSTOM QR CODE DESIGNER (ICON TILES) */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white" style={{ color: LIME }}>
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Custom Desain QRIS</h2>
                      <p className="text-[11px] text-slate-400">Pilih icon bentuk modul, bingkai sudut, dan logo tengah</p>
                    </div>
                  </div>
                </div>

                {/* 1. Body Shape */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Body Shape (Pola Modul)
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Square */}
                    <button
                      type="button"
                      title="Square (Kotak Standar)"
                      onClick={() => setQrBody('square')}
                      className={tileBtn(qrBody === 'square')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <rect x="3" y="3" width="7.5" height="7.5" fill="currentColor" />
                        <rect x="13.5" y="3" width="7.5" height="7.5" fill="currentColor" />
                        <rect x="3" y="13.5" width="7.5" height="7.5" fill="currentColor" />
                        <rect x="13.5" y="13.5" width="7.5" height="7.5" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Dots */}
                    <button
                      type="button"
                      title="Dots (Titik Bulat)"
                      onClick={() => setQrBody('dots')}
                      className={tileBtn(qrBody === 'dots')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <circle cx="6.5" cy="6.5" r="4" fill="currentColor" />
                        <circle cx="17.5" cy="6.5" r="4" fill="currentColor" />
                        <circle cx="6.5" cy="17.5" r="4" fill="currentColor" />
                        <circle cx="17.5" cy="17.5" r="4" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Rounded Squircle */}
                    <button
                      type="button"
                      title="Rounded (Kotak Tumpul)"
                      onClick={() => setQrBody('rounded')}
                      className={tileBtn(qrBody === 'rounded')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
                        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
                        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
                        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Diamond */}
                    <button
                      type="button"
                      title="Diamond (Belah Ketupat)"
                      onClick={() => setQrBody('diamond')}
                      className={tileBtn(qrBody === 'diamond')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <polygon points="6.75,2.5 11,6.75 6.75,11 2.5,6.75" fill="currentColor" />
                        <polygon points="17.25,2.5 21.5,6.75 17.25,11 13,6.75" fill="currentColor" />
                        <polygon points="6.75,13 11,17.25 6.75,21.5 2.5,17.25" fill="currentColor" />
                        <polygon points="17.25,13 21.5,17.25 17.25,21.5 13,17.25" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Star */}
                    <button
                      type="button"
                      title="Star (Bintang 4 Sisi)"
                      onClick={() => setQrBody('star')}
                      className={tileBtn(qrBody === 'star')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <polygon points="6.5,2.5 8,5 10.5,6.5 8,8 6.5,10.5 5,8 2.5,6.5 5,5" fill="currentColor" />
                        <polygon points="17.5,2.5 19,5 21.5,6.5 19,8 17.5,10.5 16,8 13.5,6.5 16,5" fill="currentColor" />
                        <polygon points="6.5,13.5 8,16 10.5,17.5 8,19 6.5,21.5 5,19 2.5,17.5 5,16" fill="currentColor" />
                        <polygon points="17.5,13.5 19,16 21.5,17.5 19,19 17.5,21.5 16,19 13.5,17.5 16,16" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Leaf */}
                    <button
                      type="button"
                      title="Leaf (Sudut Daun)"
                      onClick={() => setQrBody('leaf')}
                      className={tileBtn(qrBody === 'leaf')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <path d="M 6 3 H 11 V 8 A 3 3 0 0 1 8 11 H 3 V 6 A 3 3 0 0 1 6 3 Z" fill="currentColor" />
                        <path d="M 16.5 3 H 21.5 V 8 A 3 3 0 0 1 18.5 11 H 13.5 V 6 A 3 3 0 0 1 16.5 3 Z" fill="currentColor" />
                        <path d="M 6 13.5 H 11 V 18.5 A 3 3 0 0 1 8 21.5 H 3 V 16.5 A 3 3 0 0 1 6 13.5 Z" fill="currentColor" />
                        <path d="M 16.5 13.5 H 21.5 V 18.5 A 3 3 0 0 1 18.5 21.5 H 13.5 V 16.5 A 3 3 0 0 1 16.5 13.5 Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 2. Eye Frame Shape */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Eye Frame Shape (Bingkai Sudut Luar)
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Square Frame */}
                    <button
                      type="button"
                      title="Square Frame (Bingkai Kotak)"
                      onClick={() => setQrEyeFrame('square')}
                      className={tileBtn(qrEyeFrame === 'square')}
                    >
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3.2" />
                      </svg>
                    </button>

                    {/* Rounded Frame */}
                    <button
                      type="button"
                      title="Rounded Frame (Bingkai Melengkung)"
                      onClick={() => setQrEyeFrame('rounded')}
                      className={tileBtn(qrEyeFrame === 'rounded')}
                    >
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="3.2" />
                      </svg>
                    </button>

                    {/* Circle Frame */}
                    <button
                      type="button"
                      title="Circle Frame (Lingkaran Cincin)"
                      onClick={() => setQrEyeFrame('circle')}
                      className={tileBtn(qrEyeFrame === 'circle')}
                    >
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="3.2" />
                      </svg>
                    </button>

                    {/* Leaf Frame */}
                    <button
                      type="button"
                      title="Leaf Frame (Bingkai Daun)"
                      onClick={() => setQrEyeFrame('leaf')}
                      className={tileBtn(qrEyeFrame === 'leaf')}
                    >
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <path d="M 8.5 3.5 H 20.5 V 15.5 A 5 5 0 0 1 15.5 20.5 H 3.5 V 8.5 A 5 5 0 0 1 8.5 3.5 Z" fill="none" stroke="currentColor" strokeWidth="3.2" />
                      </svg>
                    </button>

                    {/* Teardrop Frame */}
                    <button
                      type="button"
                      title="Teardrop Frame (Bingkai Tetesan)"
                      onClick={() => setQrEyeFrame('teardrop')}
                      className={tileBtn(qrEyeFrame === 'teardrop')}
                    >
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <path d="M 3.5 3.5 H 15.5 A 5 5 0 0 1 20.5 8.5 V 15.5 A 5 5 0 0 1 15.5 20.5 H 8.5 A 5 5 0 0 1 3.5 15.5 Z" fill="none" stroke="currentColor" strokeWidth="3.2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 3. Eye Ball Shape */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Eye Ball Shape (Inti Sudut Dalam)
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Square Ball */}
                    <button
                      type="button"
                      title="Square Core (Kotak Padat)"
                      onClick={() => setQrEyeBall('square')}
                      className={tileBtn(qrEyeBall === 'square')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <rect x="5" y="5" width="14" height="14" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Circle Ball */}
                    <button
                      type="button"
                      title="Circle Core (Bulat Padat)"
                      onClick={() => setQrEyeBall('circle')}
                      className={tileBtn(qrEyeBall === 'circle')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <circle cx="12" cy="12" r="7.5" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Rounded Ball */}
                    <button
                      type="button"
                      title="Rounded Core (Kotak Tumpul)"
                      onClick={() => setQrEyeBall('rounded')}
                      className={tileBtn(qrEyeBall === 'rounded')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <rect x="5" y="5" width="14" height="14" rx="4" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Diamond Ball */}
                    <button
                      type="button"
                      title="Diamond Core (Belah Ketupat)"
                      onClick={() => setQrEyeBall('diamond')}
                      className={tileBtn(qrEyeBall === 'diamond')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <polygon points="12,3.5 20.5,12 12,20.5 3.5,12" fill="currentColor" />
                      </svg>
                    </button>

                    {/* Leaf Ball */}
                    <button
                      type="button"
                      title="Leaf Core (Inti Daun)"
                      onClick={() => setQrEyeBall('leaf')}
                      className={tileBtn(qrEyeBall === 'leaf')}
                    >
                      <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <path d="M 8.5 5 H 19 V 15.5 A 3.5 3.5 0 0 1 15.5 19 H 5 V 8.5 A 3.5 3.5 0 0 1 8.5 5 Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 4. Logo Center Embedding */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                      <span>Upload Logo Toko di Tengah QRIS (Opsional)</span>
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

                  <div className="flex items-center gap-3">
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition"
                    >
                      <UploadCloud className="h-4 w-4 text-slate-600" />
                      <span>{qrLogo ? 'Ganti File Logo...' : 'Pilih File Logo (PNG/SVG)...'}</span>
                    </button>

                    {qrLogo && (
                      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <img src={qrLogo} alt="Logo Toko" className="h-7 w-7 rounded-md object-contain bg-white" />
                        <span className="text-xs text-emerald-600 font-semibold">Logo Aktif</span>
                      </div>
                    )}
                  </div>

                  {qrLogo && (
                    <div className="pt-2 flex items-center gap-2">
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

                  <p className="text-[10px] text-slate-400">
                    Logo diletakkan di tengah dengan jarak clearance otomatis. Error Correction level H (30%) diaktifkan otomatis agar scanner bank/e-wallet tetap membaca cepat.
                  </p>
                </div>

                {/* 5. Colors Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-slate-500" />
                    <span>Warna Tema QRIS</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {SOLID_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setQrColor(c.hex)}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition ${
                          qrColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'border-slate-900 ring-2 ring-slate-900/20 bg-white text-slate-900 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
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

                {/* LIVE PREVIEW BOX */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center gap-5 mt-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 shrink-0 relative flex items-center justify-center">
                    {previewLoading && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                        <RotateCw className="h-5 w-5 animate-spin text-slate-800" />
                      </div>
                    )}
                    {previewQr ? (
                      <img src={previewQr} alt="Preview QRIS" className="w-40 h-40 object-contain rounded-lg" />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
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
                          Logo Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Preview Real-Time QRIS Dinamis</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      QR code di atas di-render langsung secara live sesuai bentuk icon dan logo yang dipilih.
                    </p>
                    <div className="text-[11px] font-mono text-slate-400">
                      Warna aktif: <strong className="text-slate-800">{qrColor}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Key Gateway Card */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  <label className="text-xs font-bold text-slate-900">API Key Gateway</label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Kunci rahasia untuk memproteksi panggilan REST API (Header X-API-Key).
                </p>

                {/* Active Token Box */}
                <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Token</span>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm tracking-wide overflow-x-auto select-all">
                      {loading ? 'Memuat...' : showKey ? apiKey : `${PREFIX}${'•'.repeat(Math.max(8, (apiKey || '').length - 3))}`}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyApiKey}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        <span>{copiedKey ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Token Belakang */}
                <div className="pt-2 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900">Custom Token Belakang</h3>
                  <p className="text-[11px] text-slate-500">
                    Prefix <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">{PREFIX}</code> terkunci permanen. Kamu bebas mengganti token belakangnya:
                  </p>

                  <div className="flex items-center gap-1.5">
                    {/* Locked Prefix */}
                    <span className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm shrink-0 border border-slate-800 select-none">
                      {PREFIX}
                    </span>

                    {/* Editable Suffix */}
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900 transition"
                    />

                    <button
                      type="button"
                      onClick={handleGenerateRandom}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shrink-0 transition"
                      title="Generate Token Acak"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Cara Penggunaan di Header HTTP */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Cara Penggunaan di Header HTTP:</span>
                  </div>
                  <code className="block p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
                    X-API-Key: {apiKey || `${PREFIX}YOUR_TOKEN`}
                  </code>
                </div>
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

      <footer className="pb-28 text-center text-xs text-slate-400 md:pb-8">
        SisforHub Pay &copy; 2026 • Settings Module
      </footer>
    </div>
  );
}
