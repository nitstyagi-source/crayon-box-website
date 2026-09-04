import { redirect } from 'next/navigation';

export default function TransportOptimizerRedirectPage() {
  redirect('/admin/transport?tab=optimizer');
}
