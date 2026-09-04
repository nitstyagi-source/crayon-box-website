import { redirect } from 'next/navigation';

export default function CampaignsRedirectPage() {
  redirect('/admin/communications?tab=campaigns');
}
