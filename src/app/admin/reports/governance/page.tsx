import { redirect } from 'next/navigation';

export default function GovernanceMISAnalyticsRedirect() {
  redirect('/admin/trust?tab=analytics');
}
