import { redirect } from "next/navigation";

export default function AdvancedAnalyticsPage() {
  redirect("/admin/trust?tab=analytics");
}
