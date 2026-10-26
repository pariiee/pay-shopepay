import { NextResponse } from 'next/server';
import { generateStyledQrSvg } from '@/lib/qr-generator';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const style = searchParams.get('style') || 'classic';
    const color = searchParams.get('color') || '#0f172a';

    // Standard EMVCo dummy string for instant realistic rendering
    const dummyQR = '00020101021226670016ID.CO.SHOPEE.WWW0118936000000000000000021500000000000000000303UME51440014ID.CO.QRIS.WWW021500000000000000000303UME5204549953033605802ID5912Ngecode Aje6007Jakarta61051234062070703A016304ABCD';
    const qrImage = generateStyledQrSvg(dummyQR, { style, color, size: 280 });

    return NextResponse.json({ success: true, qr_image: qrImage });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
