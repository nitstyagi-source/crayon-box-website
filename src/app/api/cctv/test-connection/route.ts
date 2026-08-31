import { NextRequest, NextResponse } from "next/server";
import http from "http";
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
    const nvrPort = parseInt(port || "80", 10);
    const nvrUser = username || "admin";
    const nvrPass = password || "master123";

    const path = "/ISAPI/System/deviceInfo";

    const result = await new Promise<{ success: boolean; data?: any; error?: string }>((resolve) => {
      const options = {
        hostname: nvrHost,
        port: nvrPort,
        path: path,
        method: "GET",
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 401) {
          const authHeader = res.headers["www-authenticate"] || "";
          const realmMatch = authHeader.match(/realm="([^"]+)"/);
          const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

          if (!realmMatch || !nonceMatch) {
            return resolve({ success: false, error: "Authentication challenge failed" });
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
                resolve({ success: false, error: `Auth failed with HTTP status ${authRes.statusCode}` });
              }
            });
          });

          authReq.on("error", (e) => resolve({ success: false, error: e.message }));
          authReq.end();
        } else if (res.statusCode === 200) {
          resolve({ success: true, data: { status: "Connected without auth" } });
        } else {
          resolve({ success: false, error: `NVR returned status ${res.statusCode}` });
        }
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ success: false, error: "Connection timed out. Check router port forwarding and firewall." });
      });

      req.on("error", (e) => resolve({ success: false, error: e.message }));
      req.end();
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
