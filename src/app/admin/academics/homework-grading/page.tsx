import { redirect } from 'next/navigation';

export default function AdminAcademicsHomeworkGradingPage() {
  redirect('/admin/curriculum?tab=grading');
}
