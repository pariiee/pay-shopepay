import crypto from 'crypto';

function getSecret() {
  return process.env.API_KEY || 'sisforhub-secret-key-2026';
}

export function createSessionToken(username) {
  const ts = Date.now();
  const payload = `${username}:${ts}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function verifySessionToken(token) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [username, tsStr, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(`${username}:${tsStr}`).digest('hex');
    if (sig !== expectedSig) return false;

    // 7 days expiration
    const ts = parseInt(tsStr, 10);
    if (isNaN(ts) || Date.now() - ts > 7 * 24 * 3600 * 1000) return false;

    return true;
  } catch (_) {
    return false;
  }
}
