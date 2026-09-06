import { redirect } from "next/navigation";

export default function SyllabusRemedialRedirect() {
  redirect("/admin/curriculum?tab=radar");
}
