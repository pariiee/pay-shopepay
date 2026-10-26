'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, KeyRound, Terminal, Code2, 
  CheckCircle2, Copy, Check, ShieldCheck, Zap
} from 'lucide-react';

const LIME = '#d8f53b';

export default function DocsPage() {
  const [lang, setLang] = useState('curl');
  const [copied, setCopied] = useState(null);

  const copyCode = async (id, code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-[#e9edf2] text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900" style={{ color: LIME }}>
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">API Documentation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white">
            Dashboard
          </Link>
          <Link href="/pay" className="rounded-full px-4 py-2 text-xs font-bold transition shadow-sm" style={{ background: LIME, color: '#0f172a' }}>
            Static Pay Link
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-4 sm:px-6 flex-1">
        {/* Intro */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Integrasi REST API SisforHub Pay
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Dokumentasi resmi integrasi payment gateway ShopeePay QRIS dinamis berbasis stateless EMVCo. Buat tagihan instan dan verifikasi pembayaran otomatis dari backend aplikasi Anda.
          </p>

          <div className="mt-5 flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="font-bold text-slate-900">Base URL:</span>
            <span>https://pay.sisforhub.web.id</span>
          </div>
        </div>

        {/* Authentication */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="h-4 w-4 text-slate-900" />
            <h2 className="text-lg font-bold text-slate-900">Autentikasi Header</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Semua endpoint terproteksi mewajibkan pengiriman header <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">X-API-Key</code>. Kunci dapat Anda temukan di menu Dashboard &gt; API Keys.
          </p>
          <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
            X-API-Key: YOUR_API_KEY
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 rounded-full bg-slate-200/80 p-1 text-xs w-fit">
          {['curl', 'javascript', 'php'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-full px-4 py-1.5 font-bold uppercase transition ${
                lang === l ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l === 'curl' ? 'cURL' : l === 'javascript' ? 'Node.js / Next' : 'PHP (Laravel)'}
            </button>
          ))}
        </div>

        {/* Endpoint 1: Create Payment */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs px-2.5 py-1">POST</span>
              <code className="font-mono text-sm font-bold text-slate-900">/api/payments/create</code>
            </div>
            <span className="text-xs text-slate-500">Generate QRIS Dinamis + Link</span>
          </div>

          <p className="text-xs text-slate-600">
            Membuat tagihan baru dengan masa berlaku 5 menit (atau custom), menyuntikkan nominal pas & kode unik, serta mengembalikan URL checkout dan base64 QR image.
          </p>

          <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
            <button
              onClick={() => copyCode('code1', lang === 'curl' ? codeCreateCurl : lang === 'javascript' ? codeCreateJs : codeCreatePhp)}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition"
            >
              {copied === 'code1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied === 'code1' ? 'Tersalin' : 'Salin'}</span>
            </button>

            <pre className="pt-2 leading-relaxed">
              {lang === 'curl' ? codeCreateCurl : lang === 'javascript' ? codeCreateJs : codeCreatePhp}
            </pre>
          </div>
        </div>

        {/* Endpoint 2: Check Status */}
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 text-blue-800 font-mono font-bold text-xs px-2.5 py-1">GET</span>
              <code className="font-mono text-sm font-bold text-slate-900">/payments/:trxid/status</code>
            </div>
            <span className="text-xs text-slate-500">Auto-check Verifikasi Mutasi</span>
          </div>

          <p className="text-xs text-slate-600">
            Mengecek apakah pelanggan sudah melakukan transfer ke QRIS. Jika lunas, otomatis mengembalikan status lunas, issuer (GoPay/DANA/BCA), dan nomor resi Shopee.
          </p>

          <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
            <button
              onClick={() => copyCode('code2', codeStatusCurl)}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition"
            >
              {copied === 'code2' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied === 'code2' ? 'Tersalin' : 'Salin'}</span>
            </button>

            <pre className="pt-2 leading-relaxed">{codeStatusCurl}</pre>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-300/60">
        SisforHub Pay &copy; 2026 • Documentation Center
      </footer>
    </div>
  );
}

const codeCreateCurl = `curl -X POST https://pay.sisforhub.web.id/api/payments/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "amount": 10000,
    "customer_name": "Budi Santoso",
    "note": "Pembelian Paket VIP",
    "valid_minutes": 5
  }'`;

const codeCreateJs = `const res = await fetch('https://pay.sisforhub.web.id/api/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    amount: 10000,
    customer_name: 'Budi Santoso',
    note: 'Invoice #1024',
    valid_minutes: 5
  })
});

const { data } = await res.json();
console.log('Payment Link:', data.payment_url);
console.log('Total Tagihan:', data.amount);`;

const codeCreatePhp = `<?php
$client = new \GuzzleHttp\Client();
$response = $client->post('https://pay.sisforhub.web.id/api/payments/create', [
    'headers' => [
        'X-API-Key' => 'YOUR_API_KEY',
        'Content-Type' => 'application/json'
    ],
    'json' => [
        'amount' => 10000,
        'customer_name' => 'Budi Santoso',
        'note' => 'Order #1024',
        'valid_minutes' => 5
    ]
]);

$result = json_decode($response->getBody(), true);
$paymentUrl = $result['data']['payment_url'];
header("Location: " . $paymentUrl);`;

const codeStatusCurl = `curl -X GET "https://pay.sisforhub.web.id/payments/trx_123456/status"

# Response Lunas (200 OK):
{
  "success": true,
  "paid": true,
  "data": {
    "id": "trx_123456",
    "status": "paid",
    "base_amount": 10000,
    "fee": 500,
    "unique_code": 12,
    "amount": 10512,
    "issuer": "Gopay",
    "transaction_id": "108986732659845433"
  }
}`;
