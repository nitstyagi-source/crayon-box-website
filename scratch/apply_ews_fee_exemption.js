const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function applyEwsExemption() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM public.campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  console.log('Applying strict EWS/RTE 100% Fee Exemption policy for campus:', campusId);

  // 1. Fetch all students
  const studentsRes = await client.query('SELECT id, first_name, last_name, admission_no FROM public.students WHERE campus_id = $1 ORDER BY admission_no', [campusId]);
  const students = studentsRes.rows;

  let ewsCount = 0;
  const ewsStudentIds = [];

  // Assign ~25% of students as EWS (every 4th student, standard 25% RTE quota)
  for (let i = 0; i < students.length; i++) {
    const isEws = (i % 4 === 3); // 25% EWS quota
    const stId = students[i].id;

    if (isEws) {
      ewsCount++;
      ewsStudentIds.push(stId);

      // Update public.students category
      await client.query(`
        UPDATE public.students
        SET category = 'EWS'
        WHERE id = $1;
      `, [stId]);

      // Update public.student_fee_profiles
      await client.query(`
        UPDATE public.student_fee_profiles
        SET fee_category = 'EWS',
            concession_type = 'RTE / EWS 100% Quota Exemption',
            concession_percentage = 100,
            concession_amount = 11500,
            concession_reason = 'Right to Education (RTE) Act Section 12(1)(c) Mandated Free Seat',
            status = 'EWS Exempted'
        WHERE student_id = $1;
      `, [stId]);
    } else {
      await client.query(`
        UPDATE public.students
        SET category = 'General'
        WHERE id = $1;
      `, [stId]);
    }
  }

  console.log(`Marked ${ewsCount} out of ${students.length} students as EWS (25% RTE Quota).`);

  // 2. Strict Rule: DELETE / REMOVE all invoices for EWS students
  const delInvRes = await client.query(`
    DELETE FROM public.student_invoices
    WHERE student_id = ANY($1::uuid[]);
  `, [ewsStudentIds]);
  console.log(`🗑️ Removed ${delInvRes.rowCount} fee invoices for EWS students (Zero Invoices for EWS).`);

  // 3. Clear receipts and set EWS double-entry ledger to 0 balance with RTE exemption voucher
  await client.query(`
    DELETE FROM public.fee_receipts
    WHERE student_id = ANY($1::uuid[]);
  `, [ewsStudentIds]);

  await client.query(`
    DELETE FROM public.student_fee_ledgers
    WHERE student_id = ANY($1::uuid[]);
  `, [ewsStudentIds]);

  for (const stId of ewsStudentIds) {
    await client.query(`
      INSERT INTO public.student_fee_ledgers (
        campus_id, student_id, academic_session, transaction_date, particulars,
        fee_head_name, debit, credit, running_balance, voucher_type, reference_no
      ) VALUES (
        $1, $2, '2026-2027', '2026-04-01', 'RTE / EWS Quota 100% Exemption (Zero Fee Demand)',
        'EWS RTE Exemption', 0, 0, 0, 'Concession', 'RTE-GOV-2026'
      );
    `, [campusId, stId]);
  }

  console.log(`🎉 Successfully applied EWS 100% Fee Exemption!`);
  console.log(`- Total EWS Students: ${ewsCount}`);
  console.log(`- Invoices Generated for EWS: 0 (Strictly Blocked)`);
  console.log(`- Ledger Balances for EWS: ₹0.00`);

  await client.end();
}

applyEwsExemption();
