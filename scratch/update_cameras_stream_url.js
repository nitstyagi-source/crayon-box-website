const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function updateCameraUrls() {
  await client.connect();

  const camMap = {
    'Nursery': '/api/cameras/nursery_cam/live',
    'LKG': '/api/cameras/lkg_cam/live',
    'UKG': '/api/cameras/ukg_cam/live',
    'Grade 1': '/api/cameras/grade1_cam/live',
    'Grade 2': '/api/cameras/grade2_cam/live',
    'Grade 3': '/api/cameras/grade3_cam/live',
    'Grade 4': '/api/cameras/grade4_cam/live',
    'Grade 5': '/api/cameras/grade5_cam/live',
    'Grade 6': '/api/cameras/grade6_cam/live',
    'Grade 7': '/api/cameras/grade7_cam/live',
    'Grade 8': '/api/cameras/grade8_cam/live',
    'Grade 9': '/api/cameras/grade9_cam/live',
    'Grade 10': '/api/cameras/grade10_cam/live',
    'Science Lab': '/api/cameras/science_lab/live',
    'Computer Lab': '/api/cameras/computer_lab/live',
    'Activity Hall': '/api/cameras/activity_hall/live'
  };

  for (const [cls, url] of Object.entries(camMap)) {
    await client.query(`
      UPDATE cameras 
      SET stream_url = $1, status = 'Online', is_active = true, kill_switch_active = false
      WHERE classroom_name = $2;
    `, [url, cls]);
  }

  // Update live stream settings default gateway
  await client.query(`
    UPDATE live_stream_settings
    SET gateway_url = '/api/cameras/default/live', global_kill_switch = false;
  `);

  console.log('✅ Updated all camera stream URLs to native live endpoints!');
  await client.end();
}

updateCameraUrls().catch(console.error);
