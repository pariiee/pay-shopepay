import { NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { getDb } from '@/lib/db';
import { generateDynamicQRIS } from '@/lib/shopee';

export async function POST(req) {
  try {
    const body = await req.json();
    const rawAmount = parseInt(body.amount, 10);
    const donorName = (body.donor_name || 'Hamba Allah').trim().slice(0, 50);
    const message = (body.message || '').trim().slice(0, 200);

    if (isNaN(rawAmount) || rawAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimal donasi adalah Rp 100' },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    const fifteenMinsAgo = now - 900;

    // Check recent pending donations to avoid collision
    let uniqueCode = 0;
    let finalAmount = rawAmount;

    // For collision avoidance, pick an unused unique code 1-99 if there are active pending with same nominal
    const activeAmounts = db
      .prepare("SELECT amount FROM donations WHERE status = 'pending' AND created_at >= ?")
      .all(fifteenMinsAgo)
      .map((r) => r.amount);

    if (activeAmounts.includes(finalAmount)) {
      for (let i = 1; i <= 99; i++) {
        if (!activeAmounts.includes(rawAmount + i)) {
          uniqueCode = i;
          finalAmount = rawAmount + uniqueCode;
          break;
        }
      }
    }

    const staticQR = process.env.QRIS_STATIC;
    if (!staticQR) {
      return NextResponse.json(
        { success: false, error: 'QRIS_STATIC belum dikonfigurasi di server' },
        { status: 500 }
      );
    }

    const dynamicQR = generateDynamicQRIS(staticQR, finalAmount);
    const qrImage = await QRCode.toDataURL(dynamicQR, {
      width: 380,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    const donationId = crypto.randomBytes(4).toString('hex');
    const expiresAt = now + 300; // 5 minutes

    db.prepare(`
      INSERT INTO donations (id, donor_name, message, base_amount, unique_code, amount, qris_string, status, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(donationId, donorName, message, rawAmount, uniqueCode, finalAmount, dynamicQR, now, expiresAt);

    const origin = req.headers.get('origin') || 'https://pay.sisforhub.web.id';

    return NextResponse.json({
      success: true,
      data: {
        id: donationId,
        invoice_url: `${origin}/payin/${donationId}`,
        donor_name: donorName,
        message,
        base_amount: rawAmount,
        unique_code: uniqueCode,
        amount: finalAmount,
        qr_image: qrImage,
        expires_at: new Date(expiresAt * 1000).toISOString()
      }
    });
  } catch (err) {
    console.error('Error creating donation:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
