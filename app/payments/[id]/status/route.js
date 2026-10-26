import { checkPaymentStatus } from '@/lib/payment-status';

export async function GET(req, { params }) {
  const { id } = await params;
  return checkPaymentStatus(id);
}
