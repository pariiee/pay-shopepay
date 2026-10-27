import { createHmac } from 'node:crypto';
import axios from 'axios';
import { getDb, getSetting } from './db';

export async function dispatchWebhook(event, data, targetUrl = null) {
  let urls = [];
  if (targetUrl) {
    urls = [targetUrl];
  } else {
    try {
      const raw = getSetting('webhook_urls');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) urls = parsed.filter(Boolean);
      }
    } catch (_) {}

    // Fallback to legacy single webhook_url if webhook_urls is empty
    if (urls.length === 0) {
      const single = getSetting('webhook_url');
      if (single) urls = [single];
    }
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
    } catch (err) {
      if (err.response) {
        statusCode = err.response.status;
        responseText = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      } else {
        statusCode = 500;
        responseText = err.message || 'Network / connection error';
      }
    }

    const latency = Date.now() - startTime;

    try {
      db.prepare(`
        INSERT INTO webhook_logs (event, url, payload, response_code, response_body, latency_ms, attempts, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(
        event,
        url,
        rawBody,
        statusCode,
        String(responseText).slice(0, 500),
        latency,
        now
      );
    } catch (e) {
      console.error('Failed to save webhook log:', e.message);
    }

    return { url, statusCode, latency };
  };

  const results = await Promise.allSettled(urls.map(sendToOne));
  return results.map(r => r.status === 'fulfilled' ? r.value : { statusCode: 500 });
}
