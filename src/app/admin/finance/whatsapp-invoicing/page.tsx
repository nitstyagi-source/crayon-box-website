import { Metadata } from 'next';
import { WhatsAppInvoicingCenter } from '@/components/innovations/WhatsAppInvoicingCenter';

export const metadata: Metadata = {
  title: 'WhatsApp UPI Invoicing | Crayon Box ERP',
  description: 'Automated quarterly fee invoices with 1-click Razorpay/UPI deep links.',
};

export default function AdminFinanceWhatsAppInvoicingPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <WhatsAppInvoicingCenter />
    </div>
  );
}
