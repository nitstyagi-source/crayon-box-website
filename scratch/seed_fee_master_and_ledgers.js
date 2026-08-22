const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function seedFeeData() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM public.campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  console.log('Seeding Complete Fee ERP Master & Ledgers for campus:', campusId);

  // 1. Seed Fee Heads
  const FEE_HEADS = [
    { name: 'Tuition Fee', code: 'TUI', category: 'Academic', desc: 'Core monthly academic tuition fee', ref: false, tax: false },
    { name: 'Annual Charges', code: 'ANN', category: 'Academic', desc: 'Annual institutional maintenance and library charges', ref: false, tax: false },
    { name: 'Admission Fee', code: 'ADM', category: 'One-Time', desc: 'One-time admission registration fee', ref: false, tax: false },
    { name: 'Development Fee', code: 'DEV', category: 'Academic', desc: 'Campus infrastructure & STEM lab development', ref: false, tax: false },
    { name: 'Activity Fee', code: 'ACT', category: 'Auxiliary', desc: 'Co-curricular sports, arts, and theater activities', ref: false, tax: false },
    { name: 'Examination Fee', code: 'EXM', category: 'Academic', desc: 'Term-wise assessment & report card processing', ref: false, tax: false },
    { name: 'Computer & AI Fee', code: 'CMP', category: 'Academic', desc: 'Robotics, coding, and smart lab access', ref: false, tax: false },
    { name: 'Smart Class Fee', code: 'SMT', category: 'Academic', desc: 'Interactive digital board content subscription', ref: false, tax: false },
    { name: 'Sports & Fitness Fee', code: 'SPT', category: 'Auxiliary', desc: 'Athletics coaching, equipment, and tournament entry', ref: false, tax: false },
    { name: 'Transport Fee', code: 'TRN', category: 'Transport', desc: 'GPS-enabled school bus pickup and drop', ref: false, tax: false },
    { name: 'Meal & Daycare Fee', code: 'MEL', category: 'Auxiliary', desc: 'Nutritious lunch and extended afternoon care', ref: false, tax: false },
    { name: 'ID Card & Diary Fee', code: 'IDC', category: 'Auxiliary', desc: 'Smart NFC Student & Escort ID Card kit', ref: false, tax: false }
  ];

  await client.query('DELETE FROM public.fee_template_items');
  await client.query('DELETE FROM public.fee_templates');
  await client.query('DELETE FROM public.fee_structure_items');
  await client.query('DELETE FROM public.fee_heads WHERE campus_id = $1', [campusId]);
  const headMap = {};

  for (const fh of FEE_HEADS) {
    const res = await client.query(`
      INSERT INTO public.fee_heads (campus_id, name, code, category, description, is_refundable, is_taxable)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `, [campusId, fh.name, fh.code, fh.category, fh.desc, fh.ref, fh.tax]);
    headMap[fh.name] = res.rows[0].id;
  }
  console.log(`Created ${Object.keys(headMap).length} Standard Fee Heads.`);

  // 2. Seed Fee Structures for all Classes
  await client.query('DELETE FROM public.fee_structures WHERE campus_id = $1', [campusId]);

  const CLASSES_STRUCTURES = [
    { name: 'Early Years (Nursery / LKG / UKG) 2026-27', class_name: 'Nursery', tuition: 3200, annual: 7500, act: 1200, exam: 800, trn: 2000 },
    { name: 'Lower Primary (Grades 1-2) 2026-27', class_name: 'Grade 1', tuition: 3500, annual: 8000, act: 1500, exam: 1000, trn: 2000 },
    { name: 'Upper Primary (Grades 3-5) 2026-27', class_name: 'Grade 3', tuition: 3800, annual: 8500, act: 1500, exam: 1200, trn: 2000 },
    { name: 'Middle School (Grades 6-8) 2026-27', class_name: 'Grade 6', tuition: 4200, annual: 9500, act: 1800, exam: 1500, trn: 2200 },
    { name: 'Secondary & Senior (Grades 9-12) 2026-27', class_name: 'Grade 9', tuition: 4800, annual: 11000, act: 2000, exam: 1800, trn: 2400 }
  ];

  const structMap = {};

  for (const cs of CLASSES_STRUCTURES) {
    const annualTotal = (cs.tuition * 12) + cs.annual + (cs.act * 4) + (cs.exam * 2) + (cs.trn * 12);
    const sRes = await client.query(`
      INSERT INTO public.fee_structures (campus_id, academic_session, name, class_name, total_annual_amount)
      VALUES ($1, '2026-2027', $2, $3, $4)
      RETURNING id;
    `, [campusId, cs.name, cs.class_name, annualTotal]);

    const sId = sRes.rows[0].id;
    structMap[cs.class_name] = sId;

    // Items
    await client.query(`
      INSERT INTO public.fee_structure_items (fee_structure_id, fee_head_id, fee_head_name, frequency, amount)
      VALUES 
        ($1, $2, 'Tuition Fee', 'Monthly', $3),
        ($1, $4, 'Annual Charges', 'Annual', $5),
        ($1, $6, 'Activity Fee', 'Quarterly', $7),
        ($1, $8, 'Examination Fee', 'Term-wise', $9),
        ($1, $10, 'Transport Fee', 'Monthly', $11);
    `, [
      sId, 
      headMap['Tuition Fee'], cs.tuition,
      headMap['Annual Charges'], cs.annual,
      headMap['Activity Fee'], cs.act,
      headMap['Examination Fee'], cs.exam,
      headMap['Transport Fee'], cs.trn
    ]);
  }
  console.log(`Created ${CLASSES_STRUCTURES.length} Comprehensive Fee Structures with items.`);

  // 3. Clear and Provision Student Fee Profiles & Ledgers for 303 Enrolled Students
  await client.query('DELETE FROM public.student_fee_ledgers WHERE campus_id = $1', [campusId]);
  await client.query('DELETE FROM public.fee_receipts WHERE campus_id = $1', [campusId]);
  await client.query('DELETE FROM public.fee_concessions WHERE campus_id = $1', [campusId]);
  await client.query('DELETE FROM public.student_fee_profiles WHERE campus_id = $1', [campusId]);

  const studentsRes = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no, s.enrollment_number, h.class_name, h.section_name,
           p.name as parent_name, p.mobile as parent_mobile
    FROM public.students s
    LEFT JOIN public.student_academic_history h ON h.student_id = s.id AND h.is_current_session = true
    LEFT JOIN public.student_parents p ON p.student_id = s.id AND p.is_primary_contact = true
    WHERE s.campus_id = $1
  `, [campusId]);

  const students = studentsRes.rows;
  console.log(`Provisioning fee profiles, receipts, and double-entry ledgers for ${students.length} students...`);

  let receiptCount = 1001;
  let totalCollected = 0;
  let cashCollected = 0;
  let upiCollected = 0;
  let cardCollected = 0;
  let bankCollected = 0;

  for (let i = 0; i < students.length; i++) {
    const st = students[i];
    const className = st.class_name || 'Grade 1';
    const structId = structMap[className] || structMap['Grade 1'];
    const parentName = st.parent_name || `Parent of ${st.first_name}`;
    const parentMobile = st.parent_mobile || '+919810081008';

    // A. Create Student Fee Profile
    const hasSibling = i % 7 === 0;
    const hasScholarship = i % 15 === 0;
    const concessionType = hasSibling ? 'Sibling Discount' : (hasScholarship ? 'Merit Scholarship' : null);
    const concessionPct = hasSibling ? 20 : (hasScholarship ? 30 : 0);

    const profRes = await client.query(`
      INSERT INTO public.student_fee_profiles (
        campus_id, student_id, academic_session, fee_structure_id, fee_category,
        transport_opted, transport_monthly_fee, concession_type, concession_percentage,
        family_id, status
      ) VALUES (
        $1, $2, '2026-2027', $3, 'General',
        true, 2000, $4, $5,
        $6, 'Active'
      ) RETURNING id;
    `, [campusId, st.id, structId, concessionType, concessionPct, `FAM-${1000 + (i % 80)}`]);

    // B. Ledger Entry 1: Monthly Tuition Demand (Debit: ₹3,500)
    await client.query(`
      INSERT INTO public.student_fee_ledgers (
        campus_id, student_id, academic_session, transaction_date, particulars,
        fee_head_name, debit, credit, running_balance, voucher_type, reference_no
      ) VALUES (
        $1, $2, '2026-2027', '2026-04-01', 'Monthly Tuition Fee (Apr 2026)',
        'Tuition Fee', 3500, 0, 3500, 'Demand', $3
      );
    `, [campusId, st.id, `DEM-2026-${st.admission_no}-01`]);

    // Ledger Entry 2: Annual Charges Demand (Debit: ₹8,000)
    await client.query(`
      INSERT INTO public.student_fee_ledgers (
        campus_id, student_id, academic_session, transaction_date, particulars,
        fee_head_name, debit, credit, running_balance, voucher_type, reference_no
      ) VALUES (
        $1, $2, '2026-2027', '2026-04-01', 'Annual Institutional Charges 2026-27',
        'Annual Charges', 8000, 0, 11500, 'Demand', $3
      );
    `, [campusId, st.id, `DEM-2026-${st.admission_no}-02`]);

    // C. Generate Receipts for paid/partial students
    const isPaid = i % 4 !== 0; // 75% collection rate
    const isPartial = i % 5 === 0;

    if (isPaid) {
      const amountPaid = isPartial ? 5000 : 11500;
      const remainingBal = 11500 - amountPaid;
      const receiptNo = `CBS-REC-${receiptCount++}`;
      const modes = ['UPI', 'Cash', 'Debit Card', 'Net Banking'];
      const pMode = modes[i % modes.length];

      totalCollected += amountPaid;
      if (pMode === 'Cash') cashCollected += amountPaid;
      else if (pMode === 'UPI') upiCollected += amountPaid;
      else if (pMode === 'Debit Card') cardCollected += amountPaid;
      else bankCollected += amountPaid;

      // Create Receipt
      const recRes = await client.query(`
        INSERT INTO public.fee_receipts (
          campus_id, receipt_no, receipt_date, student_id, admission_no,
          student_name, class_name, section_name, parent_name, parent_mobile,
          total_amount_due, concession_amount, late_fee_amount, net_amount_paid,
          remaining_balance, payment_mode, transaction_ref, collected_by, status,
          verification_qr
        ) VALUES (
          $1, $2, '2026-04-05', $3, $4,
          $5, $6, $7, $8, $9,
          11500, $10, 0, $11,
          $12, $13, $14, 'Rushali (Accounts Desk)', $15,
          $16
        ) RETURNING id;
      `, [
        campusId, receiptNo, st.id, st.admission_no,
        `${st.first_name} ${st.last_name || ''}`.trim(), className, st.section_name || 'A',
        parentName, parentMobile,
        concessionPct > 0 ? 500 : 0, amountPaid,
        remainingBal, pMode, `TXN-UPI-${Math.floor(100000000 + Math.random() * 900000000)}`,
        isPartial ? 'Partially Paid' : 'Paid',
        `https://crayonboxschool.com/verify-receipt/${receiptNo}`
      ]);

      // Ledger Entry 3: Payment Receipt (Credit)
      await client.query(`
        INSERT INTO public.student_fee_ledgers (
          campus_id, student_id, academic_session, transaction_date, particulars,
          fee_head_name, debit, credit, running_balance, voucher_type, reference_no, receipt_id
        ) VALUES (
          $1, $2, '2026-2027', '2026-04-05', $3,
          'Payment Receipt', 0, $4, $5, 'Receipt', $6, $7
        );
      `, [
        campusId, st.id, `Fee Payment Received via ${pMode}`,
        amountPaid, remainingBal, receiptNo, recRes.rows[0].id
      ]);
    }
  }

  // 4. Seed Daily Cashier Closing for today
  await client.query('DELETE FROM public.daily_cash_closings WHERE campus_id = $1', [campusId]);
  await client.query(`
    INSERT INTO public.daily_cash_closings (
      campus_id, closing_date, cashier_name, opening_cash,
      cash_collected, upi_collected, card_collected, bank_transfer_collected,
      total_collected, refunds_paid, expected_cash_in_drawer, actual_cash_counted,
      difference_amount, verified_by, status
    ) VALUES (
      $1, CURRENT_DATE, 'Rushali (Accounts Desk)', 5000,
      $2, $3, $4, $5,
      $6, 0, $7, $7,
      0, 'Principal Dr. Ananya Sharma', 'Closed'
    );
  `, [
    campusId, cashCollected, upiCollected, cardCollected, bankCollected,
    totalCollected, 5000 + cashCollected
  ]);

  console.log(`🎉 Successfully seeded Complete Fee ERP:`);
  console.log(`- 12 Standard Fee Heads`);
  console.log(`- 5 Class Fee Structures`);
  console.log(`- ${students.length} Student Fee Profiles & Ledgers`);
  console.log(`- ${receiptCount - 1001} Official Receipts (Total Collections: ₹${(totalCollected / 100000).toFixed(2)} Lakhs)`);
  console.log(`- Daily Cashier Closing verified & balanced.`);

  await client.end();
}

seedFeeData();
