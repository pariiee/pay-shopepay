import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { callShopeeAPI, callShopeeDetailAPI, sendTelegramNotif } from '@/lib/shopee';
import { dispatchWebhook } from '@/lib/webhook';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Parameter id wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);

    if (!donation) {
      return NextResponse.json({ success: false, error: 'Data donasi tidak ditemukan' }, { status: 404 });
    }

    if (donation.status === 'paid') {
      return NextResponse.json({
        success: true,
        paid: true,
        donation: {
          id: donation.id,
          donor_name: donation.donor_name,
          amount: donation.amount,
          issuer: donation.issuer || 'ShopeePay/QRIS',
          transaction_id: donation.transaction_id,
          paid_at: donation.paid_at
        }
      });
    }

    const now = Math.floor(Date.now() / 1000);
    // If older than 20 mins, mark expired
    if (now - donation.created_at > 1200) {
      db.prepare("UPDATE donations SET status = 'expired' WHERE id = ?").run(id);
      return NextResponse.json({ success: true, paid: false, status: 'expired' });
    }

    // Check with ShopeePay API
    const res = await callShopeeAPI(donation.created_at - 10, now + 10, 30);
    const list = res?.data?.list || [];

    const targetAmount = donation.amount;
    const match = list.find((item) => {
      const parsedAmt = parseInt(String(item.amount || '0').replace(/[\.,]/g, ''), 10) || 0;
      return item.status === 3 && parsedAmt === targetAmount && item.createTime >= donation.created_at - 10;
    });

    if (match) {
      const txId = match.transactionId || match.displayTransactionId;
      let issuer = 'QRIS';

      try {
        const detail = await callShopeeDetailAPI(txId);
        if (detail?.code === 0 && detail.data?.issuer) {
          issuer = detail.data.issuer;
        }
      } catch (e) {
        console.warn('Detail fetch error:', e.message);
      }

      db.prepare(`
        UPDATE donations 
        SET status = 'paid', paid_at = ?, issuer = ?, transaction_id = ?
        WHERE id = ?
      `).run(match.createTime, issuer, txId, id);

      // Kirim Notifikasi Telegram
      sendTelegramNotif(
        `🎉 <b>DONASI / PEMBAYARAN MASUK!</b>\n\n` +
        `💰 <b>Nominal:</b> Rp ${new Intl.NumberFormat('id-ID').format(donation.amount)}\n` +
        `👤 <b>Donatur:</b> ${donation.donor_name}\n` +
        `💬 <b>Pesan:</b> ${donation.message || '-'}\n` +
        `🏦 <b>Metode:</b> ${issuer}\n` +
        `🆔 <b>ID Transaksi:</b> <code>${txId}</code>\n` +
        `⏰ <b>Waktu:</b> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
      ).catch(() => {});

      // Dispatch Webhook Event payment.paid
      dispatchWebhook('payment.paid', {
        id: donation.id,
        amount: donation.amount,
        base_amount: donation.base_amount,
        unique_code: donation.unique_code,
        customer_name: donation.donor_name,
        message: donation.message,
        issuer: issuer,
        transaction_id: txId,
        paid_at: match.createTime
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        paid: true,
        donation: {
          id: donation.id,
          donor_name: donation.donor_name,
          amount: donation.amount,
          issuer,
          transaction_id: txId,
          paid_at: match.createTime
        }
      });
    }

    return NextResponse.json({
      success: true,
      paid: false,
      status: 'pending'
    });
  } catch (err) {
    console.error('Status check error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
