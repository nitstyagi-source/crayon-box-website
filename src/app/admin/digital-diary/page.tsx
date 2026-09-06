import { redirect } from "next/navigation";

export default function DigitalDiaryRedirect() {
  redirect("/admin/curriculum?tab=diary");
}
