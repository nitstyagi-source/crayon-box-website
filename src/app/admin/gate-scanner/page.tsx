import { redirect } from "next/navigation";

export default function GateAttendanceScannerPage() {
  redirect("/admin/visitors?tab=turnstile-sync");
}
