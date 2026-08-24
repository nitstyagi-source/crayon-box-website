import pg from 'pg';
import { getFilteredUniversalStudentsAction } from '../src/app/actions/universal-student-actions';
import { getDepartedStudentsPendingDuesAction } from '../src/app/actions/finance-concession-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testArchivedTransferredAndFinanceDues() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING ARCHIVED/TRANSFERRED HEAD & FINANCE DUES LEDGER');
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

  // 1. TEST ARCHIVED & DEPARTED HUB (UNIFIED HEAD)
  console.log('📌 1. Testing Unified "Archived & Departed Hub" Query...');
  const archivedHubRes = await getFilteredUniversalStudentsAction({
    status: 'ARCHIVED_HUB'
  });
  assert(archivedHubRes.success === true, 'Archived Hub query executed successfully');
  assert(archivedHubRes.data.length >= 1, 'Archived Hub contains departed records', `${archivedHubRes.data.length} records`);
  assert(Boolean(archivedHubRes.counts), 'Counts summary object present', JSON.stringify(archivedHubRes.counts));

  // Check subStatus mapping in each individual entry
  const hasSubStatusOnAll = archivedHubRes.data.every((s: any) => ['TRANSFERRED', 'WITHDRAWN', 'ARCHIVED'].includes(s.subStatus));
  assert(hasSubStatusOnAll, 'Every entry in Archived Hub has explicit subStatus (TRANSFERRED / WITHDRAWN / ARCHIVED)');

  // 2. TEST ONLY TC GENERATED (TRANSFERRED)
  console.log('\n📌 2. Testing TC Generated / Transferred Filter...');
  const transferredRes = await getFilteredUniversalStudentsAction({
    status: 'TRANSFERRED'
  });
  assert(transferredRes.success === true, 'Transferred query executed successfully');
  assert(transferredRes.data.length >= 1, 'Transferred records found', `${transferredRes.data.length} records`);
  const allTransferred = transferredRes.data.every((s: any) => s.subStatus === 'TRANSFERRED' || s.tc_number);
  assert(allTransferred, 'All returned records are marked as Transferred with TC info');

  // 3. TEST ONLY WITHDRAWN STUDENTS
  console.log('\n📌 3. Testing Withdrawn Students Filter...');
  const withdrawnRes = await getFilteredUniversalStudentsAction({
    status: 'WITHDRAWN'
  });
  assert(withdrawnRes.success === true, 'Withdrawn query executed successfully');
  console.log(`  Found ${withdrawnRes.data.length} Withdrawn students in database.`);

  // 4. TEST SEPARATE FINANCE PENDING DUES ON DEPARTED STUDENTS
  console.log('\n📌 4. Testing Dedicated Departed & Archived Pending Dues in Finance...');
  const departedDuesRes = await getDepartedStudentsPendingDuesAction();
  assert(departedDuesRes.success === true, 'Departed dues action returned success');
  assert(departedDuesRes.totalCount >= 1, 'Departed students with ledger arrears found', `${departedDuesRes.totalCount} students, Total: ₹${departedDuesRes.totalArrears.toLocaleString('en-IN')}`);

  // Verify fields on departed student ledger records
  const sampleDue = departedDuesRes.data[0];
  assert(sampleDue && sampleDue.pendingBalance > 0, 'Sample departed student has pending balance > 0', `Student: ${sampleDue.studentName}, Balance: ₹${sampleDue.pendingBalance}`);
  assert(Boolean(sampleDue.subStatus), 'Sample departed record has departure status', sampleDue.subStatus);
  assert(Boolean(sampleDue.admissionNo), 'Sample departed record has admission number', sampleDue.admissionNo);

  // 5. TEST HTTP ROUTES
  console.log('\n📌 5. Testing HTTP Routes for Student Directory & Finance POS/Pending...');
  try {
    const res1 = await fetch('http://localhost:3000/admin/students');
    assert(res1.status === 200, 'Route /admin/students returns HTTP 200');

    const res2 = await fetch('http://localhost:3000/admin/finance/collections');
    assert(res2.status === 200, 'Route /admin/finance/collections returns HTTP 200');

    const res3 = await fetch('http://localhost:3000/admin/finance/pending');
    assert(res3.status === 200, 'Route /admin/finance/pending returns HTTP 200');
  } catch (e: any) {
    assert(false, 'HTTP Route verification failed', e.message);
  }

  await pool.end();

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testArchivedTransferredAndFinanceDues().catch(console.error);
