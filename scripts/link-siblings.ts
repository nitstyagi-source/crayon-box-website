import pg from 'pg';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function linkSiblings() {
  const client = await pool.connect();
  console.log('⏳ Linking realistic sibling households in PostgreSQL...');

  const stuRes = await client.query(`
    SELECT id, first_name, last_name, family_id FROM public.students
    ORDER BY last_name, id
  `);
  const students = stuRes.rows;

  let linked = 0;
  for (let i = 0; i < 60; i += 2) {
    const elder = students[i];
    const younger = students[i + 1];
    if (elder && younger && elder.family_id) {
      await client.query(
        'UPDATE public.students SET family_id = $1 WHERE id = $2',
        [elder.family_id, younger.id]
      );
      linked++;
    }
  }

  console.log(`✅ Linked ${linked} multi-child sibling households!`);
  client.release();
  await pool.end();
}

linkSiblings().catch(console.error);
