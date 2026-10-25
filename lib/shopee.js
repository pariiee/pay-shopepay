import axios from 'axios';

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
];

export function randomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export function parseTLV(str) {
  const tags = [];
  let i = 0;
  while (i < str.length) {
    if (i + 4 > str.length) break;
    const tag = str.slice(i, i + 2);
    const len = parseInt(str.slice(i + 2, i + 4), 10);
    if (isNaN(len)) break;
    i += 4;
    if (i + len > str.length) break;
    tags.push([tag, str.slice(i, i + len)]);
    i += len;
  }
  return tags;
}

export function buildTLV(tags) {
  return tags.reduce((acc, [tag, val]) => acc + tag + String(val.length).padStart(2, '0') + val, '');
}

export function crc16CCITT(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generateDynamicQRIS(staticQR, amount) {
  if (!staticQR) throw new Error('QRIS_STATIC belum diset di .env');
  const tags = parseTLV(staticQR);
  if (tags.length === 0) throw new Error('Format QRIS statis tidak valid');

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
      if (item[0] === '53') inserted.push(['54', String(amount)]);
    }
    newTags.length = 0;
    newTags.push(...inserted);
  }

  const payload = buildTLV(newTags) + '6304';
  return payload + crc16CCITT(payload);
}

export async function callShopeeAPI(startTime, endTime, pageSize = 20, nextPosition = '', token = process.env.SHOPEE_TOKEN) {
  if (!token) throw new Error('SHOPEE_TOKEN belum dikonfigurasi di .env');
  
  const payload = {
    data: {
      metadata: { token, language: 'id', timezone: 'Asia/Jakarta' },
      pageSize,
      filter: { startTime, endTime, serviceList: [1, 3] },
      sorter: { field: 'createTime', order: 'descend' },
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

export async function callShopeeDetailAPI(order_sn, token = process.env.SHOPEE_TOKEN) {
  if (!token) throw new Error('SHOPEE_TOKEN belum dikonfigurasi di .env');
  
  const payload = {
    data: {
      metadata: { token, language: 'id', timezone: 'Asia/Jakarta' },
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

export async function sendTelegramNotif(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      },
      { timeout: 10000 }
    );
  } catch (err) {
    console.error('Telegram dispatch error:', err.message);
  }
}

