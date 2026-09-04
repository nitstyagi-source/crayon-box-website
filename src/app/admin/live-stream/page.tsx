import { redirect } from 'next/navigation';

export default function LiveStreamRedirectPage() {
  redirect('/admin/visitors?tab=cctv');
}
