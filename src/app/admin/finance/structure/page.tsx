import { redirect } from "next/navigation";

export default function LegacyFeeStructureRedirect() {
  redirect("/admin/finance?tab=slabs");
}
