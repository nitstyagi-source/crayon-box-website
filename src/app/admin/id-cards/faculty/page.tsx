import { redirect } from "next/navigation";

export default function IdCardsFacultyRedirect() {
  redirect("/admin/id-cards/studio?tab=faculty");
}
