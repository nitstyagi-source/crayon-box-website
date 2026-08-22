const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function activateLiveCctvGateway() {
  await client.connect();

  const GATEWAY = (process.argv[2] || 'https://think-planned-leads-family.trycloudflare.com').replace(/\/+$/, '');

  const camMapping = {
    'Nursery': `${GATEWAY}/nursery_cam/`,
    'LKG': `${GATEWAY}/lkg_cam/`,
    'UKG': `${GATEWAY}/ukg_cam/`,
    'Grade 1': `${GATEWAY}/grade1_cam/`,
    'Grade 2': `${GATEWAY}/grade2_cam/`,
    'Grade 3': `${GATEWAY}/grade3_cam/`,
    'Grade 4': `${GATEWAY}/grade4_cam/`,
    'Grade 5': `${GATEWAY}/grade5_cam/`,
    'Grade 6': `${GATEWAY}/grade6_cam/`,
    'Grade 7': `${GATEWAY}/grade7_cam/`,
    'Grade 8': `${GATEWAY}/grade8_cam/`,
    'Grade 9': `${GATEWAY}/grade9_cam/`,
    'Grade 10': `${GATEWAY}/grade10_cam/`,
    'Science Lab': `${GATEWAY}/science_lab/`,
    'Computer Lab': `${GATEWAY}/computer_lab/`,
    'Activity Hall': `${GATEWAY}/activity_hall/`
  };

  for (const [cls, url] of Object.entries(camMapping)) {
    await client.query(`
      UPDATE cameras 
      SET stream_url = $1, status = 'Online', is_active = true, kill_switch_active = false
      WHERE classroom_name = $2;
    `, [url, cls]);
  }

  await client.query(`
    UPDATE live_stream_settings
    SET gateway_url = $1, global_kill_switch = false;
  `, [GATEWAY]);

  console.log(`🎉 100% SUCCESS: All 16 Classroom CCTV Cameras linked to: ${GATEWAY}`);
  await client.end();
}

activateLiveCctvGateway().catch(console.error);
