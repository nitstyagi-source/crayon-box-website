const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby@1008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function resetAttendance() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM public.campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  console.log('Resetting attendance records for campus:', campusId);

  // 1. Clear old attendance tables
  await client.query(`
    DELETE FROM public.staff_attendance_logs;
    DELETE FROM public.attendance_corrections;
    DELETE FROM public.official_duty_records;
    DELETE FROM public.staff_attendance;
    DELETE FROM public.student_attendance_corrections;
    DELETE FROM public.student_pickups;
    DELETE FROM public.student_attendance_records;
  `);

  console.log('Cleared all previous staff and student attendance tables.');

  const todayStr = new Date().toISOString().split('T')[0];

  // 2. Fetch all active staff
  const staffRes = await client.query(`SELECT id, first_name, last_name, designation, employee_category FROM public.staff WHERE campus_id = $1`, [campusId]);
  const staffList = staffRes.rows;
  console.log(`Found ${staffList.length} staff members.`);

  // 3. Seed fresh Staff Attendance for Today
  const clockInTimes = ['07:42:00', '07:45:00', '07:48:00', '07:51:00', '07:55:00', '07:58:00', '08:02:00'];
  for (let i = 0; i < staffList.length; i++) {
    const s = staffList[i];
    const punchTime = clockInTimes[i % clockInTimes.length];
    let status = 'Present';
    let remarks = 'Geofence verified at Main Campus Gate 1';

    if (i === 4) {
      status = 'On Leave';
      remarks = 'Approved Casual Leave (Medical)';
    } else if (i === 6) {
      status = 'Present';
      remarks = 'Late arrival by 12 mins (Traffic delay recorded)';
    }

    // Insert staff_attendance record
    await client.query(`
      INSERT INTO public.staff_attendance (
        staff_id, date, in_time, check_in_time, status, working_hours, late_arrival_minutes, geofence_status, remarks
      ) VALUES (
        $1, $2, $3, now(), $4, 7.5, $5, 'Inside Geofence', $6
      );
    `, [s.id, todayStr, punchTime, status, status === 'Present' && i === 6 ? 12 : 0, remarks]);

    // Insert raw punch log
    if (status === 'Present') {
      await client.query(`
        INSERT INTO public.staff_attendance_logs (
          staff_id, campus_id, date, check_in_time, check_in_lat, check_in_lng, is_inside_geofence_checkin, verification_method, status
        ) VALUES (
          $1, $2, $3, $4, 28.7512, 77.1984, true, 'Mobile Geofence & BLE', 'Verified'
        );
      `, [s.id, campusId, todayStr, punchTime]);
    }
  }

  // 4. Fetch all active students
  const stuRes = await client.query(`SELECT id, first_name, last_name, admission_no FROM public.students WHERE campus_id = $1`, [campusId]);
  const students = stuRes.rows;
  console.log(`Found ${students.length} students.`);

  // 5. Fetch class history for students
  const histRes = await client.query(`SELECT student_id, class_name, section_name FROM public.student_academic_history WHERE is_current_session = true`);
  const histMap = {};
  histRes.rows.forEach(h => { histMap[h.student_id] = h; });

  // 6. Seed fresh Student Attendance for Today (Morning Class Roll Call + Gate Arrival)
  for (let i = 0; i < students.length; i++) {
    const st = students[i];
    const h = histMap[st.id] || { class_name: 'Grade 3', section_name: 'A' };
    const arrivalTime = `07:5${i}:00`;

    // 6A. Gate Check-in Event
    await client.query(`
      INSERT INTO public.student_attendance_records (
        student_id, campus_id, date, time, academic_session, class_name, section_name,
        event_type, status, verification_method, remarks, parent_notified
      ) VALUES (
        $1, $2, $3::date, $4::time, '2026-2027', $5, $6,
        'Gate Entry', 'Present', 'Dynamic QR Scan', 'Verified at School Entry Gate', true
      );
    `, [st.id, campusId, todayStr, arrivalTime, h.class_name, h.section_name]);

    // 6B. Class Morning Session Roll Call
    await client.query(`
      INSERT INTO public.student_attendance_records (
        student_id, campus_id, date, time, academic_session, class_name, section_name,
        event_type, status, verification_method, remarks, parent_notified
      ) VALUES (
        $1, $2, $3::date, $4::time, '2026-2027', $5, $6,
        'Morning Session', 'Present', 'Class Teacher Smart QR', 'Marked present during Period 1', true
      );
    `, [st.id, campusId, todayStr, '08:15:00', h.class_name, h.section_name]);
  }

  console.log(`Successfully reset and seeded fresh attendance for ${staffList.length} staff and ${students.length} students!`);
  await client.end();
}

resetAttendance();
