const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function seed() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  // 1. Ensure unique constraint
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'live_stream_settings_campus_id_key'
      ) THEN
        ALTER TABLE live_stream_settings ADD CONSTRAINT live_stream_settings_campus_id_key UNIQUE (campus_id);
      END IF;
    END $$;
  `);

  // 2. Insert or update global settings
  await client.query(`
    INSERT INTO live_stream_settings (
      campus_id, global_kill_switch, streaming_start_time, streaming_end_time,
      allowed_days, watermark_enabled, capture_detection_enabled,
      max_session_duration_minutes, token_validity_minutes, require_student_present
    ) VALUES (
      '${campusId}', FALSE, '08:00', '15:30', 'Mon,Tue,Wed,Thu,Fri,Sat', TRUE, TRUE, 60, 5, TRUE
    )
    ON CONFLICT (campus_id) DO UPDATE SET
      streaming_start_time = '08:00',
      streaming_end_time = '15:30',
      watermark_enabled = TRUE,
      capture_detection_enabled = TRUE;
  `);

  // 3. Seed Cameras
  const initialCameras = [
    { classroom: 'Nursery', room: 'Room 101', name: 'Nursery Blossom Wing Cam 1', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { classroom: 'LKG', room: 'Room 102', name: 'LKG Sunshine Classroom Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { classroom: 'UKG', room: 'Room 103', name: 'UKG Rainbow Activity Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { classroom: 'Grade 1', room: 'Room 201', name: 'Grade 1 Primary Section Cam A', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
    { classroom: 'Grade 2', room: 'Room 202', name: 'Grade 2 Discovery Room Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
    { classroom: 'Grade 3', room: 'Room 203', name: 'Grade 3 Scholars Wing Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4' },
    { classroom: 'Grade 4', room: 'Room 204', name: 'Grade 4 Innovation Hub Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
    { classroom: 'Grade 5', room: 'Room 301', name: 'Grade 5 Junior High Cam A', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { classroom: 'Grade 6', room: 'Room 302', name: 'Grade 6 Middle Wing Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4' },
    { classroom: 'Grade 7', room: 'Room 303', name: 'Grade 7 Senior Middle Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { classroom: 'Grade 8', room: 'Room 304', name: 'Grade 8 High School Prep Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
    { classroom: 'Grade 9', room: 'Room 401', name: 'Grade 9 CBSE Senior Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4' },
    { classroom: 'Grade 10', room: 'Room 402', name: 'Grade 10 Board Wing Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { classroom: 'Science Lab', room: 'Lab 1', name: 'Atal Tinkering & Science Lab Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { classroom: 'Computer Lab', room: 'Lab 2', name: 'AI & Robotics Lab Cam', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ];

  for (const cam of initialCameras) {
    const existing = await client.query('SELECT id FROM cameras WHERE classroom_name = $1 AND campus_id = $2', [cam.classroom, campusId]);
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO cameras (campus_id, classroom_name, room_number, camera_name, stream_url, status, is_active)
        VALUES ('${campusId}', '${cam.classroom}', '${cam.room}', '${cam.name}', '${cam.url}', 'Online', TRUE);
      `);
    }
  }

  // 4. Seed Sample Logs
  await client.query(`
    INSERT INTO camera_access_logs (
      campus_id, parent_id, parent_name, student_id, student_name, class_name,
      camera_name, room_number, access_status, reason, device_info, ip_address
    ) VALUES 
    ('${campusId}', 'PAR-9821', 'Mr. Nitin Tyagi', 'STU-1008', 'Aarav Sharma', 'Grade 5', 'Grade 5 Junior High Cam A', 'Room 301', 'Granted', 'Live Classroom View Active - Student Marked Present', 'iPhone 15 Pro / iOS 17.5', '182.74.120.45'),
    ('${campusId}', 'PAR-4421', 'Mrs. Priya Sen', 'STU-1022', 'Rohan Sen', 'Grade 2', 'Grade 2 Discovery Room Cam', 'Room 202', 'Granted', 'Live Classroom View Active - Student Marked Present', 'Samsung Galaxy S24 / Android 14', '122.161.88.12'),
    ('${campusId}', 'PAR-5531', 'Mr. Rajesh Mehra', 'STU-1045', 'Kabir Mehra', 'Grade 7', 'Grade 7 Senior Middle Cam', 'Room 303', 'Denied', 'Student marked ABSENT today. Classroom feed disabled for privacy.', 'Chrome 128 / macOS Sequoia', '103.21.144.66');
  `);

  console.log('✅ Successfully initialized & seeded Live Streaming tables in PostgreSQL!');
  await client.end();
}

seed().catch(console.error);
