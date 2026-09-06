import { redirect } from "next/navigation";

export default function StudentAttendanceScanRedirect() {
  redirect("/admin/attendance?tab=student");
}
