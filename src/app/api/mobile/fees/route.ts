import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || "STU-AARAV-01";

    const INVOICES: Record<string, any[]> = {
      "STU-AARAV-01": [
        { id: "INV-2026-T2", title: "Term 2 Tuition & Activity Fee", dueDate: "31 Aug 2026", amount: 12500, status: "Due", mandatory: true },
        { id: "INV-2026-BUS", title: "Quarter 2 Transport Fee (Route 4)", dueDate: "31 Aug 2026", amount: 3500, status: "Due", mandatory: false },
      ],
      "STU-ANAYA-02": []
    };

    const invoices = INVOICES[studentId] || INVOICES["STU-AARAV-01"];
    const totalDue = invoices.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      studentId,
      totalDue,
      invoices
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, invoiceIds, amount } = body;

    // Create Razorpay Order representation
    const orderId = `order_cb_${Date.now()}`;

    return NextResponse.json({
      success: true,
      orderId,
      currency: "INR",
      amount: amount || 12500,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_crayonbox2026",
      studentId
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
