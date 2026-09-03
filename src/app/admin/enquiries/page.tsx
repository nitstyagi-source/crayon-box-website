import { redirect } from 'next/navigation';

export default function EnquiriesLegacyRedirect() {
  redirect('/admin/admissions?tab=pipeline');
}
