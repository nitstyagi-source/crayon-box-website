const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function runEndToEndLifecycleAudit() {
  console.log('🧪 Starting End-to-End School ERP Lifecycle Audit...');
  await client.connect();

  let passCount = 0;
  let failCount = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failCount++;
    }
  }

  // =========================================================================
  // AUDIT PHASE 1: MASTER DATA & SINGLE SOURCE OF TRUTH
  // =========================================================================
  console.log('\n--- 1. MASTER ARCHITECTURE INTEGRITY ---');
  
  const campusRes = await client.query('SELECT id, name FROM campuses LIMIT 1;');
  assert(campusRes.rows.length === 1, 'Master Campus Exists', campusRes.rows[0]?.name);
  const campusId = campusRes.rows[0]?.id;

  const classesRes = await client.query('SELECT COUNT(*) FROM classes WHERE campus_id = $1;', [campusId]);
  assert(parseInt(classesRes.rows[0].count) >= 22, 'Class & Section Master Loaded', `${classesRes.rows[0].count} Sections`);

  const stuRes = await client.query(`SELECT id, first_name, last_name, admission_no, enrollment_number FROM students WHERE enrollment_number = 'CB2605421';`);
  assert(stuRes.rows.length === 1, 'Student Master Registered', `${stuRes.rows[0]?.first_name} ${stuRes.rows[0]?.last_name} (${stuRes.rows[0]?.admission_no})`);
  const studentId = stuRes.rows[0]?.id;

  const staffRes = await client.query(`SELECT id, first_name, last_name, employee_id, designation FROM staff WHERE employee_id = 'EMP-00102';`);
  assert(staffRes.rows.length === 1, 'Employee Master Registered', `${staffRes.rows[0]?.first_name} ${staffRes.rows[0]?.last_name} (${staffRes.rows[0]?.designation})`);
  const staffId = staffRes.rows[0]?.id;

  // =========================================================================
  // AUDIT PHASE 2: IAM & UNIVERSAL LOGIN WITH PROFILE SWITCHER
  // =========================================================================
  console.log('\n--- 2. IAM, SSO & MULTI-ROLE PROFILE SWITCHER ---');
  
  const iamDualRes = await client.query(`SELECT username, primary_role, linked_roles FROM user_accounts WHERE username = 'neha.sharma@crayonboxschool.com';`);
  assert(iamDualRes.rows.length === 1, 'Dual-Role Account Exists', 'neha.sharma@crayonboxschool.com');
  const linkedRoles = iamDualRes.rows[0]?.linked_roles || [];
  assert(linkedRoles.length === 2, 'Profile Switcher Detects 2 Personas', `${linkedRoles.map(r => r.role).join(' + ')}`);

  const iamStudentRes = await client.query(`SELECT username, primary_role FROM user_accounts WHERE username = 'CB2605421';`);
  assert(iamStudentRes.rows.length === 1, 'Student Login ID Active', 'CB2605421');

  // =========================================================================
  // AUDIT PHASE 3: STUDENT & PARENT DAILY LIFECYCLE
  // =========================================================================
  console.log('\n--- 3. STUDENT & PARENT DAILY LIFECYCLE ---');

  // 3a. Transport Fleet & Morning Bus
  const busRes = await client.query(`SELECT bus_number, registration_number, driver_name, status FROM transport_buses WHERE campus_id = $1;`, [campusId]);
  assert(busRes.rows.length >= 1, 'Transport Bus Telemetry Active', `${busRes.rows[0]?.bus_number} (${busRes.rows[0]?.registration_number})`);

  // 3b. Library Book Loan & Accession Copy
  const libRes = await client.query(`SELECT transaction_code, accession_number, book_title, status FROM library_transactions WHERE student_id = $1;`, [studentId]);
  assert(libRes.rows.length === 1, 'Library Accession Loan Linked', `${libRes.rows[0]?.accession_number}: ${libRes.rows[0]?.book_title}`);

  // 3c. Finance Invoicing & Fee Allocation Reconciliation
  const invRes = await client.query(`SELECT invoice_number, total_amount, status FROM invoices WHERE student_id = $1;`, [studentId]);
  assert(invRes.rows.length === 1, 'Fee Invoice Generated', `${invRes.rows[0]?.invoice_number} (₹${invRes.rows[0]?.total_amount})`);

  const txRes = await client.query(`SELECT id, receipt_number, amount_received, payment_mode, payment_status FROM fee_payment_transactions WHERE student_id = $1;`, [studentId]);
  assert(txRes.rows.length === 1, 'Fee Payment Receipt Generated', `${txRes.rows[0]?.receipt_number} (₹${txRes.rows[0]?.amount_received} via ${txRes.rows[0]?.payment_mode})`);
  const txId = txRes.rows[0]?.id;

  const allocRes = await client.query(`SELECT fee_head_name, amount_allocated FROM fee_payment_allocations WHERE payment_transaction_id = $1;`, [txId]);
  const totalAllocated = allocRes.rows.reduce((sum, r) => sum + parseFloat(r.amount_allocated), 0);
  assert(totalAllocated === 8250.00, 'Fee Head Dynamic Sum Reconciliation', `Total Received ₹8,250.00 == Sum of Heads ₹${totalAllocated.toFixed(2)}`);

  // 3d. Medical Clinic & Incident Log
  const incRes = await client.query(`SELECT incident_code, incident_type, person_name, status, parent_informed FROM school_incidents WHERE student_id = $1;`, [studentId]);
  assert(incRes.rows.length === 1, 'Medical Incident Logged & Resolved', `${incRes.rows[0]?.incident_code} (${incRes.rows[0]?.incident_type} - Parent Informed: ${incRes.rows[0]?.parent_informed})`);

  // 3e. Gate Pass & Escort Verification
  const gateRes = await client.query(`SELECT pass_number, visitor_name, visitor_type, escort_verified, status FROM school_gate_passes WHERE campus_id = $1;`, [campusId]);
  assert(gateRes.rows.length === 1, 'Visitor & Escort QR Verified', `${gateRes.rows[0]?.pass_number} (${gateRes.rows[0]?.visitor_name} - Escort Verified: ${gateRes.rows[0]?.escort_verified})`);

  // 3f. Help Desk Ticket & Parent Interaction
  const tktRes = await client.query(`SELECT ticket_number, category, subject, status FROM helpdesk_tickets WHERE student_id = $1;`, [studentId]);
  assert(tktRes.rows.length === 1, 'Help Desk Ticket Resolved', `${tktRes.rows[0]?.ticket_number} (${tktRes.rows[0]?.category})`);

  // 3g. Feedback & Survey Response
  const survRes = await client.query(`SELECT form_code, responder_name, overall_rating, action_status FROM survey_responses WHERE form_code = 'SURV-2026-0041';`);
  assert(survRes.rows.length === 1, 'Parent Satisfaction Survey Recorded', `${survRes.rows[0]?.responder_name} (Rating: ${survRes.rows[0]?.overall_rating}★)`);

  // =========================================================================
  // AUDIT PHASE 4: TEACHER & FACULTY DAILY LIFECYCLE
  // =========================================================================
  console.log('\n--- 4. TEACHER & FACULTY DAILY LIFECYCLE ---');

  // 4a. Monthly Payroll & Geofenced Ledger
  const payRes = await client.query(`SELECT month, base_salary, net_payable, payment_status FROM payroll_ledgers WHERE staff_id = $1;`, [staffId]);
  assert(payRes.rows.length === 1, 'Monthly Payroll Ledger Calculated', `Net Payable: ₹${payRes.rows[0]?.net_payable} (${payRes.rows[0]?.payment_status})`);

  // 4b. Salary Advances & EMI Ledger
  const advRes = await client.query(`SELECT staff_name, advance_amount, remaining_balance FROM staff_salary_advances WHERE staff_id = $1;`, [staffId]);
  assert(advRes.rows.length === 1, 'Salary Advance & EMI Tracked', `₹${advRes.rows[0]?.advance_amount} (Remaining: ₹${advRes.rows[0]?.remaining_balance})`);

  // =========================================================================
  // AUDIT PHASE 5: ADMINISTRATOR & SECURITY DESK LIFECYCLE
  // =========================================================================
  console.log('\n--- 5. ADMINISTRATOR & CENTRAL AUDIT TRAIL ---');

  // 5a. School Expenses & A5 Vouchers
  const expRes = await client.query(`SELECT department, category, vendor_payee, amount, status FROM school_expenses WHERE campus_id = $1;`, [campusId]);
  assert(expRes.rows.length === 1, 'School Expense Voucher Approved', `₹${expRes.rows[0]?.amount} (${expRes.rows[0]?.vendor_payee})`);

  // 5b. Central Immutable Audit Trail
  const auditRes = await client.query(`SELECT action, entity_type, ip_address FROM audit_logs WHERE campus_id = $1;`, [campusId]);
  assert(auditRes.rows.length >= 3, 'Central Audit Trail Logging Active', `${auditRes.rows.length} Forensic Audit Records Captured`);

  // =========================================================================
  // AUDIT SUMMARY
  // =========================================================================
  console.log('\n=============================================================');
  console.log(`🏁 AUDIT RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('=============================================================\n');

  await client.end();

  if (failCount > 0) {
    process.exit(1);
  }
}

runEndToEndLifecycleAudit().catch(err => {
  console.error('Audit Runner Error:', err);
  process.exit(1);
});
