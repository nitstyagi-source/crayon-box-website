import { redirect } from "next/navigation";

export default function AdmissionsPipelineRedirect() {
  redirect("/admin/admissions?tab=pipeline");
}
