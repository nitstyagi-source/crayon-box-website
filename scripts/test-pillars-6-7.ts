import pg from 'pg';
import {
  getFleetLiveTelemetryAction,
  recordStudentBusScanAction
} from '../src/app/actions/transport-telematics-actions';
import {
  getIncidentsDashboardAction,
  logSchoolIncidentAction,
  updateIncidentStatusAction
} from '../src/app/actions/incident-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testPillars6And7() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING PILLARS 6 & 7: TRANSPORT GPS, CHILD SAFETY & POCSO VAULT');
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

  // 1. TRANSPORT FLEET & LIVE GPS TELEMATICS
  console.log('📌 1. Testing Transport Fleet & Live GPS Radar...');
  const fleetRes = await getFleetLiveTelemetryAction();
  assert(fleetRes.success === true, 'Transport Fleet Dashboard API fetch success');
  assert(fleetRes.buses.length >= 1, 'Active Bus Fleet', `${fleetRes.buses.length} buses`);
  assert(fleetRes.routes.length >= 1, 'Configured Bus Routes', `${fleetRes.routes.length} routes`);

  // Test student RFID / QR Boarding Tap
  const sampleBus = fleetRes.buses[0] || { bus_number: 'DL-1PB-4521' };
  const tapRes = await recordStudentBusScanAction({
    studentQrOrAdmNo: 'CBS-2026-0001',
    busNumber: sampleBus.bus_number,
    stopName: 'Sector 62 Metro Station',
    scanType: 'BOARDING_MORNING'
  });
  assert(tapRes.success === true, 'Student QR/RFID Boarding Tap logged with SMS alert trigger', tapRes.message);

  // 2. CHILD PROTECTION VAULT & POCSO RED-FLAG INCIDENTS
  console.log('\n📌 2. Testing Child Protection Vault & POCSO Red-Flag Protocol...');
  const incRes = await getIncidentsDashboardAction();
  assert(incRes.success === true, 'Incidents Vault API fetch success');
  assert((incRes.counts?.totalIncidents ?? 0) >= 1, 'Incident Audit Records in DB', `${incRes.counts?.totalIncidents} records`);

  // Log a new confidential child protection case
  const newIncRes = await logSchoolIncidentAction({
    incidentType: 'DISCIPLINE',
    studentAdmissionNoOrName: 'CBS-2026-0001',
    category: 'Classroom Conduct',
    severity: 'LOW',
    location: 'Primary Wing Room 102',
    description: 'Minor student disruption during group activity. Teacher resolved with verbal counseling.',
    immediateAction: 'Counseling administered by Class Teacher.',
    reportedBy: 'Teacher Anita Sharma'
  });
  assert(newIncRes.success === true, 'New confidential incident case file logged in vault', newIncRes.message);

  // 3. HTTP ENDPOINTS
  console.log('\n📌 3. Verifying HTTP Routes for Transport & Child Safety...');
  const endpoints = [
    '/admin/transport',
    '/admin/incidents',
    '/admin/health',
    '/admin/security/gatepass',
    '/admin/id-cards/temporary-pass'
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

testPillars6And7().catch(console.error);
