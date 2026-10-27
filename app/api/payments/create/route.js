import { NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { getDb, getSetting } from '@/lib/db';
import { generateDynamicQRIS } from '@/lib/shopee';
import { generateStyledQrSvg } from '@/lib/qr-generator';

export async function POST(req) {
  try {
    const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const currentApiKey = getSetting('api_key', process.env.API_KEY || 'al-yra7890ia8');

    if (currentApiKey && apiKeyHeader !== currentApiKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing X-API-Key' }, { status: 401 });
    }

    const body = await req.json();
    const rawAmount = parseInt(body.amount, 10);
    const fee = Math.max(0, parseInt(body.fee, 10) || 0);
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
    const subtotal = rawAmount + fee;
    let uniqueCode = 0;
    let finalAmount = subtotal;
    const isUniqueCodeOn = getSetting('unique_code_enabled', '1') === '1';
    const maxCode = parseInt(getSetting('unique_code_max', '99'), 10) || 99;

    if (isUniqueCodeOn) {
      const activeAmounts = db
        .prepare("SELECT amount FROM donations WHERE status = 'pending' AND created_at >= ?")
        .all(now - expireSec)
        .map((r) => r.amount);

      if (activeAmounts.includes(subtotal)) {
        for (let i = 1; i <= maxCode; i++) {
          if (!activeAmounts.includes(subtotal + i)) {
            uniqueCode = i;
            finalAmount = subtotal + uniqueCode;
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
    const qrBody = getSetting('qr_body', 'square');
    const qrEyeFrame = getSetting('qr_eye_frame', 'square');
    const qrEyeBall = getSetting('qr_eye_ball', 'square');
    const qrColor = getSetting('qr_color', '#0f172a');
    const qrLogo = getSetting('qr_logo', null);
    const qrLogoBg = getSetting('qr_logo_bg', 'circle');
    const qrImage = generateStyledQrSvg(dynamicQR, { 
      body: qrBody, 
      eyeFrame: qrEyeFrame, 
      eyeBall: qrEyeBall, 
      color: qrColor, 
      logo: qrLogo,
      logoBg: qrLogoBg,
      size: 380 
    });

    const paymentId = crypto.randomBytes(4).toString('hex');

    db.prepare(`
      INSERT INTO donations (id, donor_name, message, base_amount, fee, unique_code, amount, qris_string, status, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(paymentId, customerName, note, rawAmount, fee, uniqueCode, finalAmount, dynamicQR, now, expiresAt);

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'pay.sisforhub.web.id';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = req.headers.get('origin') || `${proto}://${host}`;
    const paymentUrl = `${origin}/payin/${paymentId}`;
    const qrImageUrl = `${origin}/img/qr-${paymentId}.png`;

    return NextResponse.json({
      success: true,
      data: {
        id: paymentId,
        payment_url: paymentUrl,
        customer_name: customerName,
        note,
        base_amount: rawAmount,
        fee,
        unique_code: uniqueCode,
        amount: finalAmount,
        qr_image: qrImageUrl,
        valid_minutes: validMinutes,
        expires_at: new Date(expiresAt * 1000).toISOString()
      }
    });
  } catch (err) {
    console.error('Create payment error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
