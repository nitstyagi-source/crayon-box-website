import { redirect } from 'next/navigation';

export default function VisitorsGatePassRedirectPage() {
  redirect('/admin/visitors?tab=gate-pass');
}
