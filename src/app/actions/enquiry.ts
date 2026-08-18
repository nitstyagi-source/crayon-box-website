"use server";

export async function submitPublicEnquiry(formData: FormData) {
  const parentName = formData.get("parentName");
  const phone = formData.get("phone");
  const childName = formData.get("childName");
  const grade = formData.get("grade");

  if (!parentName || !phone || !childName || !grade) {
    return { success: false, error: "Please fill out all required fields." };
  }

  if (phone.toString().replace(/\s/g, '').length !== 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }

  // In a real application, this would:
  // 1. Validate the Supabase session/service key.
  // 2. Insert into the `enquiries` table with source='Website' and status='New'.
  
  console.log(`[ENQUIRY CRM] New Website Lead Received:`, {
    parentName, phone, childName, grade, source: 'Website', status: 'New'
  });

  // Simulated Database Latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return { success: true };
}
