import { redirect } from "next/navigation";

export default function StudentTcRedirect() {
  redirect("/admin/students?tab=tc");
}
