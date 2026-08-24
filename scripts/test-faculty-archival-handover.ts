import pg from 'pg';
import { 
  archiveFacultyWithHandoverAction, 
  restoreFacultyMemberAction,
  getPublicFacultyMembers
} from '../src/app/actions/faculty';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testFacultyArchivalAndHandover() {
  console.log('🏛️ ========================================================');
  console.log('🏛️ TESTING FACULTY ARCHIVAL, WORK HANDOVER & AUDIT RETENTION');
  console.log('🏛️ ========================================================\n');

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
  let departingTeacherId = '';
  let replacementTeacherId = '';

  try {
    // 1. SETUP: Create Campus (if needed), Departing Teacher & Replacement Teacher
    console.log('📌 1. Provisioning Test Faculty & Academic Allocations...');
    const campusRes = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const campusId = campusRes.rows[0].id;

    // Create Departing Teacher
    const depRes = await client.query(`
      INSERT INTO public.staff (
        campus_id, employee_id, first_name, last_name, email,
        phone_number, designation, department, wing,
        is_class_teacher, class_teacher_for, status, is_active, created_at
      ) VALUES (
        $1, 'TEST-DEP-001', 'Meenakshi', 'Sharma', 'meenakshi.test@crayonbox.edu',
        '+91 9876543210', 'Senior PRT Teacher', 'Sciences & Robotics', 'Primary (1-5)',
        true, 'Class 5A', 'ACTIVE', true, NOW()
      ) RETURNING id;
    `, [campusId]);
    departingTeacherId = depRes.rows[0].id;

    // Create Replacement Teacher
    const repRes = await client.query(`
      INSERT INTO public.staff (
        campus_id, employee_id, first_name, last_name, email,
        phone_number, designation, department, wing,
        is_class_teacher, class_teacher_for, status, is_active, created_at
      ) VALUES (
        $1, 'TEST-REP-002', 'Sunita', 'Rao', 'sunita.test@crayonbox.edu',
        '+91 9876543211', 'TGT Teacher', 'Sciences & Robotics', 'Primary (1-5)',
        false, null, 'ACTIVE', true, NOW()
      ) RETURNING id;
    `, [campusId]);
    replacementTeacherId = repRes.rows[0].id;

    // Create Test Timetable Slots for Departing Teacher
    await client.query(`
      INSERT INTO public.school_timetable (
        campus_id, academic_session, day_of_week, period_number, period_label, start_time, end_time,
        class_name, section_name, subject_name, teacher_id, teacher_name, status
      ) VALUES 
      ($1, '2026-2027', 'Monday', 1, 'Period 1', '08:00', '08:45', 'Class 5', 'A', 'Science', $2, 'Meenakshi Sharma', 'ACTIVE'),
      ($1, '2026-2027', 'Tuesday', 2, 'Period 2', '08:45', '09:30', 'Class 5', 'A', 'Robotics', $2, 'Meenakshi Sharma', 'ACTIVE');
    `, [campusId, departingTeacherId]);

    // Create Test Lesson Plan for Departing Teacher
    await client.query(`
      INSERT INTO public.staff_lesson_plans (
        staff_id, class_name, section_name, subject_name, chapter_name, topic_name, status, target_date
      ) VALUES 
      ($1, 'Class 5', 'A', 'Science', 'Force and Energy', 'Friction & Laws of Motion', 'In Progress', NOW());
    `, [departingTeacherId]);

    // Create Test Student Marks (should never be deleted or altered)
    await client.query(`
      INSERT INTO public.staff_student_marks (
        staff_id, class_name, section_name, subject_name, exam_name, student_name, marks_obtained, max_marks
      ) VALUES 
      ($1, 'Class 5', 'A', 'Science', 'Unit Test 1', 'Aarav Mehta', 23.5, 25);
    `, [departingTeacherId]);

    assert(Boolean(departingTeacherId && replacementTeacherId), 'Test teachers provisioned in database');

    // 2. CHECK INITIAL PUBLIC VISIBILITY
    console.log('\n📌 2. Checking Initial Public Website Visibility...');
    const pubListBefore = await getPublicFacultyMembers();
    const foundBefore = pubListBefore.data?.find((f: any) => f.id === departingTeacherId);
    assert(Boolean(foundBefore), 'Departing teacher is visible on public website while Active');

    // 3. EXECUTE ARCHIVE & WORK HANDOVER ACTION
    console.log('\n📌 3. Executing archiveFacultyWithHandoverAction...');
    const handoverRes = await archiveFacultyWithHandoverAction({
      staffId: departingTeacherId,
      reasonForLeaving: 'Relocation to Mumbai for Corporate Transfer',
      lastWorkingDate: '2026-08-31',
      replacementStaffId: replacementTeacherId,
      reassignHomeroom: true,
      reassignTimetable: true,
      reassignLessonPlans: true,
      exitNotes: 'Relieving approved by Principal. All physical assets cleared.'
    });

    assert(handoverRes.success === true, 'archiveFacultyWithHandoverAction completed successfully', handoverRes.message);

    // 4. VERIFY DEPARTING TEACHER STATUS IN DB
    console.log('\n📌 4. Verifying Departing Teacher Archival & Portal Deactivation...');
    const depCheck = await client.query(`SELECT status, is_active, is_class_teacher, class_teacher_for FROM public.staff WHERE id = $1;`, [departingTeacherId]);
    assert(depCheck.rows[0].status === 'Inactive', 'Departing teacher status set to Inactive in DB');
    assert(depCheck.rows[0].is_active === false, 'Departing teacher is_active set to false (Portal login disabled)');
    assert(depCheck.rows[0].is_class_teacher === false, 'Departing teacher class teacher role relinquished');

    // 5. VERIFY REPLACEMENT TEACHER DUTIES HANDOVER
    console.log('\n📌 5. Verifying Responsibilities Handed Over to Replacement Teacher...');
    const repCheck = await client.query(`SELECT is_class_teacher, class_teacher_for FROM public.staff WHERE id = $1;`, [replacementTeacherId]);
    assert(repCheck.rows[0].is_class_teacher === true, 'Replacement teacher assigned is_class_teacher = true');
    assert(repCheck.rows[0].class_teacher_for === 'Class 5A', 'Homeroom Class 5A transferred to replacement teacher');

    // Timetable transfer check
    const ttCheck = await client.query(`SELECT teacher_id, teacher_name FROM public.school_timetable WHERE teacher_id = $1;`, [replacementTeacherId]);
    assert(ttCheck.rows.length === 2, 'Timetable period slots reassigned to replacement teacher', `${ttCheck.rows.length} slots found`);
    assert(ttCheck.rows[0].teacher_name === 'Sunita Rao', 'Timetable slot reflects new teacher name');

    // Lesson plan transfer check
    const lpCheck = await client.query(`SELECT staff_id FROM public.staff_lesson_plans WHERE staff_id = $1;`, [replacementTeacherId]);
    assert(lpCheck.rows.length === 1, 'In-progress curriculum & lesson plans transferred to replacement teacher');

    // 6. VERIFY STUDENT MARKS & HISTORICAL AUDIT DATA PRESERVED
    console.log('\n📌 6. Verifying Student Records & CBSE Audit Retention...');
    const marksCheck = await client.query(`SELECT * FROM public.staff_student_marks WHERE staff_id = $1;`, [departingTeacherId]);
    assert(marksCheck.rows.length === 1, 'Student marks & examination gradebooks 100% preserved in database');
    assert(marksCheck.rows[0].student_name === 'Aarav Mehta', 'Student mark payload intact');

    // Exit log check
    const exitCheck = await client.query(`SELECT * FROM public.staff_exits WHERE staff_id = $1;`, [departingTeacherId]);
    assert(exitCheck.rows.length > 0, 'Exit & Handover details recorded in staff_exits for compliance');
    assert(exitCheck.rows[0].final_status === 'ARCHIVED', 'Exit log final_status is ARCHIVED');

    // 7. VERIFY PUBLIC WEBSITE EXCLUSION
    console.log('\n📌 7. Verifying Exclusion from Public Website...');
    const pubListAfter = await getPublicFacultyMembers();
    const foundAfter = pubListAfter.data?.find((f: any) => f.id === departingTeacherId);
    assert(!foundAfter, 'Archived teacher is hidden from public website /faculty directory');

    // 8. TEST 1-CLICK RESTORE ACTION
    console.log('\n📌 8. Testing 1-Click Restore Faculty Member Action...');
    const restoreRes = await restoreFacultyMemberAction(departingTeacherId);
    assert(restoreRes.success === true, 'restoreFacultyMemberAction succeeded', restoreRes.message);

    const restoreCheck = await client.query(`SELECT status, is_active FROM public.staff WHERE id = $1;`, [departingTeacherId]);
    assert(restoreCheck.rows[0].status === 'Active', 'Teacher restored to Active status in DB');
    assert(restoreCheck.rows[0].is_active === true, 'Teacher is_active set to true (Portal login re-enabled)');

  } catch (error: any) {
    console.error('Test run failed with error:', error);
  } finally {
    // Cleanup test records
    console.log('\n🧹 Cleaning up test records...');
    if (departingTeacherId) {
      await client.query(`DELETE FROM public.staff_student_marks WHERE staff_id = $1;`, [departingTeacherId]);
      await client.query(`DELETE FROM public.staff_lesson_plans WHERE staff_id = $1 OR staff_id = $2;`, [departingTeacherId, replacementTeacherId]);
      await client.query(`DELETE FROM public.school_timetable WHERE teacher_id = $1 OR teacher_id = $2;`, [departingTeacherId, replacementTeacherId]);
      await client.query(`DELETE FROM public.staff_exits WHERE staff_id = $1;`, [departingTeacherId]);
      await client.query(`DELETE FROM public.staff WHERE id = $1;`, [departingTeacherId]);
    }
    if (replacementTeacherId) {
      await client.query(`DELETE FROM public.staff WHERE id = $1;`, [replacementTeacherId]);
    }
    client.release();
    await pool.end();
  }

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testFacultyArchivalAndHandover().catch(console.error);
