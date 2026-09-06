import { redirect } from "next/navigation";

export default function SyllabusPlannerRedirect() {
  redirect("/admin/curriculum?tab=radar");
}
