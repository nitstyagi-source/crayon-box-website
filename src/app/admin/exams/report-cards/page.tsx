import { redirect } from 'next/navigation';

export default function LegacyReportCardsRedirect() {
  redirect('/admin/exams?tab=report-cards');
}
