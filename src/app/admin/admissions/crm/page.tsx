import { redirect } from "next/navigation";

export default function AdmissionsCrmRedirect() {
  redirect("/admin/admissions?tab=pipeline");
}
