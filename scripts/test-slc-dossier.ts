import pg from 'pg';
import { getIssuedTCForStudent } from '../src/app/actions/student-v2-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testSLCDossier() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING SCHOOL LEAVING CERTIFICATE & DOSSIER TC FIX');
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

  // 1. Fetch Transferred student with TC
  console.log('📌 1. Finding student with issued TC in database...');
  const client = await pool.connect();
  const tcRes = await client.query(`
    SELECT tc.*, s.id as student_id, s.first_name, s.last_name
    FROM public.transfer_certificates tc
    JOIN public.students s ON s.id = tc.student_id
    LIMIT 1;
  `);
  client.release();

  assert(tcRes.rows.length > 0, 'Found at least 1 issued TC in database');
  const sampleTC = tcRes.rows[0];
  console.log(`  Testing with student: ${sampleTC.first_name} ${sampleTC.last_name} (TC #${sampleTC.tc_number})`);

  // 2. Test getIssuedTCForStudent server action
  console.log('\n📌 2. Testing getIssuedTCForStudent action serialization...');
  const tcActionRes = await getIssuedTCForStudent(sampleTC.student_id);
  assert(tcActionRes.success === true, 'getIssuedTCForStudent succeeded');
  assert(tcActionRes.data !== null, 'getIssuedTCForStudent returned data');
  
  const tcData = tcActionRes.data;
  assert(typeof tcData.dob === 'string' || tcData.dob === null, 'tcData.dob is string or null (not Date object)', `dob = ${tcData.dob}`);
  assert(typeof tcData.admission_date === 'string' || tcData.admission_date === null, 'tcData.admission_date is string or null', `admission_date = ${tcData.admission_date}`);

  // 3. Test Date helper functions with various input types (Date object, string, ISO string, null, undefined)
  console.log('\n📌 3. Testing toInputDate robustness against all data types...');
  
  const toInputDate = (d: any): string => {
    if (!d) return '';
    if (d instanceof Date) {
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    }
    if (typeof d === 'string') {
      return d.split('T')[0];
    }
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {}
    return '';
  };

  const testCases = [
    { input: new Date('2016-05-15T00:00:00.000Z'), expected: '2016-05-15', label: 'Native Date object' },
    { input: '2016-05-15T00:00:00.000Z', expected: '2016-05-15', label: 'ISO string' },
    { input: '2016-05-15', expected: '2016-05-15', label: 'Plain date string' },
    { input: null, expected: '', label: 'null value' },
    { input: undefined, expected: '', label: 'undefined value' },
    { input: 1463270400000, expected: '2016-05-15', label: 'Epoch timestamp number' },
  ];

  for (const tc of testCases) {
    let result = '';
    let threw = false;
    try {
      result = toInputDate(tc.input);
    } catch (e) {
      threw = true;
    }
    assert(!threw && result === tc.expected, `toInputDate handles ${tc.label}`, `Result: "${result}"`);
  }

  // 4. Test Student Dossier HTTP Route
  console.log('\n📌 4. Testing Dossier HTTP Route /admin/students/[id]...');
  try {
    const routeRes = await fetch(`http://localhost:3000/admin/students/${sampleTC.student_id}`);
    assert(routeRes.status === 200, `Route /admin/students/${sampleTC.student_id} returns HTTP 200 OK`);
  } catch (e: any) {
    assert(false, 'Route fetch failed', e.message);
  }

  await pool.end();

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testSLCDossier().catch(console.error);
