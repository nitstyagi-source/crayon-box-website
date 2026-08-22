import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fesqtrunkqlmvyvqodzy.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODk1MzA3NywiZXhwIjoyMDU0NTI5MDc3fQ.Zl4989ZJ_7_F5K1e8p_J2K27z_lG_aW5U7M-rG6p16c";
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gatewayUrl } = body;

    if (!gatewayUrl || !gatewayUrl.startsWith("http")) {
      return NextResponse.json({ error: "Invalid gatewayUrl provided" }, { status: 400 });
    }

    const cleanGateway = gatewayUrl.replace(/\/+$/, "");
    const supabase = getSupabaseAdmin();

    const camMapping: Record<string, string> = {
      "Nursery": `${cleanGateway}/nursery_cam/`,
      "LKG": `${cleanGateway}/lkg_cam/`,
      "UKG": `${cleanGateway}/ukg_cam/`,
      "Grade 1": `${cleanGateway}/grade1_cam/`,
      "Grade 2": `${cleanGateway}/grade2_cam/`,
      "Grade 3": `${cleanGateway}/grade3_cam/`,
      "Grade 4": `${cleanGateway}/grade4_cam/`,
      "Grade 5": `${cleanGateway}/grade5_cam/`,
      "Grade 6": `${cleanGateway}/grade6_cam/`,
      "Grade 7": `${cleanGateway}/grade7_cam/`,
      "Grade 8": `${cleanGateway}/grade8_cam/`,
      "Grade 9": `${cleanGateway}/grade9_cam/`,
      "Grade 10": `${cleanGateway}/grade10_cam/`,
      "Science Lab": `${cleanGateway}/science_lab/`,
      "Computer Lab": `${cleanGateway}/computer_lab/`,
      "Activity Hall": `${cleanGateway}/activity_hall/`
    };

    // Update all 16 cameras in Supabase
    for (const [classroomName, streamUrl] of Object.entries(camMapping)) {
      await supabase
        .from("cameras")
        .update({
          stream_url: streamUrl,
          status: "Online",
          is_active: true,
          kill_switch_active: false
        })
        .eq("classroom_name", classroomName);
    }

    // Update global settings
    await supabase
      .from("live_stream_settings")
      .update({
        gateway_url: cleanGateway,
        global_kill_switch: false
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    return NextResponse.json({
      success: true,
      message: "Gateway heartbeat received and all 16 cameras updated successfully.",
      gatewayUrl: cleanGateway,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Gateway heartbeat error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
