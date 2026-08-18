"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Define the Zod schema for Admissions
const admissionsSchema = z.object({
  studentFirstName: z.string().min(2, "First name is too short"),
  studentLastName: z.string().min(2, "Last name is too short"),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
  gradeApplied: z.string().min(1, "Grade is required"),
  previousSchool: z.string().optional(),
  parentFirstName: z.string().min(2, "Parent first name is required"),
  parentLastName: z.string().min(2, "Parent last name is required"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(10, "Invalid phone number"),
  transportRequired: z.boolean().default(false),
});

export async function submitAdmissionApplication(formData: FormData) {
  const supabase = await createClient();

  // Extract and validate data
  const rawData = {
    studentFirstName: formData.get("studentFirstName"),
    studentLastName: formData.get("studentLastName"),
    dateOfBirth: formData.get("dateOfBirth"),
    gradeApplied: formData.get("gradeApplied"),
    previousSchool: formData.get("previousSchool"),
    parentFirstName: formData.get("parentFirstName"),
    parentLastName: formData.get("parentLastName"),
    parentEmail: formData.get("parentEmail"),
    parentPhone: formData.get("parentPhone"),
    transportRequired: formData.get("transportRequired") === "on",
  };

  const parsed = admissionsSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  // In a real scenario, we would lookup campus and academic year dynamically.
  // For now, use the default seeded UUIDs.
  const campusId = '11111111-1111-1111-1111-111111111111';
  const academicYearId = '22222222-2222-2222-2222-222222222222';

  // 1. Insert into admissions_applications
  // We leave parent_id null for now because the user is not authenticated.
  // The system will provision the parent auth account later upon approval.
  const { data: application, error: appError } = await supabase
    .from('admissions_applications')
    .insert({
      campus_id: campusId,
      academic_year_id: academicYearId,
      student_first_name: data.studentFirstName,
      student_last_name: data.studentLastName,
      date_of_birth: data.dateOfBirth,
      grade_applied: data.gradeApplied,
      previous_school: data.previousSchool,
      transport_required: data.transportRequired,
      status: 'Submitted'
      // Note: we can store parent email/phone in a JSON payload or dedicated fields if needed before parent_id is generated.
      // For this implementation, we will assume standard flow.
    })
    .select()
    .single();

  if (appError) {
    console.error("Database Error:", appError);
    return { success: false, message: "Failed to submit application to database." };
  }

  return { success: true, trackingToken: application.tracking_token };
}

export async function approveApplicationAndProvisionParent(applicationId: string, parentEmail: string, parentFirstName: string, parentLastName: string) {
  const supabase = await createClient();

  // Create Auth User
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: parentEmail,
    email_confirm: true,
    user_metadata: { first_name: parentFirstName, last_name: parentLastName }
  });

  if (authError) return { success: false, error: authError.message };

  // Insert into parents table
  const { error: parentError } = await supabase.from('parents').insert({
    id: authUser.user.id,
    first_name: parentFirstName,
    last_name: parentLastName,
  });

  if (parentError) return { success: false, error: parentError.message };

  // Update application status and assign parent_id
  const { error: updateError } = await supabase.from('admissions_applications')
    .update({ status: 'Approved', parent_id: authUser.user.id })
    .eq('id', applicationId);

  if (updateError) return { success: false, error: updateError.message };

  return { success: true };
}
