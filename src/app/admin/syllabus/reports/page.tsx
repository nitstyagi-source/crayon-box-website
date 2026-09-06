import { redirect } from "next/navigation";

export default function SyllabusReportsRedirect() {
  redirect("/admin/curriculum?tab=radar");
}
