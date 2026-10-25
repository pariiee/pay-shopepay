import { NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'ngecodeaje2026';

    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);
    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: 'pay_admin_session',
      value: token,
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
