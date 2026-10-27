import { NextResponse } from 'next/server';
import { getDb, getSetting } from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const apiKey = req.headers.get('x-api-key');
    const validKey = getSetting('api_key', process.env.API_KEY || 'al-yra7890ia8');
    if (apiKey && apiKey !== validKey) {
      return NextResponse.json({ success: false, code: 401, message: 'Invalid API key' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const row = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
    if (!row) {
      return NextResponse.json({
        success: false,
        code: 404,
        message: 'Transaction not found',
        meta: {
          timestamp: Math.floor(Date.now() / 1000),
          version: '1.0.0'
        }
      }, { status: 404 });
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = row.expires_at || (row.created_at + 300);
    if (row.status === 'paid' || row.status === 'expired' || now > expiresAt) {
      return NextResponse.json({
        success: false,
        code: 409,
        message: 'Already paid / already expired, cannot cancel',
        meta: {
          timestamp: now,
          version: '1.0.0'
        }
      }, { status: 409 });
    }

    db.prepare("UPDATE donations SET status = 'cancelled' WHERE id = ?").run(id);

    return NextResponse.json({
      success: true,
      id,
      status: 'canceled',
      canceled_at: now
    });
  } catch (err) {
    return NextResponse.json({ success: false, code: 500, message: err.message }, { status: 500 });
  }
}
