import { NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { getDb, getSetting } from '@/lib/db';
import { generateDynamicQRIS } from '@/lib/shopee';

export async function POST(req) {
  try {
    const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const currentApiKey = getSetting('api_key', process.env.API_KEY || 'al-yra7890ia8');

    if (currentApiKey && apiKeyHeader !== currentApiKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing X-API-Key' }, { status: 401 });
    }

    const body = await req.json();
    const rawAmount = parseInt(body.amount, 10);
    const customerName = (body.customer_name || body.donor_name || 'Pelanggan').trim().slice(0, 50);
    const note = (body.note || body.message || '').trim().slice(0, 200);
    const validMinutes = parseInt(body.valid_minutes, 10) || 5; // Default 5 minutes

    if (isNaN(rawAmount) || rawAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimal nominal adalah Rp 100' },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    const expireSec = validMinutes * 60;
    const expiresAt = now + expireSec;

    // Unique Code calculation
    let uniqueCode = 0;
    let finalAmount = rawAmount;
    const isUniqueCodeOn = getSetting('unique_code_enabled', '1') === '1';
    const maxCode = parseInt(getSetting('unique_code_max', '99'), 10) || 99;

    if (isUniqueCodeOn) {
      const activeAmounts = db
        .prepare("SELECT amount FROM donations WHERE status = 'pending' AND created_at >= ?")
        .all(now - expireSec)
        .map((r) => r.amount);

      if (activeAmounts.includes(finalAmount)) {
        for (let i = 1; i <= maxCode; i++) {
          if (!activeAmounts.includes(rawAmount + i)) {
            uniqueCode = i;
            finalAmount = rawAmount + uniqueCode;
            break;
          }
        }
      }
    }

    const staticQR = process.env.QRIS_STATIC;
    if (!staticQR) {
      return NextResponse.json({ success: false, error: 'QRIS_STATIC belum dikonfigurasi' }, { status: 500 });
    }

    const dynamicQR = generateDynamicQRIS(staticQR, finalAmount);
    const qrImage = await QRCode.toDataURL(dynamicQR, {
      width: 380,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    const paymentId = crypto.randomBytes(4).toString('hex');

    db.prepare(`
      INSERT INTO donations (id, donor_name, message, base_amount, unique_code, amount, qris_string, status, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(paymentId, customerName, note, rawAmount, uniqueCode, finalAmount, dynamicQR, now, expiresAt);

    const origin = req.headers.get('origin') || 'https://pay.sisforhub.web.id';
    const paymentUrl = `${origin}/payin/${paymentId}`;

    return NextResponse.json({
      success: true,
      data: {
        id: paymentId,
        payment_url: paymentUrl,
        customer_name: customerName,
        note,
        base_amount: rawAmount,
        unique_code: uniqueCode,
        amount: finalAmount,
        qr_image: qrImage,
        valid_minutes: validMinutes,
        expires_at: new Date(expiresAt * 1000).toISOString()
      }
    });
  } catch (err) {
    console.error('Create payment error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
