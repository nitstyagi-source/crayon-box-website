import { NextRequest, NextResponse } from "next/server";
import { WhatsAppService } from "@/lib/core/whatsapp/whatsapp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone,
      recipient_name,
      student_name,
      message,
      template_name,
      template_variables
    } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number and message body are required." },
        { status: 400 }
      );
    }

    const result = await WhatsAppService.sendMessage({
      recipientPhone: phone,
      recipientName: recipient_name,
      studentName: student_name,
      message,
      templateName: template_name,
      templateVariables: template_variables
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in WhatsApp send route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
