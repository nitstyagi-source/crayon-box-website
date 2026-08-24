import { redirect } from 'next/navigation';

export default function TeacherEntrypointPage() {
  redirect('/admin/attendance/teachers');
}
