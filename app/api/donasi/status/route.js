import { checkPaymentStatus } from '@/lib/payment-status';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  return checkPaymentStatus(id);
}
