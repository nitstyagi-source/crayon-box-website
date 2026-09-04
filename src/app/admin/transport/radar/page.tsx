import { redirect } from 'next/navigation';

export default function TransportRadarRedirectPage() {
  redirect('/admin/transport?tab=radar');
}
