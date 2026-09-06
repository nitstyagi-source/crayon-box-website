import { redirect } from "next/navigation";

export default function SyllabusResourcesRedirect() {
  redirect("/admin/curriculum?tab=digital_resources");
}
