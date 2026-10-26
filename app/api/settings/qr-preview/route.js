import { NextResponse } from 'next/server';
import { generateStyledQrSvg } from '@/lib/qr-generator';

const DUMMY_QR = '00020101021226670016ID.CO.SHOPEE.WWW0118936000000000000000021500000000000000000303UME51440014ID.CO.QRIS.WWW021500000000000000000303UME5204549953033605802ID5912Ngecode Aje6007Jakarta61051234062070703A016304ABCD';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const body = searchParams.get('body') || searchParams.get('style') || 'square';
    const eyeFrame = searchParams.get('eyeFrame') || 'square';
    const eyeBall = searchParams.get('eyeBall') || 'square';
    const color = searchParams.get('color') || '#0f172a';
    const logo = searchParams.get('logo') || null;

    const qrImage = generateStyledQrSvg(DUMMY_QR, { body, eyeFrame, eyeBall, color, logo, size: 280 });
    return NextResponse.json({ success: true, qr_image: qrImage });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const {
      body = 'square',
      eyeFrame = 'square',
      eyeBall = 'square',
      color = '#0f172a',
      logo = null
    } = payload;

    const qrImage = generateStyledQrSvg(DUMMY_QR, { body, eyeFrame, eyeBall, color, logo, size: 280 });
    return NextResponse.json({ success: true, qr_image: qrImage });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
