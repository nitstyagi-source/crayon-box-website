import { redirect } from "next/navigation";

export default function AlumniAdminDashboard() {
  redirect("/admin/cms?tab=alumni");
}
