import { redirect } from "next/navigation";

export default function GalleryAdminDashboard() {
  redirect("/admin/cms?tab=gallery");
}
