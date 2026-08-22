import { NextRequest, NextResponse } from "next/server";

const APPROVALS_DB = [
  { id: "APP-01", category: "refund", title: "Fee Refund Request", subtitle: "Aarav Gupta (Grade 4B)", amount: "₹12,500", detail: "Excess lab deposit refund post syllabus migration", status: "pending" },
  { id: "APP-02", category: "leave", title: "Staff Medical Leave", subtitle: "Pooja Verma (TGT Science)", amount: "2 Days", detail: "Medical leave for 25-26 Aug with medical slip", status: "pending" },
  { id: "APP-03", category: "expense", title: "Robotics Lab Spares", subtitle: "Lab Incharge (Manish K.)", amount: "₹8,400", detail: "Arduino Nano boards, sensors & soldering consumables", status: "pending" },
  { id: "APP-04", category: "concession", title: "Sibling Concession", subtitle: "Diya & Rohit Sharma", amount: "15% Waiver", detail: "Standard second sibling policy applied on term tuition", status: "pending" },
];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    totalPending: APPROVALS_DB.filter(a => a.status === "pending").length,
    approvals: APPROVALS_DB
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { approvalId, action, reviewerId, comments } = body;

    if (!approvalId || !action) {
      return NextResponse.json({ success: false, error: "Missing approvalId or action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Approval item ${approvalId} marked as ${action} by ${reviewerId || "Management"}.`,
      approvalId,
      status: action,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
