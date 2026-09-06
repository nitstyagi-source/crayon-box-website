import { redirect } from "next/navigation";

export default function AdmissionsAiBotRedirect() {
  redirect("/admin/admissions?tab=ai-bot");
}
