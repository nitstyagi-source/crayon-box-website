import { redirect } from "next/navigation";

export default function HelpdeskGrievancePage() {
  redirect("/admin/parent-care?tab=grievances");
}
