import axios from 'axios';
import { getDb, getSetting } from './db';

export async function dispatchWebhook(event, data, targetUrl = null) {
  const url = targetUrl || getSetting('webhook_url');
  if (!url) return null;

  const db = getDb();
  const startTime = Date.now();
  let statusCode = 0;
  let responseText = '';
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data
  };

  try {
    const res = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SisforHub-Pay-Webhook/1.0'
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
      JSON.stringify(payload),
      statusCode,
      String(responseText).slice(0, 500),
      latency,
      now
    );
  } catch (e) {
    console.error('Failed to save webhook log:', e.message);
  }

  return { statusCode, latency };
}
