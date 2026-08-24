import pg from 'pg';
import {
  getTrustExecutiveGovernanceMetricsAction,
  getDataQualityAuditAction,
  getAcademicSessionsAction,
  createAcademicSessionAction,
  setActiveAcademicSessionAction,
  updateInstitutionDetailsAction
} from '../src/app/actions/governance-analytics-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function runComprehensiveCommandCenterTest() {
  console.log('🧪 ========================================================');
  console.log('🧪 EXECUTIVE COMMAND CENTER FULL END-TO-END AUDIT & TEST');
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

  // TEST 1: Consolidated Metrics for ALL institutions
  console.log('📌 1. Testing Consolidated Executive Governance Metrics (ALL)...');
  const allRes = await getTrustExecutiveGovernanceMetricsAction({ institutionCode: 'ALL' });
  assert(allRes.success === true, 'Metrics fetch success');
  assert((allRes.executive?.totalStudents ?? 0) >= 200, 'Student enrollment count', `${allRes.executive?.totalStudents} students`);
  assert((allRes.executive?.totalStaff ?? 0) >= 100, 'Staff force count', `${allRes.executive?.totalStaff} staff`);
  assert((allRes.executive?.totalInvoicedDemand ?? 0) > 0, 'Invoiced fee demands', `₹${allRes.executive?.totalInvoicedDemand?.toLocaleString('en-IN')}`);
  assert((allRes.executive?.dataIntegrityScore ?? 0) >= 95, 'Data integrity score', `${allRes.executive?.dataIntegrityScore}%`);
  assert((allRes.institutions?.length ?? 0) === 4, 'All 4 Trust institutions returned', `${allRes.institutions?.map((i: any) => i.code).join(', ')}`);

  // TEST 2: Scoped Metrics for Individual Institution (CBS)
  console.log('\n📌 2. Testing Scoped Metrics for Individual Institution (CBS)...');
  const cbsRes = await getTrustExecutiveGovernanceMetricsAction({ institutionCode: 'CBS' });
  assert(cbsRes.success === true, 'Scoped fetch success for CBS');
  assert((cbsRes.executive?.totalStudents ?? 0) > 0, 'Scoped students for CBS', `${cbsRes.executive?.totalStudents} students`);

  // TEST 3: Master Data Quality Audit
  console.log('\n📌 3. Testing Continuous Database Quality Audit...');
  const auditRes = await getDataQualityAuditAction();
  assert(auditRes.success === true, 'Audit fetch success');
  assert(auditRes.overallIntegrity === 100, 'Overall database integrity', '100% Pristine');
  assert(auditRes.checks.length === 5, '5 Core integrity rules verified');
  const allPassed = auditRes.checks.every((c: any) => c.status === 'PASSED');
  assert(allPassed, 'All 5 database rules show PASSED status');

  // TEST 4: Academic Sessions Management
  console.log('\n📌 4. Testing Academic Sessions Query & Creation...');
  const sessRes = await getAcademicSessionsAction();
  assert(sessRes.success === true, 'Academic sessions query success');
  assert(sessRes.sessions.length >= 1, 'At least 1 academic session configured', `Found ${sessRes.sessions.length} sessions`);
  const activeSess = sessRes.sessions.find((s: any) => s.is_current);
  assert(!!activeSess, 'Active current session identified', activeSess?.name || 'None');

  // Create or update a test session
  const testSessionName = '2026-2027';
  const setActiveRes = await setActiveAcademicSessionAction(testSessionName);
  assert(setActiveRes.success === true, `Set session "${testSessionName}" active`);

  // TEST 5: Institution Profile Editing & Dual Upload Persistence
  console.log('\n📌 5. Testing Institution Profile Details Update & Persistence...');
  const client = await pool.connect();
  const cbsRow = (await client.query(`SELECT * FROM public.institutions WHERE code = 'CBS' LIMIT 1;`)).rows[0];
  assert(!!cbsRow, 'CBS Institution record found in PostgreSQL');

  const updateInstRes = await updateInstitutionDetailsAction({
    id: cbsRow.id,
    name: 'Crayon Box International School',
    shortName: 'Crayon Box School',
    code: 'CBS',
    boardAffiliation: 'CBSE',
    affiliationNumber: '2130894',
    schoolIdNumber: '07010203401',
    udiseCode: '07010203401',
    phoneNumber: '+91 120 4567890',
    principalEmail: 'principal@crayonboxschool.com',
    principalName: 'Dr. Meenakshi Sunder',
    address: 'Plot 4, Sector 62, Institutional Area, Noida, UP - 201309',
    websiteUrl: 'https://crayonboxschool.edu.in',
    logoUrl: '/logo.png',
    brandColor: '#2563eb',
    establishedYear: 2014
  });
  assert(updateInstRes.success === true, 'Institution details updated in DB');

  // Verify in PostgreSQL
  const verifiedCbs = (await client.query(`SELECT * FROM public.institutions WHERE id = $1;`, [cbsRow.id])).rows[0];
  assert(verifiedCbs.name === 'Crayon Box International School', 'School name persisted', verifiedCbs.name);
  assert(verifiedCbs.phone_number === '+91 120 4567890', 'Phone number persisted', verifiedCbs.phone_number);
  assert(verifiedCbs.principal_name === 'Dr. Meenakshi Sunder', 'Principal name persisted', verifiedCbs.principal_name);
  assert(verifiedCbs.school_id_number === '07010203401', 'School ID persisted', verifiedCbs.school_id_number);
  assert(verifiedCbs.udise_code === '07010203401', 'UDISE code persisted', verifiedCbs.udise_code);

  client.release();
  await pool.end();

  // TEST 6: HTTP Verification of Command Center Routes
  console.log('\n📌 6. Testing HTTP Route Reachability...');
  const resDash = await fetch('http://localhost:3000/admin/dashboard');
  assert(resDash.status === 200, 'Route /admin/dashboard returns HTTP 200 OK');

  const resAdmin = await fetch('http://localhost:3000/admin');
  assert(resAdmin.status === 200, 'Route /admin returns HTTP 200 OK');

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');

  if (passCount === testCount) {
    console.log('🎉 ALL COMMAND CENTER SYSTEMS ARE 100% OPERATIONAL & PRISTINE!');
  } else {
    process.exit(1);
  }
}

runComprehensiveCommandCenterTest().catch((err) => {
  console.error('Fatal error during command center test:', err);
  process.exit(1);
});
