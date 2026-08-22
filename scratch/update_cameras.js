const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function run() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const camerasMapping = [
    { classroom: 'Nursery', path: 'nursery_cam' },
    { classroom: 'LKG', path: 'lkg_cam' },
    { classroom: 'UKG', path: 'ukg_cam' },
    { classroom: 'Grade 1', path: 'grade1_cam' },
    { classroom: 'Grade 2', path: 'grade2_cam' },
    { classroom: 'Grade 3', path: 'grade3_cam' },
    { classroom: 'Grade 4', path: 'grade4_cam' },
    { classroom: 'Grade 5', path: 'grade5_cam' },
    { classroom: 'Grade 6', path: 'grade6_cam' },
    { classroom: 'Grade 7', path: 'grade7_cam' },
    { classroom: 'Grade 8', path: 'grade8_cam' },
    { classroom: 'Grade 9', path: 'grade9_cam' },
    { classroom: 'Grade 10', path: 'grade10_cam' },
    { classroom: 'Science Lab', path: 'science_lab' },
    { classroom: 'Computer Lab', path: 'computer_lab' }
  ];

  for (const c of camerasMapping) {
    const streamUrl = `http://localhost:8888/${c.path}/`;
    await client.query(`
      UPDATE cameras 
      SET stream_url = '${streamUrl}', status = 'Online', is_active = TRUE, updated_at = NOW()
      WHERE classroom_name = '${c.classroom}' AND campus_id = '${campusId}';
    `);
  }

  console.log('✅ Updated all camera stream URLs in PostgreSQL to http://localhost:8888/<path>/ !');
  await client.end();
}

run().catch(console.error);
