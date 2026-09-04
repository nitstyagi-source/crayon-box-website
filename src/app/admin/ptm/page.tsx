import { redirect } from 'next/navigation';

export default function PtmRedirectPage() {
  redirect('/admin/parent-care?tab=ptm');
}
