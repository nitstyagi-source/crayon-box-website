import { redirect } from 'next/navigation';

export default function MultiCampusMatrixPage() {
  redirect('/admin/dashboard?tab=campuses');
}
