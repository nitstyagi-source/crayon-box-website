import { redirect } from "next/navigation";

export default function TimetableGeneratorPage() {
  redirect("/admin/timetable?tab=solver");
}
