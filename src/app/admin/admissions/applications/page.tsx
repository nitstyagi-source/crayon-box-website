import { redirect } from "next/navigation";

export default function AdmissionsApplicationsRedirect() {
  redirect("/admin/admissions?tab=pipeline");
}
