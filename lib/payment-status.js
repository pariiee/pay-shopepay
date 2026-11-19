import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { callShopeeAPI, callShopeeDetailAPI, sendTelegramNotif } from '@/lib/shopee';
import { dispatchWebhook } from '@/lib/webhook';

// Tentukan tujuan webhook untuk satu transaksi.
// - callback_url ada        -> kirim HANYA ke URL itu
// - asal 'donate' (publik)  -> JANGAN kirim sama sekali (tidak ada merchant tujuan)
// - selain itu (baris lama) -> null = fan-out lama, dipertahankan sampai Tahap 3
function webhookTarget(donation) {
  if (donation.callback_url) return { target: donation.callback_url };
  if (donation.origin === 'donate') return { skip: true };
  return { target: null };
}

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
    const payload = {
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
    };
    return NextResponse.json({
      success: true,
      paid: true,
      status: 'paid',
      data: payload,
      donation: payload
    });
  }

  const now = Math.floor(Date.now() / 1000);
  if (donation.expires_at && now > donation.expires_at) {
    // Transisi atomik: hanya pemanggil yang benar-benar mengubah baris (changes === 1)
    // yang boleh mengirim webhook. Pemanggil lain kalah balapan -> jangan kirim.
    const changesExpired = db.prepare(
      "UPDATE donations SET status = 'expired' WHERE id = ? AND status = 'pending'"
    ).run(trxid).changes;
    const tujuanExpired = webhookTarget(donation);
    if (changesExpired === 1 && !tujuanExpired.skip) {
      dispatchWebhook('payment.expired', {
        id: donation.id,
        amount: donation.amount,
        customer_name: donation.donor_name
      }, tujuanExpired.target).catch(() => {});
    }
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

    // Transisi atomik: pemanggil yang menang balapan (changes === 1) saja yang boleh
    // mengirim notifikasi + webhook. Yang kalah (changes 0) tidak mengirim apa pun.
    const changesPaid = db.prepare(`
      UPDATE donations 
      SET status = 'paid', paid_at = ?, issuer = ?, transaction_id = ?
      WHERE id = ? AND status = 'pending'
    `).run(match.createTime, issuer, txId, trxid).changes;

    if (changesPaid === 1) {
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

      const tujuanPaid = webhookTarget(donation);
      if (!tujuanPaid.skip) {
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
        }, tujuanPaid.target).catch(() => {});
      }
    }

    const paidPayload = {
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
    };

    return NextResponse.json({
      success: true,
      paid: true,
      status: 'paid',
      data: paidPayload,
      donation: paidPayload
    });
  }

  return NextResponse.json({
    success: true,
    paid: false,
    status: donation.status || 'pending'
  });
}
