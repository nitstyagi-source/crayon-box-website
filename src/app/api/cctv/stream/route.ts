import { NextResponse } from 'next/server';
import http from 'http';
import crypto from 'crypto';

function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function fetchSingleFrame(channel: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const nvrHost = process.env.HIKVISION_NVR_HOST || '192.168.1.90';
    const nvrPort = parseInt(process.env.HIKVISION_NVR_PORT || '80', 10);
    const nvrUser = process.env.HIKVISION_NVR_USER || 'admin';
    const nvrPass = process.env.HIKVISION_NVR_PASS || 'master123';

    const options = {
      hostname: nvrHost,
      port: nvrPort,
      path: `/ISAPI/Streaming/channels/${channel}/picture`,
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 401) {
        const authHeader = res.headers['www-authenticate'] || '';
        const realmMatch = authHeader.match(/realm="([^"]+)"/);
        const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

        if (!realmMatch || !nonceMatch) return reject(new Error('Auth failed'));

        const realm = realmMatch[1];
        const nonce = nonceMatch[1];

        const ha1 = md5(`${nvrUser}:${realm}:${nvrPass}`);
        const ha2 = md5(`GET:${options.path}`);
        const response = md5(`${ha1}:${nonce}:${ha2}`);

        const authStr = `Digest username="${nvrUser}", realm="${realm}", nonce="${nonce}", uri="${options.path}", response="${response}"`;

        const authReq = http.request({
          ...options,
          headers: { Authorization: authStr }
        }, (authRes) => {
          const chunks: Buffer[] = [];
          authRes.on('data', chunk => chunks.push(chunk));
          authRes.on('end', () => resolve(Buffer.concat(chunks)));
        });
        authReq.on('error', reject);
        authReq.end();
      } else if (res.statusCode === 200) {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.end();
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || '102';

  const boundary = '--cctv_frame_boundary';

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const pushFrame = async () => {
        if (isClosed) return;
        try {
          const frame = await fetchSingleFrame(channel);
          const header = `\r\n${boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`;
          controller.enqueue(Buffer.concat([Buffer.from(header), frame]));
          setTimeout(pushFrame, 120); // ~8-10 FPS smooth live stream
        } catch (e) {
          setTimeout(pushFrame, 500);
        }
      };

      pushFrame();
    },
    cancel() {}
  });

  return new Response(stream, {
    headers: {
      'Content-Type': `multipart/x-mixed-replace; boundary=${boundary.slice(2)}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'close',
      'Pragma': 'no-cache',
    }
  });
}
