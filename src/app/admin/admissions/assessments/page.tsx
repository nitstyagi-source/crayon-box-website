import { Metadata } from 'next';
import { ParentAssessmentBookingDesk } from '@/components/innovations/ParentAssessmentBookingDesk';

export const metadata: Metadata = {
  title: 'Parent Assessment Booking | Vani ERP',
  description: 'Self-service admissions interview and assessment scheduling calendar.',
};

export default function AdminAdmissionsAssessmentsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <ParentAssessmentBookingDesk />
    </div>
  );
}
