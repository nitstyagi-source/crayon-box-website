import { redirect } from "next/navigation";

export default function AdmissionsAnalyticsRedirect() {
  redirect("/admin/admissions?tab=analytics");
}
