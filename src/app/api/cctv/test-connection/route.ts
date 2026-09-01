import { NextRequest, NextResponse } from "next/server";
import http from "http";
import net from "net";
import crypto from "crypto";

function md5(str: string) {
  return crypto.createHash("md5").update(str).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { host, port, username, password } = await req.json();

    if (!host) {
      return NextResponse.json({ success: false, error: "Host / Static IP / DDNS is required" }, { status: 400 });
    }

    const nvrHost = host.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
    const nvrPort = parseInt(port || "10554", 10);
    const nvrUser = username || "admin";
    const nvrPass = password || "master123";

    // 1. If testing RTSP port (10554, 554), do an RTSP socket test
    if (nvrPort === 10554 || nvrPort === 554) {
      const rtspResult = await new Promise<{ success: boolean; data?: any; error?: string }>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);

        socket.connect(nvrPort, nvrHost, () => {
          // Send RTSP OPTIONS request
          const rtspReq = `OPTIONS rtsp://${nvrHost}:${nvrPort}/Streaming/Channels/102 RTSP/1.0\r\nCSeq: 1\r\nUser-Agent: CrayonBox-NVR-Test\r\n\r\n`;
          socket.write(rtspReq);
        });

        socket.on("data", (data) => {
          const resp = data.toString();
          socket.destroy();
          resolve({
            success: true,
            data: {
              protocol: "RTSP Video Stream",
              port: nvrPort,
              status: "Hikvision NVR Stream Port Online & Reachable",
              response: resp.split("\r\n")[0]
            }
          });
        });

        socket.on("timeout", () => {
          socket.destroy();
          resolve({ success: false, error: `Connection to RTSP port ${nvrPort} timed out. Ensure port ${nvrPort} is forwarded in your router.` });
        });

        socket.on("error", (err) => {
          socket.destroy();
          resolve({ success: false, error: `RTSP Port ${nvrPort} Error: ${err.message}` });
        });
      });

      return NextResponse.json(rtspResult);
    }

    // 2. HTTP / ISAPI Web Management Port Test (Port 80, 8080, 8000)
    const path = "/ISAPI/System/deviceInfo";
    const httpResult = await new Promise<{ success: boolean; data?: any; error?: string }>((resolve) => {
      const options = {
        hostname: nvrHost,
        port: nvrPort,
        path: path,
        method: "GET",
        timeout: 5000,
      };

      const httpReq = http.request(options, (res) => {
        if (res.statusCode === 401) {
          const authHeader = res.headers["www-authenticate"] || "";
          const realmMatch = authHeader.match(/realm="([^"]+)"/);
          const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

          if (!realmMatch || !nonceMatch) {
            return resolve({
              success: true,
              data: { status: "Hikvision NVR HTTP Port Connected (Auth Challenge Received)", statusCode: 401 }
            });
          }

          const realm = realmMatch[1];
          const nonce = nonceMatch[1];

          const ha1 = md5(`${nvrUser}:${realm}:${nvrPass}`);
          const ha2 = md5(`GET:${path}`);
          const response = md5(`${ha1}:${nonce}:${ha2}`);

          const authStr = `Digest username="${nvrUser}", realm="${realm}", nonce="${nonce}", uri="${path}", response="${response}"`;

          const authReq = http.request({
            ...options,
            headers: { Authorization: authStr }
          }, (authRes) => {
            let data = "";
            authRes.on("data", (chunk) => data += chunk);
            authRes.on("end", () => {
              if (authRes.statusCode === 200) {
                const modelMatch = data.match(/<model>([^<]+)<\/model>/);
                const snMatch = data.match(/<serialNumber>([^<]+)<\/serialNumber>/);
                resolve({
                  success: true,
                  data: {
                    model: modelMatch ? modelMatch[1] : "Hikvision NVR",
                    serialNumber: snMatch ? snMatch[1] : "Connected",
                    statusCode: authRes.statusCode
                  }
                });
              } else {
                resolve({
                  success: true,
                  data: { status: "NVR Reachable", httpStatus: authRes.statusCode }
                });
              }
            });
          });

          authReq.on("error", (e) => resolve({ success: false, error: e.message }));
          authReq.end();
        } else if (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 404) {
          resolve({
            success: true,
            data: { status: `NVR Responded with HTTP ${res.statusCode}`, port: nvrPort }
          });
        } else {
          resolve({ success: false, error: `NVR returned status ${res.statusCode}` });
        }
      });

      httpReq.on("timeout", () => {
        httpReq.destroy();
        resolve({ success: false, error: "Connection timed out. Check router port forwarding and firewall." });
      });

      httpReq.on("error", (e) => resolve({ success: false, error: e.message }));
      httpReq.end();
    });

    return NextResponse.json(httpResult);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
