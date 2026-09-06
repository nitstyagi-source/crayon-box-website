import { redirect } from "next/navigation";

export default function AttendanceLeavesRedirect() {
  redirect("/admin/attendance?tab=leaves");
}
