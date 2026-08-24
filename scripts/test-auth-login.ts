import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspectAuth() {
  console.log('🔍 ========================================================');
  console.log('🔍 INSPECTING USER ACCOUNTS & AUTHENTICATION ON LOCALHOST');
  console.log('🔍 ========================================================\n');

  const client = await pool.connect();
  try {
    const users = await client.query(`
      SELECT id, username, email, phone_number, full_name, primary_role, account_status, password_hash
      FROM public.user_accounts
      LIMIT 20;
    `);

    console.log(`📌 Found ${users.rows.length} user accounts in public.user_accounts:`);
    users.rows.forEach((u: any) => {
      console.log(`   - [${u.primary_role}] ${u.full_name} | Username: "${u.username}", Email: "${u.email}", Phone: "${u.phone_number}", Status: "${u.account_status}"`);
    });

  } catch (err: any) {
    console.error('Auth inspection error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectAuth();
