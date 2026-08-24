import pg from 'pg';
import {
  createInstitutionAction,
  archiveInstitutionAction,
  restoreInstitutionAction,
  getTrustExecutiveGovernanceMetricsAction
} from '../src/app/actions/governance-analytics-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testSchoolManagementInCommandCenter() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING SCHOOL ADD, ARCHIVE (DELETE) & RESTORE FLOW');
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

  const testCode = 'NHWA';
  const testName = 'New Heritage World Academy';

  // 0. Clean up test record if left from previous runs
  const client = await pool.connect();
  await client.query(`DELETE FROM public.academic_sessions WHERE institution_id IN (SELECT id FROM public.institutions WHERE code = $1);`, [testCode]);
  await client.query(`DELETE FROM public.institutions WHERE code = $1;`, [testCode]);
  await client.query(`DELETE FROM public.campuses WHERE name = $1;`, [testName]);
  client.release();

  // 1. TEST CREATE INSTITUTION ACTION
  console.log('📌 1. Testing "Add New School" Action...');
  const createRes = await createInstitutionAction({
    name: testName,
    shortName: 'New Heritage',
    code: testCode,
    institutionType: 'K12_SCHOOL',
    academicFramework: 'CBSE',
    boardAffiliation: 'CBSE',
    affiliationNumber: 'CBSE/AFF/2026/99',
    schoolIdNumber: '1253999',
    udiseCode: '07010203499',
    phoneNumber: '+91 9811102008',
    principalEmail: 'principal@newheritage.in',
    principalName: 'Dr. R. K. Sharma',
    address: 'Kh. No. 12/4, Institutional Block, Sector 45, Delhi NCR',
    websiteUrl: 'https://newheritage.in',
    logoUrl: '/logo.png',
    brandColor: '#10b981',
    establishedYear: 2026,
    role: 'SUPER_ADMIN'
  });

  assert(createRes.success === true, 'createInstitutionAction succeeded', createRes.message);
  assert(Boolean(createRes.institution?.id), 'Created institution has ID', createRes.institution?.id);

  // Verify in PostgreSQL database
  const client2 = await pool.connect();
  const dbCheck = await client2.query(`SELECT id, code, name, status FROM public.institutions WHERE code = $1;`, [testCode]);
  assert(dbCheck.rows.length === 1, 'Institution record exists in public.institutions');
  assert(dbCheck.rows[0].status === 'ACTIVE', 'Institution status is ACTIVE');

  // Verify campus record created
  const campCheck = await client2.query(`SELECT id, name FROM public.campuses WHERE name = $1;`, [testName]);
  assert(campCheck.rows.length >= 1, 'Associated campus created in public.campuses');

  // Verify academic session auto-linked
  const sessCheck = await client2.query(`SELECT count(*) FROM public.academic_sessions WHERE institution_id = $1;`, [createRes.institution?.id]);
  assert(Number(sessCheck.rows[0].count) >= 1, 'Academic sessions linked to new institution', `${sessCheck.rows[0].count} sessions`);
  client2.release();

  // 2. TEST GOVERNANCE TELEMATICS METRICS CONSOLIDATION
  console.log('\n📌 2. Testing Governance Metrics Consolidation with New School...');
  const govMetrics1 = await getTrustExecutiveGovernanceMetricsAction();
  assert(govMetrics1.success === true, 'getTrustExecutiveGovernanceMetricsAction succeeded');
  const foundActive = govMetrics1.activeInstitutions.some((i: any) => i.code === testCode);
  assert(foundActive, `New school "${testCode}" appears in activeInstitutions list`);

  // 3. TEST RBAC PERMISSION CHECK ON ARCHIVE (DELETE)
  console.log('\n📌 3. Testing RBAC Security: Only Super Admin Can Archive...');
  const unauthorizedArchive = await archiveInstitutionAction({
    id: createRes.institution?.id,
    code: testCode,
    role: 'TEACHER' // Unauthorized role
  });
  assert(unauthorizedArchive.success === false, 'Unauthorized role (TEACHER) is blocked from archiving');

  // 4. TEST ARCHIVE ACTION (SUPER ADMIN)
  console.log('\n📌 4. Testing Super Admin Archive (Soft Delete) Flow...');
  const archiveRes = await archiveInstitutionAction({
    id: createRes.institution?.id,
    code: testCode,
    role: 'SUPER_ADMIN'
  });
  assert(archiveRes.success === true, 'archiveInstitutionAction succeeded', archiveRes.message);

  // Check in database
  const client3 = await pool.connect();
  const dbArchiveCheck = await client3.query(`SELECT status FROM public.institutions WHERE code = $1;`, [testCode]);
  assert(dbArchiveCheck.rows[0].status === 'ARCHIVED', 'Database status updated to ARCHIVED');
  client3.release();

  // Check governance metrics separation
  const govMetrics2 = await getTrustExecutiveGovernanceMetricsAction();
  const inActiveList = govMetrics2.activeInstitutions.some((i: any) => i.code === testCode);
  const inArchivedList = govMetrics2.archivedInstitutions.some((i: any) => i.code === testCode);
  assert(!inActiveList, `Archived school "${testCode}" is removed from activeInstitutions`);
  assert(inArchivedList, `Archived school "${testCode}" is visible in archivedInstitutions`);

  // 5. TEST RESTORE INSTITUTION ACTION
  console.log('\n📌 5. Testing Restore Archived School Flow...');
  const unauthorizedRestore = await restoreInstitutionAction({
    id: createRes.institution?.id,
    code: testCode,
    role: 'STUDENT'
  });
  assert(unauthorizedRestore.success === false, 'Unauthorized role is blocked from restoring');

  const restoreRes = await restoreInstitutionAction({
    id: createRes.institution?.id,
    code: testCode,
    role: 'SUPER_ADMIN'
  });
  assert(restoreRes.success === true, 'restoreInstitutionAction succeeded', restoreRes.message);

  // Check in database
  const client4 = await pool.connect();
  const dbRestoreCheck = await client4.query(`SELECT status FROM public.institutions WHERE code = $1;`, [testCode]);
  assert(dbRestoreCheck.rows[0].status === 'ACTIVE', 'Database status restored to ACTIVE');
  client4.release();

  // Verify governance metrics puts it back
  const govMetrics3 = await getTrustExecutiveGovernanceMetricsAction();
  const backInActive = govMetrics3.activeInstitutions.some((i: any) => i.code === testCode);
  assert(backInActive, `Restored school "${testCode}" is back in activeInstitutions roster`);

  // 6. TEST HTTP ROUTE
  console.log('\n📌 6. Testing Command Center HTTP Route /admin/dashboard...');
  try {
    const routeRes = await fetch('http://localhost:3000/admin/dashboard');
    assert(routeRes.status === 200, 'Command Center /admin/dashboard returns HTTP 200 OK');
  } catch (e: any) {
    assert(false, 'Route fetch failed', e.message);
  }

  // Cleanup test record
  const client5 = await pool.connect();
  await client5.query(`DELETE FROM public.academic_sessions WHERE institution_id IN (SELECT id FROM public.institutions WHERE code = $1);`, [testCode]);
  await client5.query(`DELETE FROM public.institutions WHERE code = $1;`, [testCode]);
  await client5.query(`DELETE FROM public.campuses WHERE name = $1;`, [testName]);
  client5.release();

  await pool.end();

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testSchoolManagementInCommandCenter().catch(console.error);
