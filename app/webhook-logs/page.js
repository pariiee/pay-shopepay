import { redirect } from 'next/navigation';

export default function WebhookLogsRedirect() {
  redirect('/riwayat?tab=webhook');
}
