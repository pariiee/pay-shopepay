import { NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/auth';
import { getSetting } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const token = (body.token || body.password || '').trim();

    const expectedToken = getSetting('admin_token') || process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || 'alpay-sec-9a8b7c6d5e4f';

    // Single-field Token authentication
    if (!token || token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Token akses admin tidak valid' },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken('admin');
    const res = NextResponse.json({ success: true, message: 'Autentikasi berhasil' });

    res.cookies.set({
      name: 'pay_admin_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600 // 7 days
    });

    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
