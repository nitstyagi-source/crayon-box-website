import pg from 'pg';
import {
  getFilteredUniversalStudentsAction,
  UniversalStudentEnrollmentInput,
  enrollUniversalStudentTransactionalAction
} from '../src/app/actions/universal-student-actions';
import { generateOfficialTransferCertificateAction } from '../src/app/actions/academic-operations-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testStudentDirectoryOptimization() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING STUDENT MASTER DIRECTORY SEARCH, DROPDOWNS & TRANSFERS');
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

  // 1. TEST ACTIVE STUDENT LIST DEFAULT (Excludes Transferred Students)
  console.log('📌 1. Testing Default Active Student Directory Fetch...');
  // Warm up connection pool
  await getFilteredUniversalStudentsAction({ status: 'ACTIVE' });
  const t0 = Date.now();
  const activeRes = await getFilteredUniversalStudentsAction({
    institutionCode: 'ALL',
    academicSession: '2026-2027',
    status: 'ACTIVE'
  });
  const tActive = Date.now() - t0;

  assert(activeRes.success === true, 'Active students query success');
  assert(activeRes.data.length >= 200, 'Active students count in scope', `${activeRes.data.length} active students`);
  assert(tActive < 500, 'Query performance with connection pooling', `${tActive}ms (Fast)`);

  // Verify that no student in the active list has status = 'TRANSFERRED'
  const transferredInActive = activeRes.data.filter((s: any) => s.student_status === 'TRANSFERRED' || s.enrollment_status === 'TRANSFERRED');
  assert(transferredInActive.length === 0, 'Zero transferred students in ACTIVE list', `${transferredInActive.length} found`);

  // 2. TEST TRANSFERRED STATUS FILTER
  console.log('\n📌 2. Testing Transferred Students Filter...');
  const transferredRes = await getFilteredUniversalStudentsAction({
    institutionCode: 'ALL',
    academicSession: '2026-2027',
    status: 'TRANSFERRED'
  });
  assert(transferredRes.success === true, 'Transferred filter query success');
  assert(transferredRes.data.length >= 1, 'Transferred students retrieved', `${transferredRes.data.length} transferred records`);
  const allAreTransferred = transferredRes.data.every((s: any) => s.student_status === 'TRANSFERRED' || s.enrollment_status === 'TRANSFERRED');
  assert(allAreTransferred, 'All returned records are marked TRANSFERRED');

  // 3. TEST OPTIMIZED SEARCH (Name, Universal ID, Admission No, Phone)
  console.log('\n📌 3. Testing Instant Search Queries...');
  const sampleStudent = activeRes.data[0];
  
  // Search by First Name
  const searchNameRes = await getFilteredUniversalStudentsAction({
    search: sampleStudent.first_name,
    status: 'ACTIVE'
  });
  assert(searchNameRes.success === true && searchNameRes.data.some((s: any) => s.id === sampleStudent.id), `Search by First Name "${sampleStudent.first_name}"`, `${searchNameRes.data.length} matched`);

  // Search by Universal ID
  const searchIdRes = await getFilteredUniversalStudentsAction({
    search: sampleStudent.universal_id,
    status: 'ACTIVE'
  });
  assert(searchIdRes.success === true && searchIdRes.data.length >= 1 && searchIdRes.data[0].universal_id === sampleStudent.universal_id, `Search by Universal ID "${sampleStudent.universal_id}"`);

  // Search by Admission Number
  const searchAdmRes = await getFilteredUniversalStudentsAction({
    search: sampleStudent.admission_number,
    status: 'ACTIVE'
  });
  assert(searchAdmRes.success === true && searchAdmRes.data.length >= 1, `Search by Admission Number "${sampleStudent.admission_number}"`);

  // 4. TEST MULTI-DIMENSIONAL DROPDOWN FILTER COMBINATIONS
  console.log('\n📌 4. Testing Dropdown Combinations (School, Class, Section)...');
  
  // Filter School = CBS
  const cbsRes = await getFilteredUniversalStudentsAction({
    institutionCode: 'CBS',
    academicSession: '2026-2027',
    status: 'ACTIVE'
  });
  assert(cbsRes.success === true, 'Filter School = CBS', `${cbsRes.data.length} students`);

  // Filter Class = Class 1
  const class1Res = await getFilteredUniversalStudentsAction({
    institutionCode: 'CBS',
    className: 'Class 1',
    status: 'ACTIVE'
  });
  assert(class1Res.success === true, 'Filter Class = Class 1', `${class1Res.data.length} students`);

  // Filter Section = A
  const secARes = await getFilteredUniversalStudentsAction({
    institutionCode: 'CBS',
    className: 'Class 1',
    sectionName: 'A',
    status: 'ACTIVE'
  });
  assert(secARes.success === true, 'Filter Section = A', `${secARes.data.length} students`);

  // 5. TEST ISSUING A TRANSFER CERTIFICATE REMOVES STUDENT FROM ACTIVE LIST
  console.log('\n📌 5. Testing Live TC Issue & Auto-Removal from Active Directory...');
  
  // Pick an active student to transfer
  const candidateToTransfer = activeRes.data[activeRes.data.length - 1];
  console.log(`  Issuing Transfer Certificate for candidate: ${candidateToTransfer.first_name} ${candidateToTransfer.last_name} (${candidateToTransfer.admission_number})...`);

  const tcResult = await generateOfficialTransferCertificateAction({
    studentAdmissionNoOrName: candidateToTransfer.admission_number,
    reasonForLeaving: 'Parent transferred to another state',
    approvedBy: 'Principal Dr. Ananya Roy'
  });
  assert(tcResult.success === true, 'TC generation action returned success', tcResult.message);

  // Check Active Student list again — candidate MUST NOT be in the active list
  const activeAfterTC = await getFilteredUniversalStudentsAction({
    institutionCode: 'ALL',
    academicSession: '2026-2027',
    status: 'ACTIVE'
  });
  const stillInActive = activeAfterTC.data.some((s: any) => s.id === candidateToTransfer.id);
  assert(!stillInActive, `Candidate ${candidateToTransfer.first_name} successfully REMOVED from Active Student List`);

  // Check Transferred list — candidate MUST appear in TRANSFERRED list
  const transferredAfterTC = await getFilteredUniversalStudentsAction({
    institutionCode: 'ALL',
    academicSession: '2026-2027',
    status: 'TRANSFERRED'
  });
  const foundInTransferred = transferredAfterTC.data.some((s: any) => s.id === candidateToTransfer.id);
  assert(foundInTransferred, `Candidate ${candidateToTransfer.first_name} now appears in Transferred Students List`);

  // 6. VERIFY HTTP ROUTE
  console.log('\n📌 6. Verifying /admin/students HTTP Route...');
  try {
    const routeRes = await fetch('http://localhost:3000/admin/students');
    assert(routeRes.status === 200, 'Route /admin/students returns HTTP 200 OK');
  } catch (e: any) {
    assert(false, 'Route /admin/students failed', e.message);
  }

  await pool.end();

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testStudentDirectoryOptimization().catch(console.error);
