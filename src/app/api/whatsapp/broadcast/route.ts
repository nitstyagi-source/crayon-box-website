import { NextRequest, NextResponse } from "next/server";
import { WhatsAppService } from "@/lib/core/whatsapp/whatsapp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients, message, template_name } = body;

    if (!Array.isArray(recipients) || recipients.length === 0 || !message) {
      return NextResponse.json(
        { success: false, error: "A non-empty array of recipients and a message are required." },
        { status: 400 }
      );
    }

    const results = [];
    for (const r of recipients) {
      if (r.phone) {
        const res = await WhatsAppService.sendMessage({
          recipientPhone: r.phone,
          recipientName: r.name || 'Parent',
          studentName: r.studentName || 'Student',
          message: r.customMessage || message,
          templateName: template_name || 'BROADCAST_CIRCULAR'
        });
        results.push({ phone: r.phone, result: res });
      }
    }

    return NextResponse.json({
      success: true,
      total_dispatched: results.length,
      details: results
    });
  } catch (error: any) {
    console.error("Error in WhatsApp broadcast route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
