import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, donor_name, message, amount, issuer, paid_at
      FROM donations
      WHERE status = 'paid'
      ORDER BY paid_at DESC
      LIMIT 20
    `).all();

    const summary = db.prepare(`
      SELECT COUNT(*) as total_donors, COALESCE(SUM(amount), 0) as total_amount
      FROM donations
      WHERE status = 'paid'
    `).get();

    return NextResponse.json({
      success: true,
      data: {
        summary,
        donations: rows
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
