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

    let webhookUrls = [];
    try {
      const raw = getSetting('webhook_urls', '[]');
      if (raw) webhookUrls = JSON.parse(raw);
    } catch (_) {}
    if (webhookUrls.length === 0 && getSetting('webhook_url')) {
      webhookUrls = [getSetting('webhook_url')];
    }

    return NextResponse.json({
      success: true,
      data: {
        store_name: getSetting('store_name', 'Ngecode Aje'),
        unique_code_enabled: getSetting('unique_code_enabled', '1') === '1',
        unique_code_max: parseInt(getSetting('unique_code_max', '99'), 10),
        api_key: getSetting('api_key', process.env.API_KEY || 'al-yra7890ia8'),
        webhook_url: getSetting('webhook_url', ''),
        webhook_urls: webhookUrls,
        qr_style: getSetting('qr_style', 'classic'),
        qr_color: getSetting('qr_color', '#0f172a')
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
    if (body.webhook_url !== undefined) setSetting('webhook_url', body.webhook_url.trim());
    if (body.webhook_urls !== undefined && Array.isArray(body.webhook_urls)) {
      const sanitized = body.webhook_urls.map(u => String(u || '').trim()).filter(Boolean).slice(0, 5);
      setSetting('webhook_urls', JSON.stringify(sanitized));
      if (sanitized.length > 0) setSetting('webhook_url', sanitized[0]);
    }
    if (body.qr_style !== undefined) setSetting('qr_style', body.qr_style);
    if (body.qr_color !== undefined) setSetting('qr_color', body.qr_color);

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil disimpan' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
