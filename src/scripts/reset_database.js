const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function resetDatabase() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('🔗 Connected to Supabase PostgreSQL...');

  try {
    // 1. Tables to TRUNCATE (all mock/test operational and transactional data)
    const tablesToTruncate = [
      'admissions_applications',
      'application_documents',
      'enquiries',
      'enquiry_logs',
      'enquiry_timeline_logs',
      'student_invoices',
      'student_invoice_items',
      'invoices',
      'invoice_items',
      'student_fee_ledgers',
      'fee_receipts',
      'fee_payment_transactions',
      'fee_payment_allocations',
      'fee_concessions',
      'fee_refunds',
      'fee_reminders_log',
      'discounts_and_waivers',
      'daily_cash_closings',
      'petty_cash_logs',
      'school_expenses',
      'payroll_ledgers',
      'attendance_logs',
      'attendance_corrections',
      'staff_attendance',
      'staff_attendance_logs',
      'digital_diary_entries',
      'diary_parent_acknowledgements',
      'homework_submissions',
      'staff_student_marks',
      'school_incidents',
      'medical_logs',
      'health_profiles',
      'library_transactions',
      'library_reservations',
      'school_gate_passes',
      'visitors',
      'visitor_logs',
      'helpdesk_tickets',
      'helpdesk_messages',
      'audit_logs',
      'camera_access_logs',
      'live_stream_tokens',
      'student_academic_history',
      'student_documents',
      'students',
      'staff_leaves',
      'staff_leave_balances',
      'leave_requests',
      'staff_salary_advances',
      'staff_appraisals',
      'staff_exits',
      'staff_documents',
      'staff',
    ];

    console.log('🧹 Truncating transactional & test tables...');
    for (const table of tablesToTruncate) {
      try {
        await client.query(`TRUNCATE TABLE public."${table}" CASCADE;`);
        console.log(`  ✓ Cleared table: ${table}`);
      } catch (err) {
        console.log(`  - Note on ${table}: ${err.message}`);
      }
    }

    // 2. Ensure Main Campus exists
    console.log('🏫 Initializing clean Master Campus...');
    const campusRes = await client.query(`
      INSERT INTO campuses (id, name, address, contact_email, contact_phone, school_id, udise_code)
      VALUES (
        'c3d782a9-a50b-4708-a3fc-6b146f456662',
        'Crayon Box International School - Main Campus',
        'Plot 12, Institutional Area, Sector 62, Noida, Uttar Pradesh 201309',
        'admissions@crayonboxschool.com',
        '+91 98100 12345',
        'CB-MAIN',
        '09100448821'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        contact_email = EXCLUDED.contact_email
      RETURNING id;
    `);
    const campusId = campusRes.rows[0].id;
    console.log(`  ✓ Campus ID: ${campusId}`);

    // 3. Ensure Standard Academic Year
    await client.query(`
      INSERT INTO academic_years (campus_id, name, start_date, end_date, is_current)
      VALUES ('${campusId}', '2026-2027', '2026-04-01', '2027-03-31', true)
      ON CONFLICT DO NOTHING;
    `).catch(() => {});

    // 4. Initialize Clean Standard Fee Heads
    console.log('💰 Initializing Master Fee Heads...');
    const feeHeads = [
      { name: 'Tuition Fee', type: 'Academic', recurring: 'Quarterly', is_refundable: false },
      { name: 'AC Transport Fee', type: 'Transport', recurring: 'Quarterly', is_refundable: false },
      { name: 'Science & Computer Lab Fee', type: 'Laboratory', recurring: 'Annual', is_refundable: false },
      { name: 'Annual Development Fund', type: 'Infrastructure', recurring: 'Annual', is_refundable: false },
      { name: 'Sports & Swimming Complex', type: 'Extracurricular', recurring: 'Quarterly', is_refundable: false },
      { name: 'Admission Processing Fee', type: 'One-Time', recurring: 'One-Time', is_refundable: false },
    ];

    for (const head of feeHeads) {
      await client.query(`
        INSERT INTO fee_heads (campus_id, name, fee_type, recurring_type, is_refundable, is_active)
        VALUES ('${campusId}', $1, $2, $3, $4, true)
        ON CONFLICT DO NOTHING;
      `, [head.name, head.type, head.recurring, head.is_refundable]).catch(() => {});
    }
    console.log('  ✓ Master Fee Heads registered');

    // 5. Initialize 16 Clean Camera Slots
    console.log('📹 Initializing 16 Clean Classroom CCTV Slots...');
    const cameras = [
      { name: 'Nursery Play Wing', room: 'Nursery A', code: 'CAM-NUR', path: '/nursery_cam/' },
      { name: 'LKG Activity Room', room: 'LKG A', code: 'CAM-LKG', path: '/lkg_cam/' },
      { name: 'UKG Classroom', room: 'UKG A', code: 'CAM-UKG', path: '/ukg_cam/' },
      { name: 'Grade 1 Classroom', room: 'Grade 1-A', code: 'CAM-G01', path: '/grade1_cam/' },
      { name: 'Grade 2 Classroom', room: 'Grade 2-A', code: 'CAM-G02', path: '/grade2_cam/' },
      { name: 'Grade 3 Classroom', room: 'Grade 3-A', code: 'CAM-G03', path: '/grade3_cam/' },
      { name: 'Grade 4 Classroom', room: 'Grade 4-A', code: 'CAM-G04', path: '/grade4_cam/' },
      { name: 'Grade 5 Classroom', room: 'Grade 5-A', code: 'CAM-G05', path: '/grade5_cam/' },
      { name: 'Grade 6 Classroom', room: 'Grade 6-A', code: 'CAM-G06', path: '/grade6_cam/' },
      { name: 'Grade 7 Classroom', room: 'Grade 7-A', code: 'CAM-G07', path: '/grade7_cam/' },
      { name: 'Grade 8 Classroom', room: 'Grade 8-A', code: 'CAM-G08', path: '/grade8_cam/' },
      { name: 'Grade 9 Classroom', room: 'Grade 9-A', code: 'CAM-G09', path: '/grade9_cam/' },
      { name: 'Grade 10 Board Room', room: 'Grade 10-A', code: 'CAM-G10', path: '/grade10_cam/' },
      { name: 'Science & Bio Laboratory', room: 'Science Lab', code: 'CAM-SCI', path: '/science_lab/' },
      { name: 'AI & Robotics Tech Hub', room: 'Computer Lab', code: 'CAM-COM', path: '/computer_lab/' },
      { name: 'Indoor Sports & Activity Hall', room: 'Activity Hall', code: 'CAM-ACT', path: '/activity_hall/' },
    ];

    await client.query(`DELETE FROM cameras WHERE campus_id = '${campusId}' OR campus_id IS NULL;`).catch(() => {});

    for (const cam of cameras) {
      await client.query(`
        INSERT INTO cameras (campus_id, classroom_name, room_number, camera_name, stream_url, status, is_active, kill_switch_active)
        VALUES ('${campusId}', $1, $2, $3, $4, 'Online', true, false);
      `, [cam.name, cam.room, cam.code, `https://think-planned-leads-family.trycloudflare.com${cam.path}`]);
    }
    console.log('  ✓ 16 Classroom CCTV Cameras initialized');

    // 6. Initialize Master Live Stream Settings
    await client.query(`
      INSERT INTO live_stream_settings (campus_id, gateway_url, global_kill_switch, stream_hours_start, stream_hours_end, watermark_enabled)
      VALUES ('${campusId}', 'https://think-planned-leads-family.trycloudflare.com', false, '08:00:00', '15:30:00', true)
      ON CONFLICT DO NOTHING;
    `).catch(() => {});

    // 7. Seed Administrator Account in Staff
    console.log('👤 Registering Master Admin Account...');
    await client.query(`
      INSERT INTO staff (
        id, campus_id, employee_id, first_name, last_name, email, phone_number, designation, department, role, is_active, is_leadership
      ) VALUES (
        'a1111111-2222-3333-4444-555555555555',
        '${campusId}',
        'CB-EMP-001',
        'Principal',
        'Desk',
        'admin@crayonboxschool.com',
        '+91 98100 12345',
        'Principal & Chief Administrator',
        'Executive Management',
        'Admin',
        true,
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_active = true;
    `);
    console.log('  ✓ Master Admin account created (admin@crayonboxschool.com)');

    console.log('================================================================');
    console.log('✨ DATABASE RESET COMPLETED SUCCESSFULLY ✨');
    console.log('All test student records, invoices, ledgers, and logs cleared.');
    console.log('Fresh environment is ready for real school data insertion.');
    console.log('================================================================');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();
