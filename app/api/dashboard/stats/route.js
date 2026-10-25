import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { callShopeeAPI } from '@/lib/shopee';

export async function GET(req) {
  try {
    const db = getDb();
    
    // Overall Stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_tx,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as total_pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as total_cancelled,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_volume,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN unique_code ELSE 0 END), 0) as total_unique_fees
      FROM donations
    `).get();

    // Recent 50 transactions
    const transactions = db.prepare(`
      SELECT 
        id, donor_name, message, base_amount, unique_code, amount, 
        status, issuer, transaction_id, created_at, paid_at
      FROM donations
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    // Token Check
    let tokenStatus = 'valid';
    try {
      const now = Math.floor(Date.now() / 1000);
      const res = await callShopeeAPI(now - 3600, now, 1);
      if (!res || res.code !== 0) tokenStatus = 'invalid';
    } catch (_) {
      tokenStatus = 'invalid';
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        token_status: tokenStatus,
        transactions
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
