import { redirect } from "next/navigation";

export default function AttendanceCheckinRedirect() {
  redirect("/admin/attendance?tab=student");
}
