'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

let shopeeToken = process.env.SHOPEE_TOKEN || '';
const apiKey = process.env.API_KEY || '';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
const telegramChatID = process.env.TELEGRAM_CHAT_ID || '';
const qrisStatic = process.env.QRIS_STATIC || '';

const qrisStore = new Map();
const usedTransactionIds = new Map();

let tokenValid = true;
let tokenNotifSent = false;
const logs = [];
const MAX_LOGS = 100;

function logEvent(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
  logs.push({ timestamp, level, message });
  if (logs.length > MAX_LOGS) logs.shift();
}

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
];

function randomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

const statusMap = {
  1: 'pending',
  2: 'failed',
  3: 'success',
  4: 'refunded',
  5: 'expired'
};

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

function apiKeyMiddleware(req, res, next) {
  const clientKey = req.headers['x-api-key'] || req.query.api_key;
  if (!clientKey || clientKey !== apiKey) {
    return res.status(401).json({ success: false, error: 'Invalid or missing API key' });
  }
  next();
}

function getReqToken(req) {
  return req.headers['x-shopee-token'] || shopeeToken;
}

function formatTransaction(tx) {
  const date = new Date(tx.createTime * 1000);
  const wibDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${wibDate.getUTCFullYear()}-${pad(wibDate.getUTCMonth() + 1)}-${pad(wibDate.getUTCDate())} ${pad(wibDate.getUTCHours())}:${pad(wibDate.getUTCMinutes())}:${pad(wibDate.getUTCSeconds())}`;
  const rawAmount = String(tx.amount || '0').replace(/\./g, '').replace(/,/g, '');
  const amount = parseInt(rawAmount, 10) || 0;
  const status = statusMap[tx.status] || `unknown_${tx.status}`;
  return {
    amount,
    status,
    time: timeStr
  };
}

async function callShopeeAPI(startTime, endTime, pageSize, nextPosition, token = shopeeToken) {
  const payload = {
    data: {
      metadata: {
        token,
        language: 'id',
        timezone: 'Asia/Jakarta'
      },
      pageSize,
      filter: {
        startTime,
        endTime,
        serviceList: [1, 3]
      },
      sorter: {
        field: 'createTime',
        order: 'descend'
      },
      next_position: nextPosition || ''
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://partner.shopee.co.id',
    'Referer': 'https://partner.shopee.co.id/',
    'User-Agent': randomUA(),
    'X-Timestamp-Ms': String(Date.now())
  };

  const res = await axios.post(
    'https://shopeepay.shopee.co.id/merchant/v1/partner-web/get-transaction-list',
    payload,
    { headers, timeout: 20000 }
  );
  return res.data;
}

async function callShopeeDetailAPI(order_sn, token = shopeeToken) {
  const payload = {
    data: {
      metadata: {
        token,
        language: 'id',
        timezone: 'Asia/Jakarta'
      },
      order_sn
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://partner.shopee.co.id',
    'Referer': 'https://partner.shopee.co.id/',
    'User-Agent': randomUA(),
    'X-Timestamp-Ms': String(Date.now())
  };

  const res = await axios.post(
    'https://shopeepay.shopee.co.id/merchant/v1/partner-web/get-transaction-detail',
    payload,
    { headers, timeout: 20000 }
  );
  return res.data;
}

async function sendTelegramNotif(text) {
  if (!telegramBotToken || !telegramChatID) {
    console.log('[TELEGRAM] Bot token atau chat ID belum diset');
    return;
  }
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  try {
    await axios.post(
      url,
      {
        chat_id: telegramChatID,
        text,
        parse_mode: 'HTML'
      },
      { timeout: 10000 }
    );
    console.log('[TELEGRAM] Notif sent');
  } catch (err) {
    console.error('[TELEGRAM] Send failed:', err.message);
  }
}

function parseTLV(str) {
  const tags = [];
  let i = 0;
  while (i < str.length) {
    if (i + 4 > str.length) break;
    const tag = str.slice(i, i + 2);
    const len = parseInt(str.slice(i + 2, i + 4), 10);
    if (isNaN(len)) break;
    i += 4;
    if (i + len > str.length) break;
    const val = str.slice(i, i + len);
    i += len;
    tags.push([tag, val]);
  }
  return tags;
}

function buildTLV(tags) {
  let out = '';
  for (const [tag, val] of tags) {
    out += tag + String(val.length).padStart(2, '0') + val;
  }
  return out;
}

function crc16CCITT(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generateDynamicQRIS(staticQR, amount) {
  if (!staticQR) throw new Error('QRIS_STATIC belum diset di .env');
  const tags = parseTLV(staticQR);
  if (tags.length === 0) throw new Error('invalid QRIS format');

  const newTags = [];
  let tag54Found = false;

  for (const [tag, val] of tags) {
    if (tag === '63') continue;
    if (tag === '54') {
      newTags.push(['54', String(amount)]);
      tag54Found = true;
      continue;
    }
    newTags.push([tag, val]);
  }

  if (!tag54Found) {
    const inserted = [];
    for (const item of newTags) {
      inserted.push(item);
      if (item[0] === '53') {
        inserted.push(['54', String(amount)]);
      }
    }
    newTags.length = 0;
    newTags.push(...inserted);
  }

  let payload = buildTLV(newTags) + '6304';
  const crc = crc16CCITT(payload);
  return payload + crc;
}

async function checkToken() {
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - 3600;
  const endTime = now;

  try {
    const res = await callShopeeAPI(startTime, endTime, 1, '');
    if (!res || res.code !== 0) {
      const msg = res ? res.msg : 'Invalid response format';
      logEvent('ERROR', `Token invalid: ${msg}`);
      tokenValid = false;
      if (!tokenNotifSent) {
        await sendTelegramNotif(`⚠️ <b>Shopee API</b>\n\nToken invalid: ${msg}\n\nUpdate token via POST /update-token`);
        tokenNotifSent = true;
      }
      return;
    }
    logEvent('INFO', 'Token valid');
    tokenValid = true;
    tokenNotifSent = false;
  } catch (err) {
    logEvent('ERROR', `Token check failed: ${err.message}`);
    tokenValid = false;
    if (!tokenNotifSent) {
      await sendTelegramNotif(`⚠️ <b>Shopee API</b>\n\nToken error: ${err.message}\n\nUpdate token via POST /update-token`);
      tokenNotifSent = true;
    }
  }
}

function startTokenChecker() {
  checkToken();
  setInterval(checkToken, 5 * 60 * 1000);
}

// Routes
app.get('/', (req, res) => {
  res.send('Shoppe API Running');
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ShopeePay API Service is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/update-token', apiKeyMiddleware, (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'Provide token in body' });
  shopeeToken = token;
  logEvent('INFO', 'Token updated via API');
  res.json({
    success: true,
    data: { message: 'Token updated' }
  });
});

app.get('/token-status', apiKeyMiddleware, (req, res) => {
  res.json({
    success: tokenValid,
    data: {
      token_status: tokenValid ? 'valid' : 'invalid',
      message: tokenValid ? 'Token is working' : 'Token expired/invalid. Please update via POST /update-token'
    }
  });
});

app.post('/create-qris', apiKeyMiddleware, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Provide valid amount (positive integer)' });
  }

  try {
    const qrisData = generateDynamicQRIS(qrisStatic, amount);
    const qrId = crypto.randomBytes(4).toString('hex');
    const expiresAt = new Date(Date.now() + (15 * 60 * 1000));
    qrisStore.set(qrId, {
      data: qrisData,
      expiresAt
    });

    const host = req.get('host');
    const proto = req.protocol;
    const qris_url = `${proto}://${host}/qr/${qrId}`;

    const wibDate = new Date(expiresAt.getTime() + (7 * 60 * 60 * 1000));
    const pad = (n) => String(n).padStart(2, '0');
    const expires_at = `${wibDate.getUTCFullYear()}-${pad(wibDate.getUTCMonth() + 1)}-${pad(wibDate.getUTCDate())} ${pad(wibDate.getUTCHours())}:${pad(wibDate.getUTCMinutes())}:${pad(wibDate.getUTCSeconds())}`;

    res.json({
      success: true,
      data: {
        qris_url,
        amount,
        expires_at,
        expires_in: '15 menit'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/qr/:id', (req, res) => {
  const item = qrisStore.get(req.params.id);
  if (!item) return res.status(404).send('QR not found');
  if (Date.now() > item.expiresAt.getTime()) {
    qrisStore.delete(req.params.id);
    return res.status(410).send('QR expired');
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(item.data)}`;
  res.redirect(302, qrImageUrl);
});

app.get('/transactions', apiKeyMiddleware, async (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  let startTime = parseInt(req.query.startTime, 10);
  let endTime = parseInt(req.query.endTime, 10);
  let pageSize = parseInt(req.query.pageSize, 10);
  const nextPosition = req.query.next_position || '';

  if (isNaN(startTime) || startTime === 0) startTime = now - (3 * 24 * 3600);
  if (isNaN(endTime) || endTime === 0) endTime = now;
  if (isNaN(pageSize) || pageSize === 0) pageSize = 10;

  const token = getReqToken(req);

  try {
    const result = await callShopeeAPI(startTime, endTime, pageSize, nextPosition, token);
    if (!result) return res.status(500).json({ success: false, error: 'Empty response from ShopeePay API' });
    if (result.code !== 0) return res.status(400).json({ success: false, error: result.msg || `API error code ${result.code}` });

    const list = (result.data && result.data.list) || [];
    const transactions = [];

    for (const tx of list) {
      const formatted = formatTransaction(tx);
      try {
        const detail = await callShopeeDetailAPI(tx.displayTransactionId || tx.transactionId, token);
        if (detail && detail.code === 0 && detail.data) {
          formatted.issuer = detail.data.issuer;
        }
      } catch (err) {
        logEvent('ERROR', `Error checking detail for ${tx.transactionId}: ${err.message}`);
      }
      transactions.push(formatted);
    }

    res.json({
      success: true,
      total_amount: (result.data && result.data.totalNetSales) || '0',
      data: { transactions }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/transactions/all', apiKeyMiddleware, async (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0) - (7 * 3600 * 1000));
  const startTs = Math.floor(startOfMonth.getTime() / 1000);
  const endTs = Math.floor(now.getTime() / 1000);

  const allTx = [];
  let nextPos = '';
  const pageSize = 100;
  const token = getReqToken(req);

  try {
    while (true) {
      const result = await callShopeeAPI(startTs, endTs, pageSize, nextPos, token);
      if (!result) return res.status(500).json({ success: false, error: 'Empty response from ShopeePay API' });
      if (result.code !== 0) return res.status(400).json({ success: false, error: result.msg || `API error code ${result.code}` });

      const list = (result.data && result.data.list) || [];
      for (const tx of list) {
        const formatted = formatTransaction(tx);
        try {
          const detail = await callShopeeDetailAPI(tx.displayTransactionId || tx.transactionId, token);
          if (detail && detail.code === 0 && detail.data) {
            formatted.issuer = detail.data.issuer;
          }
        } catch (err) {
          logEvent('ERROR', `Error checking detail for ${tx.transactionId}: ${err.message}`);
        }
        allTx.push(formatted);
      }

      if (!result.data || !result.data.next_position || list.length < pageSize) break;
      nextPos = result.data.next_position;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const pad = (n) => String(n).padStart(2, '0');
    const startWib = new Date(startOfMonth.getTime() + (7 * 3600 * 1000));
    const nowWib = new Date(now.getTime() + (7 * 3600 * 1000));
    const period = `${startWib.getUTCFullYear()}-${pad(startWib.getUTCMonth() + 1)}-${pad(startWib.getUTCDate())} s/d ${nowWib.getUTCFullYear()}-${pad(nowWib.getUTCMonth() + 1)}-${pad(nowWib.getUTCDate())}`;

    res.json({
      success: true,
      total_amount: String(allTx.length),
      data: {
        period,
        total_count: allTx.length,
        transactions: allTx
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/check-payment', apiKeyMiddleware, async (req, res) => {
  const { amount, startTime } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Provide valid amount (positive integer)' });
  }

  const token = getReqToken(req);
  const nowTs = Math.floor(Date.now() / 1000);
  let searchStart = parseInt(startTime, 10);
  if (isNaN(searchStart) || searchStart === 0) {
    searchStart = nowTs - (30 * 60);
  }

  logEvent('INFO', `Memulai pengecekan pembayaran stateless. Nominal: Rp ${amount}, Waktu Mulai: ${new Date(searchStart * 1000).toISOString()}`);

  try {
    const result = await callShopeeAPI(searchStart, nowTs, 50, '', token);
    if (!result) {
      logEvent('ERROR', 'Respons dari ShopeePay API kosong.');
      return res.status(500).json({ success: false, error: 'Empty response from ShopeePay API' });
    }
    if (result.code !== 0) {
      logEvent('ERROR', `API ShopeePay mengembalikan kode ${result.code}: ${result.msg}`);
      return res.status(400).json({ success: false, error: result.msg || `API error code ${result.code}` });
    }

    const list = (result.data && result.data.list) || [];
    const targetAmount = Number(amount);

    const match = list.find((item) => {
      const rawAmt = String(item.amount || '0').replace(/\./g, '').replace(/,/g, '');
      const parsedAmt = parseInt(rawAmt, 10) || 0;
      const txId = item.transactionId || item.displayTransactionId;
      return item.status === 3 && parsedAmt === targetAmount && item.createTime >= searchStart && !usedTransactionIds.has(txId);
    });

    if (!match) {
      logEvent('INFO', `Pengecekan selesai. Nominal Rp ${amount} BELUM ditemukan.`);
      return res.json({ success: true, paid: false });
    }

    const txId = match.transactionId || match.displayTransactionId;
    usedTransactionIds.set(txId, match.createTime);

    const oneDayAgo = Math.floor(Date.now() / 1000) - (24 * 3600);
    for (const [k, ts] of usedTransactionIds.entries()) {
      if (ts < oneDayAgo) usedTransactionIds.delete(k);
    }

    logEvent('INFO', `Pencocokan berhasil! Transaksi ditemukan: ${txId}. Mengambil detail...`);
    const formatted = formatTransaction(match);

    try {
      const detail = await callShopeeDetailAPI(match.displayTransactionId || match.transactionId, token);
      if (detail && detail.code === 0 && detail.data) {
        formatted.issuer = detail.data.issuer;
      }
    } catch (err) {
      logEvent('WARN', `Gagal mengambil detail transaksi ${match.transactionId}: ${err.message}`);
    }

    logEvent('INFO', `Pembayaran terverifikasi lunas via ${formatted.issuer || 'ShopeePay/QRIS'}.`);
    res.json({
      success: true,
      paid: true,
      transaction: {
        transactionId: match.transactionId || match.displayTransactionId,
        amount: formatted.amount,
        status: formatted.status,
        time: formatted.time,
        issuer: formatted.issuer || 'QRIS / ShopeePay'
      }
    });
  } catch (err) {
    logEvent('ERROR', `Pengecekan gagal karena exception: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/logs', apiKeyMiddleware, (req, res) => {
  res.json({
    success: true,
    data: { logs }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ShopeePay API (express) running at http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  POST /update-token       - Update ShopeeToken');
    console.log('  GET  /token-status       - Check ShopeeToken Validity status');
    console.log('  POST /create-qris        - Generate Dynamic QRIS from static template');
    console.log('  GET  /qr/:id             - Fetch Dynamic QRIS Image Redirect');
    console.log('  GET  /transactions       - Fetch transactions list');
    console.log('  GET  /transactions/all   - Fetch all transactions of the month');

    if (shopeeToken && apiKey) {
      startTokenChecker();
    } else {
      console.warn('WARNING: SHOPEE_TOKEN and API_KEY must be set in .env to run checks.');
    }
  });
}

module.exports = {
  app,
  parseTLV,
  buildTLV,
  crc16CCITT,
  generateDynamicQRIS,
  formatTransaction,
  statusMap
};
