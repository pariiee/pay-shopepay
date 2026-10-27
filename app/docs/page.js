'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, KeyRound, Check, Copy, 
  ChevronDown, ChevronRight, Play, X, ShieldCheck, Terminal, AlertCircle,
  FileCode, Download, ExternalLink, Lock, CheckCircle2
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const LIME = '#d8f53b';

const OPENAPI_YAML_TEXT = `openapi: 3.0.3
info:
  title: Alpay Gateway API
  description: API Gateway Pembayaran Dinamis ShopeePay QRIS & Webhook Callback
  version: 1.0.0
servers:
  - url: /
    description: Production Server

paths:
  /payments:
    post:
      summary: Create payment
      description: Membuat tagihan pembayaran dynamic QRIS berlaku 5 menit
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - amount
              properties:
                amount:
                  type: integer
                  description: Nominal pembayaran (min 100)
                  example: 25000
                fee:
                  type: integer
                  description: Biaya admin tambahan (opsional)
                  example: 0
                customer_name:
                  type: string
                  description: Nama pelanggan atau donatur
                  example: Budi Santoso
                note:
                  type: string
                  description: Catatan transaksi
                  example: Pembelian Paket VIP
                valid_minutes:
                  type: integer
                  description: Masa berlaku invoice dalam menit
                  example: 5
      responses:
        '200':
          description: Payment created
        '400':
          description: Invalid request parameters
        '401':
          description: Invalid or missing API key

  /payments/{trxid}/status:
    get:
      summary: Check payment status
      description: Memeriksa status real-time pembayaran dari ID transaksi
      parameters:
        - name: trxid
          in: path
          required: true
          description: Transaction ID
          schema:
            type: string
            example: 26114d00
      responses:
        '200':
          description: Payment status retrieved
        '404':
          description: Transaction not found

  /payments/{trxid}/cancel:
    post:
      summary: Cancel transaction
      description: Cancels a pending transaction. Cannot cancel transactions that are already paid or expired.
      security:
        - ApiKeyAuth: []
      parameters:
        - name: trxid
          in: path
          required: true
          description: Transaction ID to cancel
          schema:
            type: string
            example: trhczp
      responses:
        '200':
          description: Transaction canceled
        '401':
          description: Invalid API key
        '403':
          description: Email not verified
        '404':
          description: Transaction not found
        '409':
          description: Already paid / already expired, cannot cancel

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
`;

export default function DocsPage() {
  const [baseUrl, setBaseUrl] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
  }, []);
  const [openEndpoint, setOpenEndpoint] = useState(null);
  const [copied, setCopied] = useState(null);
  const [apiKey, setApiKey] = useState('al-ez7dpzxdh6');

  // Interactive Try It Out state for Endpoint 1: Create
  const [createAmount, setCreateAmount] = useState('25000');
  const [createFee, setCreateFee] = useState('0');
  const [createCustomer, setCreateCustomer] = useState('Budi Santoso');
  const [createNote, setCreateNote] = useState('Pembelian Paket VIP');
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [createLatency, setCreateLatency] = useState(0);

  // Interactive Try It Out state for Endpoint 2: Status
  const [statusTrxId, setStatusTrxId] = useState('26114d00');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusLatency, setStatusLatency] = useState(0);

  // Interactive Try It Out state for Endpoint 3: Cancel
  const [cancelTrxId, setCancelTrxId] = useState('trhczp');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);
  const [cancelLatency, setCancelLatency] = useState(0);

  // Webhook Language Tab
  const [webhookLang, setWebhookLang] = useState('python');

  useEffect(() => {
    fetch('/api/settings/active-key')
      .then(res => res.json())
      .then(data => {
        if (data?.success && data.api_key) setApiKey(data.api_key);
      })
      .catch(() => {});
  }, []);

  const copyCode = async (id, code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {}
  };

  const toggleEndpoint = (key) => {
    setOpenEndpoint(openEndpoint === key ? null : key);
  };

  // Run Create Payment
  const runCreate = async () => {
    setCreateLoading(true);
    setCreateResult(null);
    const start = performance.now();
    try {
      const res = await fetch('/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          amount: Number(createAmount) || 1000,
          fee: Number(createFee) || 0,
          customer_name: createCustomer,
          note: createNote,
          valid_minutes: 5
        })
      });
      const data = await res.json();
      setCreateLatency(Math.round(performance.now() - start));
      setCreateResult({ status: res.status, data });
    } catch (err) {
      setCreateLatency(Math.round(performance.now() - start));
      setCreateResult({ status: 500, data: { success: false, message: err.message } });
    } finally {
      setCreateLoading(false);
    }
  };

  // Run Status Check
  const runStatus = async () => {
    setStatusLoading(true);
    setStatusResult(null);
    const start = performance.now();
    try {
      const res = await fetch(`/payments/${statusTrxId.trim() || 'test'}/status`);
      const data = await res.json();
      setStatusLatency(Math.round(performance.now() - start));
      setStatusResult({ status: res.status, data });
    } catch (err) {
      setStatusLatency(Math.round(performance.now() - start));
      setStatusResult({ status: 500, data: { success: false, message: err.message } });
    } finally {
      setStatusLoading(false);
    }
  };

  // Run Cancel Transaction
  const runCancel = async () => {
    setCancelLoading(true);
    setCancelResult(null);
    const start = performance.now();
    try {
      const res = await fetch(`/payments/${cancelTrxId.trim() || 'trhczp'}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      });
      const data = await res.json();
      setCancelLatency(Math.round(performance.now() - start));
      setCancelResult({ status: res.status, data });
    } catch (err) {
      setCancelLatency(Math.round(performance.now() - start));
      setCancelResult({ status: 500, data: { success: false, message: err.message } });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-28">
      <Navbar active="docs" />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        {/* Top OpenAPI Spec Banner for Postman / Insomnia */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0" style={{ color: LIME }}>
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">OpenAPI 3.0 Specification (.yaml)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Import langsung ke Postman, Insomnia, atau Swagger Editor untuk testing REST API.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => copyCode('openapi_yaml', OPENAPI_YAML_TEXT)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              {copied === 'openapi_yaml' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copied === 'openapi_yaml' ? 'Tersalin' : 'Copy YAML'}</span>
            </button>

            <a
              href="/openapi.yaml"
              download="openapi.yaml"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5" style={{ color: LIME }} />
              <span>Download .yaml</span>
            </a>
          </div>
        </div>

        {/* Payments Category Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Payments</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              API untuk generate dynamic QRIS, pengecekan status transaksi, dan pembatalan invoice.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
            3 endpoints
          </span>
        </div>

        {/* ============================================================== */}
        {/* ENDPOINT 1: POST /payments (Create Payment) */}
        {/* ============================================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
          <div 
            onClick={() => toggleEndpoint('create')}
            className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700 border border-emerald-500/20">
                POST
              </span>
              <code className="font-mono text-sm font-bold text-slate-900">/payments</code>
              <span className="text-sm font-medium text-slate-400 hidden sm:inline">•</span>
              <span className="text-sm font-semibold text-slate-700">Create payment</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600 border border-slate-200">
                <Lock className="h-3 w-3" /> API KEY
              </span>
              {openEndpoint === 'create' ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>

          {openEndpoint === 'create' && (
            <div className="border-t border-slate-100 p-5 sm:p-6 space-y-6 text-sm">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Creates a payment valid for 5 minutes. The QR code is generated automatically from the merchant's ShopeePay QRIS. Returns <code>payment_url</code> + dynamic QR image string.
              </p>

              {/* PARAMETER TABLE */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">PARAMETER</h3>
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
                        <td className="px-4 py-3 font-mono"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">body</span></td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">number</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[11px]">yes</span></td>
                        <td className="px-4 py-3 text-slate-600">Payment amount in IDR (min 100).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">fee</td>
                        <td className="px-4 py-3 font-mono"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">body</span></td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">number</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold text-[11px]">no</span></td>
                        <td className="px-4 py-3 text-slate-600">Additional admin fee (optional, default 0).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">customer_name</td>
                        <td className="px-4 py-3 font-mono"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">body</span></td>
                        <td className="px-4 py-3 font-mono text-blue-600 font-semibold">string</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold text-[11px]">no</span></td>
                        <td className="px-4 py-3 text-slate-600">Customer or donor name.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">note</td>
                        <td className="px-4 py-3 font-mono"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">body</span></td>
                        <td className="px-4 py-3 font-mono text-blue-600 font-semibold">string</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold text-[11px]">no</span></td>
                        <td className="px-4 py-3 text-slate-600">Transaction note / message.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">valid_minutes</td>
                        <td className="px-4 py-3 font-mono"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">body</span></td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">number</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold text-[11px]">no</span></td>
                        <td className="px-4 py-3 text-slate-600">Invoice validity duration in minutes (default 5).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RESPONSES */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">RESPONSES</h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-emerald-600 px-2 py-0.5 font-mono text-xs font-bold text-white">200</span>
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">Payment created — (returns id, payment_url, qr_image, expires_at)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">400</span>
                    <span className="text-slate-700 text-xs">Invalid request parameters</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">401</span>
                    <span className="text-slate-700 text-xs">Invalid or missing X-API-Key</span>
                  </div>
                </div>
              </div>

              {/* TRY IT OUT CONSOLE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Terminal className="h-4 w-4" /> TRY IT OUT
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-slate-600">{apiKey.slice(0, 8)}..</span>
                  </div>
                </div>

                {/* cURL Box */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-500">{`>_ REQUEST`}</span>
                  <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    <button
                      onClick={() => copyCode('create_curl', `curl -X 'POST' '${baseUrl || 'https://pay.domain.com'}/payments' \\\n  -H 'accept: application/json' \\\n  -H 'Content-Type: application/json' \\\n  -H 'X-API-Key: ${apiKey}' \\\n  -d '{\n    "amount": ${createAmount || 1000},\n    "fee": ${createFee || 0},\n    "customer_name": "${createCustomer}",\n    "note": "${createNote}",\n    "valid_minutes": 5\n  }'`)}
                      className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                      title="Copy cURL"
                    >
                      {copied === 'create_curl' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">{`curl -X 'POST' '${baseUrl || 'https://pay.domain.com'}/payments' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: ${apiKey}' \\
  -d '{
    "amount": ${createAmount || 1000},
    "fee": ${createFee || 0},
    "customer_name": "${createCustomer}",
    "note": "${createNote}",
    "valid_minutes": 5
  }'`}</pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">amount</label>
                    <input
                      type="number"
                      value={createAmount}
                      onChange={(e) => setCreateAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">fee</label>
                    <input
                      type="number"
                      value={createFee}
                      onChange={(e) => setCreateFee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">customer_name</label>
                    <input
                      type="text"
                      value={createCustomer}
                      onChange={(e) => setCreateCustomer(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">note</label>
                    <input
                      type="text"
                      value={createNote}
                      onChange={(e) => setCreateNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <button
                  onClick={runCreate}
                  disabled={createLoading}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Play className={`h-3.5 w-3.5 fill-current ${createLoading ? 'animate-spin' : ''}`} />
                  <span>{createLoading ? 'Executing...' : 'Run'}</span>
                </button>

                {createResult && (
                  <div className="rounded-xl bg-slate-950 overflow-hidden text-xs font-mono shadow-md">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className={`text-[11px] font-bold ${createResult.status === 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        HTTP {createResult.status} • {createLatency} ms
                      </span>
                    </div>
                    <pre className="p-4 text-slate-300 overflow-x-auto max-h-64">
                      {JSON.stringify(createResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* ENDPOINT 2: GET /payments/:trxid/status */}
        {/* ============================================================== */}
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
              <span className="text-sm font-medium text-slate-400 hidden sm:inline">•</span>
              <span className="text-sm font-semibold text-slate-700">Check payment status</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600 border border-slate-200">
                PUBLIC
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
                Cek status real-time pembayaran dari ID transaksi unik. Mengembalikan status <code>pending</code>, <code>paid</code>, atau <code>expired</code>.
              </p>

              {/* PARAMETER TABLE */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">PARAMETER</h3>
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
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">trxid</td>
                        <td className="px-4 py-3 font-mono"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">path</span></td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">string</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[11px]">yes</span></td>
                        <td className="px-4 py-3 text-slate-600">Transaction ID to check.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RESPONSES */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">RESPONSES</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-emerald-600 px-2 py-0.5 font-mono text-xs font-bold text-white">200</span>
                    <span className="text-slate-800 text-xs font-semibold">Returns {`{ success: true, paid: boolean, status: string }`}</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">404</span>
                    <span className="text-slate-700 text-xs">Transaction not found</span>
                  </div>
                </div>
              </div>

              {/* TRY IT OUT CONSOLE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Terminal className="h-4 w-4" /> TRY IT OUT
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-500">{`>_ REQUEST`}</span>
                  <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    <button
                      onClick={() => copyCode('status_curl', `curl -X 'GET' '${baseUrl || 'https://pay.domain.com'}/payments/${statusTrxId.trim() || ':trxid'}/status' \\\n  -H 'accept: application/json'`)}
                      className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                      title="Copy cURL"
                    >
                      {copied === 'status_curl' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">{`curl -X 'GET' '${baseUrl || 'https://pay.domain.com'}/payments/${statusTrxId.trim() || ':trxid'}/status' \\
  -H 'accept: application/json'`}</pre>
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Transaction ID (:trxid)</label>
                  <input
                    type="text"
                    value={statusTrxId}
                    onChange={(e) => setStatusTrxId(e.target.value)}
                    placeholder="Contoh: 26114d00"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <button
                  onClick={runStatus}
                  disabled={statusLoading}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Play className={`h-3.5 w-3.5 fill-current ${statusLoading ? 'animate-spin' : ''}`} />
                  <span>{statusLoading ? 'Executing...' : 'Run'}</span>
                </button>

                {statusResult && (
                  <div className="rounded-xl bg-slate-950 overflow-hidden text-xs font-mono shadow-md">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className={`text-[11px] font-bold ${statusResult.status === 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        HTTP {statusResult.status} • {statusLatency} ms
                      </span>
                    </div>
                    <pre className="p-4 text-slate-300 overflow-x-auto max-h-64">
                      {JSON.stringify(statusResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* ENDPOINT 3: POST /payments/:trxid/cancel */}
        {/* ============================================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
          <div 
            onClick={() => toggleEndpoint('cancel')}
            className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700 border border-emerald-500/20">
                POST
              </span>
              <code className="font-mono text-sm font-bold text-slate-900">/payments/:trxid/cancel</code>
              <span className="text-sm font-medium text-slate-400 hidden sm:inline">•</span>
              <span className="text-sm font-semibold text-slate-700">Cancel transaction</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600 border border-slate-200">
                <Lock className="h-3 w-3" /> API KEY
              </span>
              {openEndpoint === 'cancel' ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>

          {openEndpoint === 'cancel' && (
            <div className="border-t border-slate-100 p-5 sm:p-6 space-y-6 text-sm">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Cancels a pending transaction. Cannot cancel transactions that are already paid or expired.
              </p>

              {/* PARAMETER TABLE */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">PARAMETER</h3>
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
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">trxid</td>
                        <td className="px-4 py-3 font-mono"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">path</span></td>
                        <td className="px-4 py-3 font-mono text-purple-600 font-semibold">string</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[11px]">yes</span></td>
                        <td className="px-4 py-3 text-slate-600">Transaction ID to cancel</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RESPONSES */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">RESPONSES</h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-emerald-600 px-2 py-0.5 font-mono text-xs font-bold text-white">200</span>
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">Transaction canceled — {`{ id, status: canceled, canceled_at }`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">401</span>
                    <span className="text-slate-700 text-xs">Invalid API key</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">403</span>
                    <span className="text-slate-700 text-xs">Email not verified</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">404</span>
                    <span className="text-slate-700 text-xs">Transaction not found</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">409</span>
                    <span className="text-slate-700 text-xs">Already paid / already expired, cannot cancel</span>
                  </div>
                </div>
              </div>

              {/* TRY IT OUT CONSOLE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Terminal className="h-4 w-4" /> TRY IT OUT
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-slate-600">{apiKey.slice(0, 8)}..</span>
                  </div>
                </div>

                {/* cURL Box */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-500">{`>_ REQUEST`}</span>
                  <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    <button
                      onClick={() => copyCode('cancel_curl', `curl -X 'POST' '${baseUrl || 'https://pay.domain.com'}/payments/${cancelTrxId.trim() || 'trhczp'}/cancel' \\\n  -H 'accept: application/json' \\\n  -H 'Content-Type: application/json' \\\n  -H 'X-API-Key: ${apiKey}'`)}
                      className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                      title="Copy cURL"
                    >
                      {copied === 'cancel_curl' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">{`curl -X 'POST' '${baseUrl || 'https://pay.domain.com'}/payments/${cancelTrxId.trim() || 'trhczp'}/cancel' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: ${apiKey}'`}</pre>
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">trxid</label>
                  <input
                    type="text"
                    value={cancelTrxId}
                    onChange={(e) => setCancelTrxId(e.target.value)}
                    placeholder="trhczp"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <button
                  onClick={runCancel}
                  disabled={cancelLoading}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Play className={`h-3.5 w-3.5 fill-current ${cancelLoading ? 'animate-spin' : ''}`} />
                  <span>{cancelLoading ? 'Executing...' : 'Run'}</span>
                </button>

                {cancelResult && (
                  <div className="rounded-xl bg-slate-950 overflow-hidden text-xs font-mono shadow-md">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <span className={`text-[11px] font-bold ${cancelResult.status === 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        HTTP {cancelResult.status} • {cancelLatency} ms
                      </span>
                    </div>
                    <pre className="p-4 text-slate-300 overflow-x-auto max-h-64">
                      {JSON.stringify(cancelResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* WEBHOOKS CATEGORY & LANGUAGE TABS (MATCHING image_bffe86.png) */}
        {/* ============================================================== */}
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

        {/* Webhook Signature Verification Card with Language Switcher */}
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
              <span className="text-sm font-medium text-slate-400 hidden sm:inline">•</span>
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
            <div className="border-t border-slate-100 p-5 sm:p-6 space-y-6 text-sm">
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Setiap request webhook menyertakan header <code>X-Webhook-Signature</code> — yaitu string hash <strong>HMAC-SHA256</strong> dari raw body request mentah menggunakan <code>API Key</code> Anda sebagai secret key. Verifikasi signature di server Anda dan tolak request jika tidak cocok untuk mencegah spoofing / tampered data.
              </p>

              {/* LANGUAGE TABS: Node.js | PHP | Python (image_bffe86.png) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contoh Kode Verifikasi Signature
                  </h4>

                  {/* Tabs from image_bffe86.png */}
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setWebhookLang('nodejs')}
                      className={`rounded-md px-3 py-1 transition ${
                        webhookLang === 'nodejs'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Node.js
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebhookLang('php')}
                      className={`rounded-md px-3 py-1 transition ${
                        webhookLang === 'php'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      PHP
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebhookLang('python')}
                      className={`rounded-md px-3 py-1 transition ${
                        webhookLang === 'python'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Python
                    </button>
                  </div>
                </div>

                {/* Code Window for Node.js */}
                {webhookLang === 'nodejs' && (
                  <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    <button
                      onClick={() => copyCode('code_nodejs', `const crypto = require('crypto');
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
});`)}
                      className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                      title="Copy Code"
                    >
                      {copied === 'code_nodejs' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre className="text-slate-300 overflow-x-auto">
{`const crypto = require('crypto');
const express = require('express');
const app = express();

const SECRET = 'YOUR_API_KEY'; // Kunci API Anda (misal: ${apiKey})

// Gunakan express.raw agar body tidak terubah sebelum verifikasi hash
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const received = req.headers['x-webhook-signature'];
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(req.body)
    .digest('hex');

  if (received !== expected) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  const payload = JSON.parse(req.body.toString());
  console.log('Webhook verified:', payload.event, payload.data);

  // Proses bisnis (top up saldo, aktifkan pesanan, dll)
  res.sendStatus(200);
});`}
                    </pre>
                  </div>
                )}

                {/* Code Window for PHP */}
                {webhookLang === 'php' && (
                  <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    <button
                      onClick={() => copyCode('code_php', `<?php
$rawBody = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$secret = 'YOUR_API_KEY';

$expected = hash_hmac('sha256', $rawBody, $secret);

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit(json_encode(['error' => 'Invalid signature']));
}

$payload = json_decode($rawBody, true);
// Event: $payload['event'], Data: $payload['data']
echo json_encode(['success' => true]);`)}
                      className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                      title="Copy Code"
                    >
                      {copied === 'code_php' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre className="text-slate-300 overflow-x-auto">
{`<?php
// Ambil raw payload mentah langsung dari input stream
$rawBody = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$secret = 'YOUR_API_KEY'; // Kunci API Anda (misal: ${apiKey})

$expected = hash_hmac('sha256', $rawBody, $secret);

// Gunakan hash_equals untuk mencegah timing attack
if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit(json_encode(['error' => 'Invalid signature']));
}

$payload = json_decode($rawBody, true);

// Proses event pembayaran
$event = $payload['event']; // payment.paid
$data = $payload['data'];

echo json_encode(['success' => true]);`}
                    </pre>
                  </div>
                )}

                {/* Code Window for Python */}
                {webhookLang === 'python' && (
                  <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    <button
                      onClick={() => copyCode('code_py', `import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
SECRET = b'YOUR_API_KEY'

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data() # Ambil raw bytes mentah
    expected = hmac.new(SECRET, payload, hashlib.sha256).hexdigest()

    if not signature or not hmac.compare_digest(signature, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    data = request.get_json()
    print('Webhook verified:', data['event'], data['data'])
    return jsonify({'success': True}), 200`)}
                      className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                      title="Copy Code"
                    >
                      {copied === 'code_py' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre className="text-slate-300 overflow-x-auto">
{`import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
SECRET = b'YOUR_API_KEY'  # Kunci API Anda (misal: b'${apiKey}')

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data()  # Ambil raw bytes mentah dari request body
    
    # Hitung HMAC-SHA256
    expected = hmac.new(SECRET, payload, hashlib.sha256).hexdigest()

    # Cegah timing-attack dengan compare_digest
    if not signature or not hmac.compare_digest(signature, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    data = request.get_json()
    print(f"Event: {data.get('event')}, ID: {data.get('data', {}).get('id')}")
    
    # Jalankan logika bisnis pesanan di sini
    return jsonify({'success': True}), 200`}
                    </pre>
                  </div>
                )}
              </div>

              {/* Sample Webhook Event Payload */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sample Event Payload (payment.paid)
                </h4>
                <div className="relative rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                  <pre className="text-slate-300 overflow-x-auto">
{`{
  "event": "payment.paid",
  "data": {
    "id": "26114d00",
    "amount": 25012,
    "base_amount": 25000,
    "unique_code": 12,
    "customer_name": "Pak Budi",
    "message": "Pembelian Paket VIP",
    "issuer": "ShopeePay",
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
      </main>

      <footer className="pb-28 text-center text-xs text-slate-400 md:pb-8">
        Alpay &copy; 2026 • Interactive API Docs
      </footer>
    </div>
  );
}
