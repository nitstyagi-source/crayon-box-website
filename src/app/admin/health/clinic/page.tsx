import { redirect } from 'next/navigation';

export default function HealthClinicRedirectPage() {
  redirect('/admin/health?tab=clinic');
}
