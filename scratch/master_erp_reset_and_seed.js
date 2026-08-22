const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function resetAndSeedMasterErp() {
  console.log('🚀 Starting Complete ERP Database Reset & Master Seeding...');
  await client.connect();

  // 1. Clean / Truncate Transactional & Operational Tables
  console.log('🧹 Cleaning transactional tables...');
  const tablesToClean = [
    'fee_payment_allocations',
    'fee_payment_transactions',
    'fee_receipts',
    'invoices',
    'invoice_items',
    'school_expenses',
    'school_gate_passes',
    'restricted_visitors',
    'library_transactions',
    'library_reservations',
    'school_incidents',
    'helpdesk_messages',
    'helpdesk_tickets',
    'survey_responses',
    'survey_forms',
    'payroll_ledgers',
    'staff_salary_advances',
    'staff_increments_history',
    'staff_hr_letters',
    'user_sessions',
    'user_accounts',
    'login_audit_logs',
    'auth_otp_logs',
    'audit_logs'
  ];

  for (const t of tablesToClean) {
    try {
      await client.query(`TRUNCATE TABLE ${t} CASCADE;`);
    } catch (e) {
      try {
        await client.query(`DELETE FROM ${t};`);
      } catch (err) {
        // Table might not exist
      }
    }
  }

  // 2. Fetch or Create Campus
  console.log('🏫 Verifying Master Campus...');
  let campusRes = await client.query('SELECT id FROM campuses LIMIT 1;');
  let campusId;
  if (campusRes.rows.length === 0) {
    const cIns = await client.query(`
      INSERT INTO campuses (name, address, phone_number, email)
      VALUES ('Crayon Box School (Main Campus)', '6/20, Shastri Park Ext. D-Block, Phool Bagh, Burari, Delhi', '+91 98186 65077', 'info@crayonboxschool.com')
      RETURNING id;
    `);
    campusId = cIns.rows[0].id;
  } else {
    campusId = campusRes.rows[0].id;
  }

  // 3. Seed Classes & Sections (2026-27)
  console.log('📚 Setting up Classes & Sections...');
  const classNames = ['Pre-Nursery', 'Nursery', 'KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
  const classMap = {};

  for (const cName of classNames) {
    for (const sec of ['A', 'B']) {
      const cRes = await client.query(`
        INSERT INTO classes (campus_id, grade, section)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [campusId, cName, sec]);

      if (cRes.rows.length > 0) {
        classMap[`${cName}-${sec}`] = cRes.rows[0].id;
      }
    }
  }

  // 4. Seed Central Student & Parent Masters
  console.log('🧑‍🎓 Seeding Student & Parent Masters...');
  
  const authRes = await client.query('SELECT id FROM auth.users LIMIT 1;');
  const parentId = authRes.rows[0]?.id || '3e7a6538-17db-4cb4-8ffe-1a2ebb022091';

  await client.query(`
    INSERT INTO parents (id, first_name, last_name, phone_number)
    VALUES ($1, 'Nitin', 'Sharma', '+919876543452')
    ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone_number = EXCLUDED.phone_number;
  `, [parentId]);

  // Clean old students for clean restart
  await client.query('DELETE FROM students WHERE campus_id = $1;', [campusId]);

  // Student 1: Aarav Sharma (Grade 5A, CB2605421)
  const stu1Res = await client.query(`
    INSERT INTO students (
      campus_id, parent_id, admission_no, enrollment_number, roll_no, status,
      first_name, last_name, dob, gender, blood_group, transport_mode, transport_route
    ) VALUES (
      $1, $2, 'CBS-2026-1042', 'CB2605421', '12', 'Active',
      'Aarav', 'Sharma', '2016-08-21', 'Male', 'O+', 'Bus', 'Route R-05'
    ) RETURNING id;
  `, [campusId, parentId]);
  const student1Id = stu1Res.rows[0].id;

  // Student 2: Ananya Sharma (Grade 2B, Sibling)
  const stu2Res = await client.query(`
    INSERT INTO students (
      campus_id, parent_id, admission_no, enrollment_number, roll_no, status,
      first_name, last_name, dob, gender, blood_group, transport_mode, transport_route
    ) VALUES (
      $1, $2, 'CBS-2026-1189', 'CB2605422', '08', 'Active',
      'Ananya', 'Sharma', '2019-11-14', 'Female', 'B+', 'Bus', 'Route R-05'
    ) RETURNING id;
  `, [campusId, parentId]);
  const student2Id = stu2Res.rows[0].id;

  // 5. Seed Central Employee Master (Faculty & Staff)
  console.log('👩‍🏫 Seeding Employee Master (Staff & Faculty)...');
  
  // Faculty 1: Neha Sharma (PRT Mathematics & Mentor - ALSO Mother of Aarav & Ananya)
  let staff1Id;
  const staff1Check = await client.query(`SELECT id FROM staff WHERE employee_code = 'CBS-FAC-0102' LIMIT 1;`);
  if (staff1Check.rows.length > 0) {
    staff1Id = staff1Check.rows[0].id;
  } else {
    const staff1Res = await client.query(`
      INSERT INTO staff (
        campus_id, employee_id, employee_code, first_name, last_name, designation,
        department, email, official_email, phone_number, joining_date, employment_type,
        status, basic_salary, hra, conveyance, special_allowance, gross_salary,
        pf_deduction, tds_deduction, net_salary, bank_name, bank_account_no, bank_ifsc
      ) VALUES (
        $1, 'EMP-00102', 'CBS-FAC-0102', 'Neha', 'Sharma', 'PRT Mathematics & Mentor',
        'Academics', 'neha.sharma@crayonboxschool.com', 'neha.sharma@crayonboxschool.com',
        '+919876543452', '2024-04-01', 'Permanent', 'Active',
        25000.00, 10000.00, 2000.00, 3000.00, 40000.00,
        2000.00, 1200.00, 36800.00, 'State Bank of India', '39100291081', 'SBIN0001821'
      ) RETURNING id;
    `, [campusId]);
    staff1Id = staff1Res.rows[0].id;
  }

  // Faculty 2: Bhawna Tyagi (Academic Coordinator)
  let staff2Id;
  const staff2Check = await client.query(`SELECT id FROM staff WHERE employee_code = 'CBS-FAC-0105' LIMIT 1;`);
  if (staff2Check.rows.length > 0) {
    staff2Id = staff2Check.rows[0].id;
  } else {
    const staff2Res = await client.query(`
      INSERT INTO staff (
        campus_id, employee_id, employee_code, first_name, last_name, designation,
        department, email, official_email, phone_number, joining_date, employment_type,
        status, basic_salary, hra, conveyance, special_allowance, gross_salary,
        pf_deduction, tds_deduction, net_salary, bank_name, bank_account_no, bank_ifsc
      ) VALUES (
        $1, 'EMP-00105', 'CBS-FAC-0105', 'Bhawna', 'Tyagi', 'Academic Coordinator & Senior PRT',
        'Academics', 'bhawna.tyagi@crayonboxschool.com', 'bhawna.tyagi@crayonboxschool.com',
        '+919811223344', '2023-06-01', 'Permanent', 'Active',
        30000.00, 12000.00, 2000.00, 4000.00, 48000.00,
        2500.00, 1500.00, 44000.00, 'HDFC Bank', '50100291827', 'HDFC0001092'
      ) RETURNING id;
    `, [campusId]);
    staff2Id = staff2Res.rows[0].id;
  }

  // 6. Seed Transport Fleet & Telemetry
  console.log('🚌 Seeding Transport Fleet & Routes...');
  await client.query(`
    INSERT INTO transport_buses (campus_id, bus_number, registration_number, bus_type, capacity, driver_name, driver_phone, attendant_name, attendant_phone, status)
    VALUES ($1, 'Bus #12', 'DL-1P-AZ-8812', 'CNG Standard 42-Seater', 42, 'Ramesh Yadav', '+919911002244', 'Sunita Devi', '+919811009988', 'Active')
    ON CONFLICT DO NOTHING;
  `, [campusId]);

  await client.query(`
    INSERT INTO transport_routes (campus_id, route_code, route_name, starting_point, destination, total_stops, status)
    VALUES ($1, 'R-05', 'Route R-05 — Burari Loop', 'Crayon Box School', 'Nathupura via Burari', 6, 'Active')
    ON CONFLICT DO NOTHING;
  `, [campusId]);

  // 7. Seed Library Catalog & Accession Copies
  console.log('📖 Seeding Library Master & Physical Copies...');
  let bookId;
  const bookCheck = await client.query(`SELECT id FROM library_books WHERE book_code = 'BK-2026-0041' LIMIT 1;`);
  if (bookCheck.rows.length > 0) {
    bookId = bookCheck.rows[0].id;
  } else {
    const bookRes = await client.query(`
      INSERT INTO library_books (
        campus_id, book_code, title, author, publisher, isbn, category,
        language, class_grade, rack_location, price, total_copies, available_copies, description
      ) VALUES (
        $1, 'BK-2026-0041', 'Science Encyclopedia for Young Explorers', 'Dr. Sarah Jenkins',
        'DK Children Publishing', '978-0241385421', 'Science', 'English', 'Grade 3-8',
        'Rack S-02, Shelf 3', 650.00, 5, 4, 'Visual encyclopedia of physics and biology.'
      ) RETURNING id;
    `, [campusId]);
    bookId = bookRes.rows[0].id;
  }

  let copyId;
  const copyCheck = await client.query(`SELECT id FROM library_book_copies WHERE accession_number = 'ACC-1005' LIMIT 1;`);
  if (copyCheck.rows.length > 0) {
    copyId = copyCheck.rows[0].id;
  } else {
    const copyRes = await client.query(`
      INSERT INTO library_book_copies (book_id, accession_number, barcode_qr, copy_number, status, rack_location)
      VALUES ($1, 'ACC-1005', 'QR-ACC-1005', 1, 'Issued', 'Rack S-02, Shelf 3')
      RETURNING id;
    `, [bookId]);
    copyId = copyRes.rows[0].id;
  }

  // Active Loan for Aarav Sharma
  await client.query(`
    INSERT INTO library_transactions (
      campus_id, transaction_code, book_id, copy_id, accession_number, book_title,
      borrower_type, student_id, student_name, class_name, issue_date, due_date, status, fine_amount
    ) VALUES (
      $1, 'LIB-TX-2026-0012', $2, $3, 'ACC-1005', 'Science Encyclopedia for Young Explorers',
      'Student', $4, 'Aarav Sharma', 'Grade 5-A', '2026-08-15', '2026-08-28', 'Issued', 0.00
    ) ON CONFLICT DO NOTHING;
  `, [campusId, bookId, copyId, student1Id]);

  // 8. Seed Invoice and August 2026 Fee Payments & Dynamic Allocations (Reconciliation Guarantee)
  console.log('💰 Seeding Fee Invoices, Collections & Dynamic Allocations...');
  
  const invRes = await client.query(`
    INSERT INTO invoices (
      campus_id, student_id, parent_id, invoice_number, billing_period, total_amount, amount_paid, due_date, status
    ) VALUES (
      $1, $2, $3, 'INV-2026-00125', 'August 2026', 8250.00, 8250.00, '2026-08-15', 'Paid'
    ) RETURNING id;
  `, [campusId, student1Id, parentId]);
  const invoiceId = invRes.rows[0].id;

  const txRes = await client.query(`
    INSERT INTO fee_payment_transactions (
      campus_id, invoice_id, receipt_number, student_id, student_name,
      class_name, section_name, fee_month, payment_date, payment_mode,
      transaction_id, amount_received, bank_reference, payment_status
    ) VALUES (
      $1, $2, 'REC-2026-00812', $3, 'Aarav Sharma',
      'Grade 5', 'A', 'August 2026', '2026-08-21', 'UPI',
      'UPI-ICICI-88129014', 8250.00, 'SBI-COL-0091', 'Success'
    ) RETURNING id;
  `, [campusId, invoiceId, student1Id]);
  const txId = txRes.rows[0].id;

  // Dynamic fee head allocations for INV-00125: Total 8,250
  const allocations = [
    { head: 'Tuition Fee', amt: 4500.00 },
    { head: 'Annual Charges', amt: 1200.00 },
    { head: 'Transport Fee', amt: 1850.00 },
    { head: 'Activity Fee', amt: 700.00 }
  ];

  for (const a of allocations) {
    await client.query(`
      INSERT INTO fee_payment_allocations (payment_transaction_id, fee_head_name, amount_allocated)
      VALUES ($1, $2, $3);
    `, [txId, a.head, a.amt]);
  }

  // 9. Seed School Expense & A5 Voucher Record
  console.log('🧾 Seeding School Expense & Voucher...');
  await client.query(`
    INSERT INTO school_expenses (
      campus_id, expense_date, department, category, expense_head, vendor_payee,
      description, amount, payment_mode, payment_ref_no, entered_by, status
    ) VALUES (
      $1, '2026-08-21', 'STEM & Robotics Lab', 'Lab & IT', 'Curriculum Kits', 'RoboTech Solutions India',
      'Robotics lab microcontrollers & sensor expansion kits for Grade 5 STEM curriculum',
      18500.00, 'Bank Transfer', 'UTR-HDFC-991204', 'Bhawna Tyagi', 'Approved'
    );
  `, [campusId]);

  // 10. Seed Gate Passes (Visitor & Escort Pickup)
  console.log('🪪 Seeding Visitor Gate Passes...');
  await client.query(`
    INSERT INTO school_gate_passes (
      campus_id, pass_number, visitor_name, mobile_number, visitor_type,
      purpose, person_to_meet, department, entry_date, entry_time,
      expected_exit_time, gate_number, vehicle_number, status, is_pre_registered,
      linked_student_name, linked_student_class, escort_verified, remarks
    ) VALUES (
      $1, 'VIS-2026-00452', 'Nitin Sharma', '+919876543452', 'Authorized Escort',
      'Early Student Pickup for Olympiad Coaching', 'Bhawna Tyagi (Coordinator)',
      'Academics', CURRENT_DATE, '10:32 AM', '11:30 AM', 'Gate 1 (Main Gate)',
      'DL-3C-AZ-1120', 'Inside', true, 'Aarav Sharma', 'Grade 5-A', true, 'Escort QR verified'
    );
  `, [campusId]);

  // 11. Seed Incident & Medical Clinic Record
  console.log('🚨 Seeding Incident & Clinic Record...');
  await client.query(`
    INSERT INTO school_incidents (
      campus_id, incident_code, incident_type, incident_date, incident_time,
      category, severity, person_name, person_type, student_id, class_name, reported_by,
      location, description, immediate_action, status, parent_informed, follow_up_required
    ) VALUES (
      $1, 'INC-2026-0041', 'Medical', CURRENT_DATE, '11:15 AM',
      'Playground Minor Abrasion', 'Low', 'Aarav Sharma', 'Student', $2, 'Grade 5-A', 'Bhawna Tyagi (Coordinator)',
      'Primary Playground', 'Mild scrape on right knee during football drill.',
      'Wound cleaned with antiseptic and sterile band-aid applied at school clinic. Student resumed class.',
      'Resolved', true, false
    );
  `, [campusId, student1Id]);

  // 12. Seed Help Desk Ticket & Parent Interaction
  console.log('🎧 Seeding Help Desk Ticket...');
  const tktRes = await client.query(`
    INSERT INTO helpdesk_tickets (
      campus_id, ticket_number, student_id, student_name, parent_name,
      parent_phone, class_name, category, subject, description, priority, assigned_department,
      status, sla_target_hours, assigned_to_name
    ) VALUES (
      $1, 'TKT-2026-00458', $2, 'Aarav Sharma', 'Nitin Sharma',
      '+919876543452', 'Grade 5-A', 'Transport', 'Morning Bus Timing Query for Burari Route R-05',
      'Requesting 5-minute schedule confirmation for Phool Bagh bus stop pickup.',
      'Low', 'Transport & Fleet', 'Resolved', 24, 'Ramesh Yadav (Fleet Lead)'
    ) RETURNING id;
  `, [campusId, student1Id]);
  const ticketId = tktRes.rows[0].id;

  await client.query(`
    INSERT INTO helpdesk_messages (ticket_id, sender_type, sender_name, sender_role, message, is_internal_note)
    VALUES
      ($1, 'Parent', 'Nitin Sharma', 'Parent', 'Hello, could you please confirm the morning pickup timing at Phool Bagh stop?', false),
      ($1, 'Staff', 'Transport Desk', 'Staff', 'Confirmed: Bus #12 arrives at Phool Bagh stop at 07:58 AM sharp every morning.', false);
  `, [ticketId]);

  // 13. Seed Feedback & Survey Dynamic Form
  console.log('📝 Seeding Feedback & Survey Form...');
  const survRes = await client.query(`
    INSERT INTO survey_forms (
      campus_id, form_code, title, form_type, description, target_audience,
      start_date, end_date, status, is_anonymous, qr_code_token, total_responses, average_rating, questions
    ) VALUES (
      $1, 'SURV-2026-0041', 'Term 1 Parent Satisfaction & Academic Quality Survey', 'Feedback',
      'Evaluation of teaching quality, school safety, and homework pacing.', 'All Parents',
      '2026-08-15', '2026-08-30', 'Active', false, 'QR-SURV-TERM1-2026', 420, 4.72,
      $2
    ) RETURNING id;
  `, [
    campusId,
    JSON.stringify([
      { id: 'q1', type: 'star_rating', title: 'Overall academic progress and teaching quality:' },
      { id: 'q2', type: 'conditional_yes_no', title: 'Have all queries been addressed promptly?', followUpPrompt: 'Specify unresolved issue:' }
    ])
  ]);
  const formId = survRes.rows[0].id;

  await client.query(`
    INSERT INTO survey_responses (
      form_id, form_code, responder_name, responder_role, class_name, overall_rating, answers, written_feedback, action_status
    ) VALUES (
      $1, 'SURV-2026-0041', 'Nitin Sharma', 'Parent', 'Grade 5-A', 5,
      '{"q1": 5, "q2": "Yes"}', 'Very happy with the digital diary updates and mathematics instruction.', 'Closed'
    );
  `, [formId]);

  // 14. Seed HR & Monthly Payroll (August 2026)
  console.log('👩‍💼 Seeding Monthly Payroll Ledgers & Advances...');
  await client.query(`
    INSERT INTO payroll_ledgers (
      staff_id, month, base_salary, lwp_days, lwp_deduction, allowances, net_payable, payment_status, processed_at
    ) VALUES
      ($1, '2026-08', 25000.00, 0, 0.00, 15000.00, 36800.00, 'Paid', NOW()),
      ($2, '2026-08', 30000.00, 1, 1600.00, 18000.00, 42400.00, 'Paid', NOW());
  `, [staff1Id, staff2Id]);

  await client.query(`
    INSERT INTO staff_salary_advances (
      campus_id, staff_id, staff_name, advance_amount, monthly_deduction, total_installments, remaining_balance, reason
    ) VALUES (
      $1, $2, 'Neha Sharma', 20000.00, 5000.00, 4, 15000.00, 'Family emergency support'
    );
  `, [campusId, staff1Id]);

  // 15. Seed Central IAM Accounts (Universal Login with Multi-Role)
  console.log('🔐 Seeding Central IAM Universal User Accounts...');
  const iamUsers = [
    {
      uname: 'admin@crayonboxschool.com',
      email: 'admin@crayonboxschool.com',
      phone: '+919818000001',
      name: 'Super Administrator',
      role: 'Super Admin',
      linked: [{ role: 'Super Admin', title: 'Institutional Superuser', dashboardUrl: '/admin/dashboard' }],
      pass: 'admin123'
    },
    {
      uname: 'neha.sharma@crayonboxschool.com',
      email: 'neha.sharma@crayonboxschool.com',
      phone: '+919876543452',
      name: 'Neha Sharma',
      role: 'Faculty',
      linked: [
        {
          role: 'Faculty',
          title: 'PRT Mathematics & Mentor',
          employeeId: 'EMP-00102',
          dashboardUrl: '/staff/dashboard'
        },
        {
          role: 'Parent',
          title: 'Parent of Aarav & Ananya',
          children: [
            { name: 'Aarav Sharma', class: 'Grade 5-A', id: student1Id },
            { name: 'Ananya Sharma', class: 'Grade 2-B', id: student2Id }
          ],
          dashboardUrl: '/parent/dashboard'
        }
      ],
      pass: 'neha123'
    },
    {
      uname: 'CB2605421',
      email: 'aarav.sharma@student.crayonboxschool.com',
      phone: '+919876543452',
      name: 'Aarav Sharma',
      role: 'Student',
      linked: [
        {
          role: 'Student',
          title: 'Student Portal (CB2605421)',
          studentId: student1Id,
          class: 'Grade 5-A',
          dashboardUrl: '/parent/dashboard'
        },
        {
          role: 'Parent',
          title: 'Parent Portal (Nitin Sharma)',
          children: [
            { name: 'Aarav Sharma', class: 'Grade 5-A', id: student1Id },
            { name: 'Ananya Sharma', class: 'Grade 2-B', id: student2Id }
          ],
          dashboardUrl: '/parent/dashboard'
        }
      ],
      pass: 'student123'
    },
    {
      uname: '+919876543452',
      email: 'nitin.sharma@gmail.com',
      phone: '+919876543452',
      name: 'Nitin Sharma',
      role: 'Parent',
      linked: [
        {
          role: 'Parent',
          title: 'Parent Portal (Nitin Sharma)',
          children: [
            { name: 'Aarav Sharma', class: 'Grade 5-A', id: student1Id },
            { name: 'Ananya Sharma', class: 'Grade 2-B', id: student2Id }
          ],
          dashboardUrl: '/parent/dashboard'
        }
      ],
      pass: 'parent123'
    }
  ];

  for (const u of iamUsers) {
    await client.query(`
      INSERT INTO user_accounts (
        campus_id, username, email, phone_number, password_hash, full_name,
        primary_role, linked_roles, account_status, must_change_password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active', false)
      ON CONFLICT (username) DO UPDATE SET
        linked_roles = EXCLUDED.linked_roles,
        phone_number = EXCLUDED.phone_number;
    `, [
      campusId, u.uname, u.email, u.phone, u.pass, u.name,
      u.role, JSON.stringify(u.linked)
    ]);
  }

  // 16. Seed Central Audit Logs
  console.log('📜 Seeding Central Audit Trail Logs...');
  const auditEvents = [
    {
      act: 'NEW_ADMISSION_ENROLLED',
      type: 'students',
      id: student1Id,
      old: '{"status": "Application Verified"}',
      new: '{"student_id": "STU-2026-00142", "admission_no": "CBS-2026-1042", "class": "Grade 5-A"}'
    },
    {
      act: 'FEE_PAYMENT_COLLECTED',
      type: 'fee_payment_transactions',
      id: student1Id,
      old: '{"outstanding_dues": 8250.00}',
      new: '{"paid_amount": 8250.00, "receipt_no": "REC-2026-00812", "balance": 0.00}'
    },
    {
      act: 'PAYROLL_LOCKED_AND_DISBURSED',
      type: 'payroll_ledgers',
      id: staff1Id,
      old: '{"month": "2026-08", "status": "Draft"}',
      new: '{"month": "2026-08", "net_payable": 36800.00, "status": "Paid"}'
    }
  ];

  for (const a of auditEvents) {
    await client.query(`
      INSERT INTO audit_logs (campus_id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, '192.168.1.10', NOW());
    `, [campusId, parentId, a.act, a.type, a.id, a.old, a.new]);
  }

  console.log('🎉 100% COMPLETE: Master ERP Database Reset & Interconnected Seed Successful!');
  await client.end();
}

resetAndSeedMasterErp().catch(console.error);
