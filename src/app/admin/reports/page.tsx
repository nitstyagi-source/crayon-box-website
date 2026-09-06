import { redirect } from 'next/navigation';

export default function TrustIntelligenceReportsPage() {
  redirect('/admin/trust?tab=analytics');
}
