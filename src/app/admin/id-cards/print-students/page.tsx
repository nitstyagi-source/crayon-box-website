import { redirect } from "next/navigation";

export default function PrintStudentsRedirect() {
  redirect("/admin/id-cards/studio?tab=student");
}
