import { redirect } from "next/navigation";

export default function AdminRoot() {
  // Redirect the root /admin path to the main dashboard
  redirect("/admin/dashboard");
}
