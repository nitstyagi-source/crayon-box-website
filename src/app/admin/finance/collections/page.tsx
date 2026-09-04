import { redirect } from "next/navigation";

export default function LegacyFeeCollectionsRedirect() {
  redirect("/admin/finance?tab=pos");
}
