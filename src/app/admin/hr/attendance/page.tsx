import { redirect } from "next/navigation";

export default function HrAttendanceRedirect() {
  redirect("/admin/attendance?tab=staff");
}
