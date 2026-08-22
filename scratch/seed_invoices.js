const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function seedInvoices() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM public.campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  console.log('Seeding individual invoices for campus:', campusId);

  // Clear existing student_invoices
  await client.query('DELETE FROM public.student_invoices WHERE campus_id = $1', [campusId]);

  // Fetch all students with their academic info and ledger payments
  const studentsRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no, s.enrollment_number,
           h.class_name, h.section_name,
           COALESCE(SUM(l.credit), 0) as total_paid,
           COALESCE(SUM(l.debit), 0) as total_demand
    FROM public.students s
    LEFT JOIN public.student_academic_history h ON h.student_id = s.id AND h.is_current_session = true
    LEFT JOIN public.student_fee_ledgers l ON l.student_id = s.id
    WHERE s.campus_id = $1
    GROUP BY s.id, s.first_name, s.last_name, s.admission_no, s.enrollment_number, h.class_name, h.section_name
  `, [campusId]);

  const students = studentsRes.rows;
  console.log(`Generating individual invoices for ${students.length} students...`);

  let count = 1001;

  for (const st of students) {
    const totalAmount = Number(st.total_demand) > 0 ? Number(st.total_demand) : 11500;
    const amountPaid = Number(st.total_paid);
    const balance = totalAmount - amountPaid;

    let status = 'Unpaid';
    if (balance <= 0) status = 'Paid';
    else if (amountPaid > 0) status = 'Partial';
    else status = 'Unpaid';

    const invNum = `INV-2026-${count++}`;
    const studentName = `${st.first_name} ${st.last_name || ''}`.trim();
    const admNo = st.admission_no || st.enrollment_number || 'ADM-N/A';
    const className = st.class_name || 'Grade 1';
    const sectionName = st.section_name || 'A';

    await client.query(`
      INSERT INTO public.student_invoices (
        campus_id, student_id, invoice_number, billing_period,
        total_amount, total_discount, total_late_fee, amount_paid,
        status, due_date, notes, class_name, section_name, student_name, admission_no
      ) VALUES (
        $1, $2, $3, 'Annual 2026-27 (Term 1)',
        $4, 0, 0, $5,
        $6, '2026-04-10', 'Official session fee invoice including Tuition & Annual charges',
        $7, $8, $9, $10
      );
    `, [
      campusId, st.id, invNum, totalAmount, amountPaid,
      status, className, sectionName, studentName, admNo
    ]);
  }

  console.log(`🎉 Successfully seeded ${students.length} individual student invoices in public.student_invoices!`);
  await client.end();
}

seedInvoices();
