import { redirect } from "next/navigation";

export default function TemporaryPassRedirect() {
  redirect("/admin/id-cards");
}
