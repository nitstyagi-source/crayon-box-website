"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function resolveCampusId(supabase: any, campusId?: string): Promise<string> {
  if (campusId && campusId !== "all" && campusId !== "default") {
    return campusId;
  }
  const { data: firstCampus } = await supabase.from("campuses").select("id").limit(1).single();
  return firstCampus?.id || "c3d782a9-a50b-4708-a3fc-6b146f456662";
}

// -------------------------------------------------------------
// 1. EXPENSE DASHBOARD STATS
// -------------------------------------------------------------
export async function getExpenseDashboardStats(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data: expenses, error } = await supabase
      .from("school_expenses")
      .select("*")
      .eq("campus_id", resolvedCampusId);

    if (error) throw error;

    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonthPrefix = todayStr.substring(0, 7); // '2026-08'

    let todaysTotal = 0;
    let thisMonthTotal = 0;
    let pendingApprovalTotal = 0;
    let pendingPaymentTotal = 0;
    const categoryMap: Record<string, number> = {};

    (expenses || []).forEach((exp: any) => {
      const amt = Number(exp.amount) || 0;
      const isToday = exp.expense_date === todayStr;
      const isThisMonth = exp.expense_date && exp.expense_date.startsWith(currentMonthPrefix);

      if (isToday && (exp.status === "Paid" || exp.status === "Approved")) {
        todaysTotal += amt;
      }

      if (isThisMonth && (exp.status === "Paid" || exp.status === "Approved")) {
        thisMonthTotal += amt;
        const cat = exp.category || "Miscellaneous";
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      }

      if (exp.status === "Pending") {
        pendingApprovalTotal += amt;
      } else if (exp.status === "Approved") {
        pendingPaymentTotal += amt;
      }
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);

    return {
      success: true,
      data: {
        todaysExpense: todaysTotal,
        thisMonthExpense: thisMonthTotal,
        pendingApproval: pendingApprovalTotal,
        pendingPayment: pendingPaymentTotal,
        categoryBreakdown,
        totalRecords: expenses?.length || 0
      }
    };
  } catch (error: any) {
    console.error("Error in getExpenseDashboardStats:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. GET EXPENSES LIST WITH FILTERS
// -------------------------------------------------------------
export async function getSchoolExpenses(payload?: {
  campusId?: string;
  category?: string;
  status?: string;
  paymentMode?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload?.campusId);

    let query = supabase
      .from("school_expenses")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .order("expense_date", { ascending: false });

    if (payload?.category && payload.category !== "All") {
      query = query.eq("category", payload.category);
    }

    if (payload?.status && payload.status !== "All") {
      query = query.eq("status", payload.status);
    }

    if (payload?.paymentMode && payload.paymentMode !== "All") {
      query = query.eq("payment_mode", payload.paymentMode);
    }

    if (payload?.search) {
      query = query.or(`vendor_payee.ilike.%${payload.search}%,description.ilike.%${payload.search}%,expense_head.ilike.%${payload.search}%`);
    }

    if (payload?.startDate) {
      query = query.gte("expense_date", payload.startDate);
    }

    if (payload?.endDate) {
      query = query.lte("expense_date", payload.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error in getSchoolExpenses:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 3. CREATE NEW EXPENSE
// -------------------------------------------------------------
export async function createSchoolExpense(payload: {
  campusId?: string;
  expenseDate: string;
  department: string;
  category: string;
  expenseHead: string;
  vendorPayee: string;
  description: string;
  particulars?: { item: string; amount: number }[];
  amount: number;
  paymentMode: string;
  paymentRefNo?: string;
  billNo?: string;
  billDate?: string;
  bankName?: string;
  chequeNo?: string;
  attachmentUrl?: string;
  enteredBy?: string;
  remarks?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    // Auto-approval logic: Expenses <= ₹2,000 auto-approved; others set to Pending
    const status = payload.amount <= 2000 ? "Approved" : "Pending";

    const { data, error } = await supabase
      .from("school_expenses")
      .insert({
        campus_id: resolvedCampusId,
        expense_date: payload.expenseDate,
        department: payload.department,
        category: payload.category,
        expense_head: payload.expenseHead,
        vendor_payee: payload.vendorPayee,
        description: payload.description,
        particulars: JSON.stringify(payload.particulars || [{ item: payload.description, amount: payload.amount }]),
        amount: payload.amount,
        payment_mode: payload.paymentMode,
        payment_ref_no: payload.paymentRefNo || null,
        bill_no: payload.billNo || null,
        bill_date: payload.billDate || payload.expenseDate,
        bank_name: payload.bankName || null,
        cheque_no: payload.chequeNo || null,
        attachment_url: payload.attachmentUrl || null,
        entered_by: payload.enteredBy || "Accounts Team",
        remarks: payload.remarks || "",
        status,
        approved_by: status === "Approved" ? "Auto-System (< ₹2,000)" : null,
        approved_at: status === "Approved" ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/finance/expenses");
    return { success: true, message: `Expense of ₹${payload.amount.toLocaleString()} recorded successfully!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. UPDATE EXPENSE STATUS (APPROVE / PAY / CANCEL)
// -------------------------------------------------------------
export async function updateExpenseStatus(payload: {
  expenseId: string;
  status: "Approved" | "Paid" | "Cancelled";
  approvedBy?: string;
  remarks?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const updateObj: any = {
      status: payload.status,
      updated_at: new Date().toISOString()
    };

    if (payload.status === "Approved") {
      updateObj.approved_by = payload.approvedBy || "Principal & Managing Trustee";
      updateObj.approved_at = new Date().toISOString();
    } else if (payload.status === "Paid") {
      updateObj.paid_at = new Date().toISOString();
    }

    if (payload.remarks) {
      updateObj.remarks = payload.remarks;
    }

    const { data, error } = await supabase
      .from("school_expenses")
      .update(updateObj)
      .eq("id", payload.expenseId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/finance/expenses");
    return { success: true, message: `Expense status marked as ${payload.status}!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. GET & CREATE VENDORS
// -------------------------------------------------------------
export async function getVendorsList(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data, error } = await supabase
      .from("school_vendors")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .order("vendor_name", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function createVendor(payload: {
  campusId?: string;
  vendorName: string;
  contactPerson?: string;
  mobile?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  category?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const { data, error } = await supabase
      .from("school_vendors")
      .insert({
        campus_id: resolvedCampusId,
        vendor_name: payload.vendorName,
        contact_person: payload.contactPerson || "",
        mobile: payload.mobile || "",
        email: payload.email || "",
        address: payload.address || "",
        gst_number: payload.gstNumber || "",
        category: payload.category || "General",
        status: "Active"
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/finance/expenses");
    return { success: true, message: `Vendor "${payload.vendorName}" registered!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. PETTY CASH & BUDGETS
// -------------------------------------------------------------
export async function getPettyCashLogs(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data, error } = await supabase
      .from("petty_cash_logs")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function getExpenseBudgets(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data, error } = await supabase
      .from("expense_budgets")
      .select("*")
      .eq("campus_id", resolvedCampusId);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}
