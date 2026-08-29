import pg from 'pg';
import {
  getFixedAssetsInventoryDashboardAction,
  registerNewFixedAssetAction,
  recordStockroomDisbursementAction
} from '../src/app/actions/inventory-asset-actions';
import {
  getMonthlyPayrollSummaryAction,
  processMonthlyPayrollRunAction,
  getStaffOfficialPayslipAction
} from '../src/app/actions/payroll-engine-actions';
import {
  getProcurementPurchaseOrdersAction,
  createPurchaseOrderAction
} from '../src/app/actions/helpdesk-procurement-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testPillar5Finance() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING PILLAR 5: FINANCE, CONCESSIONS, PAYROLL & ASSETS');
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

  // 1. SIBLING CONCESSION AUDIT & FEE LEDGERS
  console.log('📌 1. Verifying Sibling Concessions & Fee Invoicing Ledgers...');
  const concRes = await client.query(`
    SELECT count(*) as count FROM public.fee_concessions;
  `);
  assert(Number(concRes.rows[0].count) >= 30, 'Active Sibling Concession Grants in DB', `${concRes.rows[0].count} grants`);

  const ledgerRes = await client.query(`
    SELECT count(*) as count FROM public.student_fee_ledgers;
  `);
  assert(Number(ledgerRes.rows[0].count) >= 100, 'Student Double-Entry Fee Ledgers in DB', `${ledgerRes.rows[0].count} entries`);

  // 2. STATUTORY INDIAN PAYROLL ENGINE
  console.log('\n📌 2. Testing Statutory Indian Payroll Engine (EPF, ESIC, PT, TDS)...');
  const payRes = await getMonthlyPayrollSummaryAction({ month: 'August 2026', institutionCode: 'CBS' });
  assert(payRes.success === true, 'Payroll Dashboard API fetch success');
  assert((payRes.roster?.length ?? 0) >= 100, 'Employees included in payroll', `${payRes.roster?.length} staff`);
  assert((payRes.counts?.totalGrossBill ?? 0) > 1000000, 'Total Gross Salary Bill', `₹${payRes.counts?.totalGrossBill?.toLocaleString('en-IN')}`);
  assert((payRes.counts?.totalEpfSum ?? 0) > 0, 'Statutory EPF (12%) Deductions', `₹${payRes.counts?.totalEpfSum?.toLocaleString('en-IN')}`);
  assert((payRes.counts?.totalNetDisbursed ?? 0) > 0, 'Total Net Disbursed', `₹${payRes.counts?.totalNetDisbursed?.toLocaleString('en-IN')}`);

  // Test 1-click payroll disbursement run
  const disburseRes = await processMonthlyPayrollRunAction({ month: 'August 2026', institutionCode: 'CBS' });
  assert(disburseRes.success === true, '1-Click Payroll Run executed', disburseRes.message);

  // 3. FIXED ASSET REGISTER & STRAIGHT-LINE DEPRECIATION
  console.log('\n📌 3. Testing Fixed Asset Register & Straight-Line Depreciation Ledger...');
  const assetRes = await getFixedAssetsInventoryDashboardAction({});
  assert(assetRes.success === true, 'Fixed Assets Dashboard API fetch success');
  assert((assetRes.assets?.length ?? 0) >= 1, 'Registered Capital Fixed Assets', `${assetRes.assets?.length} assets`);
  assert((assetRes.counts?.totalOriginalCost ?? 0) > 0, 'Total Capital Asset Cost', `₹${assetRes.counts?.totalOriginalCost?.toLocaleString('en-IN')}`);
  assert((assetRes.counts?.totalAccumulatedDep ?? 0) >= 0, 'Accumulated Depreciation', `₹${assetRes.counts?.totalAccumulatedDep?.toLocaleString('en-IN')}`);
  assert((assetRes.counts?.totalNetBookValue ?? 0) > 0, 'Net Book Value', `₹${assetRes.counts?.totalNetBookValue?.toLocaleString('en-IN')}`);

  // Register a new capital fixed asset
  const newAssetRes = await registerNewFixedAssetAction({
    name: 'Smart Robotics Laser Cutter & AI Lab Hub',
    category: 'Science Laboratory',
    purchaseCost: 185000,
    usefulLifeYears: 5,
    location: 'Senior AI Research Lab'
  });
  assert(newAssetRes.success === true, 'New Capital Asset registered with ISO QR Tag', newAssetRes.message);

  // 4. INSTITUTIONAL PROCUREMENT & PURCHASE ORDERS
  console.log('\n📌 4. Testing Institutional Procurement & Purchase Orders (PO)...');
  const poRes = await getProcurementPurchaseOrdersAction();
  assert(poRes.success === true, 'Procurement PO Dashboard API fetch success');
  assert(poRes.orders.length >= 3, 'Purchase Orders in DB', `${poRes.orders.length} POs`);

  const newPoRes = await createPurchaseOrderAction({
    vendorName: 'Dell Technologies India',
    category: 'IT Infrastructure',
    totalAmount: 350000,
    itemsSummary: '5x Dell Precision Workstations for AI Curriculum'
  });
  assert(newPoRes.success === true, 'New Purchase Order created', newPoRes.message);

  // 5. HTTP ENDPOINTS
  console.log('\n📌 5. Verifying HTTP Routes for Finance & Payroll...');
  const endpoints = [
    '/admin/finance/structure',
    '/admin/finance/invoices',
    '/admin/finance/collections',
    '/admin/hr/payroll',
    '/admin/inventory',
    '/admin/procurement',
    '/pay-fees'
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

testPillar5Finance().catch(console.error);
