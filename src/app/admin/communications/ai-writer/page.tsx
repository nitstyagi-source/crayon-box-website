import { redirect } from 'next/navigation';

export default function AiWriterRedirectPage() {
  redirect('/admin/communications?tab=ai-writer');
}
