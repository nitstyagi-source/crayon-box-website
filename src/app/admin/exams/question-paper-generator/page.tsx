import { redirect } from 'next/navigation';

export default function LegacyQuestionPaperRedirect() {
  redirect('/admin/exams?tab=question-papers');
}
