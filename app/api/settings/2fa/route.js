import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import QRCode from 'qrcode';
import { getSetting, setSetting } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { generateTotpSecret, verifyTOTP, getOtpAuthUrl } from '@/lib/totp';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('pay_admin_session')?.value;
  if (!verifySessionToken(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const enabled = getSetting('totp_enabled', '0') === '1';
  let secret = getSetting('totp_secret', '');

  // If not enabled or no secret, generate a fresh candidate secret for setup
  if (!enabled || !secret) {
    secret = generateTotpSecret(16);
  }

  const otpAuthUrl = getOtpAuthUrl(secret, 'admin', 'Alpay');
  const qrDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    margin: 2,
    width: 256,
    color: { dark: '#0f172a', light: '#ffffff' }
  });

  return NextResponse.json({
    success: true,
    data: {
      enabled,
      secret,
      qr_data_url: qrDataUrl,
      otpauth_url: otpAuthUrl
    }
  });
}

export async function POST(req) {
  const cookieStore = await cookies();
  const session = cookieStore.get('pay_admin_session')?.value;
  if (!verifySessionToken(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, secret, code } = await req.json();

    if (action === 'enable') {
      if (!secret || !code) {
        return NextResponse.json({ success: false, error: 'Secret dan kode 6 digit diperlukan' }, { status: 400 });
      }

      const isValid = verifyTOTP(secret, code, 1);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Kode 2FA tidak valid atau salah' }, { status: 400 });
      }

      setSetting('totp_secret', secret);
      setSetting('totp_enabled', '1');

      return NextResponse.json({ success: true, message: 'Google Authenticator 2FA berhasil diaktifkan!' });
    }

    if (action === 'disable') {
      const currentSecret = getSetting('totp_secret', '');
      const isValid = verifyTOTP(currentSecret, code, 1);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Kode 2FA tidak valid untuk konfirmasi penonaktifan' }, { status: 400 });
      }

      setSetting('totp_enabled', '0');
      setSetting('totp_secret', '');

      return NextResponse.json({ success: true, message: '2FA berhasil dinonaktifkan' });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
