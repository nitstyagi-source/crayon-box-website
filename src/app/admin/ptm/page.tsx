import { redirect } from "next/navigation";

export default function PtmSchedulerPage() {
  redirect("/admin/parent-care?tab=ptm");
}
