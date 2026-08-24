import pg from 'pg';
import { submitAdmission } from '../src/app/actions/forms';
import { 
  getAdmissionsPipelineApplicationsAction, 
  updateAdmissionsApplicationStatusAction,
  scheduleApplicantInterviewAction,
  updateApplicantDocumentVerificationAction,
  approveApplicationAndProvisionParent,
  generateAdmissionFeeReceiptAction
} from '../src/app/actions/admissions';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testAdmissionsPipelineDetails() {
  console.log('🏛️ ========================================================');
  console.log('🏛️ TESTING ADMISSIONS CRM & CANDIDATE DETAILS PIPELINE');
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

  let testAppToken = '';
  let testAppId = '';
  const client = await pool.connect();

  try {
    // 1. SUBMIT ADMISSION APPLICATION VIA FORM ACTION
    console.log('📌 1. Submitting New Admission Application with Parent & Document info...');
    const formData = new FormData();
    formData.append('childName', 'Vihaan Agarwal');
    formData.append('grade', 'Grade 2');
    formData.append('dob', '2019-06-15');
    formData.append('parentName', 'Sanjay Agarwal');
    formData.append('email', 'sanjay.agarwal.test@example.com');
    formData.append('phone', '+91 98222 11000');
    formData.append('document_url', 'https://images.unsplash.com/sample_birth_cert.pdf');

    const submitRes = await submitAdmission(formData);
    assert(submitRes.success === true, 'submitAdmission succeeded', submitRes.applicationId);
    testAppToken = submitRes.applicationId || '';

    // 2. FETCH PIPELINE APPLICATIONS & VERIFY DETAILS
    console.log('\n📌 2. Querying getAdmissionsPipelineApplicationsAction...');
    const pipelineRes = await getAdmissionsPipelineApplicationsAction();
    assert(pipelineRes.success === true, 'getAdmissionsPipelineApplicationsAction returned success');

    const testApp = pipelineRes.data?.find((a: any) => a.token === testAppToken);
    assert(Boolean(testApp), 'Candidate found in live pipeline dataset', testAppToken);
    
    if (testApp) {
      testAppId = testApp.id;
      assert(testApp.fullName === 'Vihaan Agarwal', 'Candidate full name matches', testApp.fullName);
      assert(testApp.gradeApplied === 'Grade 2', 'Grade applied matches', testApp.gradeApplied);
      assert(testApp.parentName === 'Sanjay Agarwal', 'Parent name preserved and visible in CRM', testApp.parentName);
      assert(testApp.parentPhone === '+91 98222 11000', 'Parent phone number matches', testApp.parentPhone);
      assert(testApp.parentEmail === 'sanjay.agarwal.test@example.com', 'Parent email matches', testApp.parentEmail);
      assert(testApp.documentUrl === 'https://images.unsplash.com/sample_birth_cert.pdf', 'Uploaded document URL preserved and accessible', testApp.documentUrl);
      assert(testApp.dateOfBirth === '2019-06-15', 'Candidate date of birth matches', testApp.dateOfBirth);
      assert(testApp.age.includes('yrs'), 'Candidate age calculated dynamically', testApp.age);
      assert(testApp.status === 'SUBMITTED', 'Candidate initial stage is SUBMITTED', testApp.status);
    }

    // 3. TEST DOCUMENT VERIFICATION
    console.log('\n📌 3. Testing Document Verification Action...');
    const docRes = await updateApplicantDocumentVerificationAction(testAppId, 'VERIFIED', 'Birth certificate matches civil registry standards');
    assert(docRes.success === true, 'updateApplicantDocumentVerificationAction succeeded', docRes.message);

    // 4. TEST INTERVIEW SCHEDULING
    console.log('\n📌 4. Testing Assessment / Interview Scheduling Action...');
    const interviewRes = await scheduleApplicantInterviewAction(testAppId, {
      interviewDate: '2026-08-30',
      interviewTime: '11:00',
      interviewerName: 'Dr. Ananya Sharma (Principal)',
      notes: 'Parent interaction & Montessori readiness check'
    });
    assert(interviewRes.success === true, 'scheduleApplicantInterviewAction succeeded', interviewRes.message);

    // Verify status updated to INTERVIEW
    const checkInterview = await client.query(`SELECT status, co_curricular_kits FROM public.admissions_applications WHERE id = $1;`, [testAppId]);
    assert(checkInterview.rows[0].status === 'INTERVIEW', 'Candidate stage moved to INTERVIEW in DB');
    assert(checkInterview.rows[0].co_curricular_kits.interview_schedule.date === '2026-08-30', 'Interview date persisted in DB');

    // 5. TEST APPROVAL & FULL STUDENT ROSTER PROVISIONING
    console.log('\n📌 5. Testing Candidate Approval & Student Roster Provisioning...');
    const approveRes = await approveApplicationAndProvisionParent(testAppId, 'sanjay.agarwal.test@example.com', 'Sanjay', 'Agarwal');
    assert(approveRes.success === true, 'approveApplicationAndProvisionParent succeeded', approveRes.message);

    const checkApprove = await client.query(`SELECT status, parent_id FROM public.admissions_applications WHERE id = $1;`, [testAppId]);
    assert(checkApprove.rows[0].status === 'Approved', 'Candidate status updated to Approved in DB');
    assert(Boolean(checkApprove.rows[0].parent_id), 'Parent record created and linked to application');

    // Verify Student Master Record in public.students
    const studentCheck = await client.query(`SELECT id, admission_no, first_name, last_name, status FROM public.students WHERE admission_application_id = $1;`, [testAppId]);
    assert(studentCheck.rows.length > 0, 'Student master record created in public.students');
    assert(studentCheck.rows[0]?.admission_no.startsWith('ADM-2026-'), 'Official Admission Number generated', studentCheck.rows[0]?.admission_no);
    assert(studentCheck.rows[0]?.status === 'Active', 'Student status initialized to Active');

    const createdStudentId = studentCheck.rows[0]?.id;

    // Verify Student Enrollment Record in public.student_enrollments
    const enrollCheck = await client.query(`SELECT * FROM public.student_enrollments WHERE student_id = $1;`, [createdStudentId]);
    assert(enrollCheck.rows.length > 0, 'Active enrollment record created in public.student_enrollments');
    assert(enrollCheck.rows[0]?.academic_session === '2026-2027', 'Enrolled in 2026-2027 session');

    // Verify Post-Confirmation Document Checklist in public.student_documents
    const docChecklist = await client.query(`SELECT document_type, verification_status FROM public.student_documents WHERE student_id = $1;`, [createdStudentId]);
    assert(docChecklist.rows.length >= 4, 'Post-admission document onboarding checklist generated in student_documents', `${docChecklist.rows.length} docs`);
    assert(docChecklist.rows.every((d: any) => d.verification_status === 'PENDING_SUBMISSION'), 'Documents marked as PENDING_SUBMISSION for post-admission onboarding');

    // 6. TEST ADMISSION INVOICE & LEDGER ACTIVATION
    console.log('\n📌 6. Testing Admission Invoice & Fee Ledger Activation...');
    const invoiceCheck = await client.query(`SELECT * FROM public.student_invoices WHERE student_id = $1;`, [createdStudentId]);
    assert(invoiceCheck.rows.length > 0, 'Admission fee invoice created in public.student_invoices');
    assert(Number(invoiceCheck.rows[0]?.total_amount) === 25000, 'Invoice total amount set to ₹25,000');
    assert(invoiceCheck.rows[0]?.status === 'Unpaid', 'Initial invoice status is Unpaid');

    const ledgerCheck = await client.query(`SELECT * FROM public.student_fee_ledgers WHERE student_id = $1 AND transaction_type = 'DEBIT';`, [createdStudentId]);
    assert(ledgerCheck.rows.length > 0, 'Debit ledger entry created in public.student_fee_ledgers');

    // 7. TEST CUSTOM FEE RECEIPT GENERATION ACTION
    console.log('\n📌 7. Testing Custom Admission Fee Receipt Generation Action (Itemized & Concessions)...');
    const admissionNo = studentCheck.rows[0]?.admission_no;
    const receiptRes = await generateAdmissionFeeReceiptAction({
      applicationId: testAppId,
      studentId: createdStudentId,
      admissionNo: admissionNo,
      studentName: 'Vihaan Agarwal',
      className: 'Grade 2',
      parentName: 'Sanjay Agarwal',
      parentMobile: '+91 98222 11000',
      customReceiptNo: 'CBS-REC-CUSTOM-2026',
      customReceiptDate: '2026-08-23',
      feeHeads: [
        { name: 'Admission & Registration Fee', amount: 10000 },
        { name: 'Tuition Fee (Term 1)', amount: 12000 },
        { name: 'Annual Development Charges', amount: 3000 }
      ],
      concessionAmount: 2000,
      concessionReason: 'Sibling Concession (10%)',
      lateFeeAmount: 0,
      totalAmountDue: 25000,
      amountPaid: 23000,
      paymentMode: 'UPI',
      transactionRef: 'UPI-TEST-998811',
      bankName: 'HDFC Bank',
      collectedBy: 'Rushali (Accounts Desk)',
      remarks: 'Sibling discount applied and Term 1 paid in full'
    });

    assert(receiptRes.success === true, 'generateAdmissionFeeReceiptAction succeeded', receiptRes.message);
    assert(receiptRes.receipt?.receipt_no === 'CBS-REC-CUSTOM-2026', 'Custom Receipt Number preserved', receiptRes.receipt?.receipt_no);
    assert(Number(receiptRes.receipt?.concession_amount) === 2000, 'Custom concession amount recorded in DB', receiptRes.receipt?.concession_amount);
    assert(Number(receiptRes.receipt?.net_amount_paid) === 23000, 'Custom net amount paid recorded in DB', receiptRes.receipt?.net_amount_paid);
    assert(receiptRes.receipt?.status === 'Paid', 'Receipt status marked as Paid');
    assert(Boolean(receiptRes.receipt?.verification_qr), 'QR Code verification generated');

    // Verify DB update on student_invoices and student_fee_ledgers
    const paidInvoiceCheck = await client.query(`SELECT status, amount_paid FROM public.student_invoices WHERE student_id = $1;`, [createdStudentId]);
    assert(paidInvoiceCheck.rows.length > 0, 'Student invoice found in DB');
    assert(Number(paidInvoiceCheck.rows[0]?.amount_paid) === 23000, 'Amount paid updated in student invoice');

    const creditLedgerCheck = await client.query(`SELECT * FROM public.student_fee_ledgers WHERE student_id = $1 AND transaction_type = 'CREDIT';`, [createdStudentId]);
    assert(creditLedgerCheck.rows.length > 0, 'Double-entry credit recorded in public.student_fee_ledgers');

  } catch (error: any) {
    console.error('Test failed with error:', error);
  } finally {
    console.log('\n🧹 Cleaning up test application records...');
    if (testAppId) {
      const sRow = await client.query(`SELECT id FROM public.students WHERE admission_application_id = $1;`, [testAppId]);
      const sId = sRow.rows[0]?.id;
      if (sId) {
        await client.query(`DELETE FROM public.fee_receipts WHERE student_id = $1;`, [sId]);
        await client.query(`DELETE FROM public.student_fee_ledgers WHERE student_id = $1;`, [sId]);
        await client.query(`DELETE FROM public.student_invoices WHERE student_id = $1;`, [sId]);
        await client.query(`DELETE FROM public.student_documents WHERE student_id = $1;`, [sId]);
        await client.query(`DELETE FROM public.student_parents WHERE student_id = $1;`, [sId]);
        await client.query(`DELETE FROM public.student_enrollments WHERE student_id = $1;`, [sId]);
        await client.query(`DELETE FROM public.students WHERE id = $1;`, [sId]);
      }
      await client.query(`DELETE FROM public.fee_receipts WHERE parent_mobile = '+91 98222 11000';`);
      await client.query(`DELETE FROM public.application_documents WHERE application_id = $1;`, [testAppId]);
      await client.query(`DELETE FROM public.admissions_applications WHERE id = $1;`, [testAppId]);
    }
    if (testAppToken) {
      await client.query(`DELETE FROM public.admissions_applications WHERE tracking_token = $1;`, [testAppToken]);
    }
    await client.query(`DELETE FROM public.parents WHERE phone_number = '+91 98222 11000';`);
    client.release();
    await pool.end();
  }

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testAdmissionsPipelineDetails().catch(console.error);
