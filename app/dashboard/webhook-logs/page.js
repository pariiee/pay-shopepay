import { redirect } from 'next/navigation';

export default function DashboardWebhookLogsRedirect() {
  redirect('/riwayat?tab=webhook');
}
