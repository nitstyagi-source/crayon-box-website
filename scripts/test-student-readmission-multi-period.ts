import pg from 'pg';
import {
  enrollUniversalStudentTransactionalAction,
  getFilteredUniversalStudentsAction,
  readmitStudentAction,
  getStudentEnrollmentPeriodsAction,
  deleteTestStudentTransactionalAction
} from '../src/app/actions/universal-student-actions';
import { generateOfficialTCAction } from '../src/app/actions/student-v2-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testStudentReadmissionAndMultiPeriodEnrollment() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING STUDENT RE-ADMISSION & MULTI-PERIOD ENROLLMENTS');
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

  let createdStudentId = '';

  try {
    // 1. ENROLL INITIAL TEST STUDENT (PERIOD 1: Session 2024-2025, Class 1)
    console.log('📌 1. Enrolling Test Student (Period #1: 2024-2025)...');
    const enrollRes = await enrollUniversalStudentTransactionalAction({
      firstName: 'Aarav',
      middleName: 'Kumar',
      lastName: 'Saxena',
      dob: '2017-06-15',
      gender: 'Male',
      bloodGroup: 'B+',
      nationality: 'Indian',
      category: 'General',
      aadhaarNo: '998877665544',
      isTestRecord: true,

      institutionCode: 'CBS',
      academicSession: '2024-2025',
      academicStage: 'PRIMARY',
      className: 'Class 1',
      sectionName: 'A',
      rollNumber: '12',
      admissionNumber: 'CBS-2024-9901',
      admissionDate: '2024-04-05',

      parentName: 'Mr. Vivek Saxena',
      parentRelationship: 'FATHER',
      parentPhone: '+91 9811009988',
      parentEmail: 'vivek.saxena@example.com',
      parentOccupation: 'Software Architect',
      parentAddress: 'A-44, Sector 62, Noida'
    });

    assert(enrollRes.success === true, 'Initial enrollment succeeded', (enrollRes as any).message || 'OK');
    createdStudentId = enrollRes.studentId || '';
    assert(Boolean(createdStudentId), 'Student ID generated', createdStudentId);

    // 2. ISSUE TC (STUDENT DEPARTS / LEAVES SCHOOL)
    console.log('\n📌 2. Issuing Transfer Certificate (Student Leaves School)...');
    const tcRes = await generateOfficialTCAction({
      studentId: createdStudentId,
      institutionCode: 'CBS',
      reasonForLeaving: 'Parent relocated to Bangalore for corporate transfer'
    });

    assert(tcRes.success === true, 'TC generated successfully', (tcRes as any).message || 'OK');

    // Verify student is now marked TRANSFERRED
    const client1 = await pool.connect();
    const stuCheck1 = await client1.query(`SELECT status FROM public.students WHERE id = $1;`, [createdStudentId]);
    assert(stuCheck1.rows[0].status === 'TRANSFERRED', 'Student master status is TRANSFERRED in DB');

    const enrCheck1 = await client1.query(`SELECT is_current, enrollment_status FROM public.student_enrollments WHERE student_id = $1;`, [createdStudentId]);
    assert(enrCheck1.rows[0].is_current === false, 'Period 1 enrollment is marked is_current = false');
    assert(enrCheck1.rows[0].enrollment_status === 'TRANSFERRED', 'Period 1 enrollment is marked TRANSFERRED');
    client1.release();

    // Verify student appears under Archived/Departed Hub in directory filters
    const dirRes1 = await getFilteredUniversalStudentsAction({ status: 'ARCHIVED_HUB', academicSession: '2024-2025', showTestRecords: true });
    const foundDeparted = dirRes1.data.some((s: any) => s.id === createdStudentId && s.subStatus === 'TRANSFERRED');
    assert(foundDeparted, 'Departed student is visible in Archived & Departed Hub (subStatus = TRANSFERRED)');

    // 3. STUDENT RETURNS TO SCHOOL AFTER SOME TIME -> RE-ADMIT INTO SESSION 2026-2027 (PERIOD #2)
    console.log('\n📌 3. Student Returns -> Re-Admitting into Session 2026-2027 (Period #2)...');
    const readmitRes = await readmitStudentAction({
      studentId: createdStudentId,
      institutionCode: 'CBS',
      academicSession: '2026-2027',
      className: 'Class 3',
      sectionName: 'B',
      academicStage: 'PRIMARY',
      admissionNumber: 'CBS-2026-9901', // Retained / Re-issued admission number
      admissionDate: '2026-08-23',
      remarks: 'Family relocated back to Delhi NCR; student re-admitted to Class 3-B.'
    });

    assert(readmitRes.success === true, 'readmitStudentAction succeeded', readmitRes.message);

    // Verify student master record is ACTIVE again
    const client2 = await pool.connect();
    const stuCheck2 = await client2.query(`SELECT status, admission_no FROM public.students WHERE id = $1;`, [createdStudentId]);
    assert(stuCheck2.rows[0].status === 'ACTIVE', 'Student master status restored to ACTIVE');
    assert(stuCheck2.rows[0].admission_no === 'CBS-2026-9901', 'Student active admission_no updated');

    // 4. VERIFY BOTH ENROLLMENT PERIODS ARE RECORDED SEPARATELY
    console.log('\n📌 4. Verifying Multi-Period Enrollments & Progression Log...');
    const enrCheck2 = await client2.query(`
      SELECT id, academic_session, class_name, section_name, admission_number, enrollment_status, is_current
      FROM public.student_enrollments
      WHERE student_id = $1
      ORDER BY created_at ASC;
    `, [createdStudentId]);

    assert(enrCheck2.rows.length === 2, 'Exactly 2 separate enrollment periods recorded in DB', `${enrCheck2.rows.length} periods`);

    const p1 = enrCheck2.rows[0];
    assert(p1.academic_session === '2024-2025' && p1.class_name === 'Class 1' && p1.is_current === false,
      'Period #1 preserved accurately (2024-2025, Class 1, is_current=false)');

    const p2 = enrCheck2.rows[1];
    assert(p2.academic_session === '2026-2027' && p2.class_name === 'Class 3' && p2.is_current === true && p2.enrollment_status === 'ACTIVE',
      'Period #2 active accurately (2026-2027, Class 3, is_current=true, ACTIVE)');

    // Verify progression entry
    const progCheck = await client2.query(`
      SELECT promotion_status, remarks FROM public.student_progression
      WHERE student_id = $1 AND promotion_status = 'RE_ADMITTED';
    `, [createdStudentId]);
    assert(progCheck.rows.length >= 1, 'Re-admission event recorded in student_progression timeline');
    client2.release();

    // 5. TEST GET STUDENT ENROLLMENT PERIODS ACTION
    console.log('\n📌 5. Testing getStudentEnrollmentPeriodsAction...');
    const periodsRes = await getStudentEnrollmentPeriodsAction(createdStudentId);
    assert(periodsRes.success === true, 'getStudentEnrollmentPeriodsAction succeeded');
    assert(periodsRes.periods.length === 2, 'Returned 2 distinct periods in sequence');
    assert(periodsRes.periods[0].tc_number !== null, 'Period #1 includes TC issue reference', periodsRes.periods[0].tc_number);
    assert(periodsRes.periods[1].is_current === true, 'Period #2 is current active period');

    // 6. VERIFY ACTIVE STATUS IN DIRECTORY FILTERS
    console.log('\n📌 6. Testing Active Directory Filters...');
    const dirRes2 = await getFilteredUniversalStudentsAction({ status: 'ACTIVE', academicSession: '2026-2027', showTestRecords: true });
    const foundActive = dirRes2.data.some((s: any) => s.id === createdStudentId);
    assert(foundActive, 'Student is back in Active Students Directory list');

  } finally {
    // Clean up test student
    if (createdStudentId) {
      console.log('\n🧹 Cleaning up test student records...');
      await deleteTestStudentTransactionalAction(createdStudentId);
      console.log('✓ Cleaned up.');
    }
    await pool.end();
  }

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testStudentReadmissionAndMultiPeriodEnrollment().catch(console.error);
