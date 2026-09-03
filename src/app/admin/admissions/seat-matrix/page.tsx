import { Metadata } from 'next';
import { SeatMatrixWaitlistDesk } from '@/components/innovations/SeatMatrixWaitlistDesk';

export const metadata: Metadata = {
  title: 'Seat Matrix & Waitlist Radar | Crayon Box ERP',
  description: 'Dynamic seat inventory and waitlist quota manager across admissions pools.',
};

export default function AdminAdmissionsSeatMatrixPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <SeatMatrixWaitlistDesk />
    </div>
  );
}
