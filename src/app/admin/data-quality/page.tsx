import { redirect } from 'next/navigation';

export default function DataQualityAuditRedirect() {
  redirect('/admin/iam?tab=data-quality');
}
