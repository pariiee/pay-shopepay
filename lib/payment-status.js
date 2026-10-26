import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { callShopeeAPI, callShopeeDetailAPI, sendTelegramNotif } from '@/lib/shopee';
import { dispatchWebhook } from '@/lib/webhook';

export async function checkPaymentStatus(trxid) {
  if (!trxid) {
    return NextResponse.json({ success: false, error: 'Parameter trxid wajib diisi' }, { status: 400 });
  }

  const db = getDb();
  const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(trxid);

  if (!donation) {
    return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
  }

  if (donation.status === 'paid') {
    return NextResponse.json({
      success: true,
      paid: true,
      status: 'paid',
      data: {
        id: donation.id,
        customer_name: donation.donor_name,
        base_amount: donation.base_amount,
        fee: donation.fee || 0,
        unique_code: donation.unique_code,
        amount: donation.amount,
        issuer: donation.issuer || 'ShopeePay/QRIS',
        transaction_id: donation.transaction_id,
        paid_at: donation.paid_at,
        created_at: donation.created_at,
        expires_at: donation.expires_at
      }
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (donation.expires_at && now > donation.expires_at) {
    db.prepare("UPDATE donations SET status = 'expired' WHERE id = ?").run(trxid);
    dispatchWebhook('payment.expired', {
      id: donation.id,
      amount: donation.amount,
      customer_name: donation.donor_name
    }).catch(() => {});
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
    `).run(match.createTime, issuer, txId, trxid);

    sendTelegramNotif(
      `🎉 <b>PEMBAYARAN DITERIMA!</b>\n\n` +
      `💰 <b>Total:</b> Rp ${new Intl.NumberFormat('id-ID').format(donation.amount)}\n` +
      `💵 <b>Nominal:</b> Rp ${new Intl.NumberFormat('id-ID').format(donation.base_amount)}\n` +
      (donation.fee ? `💳 <b>Fee:</b> Rp ${new Intl.NumberFormat('id-ID').format(donation.fee)}\n` : '') +
      (donation.unique_code ? `🔢 <b>Kode Unik:</b> ${donation.unique_code}\n` : '') +
      `👤 <b>Pelanggan:</b> ${donation.donor_name}\n` +
      `💬 <b>Catatan:</b> ${donation.message || '-'}\n` +
      `🏦 <b>Metode:</b> ${issuer}\n` +
      `🆔 <b>ID Transaksi:</b> <code>${txId}</code>\n` +
      `⏰ <b>Waktu:</b> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
    ).catch(() => {});

    dispatchWebhook('payment.paid', {
      id: donation.id,
      amount: donation.amount,
      base_amount: donation.base_amount,
      fee: donation.fee || 0,
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
      status: 'paid',
      data: {
        id: donation.id,
        customer_name: donation.donor_name,
        base_amount: donation.base_amount,
        fee: donation.fee || 0,
        unique_code: donation.unique_code,
        amount: donation.amount,
        issuer,
        transaction_id: txId,
        paid_at: match.createTime,
        created_at: donation.created_at,
        expires_at: donation.expires_at
      }
    });
  }

  return NextResponse.json({
    success: true,
    paid: false,
    status: donation.status || 'pending'
  });
}
