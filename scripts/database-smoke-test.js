const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

const MODULE_TABLE_GROUPS = {
  '1. Governance & Campuses': [
    'institutions',
    'campuses',
    'legal_entities',
    'academic_years',
    'academic_sessions'
  ],
  '2. Staff, Faculty & IAM': [
    'staff',
    'faculty_members',
    'employee_assignments',
    'user_accounts',
    'audit_logs'
  ],
  '3. Students, Parents & Identity': [
    'students',
    'parents',
    'families',
    'guardians',
    'escorts',
    'id_cards'
  ],
  '4. Admissions CRM': [
    'enquiries',
    'enquiry_followups',
    'admission_applications',
    'admissions_assessments'
  ],
  '5. Academics & Timetable': [
    'classes',
    'academic_subjects',
    'curriculum_terms',
    'digital_diary_entries',
    'homework_submissions'
  ],
  '6. Financial Engine & Fees': [
    'fee_structures',
    'fee_heads',
    'fee_structure_items',
    'student_invoices',
    'student_fee_ledgers'
  ],
  '7. Attendance & Gate Control': [
    'student_attendance_records',
    'attendance_settings',
    'leave_requests',
    'gate_passes'
  ],
  '8. Transport & Fleet': [
    'transport_buses',
    'transport_routes',
    'transport_stops',
    'transport_student_allocations'
  ],
  '9. Safety, Health & Facilities': [
    'cameras',
    'school_incidents',
    'infirmary_visit_logs',
    'library_books',
    'assets'
  ],
  '10. Communications & Parent Care': [
    'communications',
    'communication_campaigns',
    'helpdesk_tickets',
    'survey_forms'
  ]
};

async function checkTable(tableName) {
  try {
    const res = await client.query(`SELECT COUNT(*) AS count FROM "${tableName}";`);
    return { exists: true, count: parseInt(res.rows[0].count, 10) };
  } catch (err) {
    return { exists: false, count: 0, error: err.message };
  }
}

async function runSmokeCheck() {
  console.log('================================================================================');
  console.log(' 🗄️  SUPABASE DATABASE LIVE SMOKE CHECK & MODULE AUDIT');
  console.log('================================================================================\n');

  await client.connect();

  let totalChecked = 0;
  let populatedCount = 0;
  let emptyCount = 0;
  let missingCount = 0;

  for (const [moduleName, tables] of Object.entries(MODULE_TABLE_GROUPS)) {
    console.log(`┌── ${moduleName}`);
    for (const table of tables) {
      totalChecked++;
      const { exists, count, error } = await checkTable(table);
      if (!exists) {
        missingCount++;
        console.log(`│   ✗ ${table.padEnd(32)} [NOT FOUND / SCHEMA ERROR]`);
      } else if (count === 0) {
        emptyCount++;
        console.log(`│   ⚠️  ${table.padEnd(32)} [0 rows - Empty]`);
      } else {
        populatedCount++;
        console.log(`│   ✓ ${table.padEnd(32)} [${count.toString().padStart(5)} rows]`);
      }
    }
    console.log(`└──\n`);
  }

  // Quick check on active students sample
  console.log('🔍 DATA INTEGRITY PROBE: Sample Student Verification');
  try {
    const sRes = await client.query(`
      SELECT id, first_name, last_name, admission_no, enrollment_number, parent_phone, status 
      FROM students 
      LIMIT 3;
    `);
    console.log(' Sample Students in Database:');
    sRes.rows.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s.first_name} ${s.last_name || ''} | Adm: ${s.admission_no || s.enrollment_number} | Phone: ${s.parent_phone} | Status: ${s.status}`);
    });
  } catch (e) {
    console.log(' Student sample query error:', e.message);
  }

  // Quick check on active staff sample
  console.log('\n🔍 DATA INTEGRITY PROBE: Sample Faculty & Admin Verification');
  try {
    const fRes = await client.query(`
      SELECT id, first_name, last_name, role, designation, phone_number, official_email 
      FROM staff 
      LIMIT 3;
    `);
    console.log(' Sample Staff in Database:');
    fRes.rows.forEach((st, idx) => {
      console.log(`   ${idx + 1}. ${st.first_name} ${st.last_name || ''} | Role: ${st.role} | Desig: ${st.designation} | Phone: ${st.phone_number}`);
    });
  } catch (e) {
    console.log(' Staff sample query error:', e.message);
  }

  console.log('\n================================================================================');
  console.log(` DATABASE AUDIT SUMMARY:`);
  console.log(` • Key Tables Audited:   ${totalChecked}`);
  console.log(` • Populated with Data:  ${populatedCount} (${((populatedCount / totalChecked) * 100).toFixed(1)}%)`);
  console.log(` • Empty (0 rows):       ${emptyCount}`);
  console.log(` • Missing / Alternate:  ${missingCount}`);
  console.log('================================================================================');

  await client.end();
}

runSmokeCheck().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
