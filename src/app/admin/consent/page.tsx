import { redirect } from 'next/navigation';

export default function ConsentRedirectPage() {
  redirect('/admin/parent-care?tab=consent');
}
