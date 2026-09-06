import { redirect } from "next/navigation";

export default function PrintEscortsRedirect() {
  redirect("/admin/id-cards/studio?tab=escort");
}
