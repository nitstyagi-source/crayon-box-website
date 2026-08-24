import pg from 'pg';
import {
  getAcademicClassesDashboardAction,
  getMasterTimetableGridAction,
  getTransferCertificatesAction,
  generateOfficialTransferCertificateAction
} from '../src/app/actions/academic-operations-actions';
import { autoAssignAllSubstitutionsAction } from '../src/app/actions/faculty-substitution-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testPillar4Academics() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING PILLAR 4: ACADEMIC OPERATIONS, TIMETABLE, PROXIES & EXAMS');
  console.log('🧪 ========================================================\n');

  let passCount = 0;
  let testCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    testCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    }
  }

  const client = await pool.connect();

  // 1. ACADEMIC CLASSES & 836 TIMETABLE PERIODS
  console.log('📌 1. Verifying Class Cohorts & Master 5-Day Period Matrix...');
  const classesRes = await getAcademicClassesDashboardAction();
  assert(classesRes.success === true, 'Classes Dashboard API fetch success');
  assert(classesRes.classes.length >= 10, 'Configured Class Cohorts', `${classesRes.classes.length} classes`);

  const ttRes = await getMasterTimetableGridAction({ grade: 'Class 1', section: 'A' });
  assert(ttRes.success === true, 'Timetable Grid API fetch success');
  assert(ttRes.totalSlots >= 40, 'Period Slots per class section', `${ttRes.totalSlots} slots`);

  // 2. AUTOMATED ZERO-CLASH FACULTY SUBSTITUTION ENGINE
  console.log('\n📌 2. Testing Automated Faculty Substitution Engine...');
  const subRes = await autoAssignAllSubstitutionsAction({ date: '2026-08-22' });
  assert(subRes.success === true, 'Auto-Assign Proxy Substitutions executed successfully');
  console.log('Proxy Result:', subRes.message);

  // 3. CBSE EXAMINATION SCORES & 9-POINT GRADING
  console.log('\n📌 3. Verifying CBSE Examination Marks & 9-Point Grading Roster...');
  const examRes = await client.query(`
    SELECT count(*) as count FROM public.student_exam_marks;
  `);
  assert(Number(examRes.rows[0].count) >= 10, 'Exam results found in DB', `${examRes.rows[0].count} results`);

  // 4. TRANSFER CERTIFICATE (TC) ENGINE (CBSE RULE 24)
  console.log('\n📌 4. Testing Official CBSE Transfer Certificate (TC) Generator...');
  // Generate a new test TC
  const newTcRes = await generateOfficialTransferCertificateAction({
    studentAdmissionNoOrName: 'CBS-2026-0001',
    reasonForLeaving: 'Parent Relocation to Bengaluru HQ',
    approvedBy: 'Principal Dr. Meenakshi Sunder'
  });
  assert(newTcRes.success === true, 'New CBSE Transfer Certificate generated', newTcRes.message);

  const tcRes = await getTransferCertificatesAction();
  assert(tcRes.success === true, 'TC Dashboard API fetch success');
  assert(tcRes.certificates.length >= 1, 'Existing TC records in DB', `${tcRes.certificates.length} TCs`);

  // 5. HTTP ENDPOINTS
  console.log('\n📌 5. Verifying HTTP Routes for Academic Operations...');
  const endpoints = [
    '/admin/classes',
    '/admin/timetable',
    '/admin/faculty/substitutions',
    '/admin/exams',
    '/admin/transfers',
    '/admin/curriculum',
    '/admin/lesson-diary'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch('http://localhost:3000' + ep);
      assert(res.status === 200, `Route ${ep} returns HTTP 200 OK`);
    } catch (e: any) {
      assert(false, `Route ${ep} failed`, e.message);
    }
  }

  client.release();
  await pool.end();

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testPillar4Academics().catch(console.error);
