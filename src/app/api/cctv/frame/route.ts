import { NextResponse } from 'next/server';
import http from 'http';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

let cachedSettings: { host: string; port: number; user: string; pass: string; expires: number } | null = null;

async function getNvrConfig() {
  if (cachedSettings && cachedSettings.expires > Date.now()) {
    return cachedSettings;
  }
  try {
    const p = getPool();
    const res = await p.query("SELECT dvr_ip, dvr_port, dvr_username, dvr_password FROM public.live_stream_settings LIMIT 1;");
    const row = res.rows[0];
    const host = (row?.dvr_ip || process.env.HIKVISION_NVR_HOST || '192.168.1.90').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    const port = parseInt(row?.dvr_port || process.env.HIKVISION_NVR_PORT || '80', 10);
    const user = row?.dvr_username || process.env.HIKVISION_NVR_USER || 'admin';
    const pass = row?.dvr_password || process.env.HIKVISION_NVR_PASS || 'master123';
    cachedSettings = { host, port, user, pass, expires: Date.now() + 30000 };
    return cachedSettings;
  } catch {
    return {
      host: (process.env.HIKVISION_NVR_HOST || '192.168.1.90').replace(/^https?:\/\//, '').trim(),
      port: parseInt(process.env.HIKVISION_NVR_PORT || '80', 10),
      user: process.env.HIKVISION_NVR_USER || 'admin',
      pass: process.env.HIKVISION_NVR_PASS || 'master123',
      expires: Date.now() + 10000
    };
  }
}

const keepAliveAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 25,
  maxFreeSockets: 10,
  timeout: 5000,
});

let cachedAuth: { realm: string; nonce: string; timestamp: number } | null = null;

function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

async function fetchHikvisionFrame(channel: string = '102'): Promise<Buffer> {
  const config = await getNvrConfig();
  const nvrHost = config.host;
  let nvrPort = config.port;
  if (nvrPort === 10554 || nvrPort === 554) nvrPort = 8080;
  const nvrUser = config.user;
  const nvrPass = config.pass;
  const path = `/ISAPI/Streaming/channels/${channel}/picture`;

  const buildDigestHeader = (realm: string, nonce: string) => {
    const ha1 = md5(`${nvrUser}:${realm}:${nvrPass}`);
    const ha2 = md5(`GET:${path}`);
    const response = md5(`${ha1}:${nonce}:${ha2}`);
    return `Digest username="${nvrUser}", realm="${realm}", nonce="${nonce}", uri="${path}", response="${response}"`;
  };

  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      "User-Agent": "CrayonBox-Frame-Fetcher/2.0",
      "Connection": "keep-alive"
    };

    if (cachedAuth && (Date.now() - cachedAuth.timestamp < 300000)) {
      headers["Authorization"] = buildDigestHeader(cachedAuth.realm, cachedAuth.nonce);
    }

    const options = {
      hostname: nvrHost,
      port: nvrPort,
      path: path,
      method: 'GET',
      timeout: 4000,
      agent: keepAliveAgent,
      headers
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 401) {
        const authHeader = res.headers['www-authenticate'] || '';
        const realmMatch = authHeader.match(/realm="([^"]+)"/);
        const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

        if (!realmMatch || !nonceMatch) {
          return reject(new Error('Invalid WWW-Authenticate header from NVR'));
        }

        const realm = realmMatch[1];
        const nonce = nonceMatch[1];
        cachedAuth = { realm, nonce, timestamp: Date.now() };

        const authReq = http.request({
          ...options,
          headers: {
            ...headers,
            Authorization: buildDigestHeader(realm, nonce)
          }
        }, (authRes) => {
          if (authRes.statusCode !== 200) {
            return reject(new Error(`NVR returned ${authRes.statusCode}`));
          }
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
        reject(new Error(`NVR returned status ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.end();
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || '102';

    const frameBuffer = await fetchHikvisionFrame(channel);

    return new Response(new Uint8Array(frameBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch camera frame' }, { status: 500 });
  }
}
