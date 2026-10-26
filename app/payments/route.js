import { POST as createPayment } from '@/app/api/payments/create/route';

export async function POST(req) {
  return createPayment(req);
}
