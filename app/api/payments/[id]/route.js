import { NextResponse } from 'next/server';
import { getDb, getSetting } from '@/lib/db';
import { generateStyledQrSvg } from '@/lib/qr-generator';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const row = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);

    if (!row) {
      return NextResponse.json({ success: false, error: 'Tagihan tidak ditemukan' }, { status: 404 });
    }

    const qrBody = getSetting('qr_body', 'square');
    const qrEyeFrame = getSetting('qr_eye_frame', 'square');
    const qrEyeBall = getSetting('qr_eye_ball', 'square');
    const qrColor = getSetting('qr_color', '#0f172a');
    const qrLogo = getSetting('qr_logo', null);
    const qrLogoBg = getSetting('qr_logo_bg', 'circle');
    const qrImage = generateStyledQrSvg(row.qris_string, { 
      body: qrBody, 
      eyeFrame: qrEyeFrame, 
      eyeBall: qrEyeBall, 
      color: qrColor, 
      logo: qrLogo,
      logoBg: qrLogoBg,
      size: 380 
    });

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = row.expires_at || (row.created_at + 300); // 5 mins fallback
    const isExpired = row.status === 'expired' || (row.status === 'pending' && now > expiresAt);
    const origin = req.headers.get('origin') || 'https://pay.sisforhub.web.id';
    const qrImageUrl = `${origin}/img/qr-${row.id}.png`;

    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        store_name: getSetting('store_name', 'Ngecode Aje'),
        customer_name: row.donor_name,
        note: row.message,
        base_amount: row.base_amount,
        fee: row.fee || 0,
        unique_code: row.unique_code,
        amount: row.amount,
        status: isExpired && row.status === 'pending' ? 'expired' : row.status,
        qr_image: qrImageUrl,
        created_at: row.created_at,
        expires_at: expiresAt,
        paid_at: row.paid_at,
        issuer: row.issuer,
        transaction_id: row.transaction_id
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
