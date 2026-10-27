import { NextResponse } from 'next/server';
import { getDb, getSetting } from '@/lib/db';
import { generateStyledQrSvg } from '@/lib/qr-generator';
import QRCode from 'qrcode';

let sharp;
try {
  sharp = require('sharp');
} catch (_) {}

export async function GET(req, { params }) {
  try {
    const { filename } = await params;
    // Extracts ID from e.g. qr-ghtqqzyr.png -> ghtqqzyr, qr-26114d00 -> 26114d00
    const id = filename.replace(/^qr-/, '').replace(/\.(png|svg|jpg|jpeg)$/i, '');

    const db = getDb();
    const row = db.prepare('SELECT qris_string, status, created_at, expires_at FROM donations WHERE id = ?').get(id);

    if (!row || !row.qris_string) {
      return new NextResponse('QR Not Found', { status: 404 });
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = row.expires_at || (row.created_at + 300);
    const isPaid = row.status === 'paid';
    const isExpired = row.status === 'expired' || (row.status === 'pending' && now > expiresAt);
    const isCancelled = row.status === 'cancelled' || row.status === 'canceled';

    // Otomatis tolak / hapus akses gambar jika transaksi sudah lunas, expired, atau dibatalkan
    if (isPaid || isCancelled || isExpired) {
      if (row.status === 'pending' && isExpired) {
        db.prepare("UPDATE donations SET status = 'expired' WHERE id = ?").run(id);
      }
      return new NextResponse('QR Not Available (Already Paid, Expired, or Cancelled)', { 
        status: 404,
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Cloudflare-CDN-Cache-Control': 'no-store'
        }
      });
    }

    const qrBody = getSetting('qr_body', 'square');
    const qrEyeFrame = getSetting('qr_eye_frame', 'square');
    const qrEyeBall = getSetting('qr_eye_ball', 'square');
    const qrColor = getSetting('qr_color', '#0f172a');
    const qrLogo = getSetting('qr_logo', null);
    const qrLogoBg = getSetting('qr_logo_bg', 'circle');

    const svg = generateStyledQrSvg(row.qris_string, {
      body: qrBody,
      eyeFrame: qrEyeFrame,
      eyeBall: qrEyeBall,
      color: qrColor,
      logo: qrLogo,
      logoBg: qrLogoBg,
      size: 420,
      rawSvg: true
    });

    // If .svg format explicitly requested
    if (filename.toLowerCase().endsWith('.svg')) {
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Cloudflare-CDN-Cache-Control': 'no-store'
        }
      });
    }

    // Convert styled SVG directly into high-res PNG
    if (sharp) {
      try {
        const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
        return new NextResponse(pngBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'CDN-Cache-Control': 'no-store',
            'Cloudflare-CDN-Cache-Control': 'no-store'
          }
        });
      } catch (e) {
        console.warn('Sharp SVG conversion warning:', e.message);
      }
    }

    // Safe fallback to native QRCode PNG buffer
    const fallbackPng = await QRCode.toBuffer(row.qris_string, {
      type: 'png',
      width: 420,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: qrColor || '#0f172a',
        light: '#ffffff'
      }
    });

    return new NextResponse(fallbackPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return new NextResponse(err.message, { status: 500 });
  }
}
