import { redirect } from 'next/navigation';

export default function FamiliesLegacyRedirect() {
  redirect('/admin/students?tab=families');
}
