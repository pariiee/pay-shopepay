import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSetting, setSetting } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('pay_admin_session')?.value;
  if (!verifySessionToken(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      store_name: getSetting('store_name', 'Ngecode Aje'),
      unique_code_enabled: getSetting('unique_code_enabled', '1') === '1',
      unique_code_max: parseInt(getSetting('unique_code_max', '99'), 10),
      api_key: getSetting('api_key', process.env.API_KEY || 'ngecodeaje-secret-2026')
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
    const body = await req.json();
    if (body.store_name !== undefined) setSetting('store_name', body.store_name);
    if (body.unique_code_enabled !== undefined) setSetting('unique_code_enabled', body.unique_code_enabled ? '1' : '0');
    if (body.unique_code_max !== undefined) setSetting('unique_code_max', String(body.unique_code_max));
    if (body.api_key !== undefined && body.api_key.trim()) setSetting('api_key', body.api_key.trim());

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil disimpan' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
