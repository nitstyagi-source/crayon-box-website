import { redirect } from "next/navigation";

export default function SyllabusIndexRedirect() {
  redirect("/admin/curriculum?tab=radar");
}
