import pg from 'pg';

export const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let sharedPool: pg.Pool | null = null;

export function getSharedPool(): pg.Pool {
  if (!sharedPool) {
    sharedPool = new pg.Pool({
      connectionString: DEFAULT_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return sharedPool;
}
