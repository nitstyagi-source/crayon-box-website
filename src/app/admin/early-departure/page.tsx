import { redirect } from 'next/navigation';

export default function EarlyDepartureRedirectPage() {
  redirect('/admin/visitors?tab=gate-pass');
}
