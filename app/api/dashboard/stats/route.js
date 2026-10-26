import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { callShopeeAPI } from '@/lib/shopee';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('pay_admin_session')?.value;
    if (!verifySessionToken(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const now = Math.floor(Date.now() / 1000);

    // Auto-update pending transactions that have expired
    try {
      db.prepare(`
        UPDATE donations 
        SET status = 'expired' 
        WHERE status = 'pending' 
          AND (
            (expires_at IS NOT NULL AND expires_at < ?)
            OR (expires_at IS NULL AND created_at < ? - 1200)
          )
      `).run(now, now);
    } catch (_) {}
    
    // Overall Stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_tx,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as total_pending,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as total_expired,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as total_cancelled,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_volume,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN unique_code ELSE 0 END), 0) as total_unique_fees
      FROM donations
    `).get();

    // Recent 50 transactions
    const transactions = db.prepare(`
      SELECT 
        id, donor_name, message, base_amount, fee, unique_code, amount, 
        status, issuer, transaction_id, created_at, expires_at, paid_at
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
