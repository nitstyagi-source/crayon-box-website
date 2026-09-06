import { redirect } from "next/navigation";

export default function AttendanceSettingsRedirect() {
  redirect("/admin/attendance");
}
