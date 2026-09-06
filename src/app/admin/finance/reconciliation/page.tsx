import { redirect } from "next/navigation";

export default function FinanceReconRedirect() {
  redirect("/admin/finance?tab=reconciliation");
}
