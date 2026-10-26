'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, KeyRound, Check, Copy, 
  ChevronDown, ChevronRight, Play
} from 'lucide-react';

const LIME = '#d8f53b';

export default function DocsPage() {
  const [openEndpoint, setOpenEndpoint] = useState('create');
  const [copied, setCopied] = useState(null);
  const [tryOutActive, setTryOutActive] = useState(false);
  const [testAmount, setTestAmount] = useState('25000');
  const [testFee, setTestFee] = useState('1000');
  const [testCustomer, setTestCustomer] = useState('Pak Tester');
  const [testApiKey, setTestApiKey] = useState('al-yra7890ia8');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const copyCode = async (id, code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {}
  };

  const handleTestCreate = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': testApiKey
        },
        body: JSON.stringify({
          amount: Number(testAmount) || 1000,
          fee: Number(testFee) || 0,
          customer_name: testCustomer,
          valid_minutes: 5
        })
      });
      const data = await res.json();
      setTestResult({ status: res.status, data });
    } catch (err) {
      setTestResult({ status: 500, data: { error: err.message } });
    } finally {
      setTestLoading(false);
    }
  };

  const toggleEndpoint = (key) => {
    setOpenEndpoint(openEndpoint === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-900 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900" style={{ color: LIME }}>
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight">API Reference</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block font-mono text-xs px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 border border-slate-200">
              https://pay.sisforhub.web.id
            </span>
            <Link 
              href="/api-keys" 
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <KeyRound className="h-3 w-3" />
              <span>API Keys</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        {/* Payments Category Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Payments</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              API untuk pembuatan invoice tagihan, dynamic QRIS, dan cek status mutasi.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
            3 endpoints
          </span>
        </div>

        {/* ENDPOINT 1: POST /payments */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
          {/* Endpoint Bar */}
          <div 
            onClick={() => toggleEndpoint('create')}
            className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700 border border-emerald-500/20">
                POST
              </span>
              <code className="font-mono text-sm font-bold text-slate-900">/payments</code>
              <span className="text-sm font-medium text-slate-600 hidden sm:inline">•</span>
              <span className="text-sm font-semibold text-slate-700">Create payment</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600 border border-slate-200">
                <KeyRound className="h-3 w-3" /> API KEY
              </span>
              {openEndpoint === 'create' ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {openEndpoint === 'create' && (
            <div className="border-t border-slate-100 p-5 sm:p-6 space-y-6 text-sm">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Creates a payment valid for 5 minutes. The QR code is generated automatically from the merchant\'s ShopeePay QRIS. Returns <code>payment_url</code> + dynamic QR image string.
              </p>

              {/* REQUEST BODY TABLE */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">REQUEST BODY</h3>
                  <span className="font-mono text-xs text-slate-400">application/json</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">NAME</th>
                        <th className="px-4 py-2.5">LOCATION</th>
                        <th className="px-4 py-2.5">TYPE</th>
                        <th className="px-4 py-2.5">REQUIRED</th>
                        <th className="px-4 py-2.5">DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">amount</td>
                        <td className="px-4 py-3 font-mono text-slate-500">body</td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">number</td>
                        <td className="px-4 py-3 font-bold text-rose-600">yes</td>
                        <td className="px-4 py-3 text-slate-600">Payment amount, 1 — 100.000.000.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">fee</td>
                        <td className="px-4 py-3 font-mono text-slate-500">body</td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">number</td>
                        <td className="px-4 py-3 text-slate-400">no</td>
                        <td className="px-4 py-3 text-slate-600">Additional fee charged to the customer (optional, default 0).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">customer_name</td>
                        <td className="px-4 py-3 font-mono text-slate-500">body</td>
                        <td className="px-4 py-3 font-mono text-blue-600 font-semibold">string</td>
                        <td className="px-4 py-3 text-slate-400">no</td>
                        <td className="px-4 py-3 text-slate-600">Customer or donor name (default: &quot;Hamba Allah&quot;).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">note</td>
                        <td className="px-4 py-3 font-mono text-slate-500">body</td>
                        <td className="px-4 py-3 font-mono text-blue-600 font-semibold">string</td>
                        <td className="px-4 py-3 text-slate-400">no</td>
                        <td className="px-4 py-3 text-slate-600">Transaction note / message (optional).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">valid_minutes</td>
                        <td className="px-4 py-3 font-mono text-slate-500">body</td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">number</td>
                        <td className="px-4 py-3 text-slate-400">no</td>
                        <td className="px-4 py-3 text-slate-600">Invoice validity duration in minutes (default: 5).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payload Sample Code */}
              <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                <button
                  onClick={() => copyCode('sample_json', `{\n  "amount": 25000,\n  "fee": 1000,\n  "customer_name": "Pak Tester",\n  "note": "Pembelian Paket VIP",\n  "valid_minutes": 5\n}`)}
                  className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                  title="Copy JSON"
                >
                  {copied === 'sample_json' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <pre className="text-slate-300">
{`{
  "amount": 25000,
  "fee": 1000,
  "customer_name": "Pak Tester",
  "note": "Pembelian Paket VIP",
  "valid_minutes": 5
}`}
                </pre>
              </div>

              {/* RESPONSES SECTION */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">RESPONSES</h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800">200</span>
                      <span className="font-semibold text-xs text-slate-900">Transaction created</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      id, payment_url, status, amount, base_amount, fee, unique_code, qr_string, qr_image, expires_at
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-xs font-bold text-amber-800">400</span>
                      <span className="font-semibold text-xs text-slate-900">Invalid amount or parameters</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      amount minimal Rp 100
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-100 px-2 py-0.5 font-mono text-xs font-bold text-rose-800">401</span>
                      <span className="font-semibold text-xs text-slate-900">Unauthorized</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      Invalid or missing X-API-Key
                    </span>
                  </div>
                </div>
              </div>

              {/* TRY IT OUT BUTTON & CONSOLE */}
              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => setTryOutActive(!tryOutActive)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-current" style={{ color: LIME }} />
                  <span>{tryOutActive ? 'Close Console' : 'Try it out'}</span>
                </button>

                {tryOutActive && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">X-API-Key Header</label>
                        <input
                          type="text"
                          value={testApiKey}
                          onChange={(e) => setTestApiKey(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Amount (Rp)</label>
                        <input
                          type="number"
                          value={testAmount}
                          onChange={(e) => setTestAmount(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Fee (Rp - opsional)</label>
                        <input
                          type="number"
                          value={testFee}
                          onChange={(e) => setTestFee(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
                        <input
                          type="text"
                          value={testCustomer}
                          onChange={(e) => setTestCustomer(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleTestCreate}
                      disabled={testLoading}
                      className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-xs text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {testLoading ? 'Executing...' : 'Execute POST /payments'}
                    </button>

                    {testResult && (
                      <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 overflow-x-auto">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${testResult.status === 200 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'}`}>
                            Status: {testResult.status}
                          </span>
                        </div>
                        <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ENDPOINT 2: GET /payments/:trxid/status */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
          <div 
            onClick={() => toggleEndpoint('status')}
            className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-blue-500/10 px-2.5 py-1 font-mono text-xs font-bold text-blue-700 border border-blue-500/20">
                GET
              </span>
              <code className="font-mono text-sm font-bold text-slate-900">/payments/:trxid/status</code>
              <span className="text-sm font-medium text-slate-600 hidden sm:inline">•</span>
              <span className="text-sm font-semibold text-slate-700">Check payment status</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600 border border-slate-200">
                <KeyRound className="h-3 w-3" /> API KEY
              </span>
              {openEndpoint === 'status' ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>

          {openEndpoint === 'status' && (
            <div className="border-t border-slate-100 p-5 sm:p-6 space-y-6 text-sm">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Cek status real-time transaksi tagihan berdasarkan parameter <code>:trxid</code>. Otomatis memeriksa mutasi ShopeePay Partner dan menandai lunas/expired.
              </p>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">PATH PARAMETERS</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">NAME</th>
                        <th className="px-4 py-2.5">TYPE</th>
                        <th className="px-4 py-2.5">REQUIRED</th>
                        <th className="px-4 py-2.5">DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">:trxid</td>
                        <td className="px-4 py-3 font-mono text-blue-600">string</td>
                        <td className="px-4 py-3 font-bold text-rose-600">yes</td>
                        <td className="px-4 py-3 text-slate-600">ID transaksi unik tagihan (contoh: <code>26114d00</code>).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Response */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">RESPONSE SAMPLE (200 OK)</h3>
                <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                  <button
                    onClick={() => copyCode('status_json', `{\n  "success": true,\n  "paid": true,\n  "status": "paid",\n  "data": {\n    "id": "26114d00",\n    "customer_name": "Pak Tester",\n    "base_amount": 25000,\n    "fee": 1000,\n    "unique_code": 12,\n    "amount": 26012,\n    "issuer": "DANA",\n    "transaction_id": "101196058878630531",\n    "paid_at": 1792998022\n  }\n}`)}
                    className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                  >
                    {copied === 'status_json' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <pre className="text-slate-300">
{`{
  "success": true,
  "paid": true,
  "status": "paid",
  "data": {
    "id": "26114d00",
    "customer_name": "Pak Tester",
    "base_amount": 25000,
    "fee": 1000,
    "unique_code": 12,
    "amount": 26012,
    "issuer": "DANA",
    "transaction_id": "101196058878630531",
    "paid_at": 1792998022
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ENDPOINT 3: POST /payments/:trxid/cancel */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
          <div 
            onClick={() => toggleEndpoint('cancel')}
            className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-700 border border-rose-500/20">
                POST
              </span>
              <code className="font-mono text-sm font-bold text-slate-900">/payments/:trxid/cancel</code>
              <span className="text-sm font-medium text-slate-600 hidden sm:inline">•</span>
              <span className="text-sm font-semibold text-slate-700">Cancel transaction</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600 border border-slate-200">
                <KeyRound className="h-3 w-3" /> API KEY
              </span>
              {openEndpoint === 'cancel' ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>

          {openEndpoint === 'cancel' && (
            <div className="border-t border-slate-100 p-5 sm:p-6 space-y-4 text-sm">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Membatalkan transaksi pembayaran pending secara manual sehingga tidak dapat dibayar lagi.
              </p>
              <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                <pre>{`curl -X POST "https://pay.sisforhub.web.id/payments/26114d00/cancel"`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Webhook Category Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 pt-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Webhooks</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Notifikasi HTTP POST otomatis ke server Anda saat transaksi dibayar atau expired.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
            HMAC-SHA256
          </span>
        </div>

        {/* Webhook Signature Verification Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
          <div 
            onClick={() => toggleEndpoint('webhook_verify')}
            className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-purple-500/10 px-2.5 py-1 font-mono text-xs font-bold text-purple-700 border border-purple-500/20">
                SECURITY
              </span>
              <code className="font-mono text-sm font-bold text-slate-900">X-Webhook-Signature</code>
              <span className="text-sm font-medium text-slate-600 hidden sm:inline">•</span>
              <span className="text-sm font-semibold text-slate-700">Verify webhook signatures</span>
            </div>

            <div className="flex items-center gap-2">
              {openEndpoint === 'webhook_verify' ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>

          {openEndpoint === 'webhook_verify' && (
            <div className="border-t border-slate-100 p-5 sm:p-6 space-y-5 text-sm">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Setiap pengiriman webhook menyertakan header <code>X-Webhook-Signature</code> — yaitu HMAC-SHA256 dari body request mentah menggunakan <code>API Key</code> Anda sebagai secret key. Hitung signature di server Anda dan tolak request jika tidak cocok.
              </p>

              {/* Node.js verification example */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Contoh Verifikasi (Node.js Express)</h4>
                <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                  <pre className="text-slate-300">
{`const crypto = require('crypto');
const express = require('express');
const app = express();

const SECRET = 'YOUR_API_KEY'; // Kunci API Anda

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const received = req.headers['x-webhook-signature'];
  const expected = crypto.createHmac('sha256', SECRET).update(req.body).digest('hex');

  if (received !== expected) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  const payload = JSON.parse(req.body.toString());
  console.log('Webhook verified:', payload.event, payload.data);
  res.sendStatus(200);
});`}
                  </pre>
                </div>
              </div>

              {/* PHP verification example */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Contoh Verifikasi (PHP / Laravel)</h4>
                <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                  <pre className="text-slate-300">
{`$rawBody = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$secret = 'YOUR_API_KEY';

$expected = hash_hmac('sha256', $rawBody, $secret);

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}

$data = json_decode($rawBody, true);
// Proses event: $data['event'] & $data['data']`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
