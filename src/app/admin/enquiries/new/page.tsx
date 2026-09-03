import { redirect } from 'next/navigation';

export default function NewEnquiryLegacyRedirect() {
  redirect('/admin/admissions?tab=walkin');
}
