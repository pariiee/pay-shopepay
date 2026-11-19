import { createHmac } from 'node:crypto';
import axios from 'axios';
import { getDb, getSetting } from './db';

// Daftar URL webhook yang boleh jadi target. Sumbernya settings.webhook_urls
// (fallback legacy: webhook_url). Dipakai untuk whitelist callback_url per transaksi
// supaya API tidak bisa dipakai mengirim webhook ke URL sembarang (SSRF).
export function getWebhookUrls() {
  let urls = [];
  try {
    const raw = getSetting('webhook_urls');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) urls = parsed.filter(Boolean);
    }
  } catch (_) {}

  if (urls.length === 0) {
    const single = getSetting('webhook_url');
    if (single) urls = [single];
  }

  return urls.map((u) => String(u).trim()).filter(Boolean).slice(0, 5);
}

// Normalisasi + validasi callback_url dari request body.
// Return { url } kalau valid, atau { error } berisi pesan untuk user.
export function validateCallbackUrl(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return { url: null };
  }

  const candidate = String(value).trim();

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch (_) {
    return { error: 'callback_url bukan URL yang valid' };
  }

  if (parsed.protocol !== 'https:') {
    return { error: 'callback_url harus memakai https://' };
  }

  const allowed = getWebhookUrls();
  if (!allowed.includes(candidate)) {
    return { error: 'callback_url tidak terdaftar di daftar Webhook URL (Pengaturan)' };
  }

  return { url: candidate };
}

export async function dispatchWebhook(event, data, targetUrl = null) {
  let urls = [];
  if (targetUrl) {
    urls = [targetUrl];
  } else {
    urls = getWebhookUrls();
  }

  // Cap to max 5 URLs
  urls = urls.slice(0, 5);
  if (urls.length === 0) return null;

  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const secret = getSetting('api_key') || '';

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data
  };

  const rawBody = JSON.stringify(payload);
  const signature = createHmac('sha256', secret).update(rawBody).digest('hex');

  const sendToOne = async (url) => {
    const startTime = Date.now();
    let statusCode = 0;
    let responseText = '';
    let attempts = 0;

    for (let tryIdx = 1; tryIdx <= 3; tryIdx++) {
      attempts = tryIdx;
      try {
        const res = await axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Alpay-Webhook/1.0',
            'X-Webhook-Signature': signature
          },
          timeout: 8000
        });

        statusCode = res.status;
        responseText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        if (statusCode >= 200 && statusCode < 300) break;
      } catch (err) {
        if (err.response) {
          statusCode = err.response.status;
          responseText = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
        } else {
          statusCode = 500;
          responseText = err.message || 'Network / connection error';
        }
      }

      // If failed and still has retries left, wait 2s before retry
      if (tryIdx < 3 && (statusCode < 200 || statusCode >= 300)) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    const latency = Date.now() - startTime;

    try {
      db.prepare(`
        INSERT INTO webhook_logs (event, url, payload, response_code, response_body, latency_ms, attempts, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        event,
        url,
        rawBody,
        statusCode,
        String(responseText).slice(0, 500),
        latency,
        attempts,
        now
      );
    } catch (e) {
      console.error('Failed to save webhook log:', e.message);
    }

    return { url, statusCode, latency, attempts };
  };

  const results = await Promise.allSettled(urls.map(sendToOne));
  return results.map(r => r.status === 'fulfilled' ? r.value : { statusCode: 500 });
}
