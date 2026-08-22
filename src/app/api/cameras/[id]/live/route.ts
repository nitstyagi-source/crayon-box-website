import { NextRequest } from "next/server";
import { spawn } from "child_process";

// Channel mapping to Hikvision DVR RTSP endpoints
const CHANNEL_MAP: Record<string, string> = {
  "nursery_cam": "102",
  "lkg_cam": "202",
  "ukg_cam": "302",
  "grade1_cam": "402",
  "grade2_cam": "502",
  "grade3_cam": "602",
  "grade4_cam": "702",
  "grade5_cam": "802",
  "grade6_cam": "902",
  "grade7_cam": "1002",
  "grade8_cam": "1102",
  "grade9_cam": "1202",
  "grade10_cam": "1302",
  "science_lab": "1402",
  "computer_lab": "1502",
  "activity_hall": "1602",
  "default": "102"
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const channelKey = resolvedParams.id || "nursery_cam";
  const chNum = CHANNEL_MAP[channelKey] || CHANNEL_MAP["nursery_cam"] || "102";

  const rtspUrl = `rtsp://admin:master123@192.168.1.90:10554/Streaming/Channels/${chNum}`;

  // Spawn ffmpeg to convert RTSP to MJPEG stream for zero-latency browser rendering
  const ffmpeg = spawn("ffmpeg", [
    "-rtsp_transport", "tcp",
    "-stimeout", "5000000",
    "-i", rtspUrl,
    "-f", "mpjpeg",
    "-q:v", "5",
    "-r", "15",
    "-s", "640x480",
    "-"
  ]);

  const stream = new ReadableStream({
    start(controller) {
      ffmpeg.stdout.on("data", (chunk) => {
        controller.enqueue(chunk);
      });

      ffmpeg.stderr.on("data", (data) => {
        // Logging stderr if needed
      });

      ffmpeg.on("close", () => {
        controller.close();
      });

      ffmpeg.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      ffmpeg.kill("SIGKILL");
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "multipart/x-mixed-replace; boundary=ffmpeg",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "Pragma": "no-cache"
    }
  });
}
