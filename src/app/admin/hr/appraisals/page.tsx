import { Metadata } from 'next';
import { StaffAppraisalMatrixDesk } from '@/components/innovations/StaffAppraisalMatrixDesk';

export const metadata: Metadata = {
  title: 'Staff Appraisal Matrix | Vani ERP',
  description: '360° faculty performance appraisal and annual increment recommendations.',
};

export default function AdminHrAppraisalsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <StaffAppraisalMatrixDesk />
    </div>
  );
}
