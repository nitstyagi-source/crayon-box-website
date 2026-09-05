const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function main() {
  await client.connect();
  console.log('🚀 Seeding comprehensive fee invoices & diary entries for user trials...');

  // 1. Fetch all students
  const res = await client.query(`
    SELECT s.id, s.first_name, s.last_name, s.admission_no, s.enrollment_number, s.campus_id, s.parent_phone,
           c.grade as class_name, c.section as section_name
    FROM students s
    LEFT JOIN classes c ON c.id = s.class_id
  `);

  const students = res.rows;
  console.log(`Found ${students.length} students to generate fee records for.`);

  // Clean existing invoices and ledgers
  await client.query('DELETE FROM student_invoices;');
  await client.query('DELETE FROM student_fee_ledgers;');

  let invCount = 1001;

  for (let i = 0; i < students.length; i++) {
    const st = students[i];
    const studentName = `${st.first_name} ${st.last_name || ''}`.trim();
    const admNo = st.admission_no || st.enrollment_number || `ADM-2026-${1000 + i}`;
    const className = st.class_name || 'Class 1';
    const sectionName = st.section_name || 'A';
    const invNum = `INV-2026-${invCount++}`;
    
    // Vary fee status for rich testing:
    // 0: Paid (Zero dues)
    // 1: Partial (₹5,000 paid, ₹6,500 due)
    // 2+: Unpaid (Full ₹11,500 due)
    const totalAmount = 11500;
    let amountPaid = 0;
    let status = 'Unpaid';

    if (i % 3 === 0) {
      amountPaid = 11500;
      status = 'Paid';
    } else if (i % 3 === 1) {
      amountPaid = 5000;
      status = 'Partial';
    } else {
      amountPaid = 0;
      status = 'Unpaid';
    }

    // Insert Invoice
    await client.query(`
      INSERT INTO student_invoices (
        campus_id, student_id, invoice_number, billing_period,
        total_amount, total_discount, total_late_fee, amount_paid,
        status, due_date, notes, class_name, section_name, student_name, admission_no
      ) VALUES (
        $1, $2, $3, 'Quarter 1 (Apr - Jun 2026)',
        $4, 0, 0, $5,
        $6, '2026-04-15', 'Q1 Tuition, Annual Activity & Smart Class Charges',
        $7, $8, $9, $10
      );
    `, [
      st.campus_id, st.id, invNum, totalAmount, amountPaid,
      status, className, sectionName, studentName, admNo
    ]);

    // Insert Fee Ledger Entry (Debit)
    await client.query(`
      INSERT INTO student_fee_ledgers (
        student_id, campus_id, transaction_type, particulars, debit, credit, amount, running_balance, voucher_type, reference_no, academic_session
      ) VALUES (
        $1, $2, 'DEBIT', 'Quarter 1 Fee Invoice', $3, 0, $3, $3, 'INVOICE', $4, '2026-27'
      );
    `, [st.id, st.campus_id, totalAmount, invNum]);

    // If paid or partial, insert Payment Entry (Credit)
    if (amountPaid > 0) {
      const recNo = `REC-2026-${9000 + i}`;
      await client.query(`
        INSERT INTO student_fee_ledgers (
          student_id, campus_id, transaction_type, particulars, debit, credit, amount, running_balance, voucher_type, reference_no, academic_session
        ) VALUES (
          $1, $2, 'CREDIT', 'Fee Payment via UPI / Mobile Portal', 0, $3, $3, $4, 'RECEIPT', $5, '2026-27'
        );
      `, [st.id, st.campus_id, amountPaid, totalAmount - amountPaid, recNo]);
    }
  }

  console.log(`✅ Seeded ${students.length} student invoices & ledgers successfully!`);

  // Seed sample Homework / Digital Diary entries
  console.log('📝 Seeding digital diary & homework entries...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS digital_diary_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID,
      class_name VARCHAR(100) NOT NULL,
      section_name VARCHAR(50) NOT NULL,
      subject VARCHAR(100) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      assigned_date DATE DEFAULT CURRENT_DATE,
      due_date DATE DEFAULT CURRENT_DATE + 2,
      teacher_name VARCHAR(150) DEFAULT 'Pooja Verma',
      attachment_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await client.query('DELETE FROM digital_diary_entries;');

  const sampleDiary = [
    {
      class_name: 'Class 1',
      section_name: 'A',
      subject: 'Mathematics',
      title: 'Counting & Grouping Practice',
      content: 'Complete Page 14 Exercises 1 to 5 in the Mathematics Activity Workbook.',
      teacher_name: 'Pooja Verma'
    },
    {
      class_name: 'Class 1',
      section_name: 'A',
      subject: 'English',
      title: 'Phonics & Sight Words',
      content: 'Read Chapter 2 "The Little Sparrow" and practice sounding out the 5 new sight words.',
      teacher_name: 'Anita Sharma'
    },
    {
      class_name: 'Class 5',
      section_name: 'A',
      subject: 'Science',
      title: 'Plant Photosynthesis Experiment',
      content: 'Observe the bean sprout kept near the window. Record day 3 leaf color in your lab journal.',
      teacher_name: 'Sunil Mehra'
    },
    {
      class_name: 'Nursery',
      section_name: 'A',
      subject: 'Art & Craft',
      title: 'Tricolour Handprint Activity',
      content: 'Please send a spare apron for tomorrow hand painting session.',
      teacher_name: 'Kavita Joshi'
    }
  ];

  for (const d of sampleDiary) {
    await client.query(`
      INSERT INTO digital_diary_entries (
        campus_id, class_name, section_name, subject, title, content, teacher_name
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      );
    `, [students[0]?.campus_id, d.class_name, d.section_name, d.subject, d.title, d.content, d.teacher_name]);
  }

  console.log(`✅ Seeded ${sampleDiary.length} digital diary entries successfully!`);

  await client.end();
}

main().catch(console.error);
