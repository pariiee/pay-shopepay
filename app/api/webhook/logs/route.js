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
    // Join ke transaksi lewat payload JSON -> satu baris log tahu transaksi mana
    // yang memicunya dan URL tujuan apa yang benar-benar dipakai transaksi itu.
    const rows = db.prepare(`
      SELECT w.id, w.event, w.url, w.payload, w.response_code, w.response_body,
             w.latency_ms, w.attempts, w.created_at,
             d.id AS donation_id, d.donor_name, d.message AS donation_message,
             d.amount AS donation_amount, d.status AS donation_status,
             d.issuer, d.callback_url
      FROM webhook_logs w
      LEFT JOIN donations d ON d.id = json_extract(w.payload, '$.data.id')
      ORDER BY w.created_at DESC, w.id DESC
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
