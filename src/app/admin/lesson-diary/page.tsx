import { redirect } from "next/navigation";

export default function LegacyLessonDiaryRedirect() {
  redirect("/admin/curriculum?tab=diary");
}
