import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID transaksi wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const donation = db.prepare('SELECT status FROM donations WHERE id = ?').get(id);

    if (!donation) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    if (donation.status === 'paid') {
      return NextResponse.json({ success: false, error: 'Transaksi sudah lunas, tidak dapat dibatalkan' }, { status: 400 });
    }

    db.prepare("UPDATE donations SET status = 'cancelled' WHERE id = ?").run(id);

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dibatalkan'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
