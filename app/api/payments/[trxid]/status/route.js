import { checkPaymentStatus } from '@/lib/payment-status';

export async function GET(req, { params }) {
  const { trxid } = await params;
  return checkPaymentStatus(trxid);
}
