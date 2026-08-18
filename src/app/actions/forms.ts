"use server";

import { revalidatePath } from "next/cache";

// In-memory mock database for form submissions
type Admission = { id: string; parentName: string; email: string; phone: string; childName: string; grade: string; date: string; status: string };
type Payment = { id: string; studentId: string; parentName: string; amount: number; date: string; status: string };
type Enquiry = { id: string; name: string; email: string; phone: string; department: string; nature: string; message: string; date: string; status: string };

const MOCK_FORM_DB: {
  admissions: Admission[];
  payments: Payment[];
  enquiries: Enquiry[];
} = {
  admissions: [
    { id: "APP-001", parentName: "John Doe", email: "john@example.com", phone: "123-456-7890", childName: "Jane Doe", grade: "Grade 1", date: new Date().toISOString(), status: "Pending" }
  ],
  payments: [
    { id: "PAY-001", studentId: "STU-8821", parentName: "Mary Smith", amount: 1500, date: new Date().toISOString(), status: "Completed" }
  ],
  enquiries: [
    { id: "ENQ-001", name: "Alice Johnson", email: "alice@example.com", phone: "987-654-3210", department: "Admissions Office", nature: "Admissions", message: "When do the 2026 applications open?", date: new Date().toISOString(), status: "Unread" }
  ]
};

export async function submitAdmission(formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
  
  const application: Admission = {
    id: `APP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    parentName: formData.get("parentName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    childName: formData.get("childName") as string,
    grade: formData.get("grade") as string,
    date: new Date().toISOString(),
    status: "Pending"
  };

  MOCK_FORM_DB.admissions.unshift(application);
  revalidatePath("/admin/admissions");
  return { success: true, applicationId: application.id };
}

export async function submitFeePayment(formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate latency
  
  const payment: Payment = {
    id: `PAY-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    studentId: formData.get("studentId") as string,
    parentName: formData.get("parentName") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: new Date().toISOString(),
    status: "Completed"
  };

  MOCK_FORM_DB.payments.unshift(payment);
  revalidatePath("/admin/finance");
  return { success: true, transactionId: payment.id };
}

export async function submitContactEnquiry(formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
  
  const enquiry: Enquiry = {
    id: `ENQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    department: formData.get("department") as string,
    nature: formData.get("nature") as string,
    message: formData.get("message") as string,
    date: new Date().toISOString(),
    status: "Unread"
  };

  MOCK_FORM_DB.enquiries.unshift(enquiry);
  revalidatePath("/admin/enquiries");
  return { success: true, enquiryId: enquiry.id };
}

export async function getAdmissions() {
  return MOCK_FORM_DB.admissions;
}

export async function getFeePayments() {
  return MOCK_FORM_DB.payments;
}

export async function getContactEnquiries() {
  return MOCK_FORM_DB.enquiries;
}
