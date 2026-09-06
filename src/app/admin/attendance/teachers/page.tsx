import { redirect } from "next/navigation";

export default function AttendanceTeachersRedirect() {
  redirect("/admin/attendance?tab=staff");
}
