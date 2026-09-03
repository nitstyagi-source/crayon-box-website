import { Metadata } from 'next';
import { HomeworkAnnotationDesk } from '@/components/innovations/HomeworkAnnotationDesk';

export const metadata: Metadata = {
  title: 'Homework Annotation Desk | Crayon Box ERP',
  description: 'Evaluate parent notebook photo uploads with digital ink annotations.',
};

export default function AdminAcademicsHomeworkGradingPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <HomeworkAnnotationDesk />
    </div>
  );
}
