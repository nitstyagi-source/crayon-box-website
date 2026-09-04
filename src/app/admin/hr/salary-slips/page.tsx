import { redirect } from "next/navigation";

export default function LegacySalarySlipsRedirect() {
  redirect("/admin/hr/payroll?tab=slips");
}
