import { redirect } from "next/navigation";

export default function NewsAdminDashboard() {
  redirect("/admin/cms?tab=news");
}
