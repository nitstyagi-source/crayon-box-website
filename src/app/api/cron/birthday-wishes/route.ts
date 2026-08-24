import { NextResponse } from "next/server";
import { autoSendTodaysBirthdayWishes } from "@/app/actions/birthdays";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campusId") || undefined;
    const forceAll = searchParams.get("force") === "true";

    const result = await autoSendTodaysBirthdayWishes({ campusId, forceAll });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const result = await autoSendTodaysBirthdayWishes({
      campusId: body.campusId,
      forceAll: body.forceAll === true
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
