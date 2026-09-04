import { redirect } from 'next/navigation';

export default function LibraryCirculationRedirectPage() {
  redirect('/admin/library?tab=circulation');
}
