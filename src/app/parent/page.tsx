import { redirect } from 'next/navigation';

export default function ParentEntrypointPage() {
  redirect('/parent/dashboard');
}
