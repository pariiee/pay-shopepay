import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const db = getDb();

    const row = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
    if (!row) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (row.status === 'paid') {
      return NextResponse.json({ success: false, error: 'Transaction already paid' }, { status: 400 });
    }

    db.prepare("UPDATE donations SET status = 'cancelled' WHERE id = ?").run(id);

    return NextResponse.json({
      success: true,
      message: 'Transaction cancelled successfully',
      id
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
