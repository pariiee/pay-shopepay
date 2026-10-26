import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('pay_admin_session')?.value;
  if (!verifySessionToken(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, event, url, payload, response_code, response_body, latency_ms, attempts, created_at
      FROM webhook_logs
      ORDER BY created_at DESC, id DESC
      LIMIT 50
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        logs: rows
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
