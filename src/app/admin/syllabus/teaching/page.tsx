import { redirect } from "next/navigation";

export default function SyllabusTeachingRedirect() {
  redirect("/admin/curriculum?tab=diary");
}
