import { redirect } from "next/navigation";

export default function SafetyCompliancePage() {
  redirect("/admin/reports/compliance");
}
