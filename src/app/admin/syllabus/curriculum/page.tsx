import { redirect } from "next/navigation";

export default function SyllabusCurriculumRedirect() {
  redirect("/admin/curriculum?tab=radar");
}
