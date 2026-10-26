import { redirect } from 'next/navigation';

export default function DashboardTransactionsRedirect() {
  redirect('/riwayat?tab=qris');
}
