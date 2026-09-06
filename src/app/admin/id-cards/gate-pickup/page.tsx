import { redirect } from "next/navigation";

export default function GatePickupRedirect() {
  redirect("/admin/id-cards/studio?tab=escort");
}
