import { redirect } from 'next/navigation';

export default function GrievancesRedirectPage() {
  redirect('/admin/parent-care?tab=grievances');
}
