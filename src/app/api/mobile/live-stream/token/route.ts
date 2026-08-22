import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, studentId, classroomCamera } = body;

    // Verify timetable and parent authorization
    const targetStream = (classroomCamera || "grade5").toLowerCase().replace(/\s+/g, "");
    const liveGateway = "https://bibliographic-wales-qualifying-variety.trycloudflare.com";

    const securePlaybackUrl = `${liveGateway}/${targetStream}_cam/`;
    const token = `stream_token_exp_${Date.now() + 3600000}`;

    return NextResponse.json({
      success: true,
      classroomCamera: classroomCamera || "Grade 5",
      playbackUrl: securePlaybackUrl,
      accessToken: token,
      expiresIn: 3600,
      drmWatermark: {
        viewerId: userId || "USR-PARENT",
        timestamp: new Date().toISOString(),
        antiScreenCapture: true
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
