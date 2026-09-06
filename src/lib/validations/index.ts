import { z } from "zod";

/**
 * Universal Server Action & Form Validation Schemas
 * Crayon Box School Web ERP
 *
 * Implements Pillar 3 of the Enterprise Dynamic Architecture.
 * Enforces strict type boundaries and runtime verification on all incoming mutations.
 */

// Student Validations
export const studentEnrollmentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  gender: z.enum(["Male", "Female", "Other"]),
  campusId: z.string().uuid("Invalid campus ID"),
  classId: z.string().uuid("Invalid class ID"),
  sectionId: z.string().uuid().optional(),
  parentMobile: z.string().min(10, "Valid 10-digit phone required"),
  academicSession: z.string().optional(),
});

// Finance Validations
export const feeInvoiceGenerateSchema = z.object({
  campusId: z.string().uuid("Invalid campus ID"),
  academicSession: z.string().min(4, "Academic session is required"),
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4", "Annual"]),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid due date format"),
  classIds: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
});

// Admissions Validations
export const admissionEnquirySchema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  parentName: z.string().min(2, "Parent name is required"),
  parentEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  parentPhone: z.string().min(10, "Valid 10-digit mobile number required"),
  targetClass: z.string().min(1, "Target class is required"),
  campusId: z.string().uuid("Invalid campus ID"),
  academicSession: z.string().optional(),
});

// Verification helper
export function validateActionInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issueMsg = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    return { success: false, error: issueMsg };
  }
  return { success: true, data: result.data };
}
