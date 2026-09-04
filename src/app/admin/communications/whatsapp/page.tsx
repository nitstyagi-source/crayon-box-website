import { redirect } from 'next/navigation';

export default function WhatsAppRedirectPage() {
  redirect('/admin/communications?tab=whatsapp');
}
