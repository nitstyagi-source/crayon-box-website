import { NextRequest, NextResponse } from "next/server";
import { WhatsAppService } from "@/lib/core/whatsapp/whatsapp-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const logs = await WhatsAppService.getLogs(limit);
    return NextResponse.json({
      success: true,
      total: logs.length,
      data: logs
    });
  } catch (error: any) {
    console.error("Error in WhatsApp logs route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
