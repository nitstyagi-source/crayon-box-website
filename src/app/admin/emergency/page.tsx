import { redirect } from 'next/navigation';

export default function EmergencyRedirectPage() {
  redirect('/admin/visitors?tab=emergency');
}
