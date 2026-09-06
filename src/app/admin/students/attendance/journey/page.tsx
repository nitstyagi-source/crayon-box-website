import { redirect } from "next/navigation";

export default function StudentAttendanceJourneyRedirect() {
  redirect("/admin/attendance?tab=student");
}
