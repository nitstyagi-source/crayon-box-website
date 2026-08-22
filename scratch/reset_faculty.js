const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby@1008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function resetFacultyData() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM public.campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  console.log('Resetting staff and 360 tables for campus:', campusId);

  // 1. Clean existing staff 360 child tables
  await client.query(`
    DELETE FROM public.staff_timetable;
    DELETE FROM public.staff_lesson_plans;
    DELETE FROM public.staff_student_marks;
    DELETE FROM public.staff_appraisals;
    DELETE FROM public.staff_trainings;
    DELETE FROM public.staff_assets;
    DELETE FROM public.staff_exits;
    DELETE FROM public.staff_leaves;
    DELETE FROM public.staff_leave_balances;
    DELETE FROM public.staff_documents;
    DELETE FROM public.staff_qualifications;
    DELETE FROM public.staff_emergency_contacts;
    DELETE FROM public.staff_addresses;
    DELETE FROM public.staff_substitutions;
    DELETE FROM public.staff_attendance;
    DELETE FROM public.staff;
  `);

  console.log('Cleared existing staff tables.');

  const staffData = [
    {
      employee_id: 'CB-LEAD-001',
      employee_code: 'DIR2026001',
      first_name: 'Nitin',
      last_name: 'Tyagi',
      gender: 'Male',
      dob: '1984-06-15',
      blood_group: 'O+',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9810081008',
      whatsapp_no: '9810081008',
      official_email: 'director@crayonboxschool.com',
      designation: 'Director & Managing Trustee',
      role: 'Director',
      employee_category: 'Leadership',
      department: 'Administration',
      wing: 'Administration',
      qualification: 'B.Tech, MBA',
      experience_years: '15 Years',
      total_experience: '18 Years',
      joining_date: '2020-04-01',
      employment_type: 'Permanent',
      status: 'Active',
      is_leadership: true,
      basic_salary: 70000,
      hra: 28000,
      conveyance: 10000,
      special_allowance: 12000,
      gross_salary: 120000,
      net_salary: 112000,
      bank_name: 'HDFC Bank',
      bank_account_no: '50100234918231',
      bank_ifsc: 'HDFC0001245',
      order_index: 1
    },
    {
      employee_id: 'CB-LEAD-002',
      employee_code: 'PRN2026002',
      first_name: 'Dr. Ananya',
      last_name: 'Sharma',
      gender: 'Female',
      dob: '1982-09-20',
      blood_group: 'A+',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9811224466',
      whatsapp_no: '9811224466',
      official_email: 'principal@crayonboxschool.com',
      designation: 'Principal',
      role: 'Principal',
      employee_category: 'Leadership',
      department: 'Administration',
      wing: 'Administration',
      qualification: 'Ph.D. in Education, M.Ed, B.Ed',
      experience_years: '14 Years',
      total_experience: '16 Years',
      joining_date: '2021-06-01',
      employment_type: 'Permanent',
      status: 'Active',
      is_leadership: true,
      basic_salary: 55000,
      hra: 22000,
      conveyance: 8000,
      special_allowance: 10000,
      gross_salary: 95000,
      net_salary: 89000,
      bank_name: 'ICICI Bank',
      bank_account_no: '002101928374',
      bank_ifsc: 'ICIC0000021',
      order_index: 2
    },
    {
      employee_id: 'CB-FAC-101',
      employee_code: 'FAC2026101',
      first_name: 'Meenakshi',
      last_name: 'Sundaram',
      gender: 'Female',
      dob: '1989-11-12',
      blood_group: 'B+',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9871122334',
      whatsapp_no: '9871122334',
      official_email: 'meenakshi.s@crayonboxschool.com',
      designation: 'HOD - Sciences & Robotics',
      role: 'Senior Teacher',
      employee_category: 'Teaching',
      department: 'Sciences & Robotics',
      wing: 'Primary (1-5)',
      qualification: 'M.Sc (Physics), B.Ed',
      experience_years: '7 Years',
      total_experience: '9 Years',
      joining_date: '2022-04-01',
      employment_type: 'Permanent',
      status: 'Active',
      is_class_teacher: true,
      class_teacher_for: 'Grade 5-A',
      subjects_taught: 'Science, Robotics, STEM Lab',
      basic_salary: 38000,
      hra: 15200,
      conveyance: 4000,
      special_allowance: 7800,
      gross_salary: 65000,
      net_salary: 61200,
      bank_name: 'State Bank of India',
      bank_account_no: '30918274619',
      bank_ifsc: 'SBIN0004521',
      order_index: 3
    },
    {
      employee_id: 'CB-FAC-102',
      employee_code: 'FAC2026102',
      first_name: 'Vikram',
      last_name: 'Malhotra',
      gender: 'Male',
      dob: '1990-03-25',
      blood_group: 'O+',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9872233445',
      whatsapp_no: '9872233445',
      official_email: 'vikram.m@crayonboxschool.com',
      designation: 'Senior Mathematics Facilitator',
      role: 'Teacher',
      employee_category: 'Teaching',
      department: 'Mathematics',
      wing: 'Primary (1-5)',
      qualification: 'M.Sc (Mathematics), B.Ed',
      experience_years: '6 Years',
      total_experience: '8 Years',
      joining_date: '2022-07-01',
      employment_type: 'Permanent',
      status: 'Active',
      is_class_teacher: true,
      class_teacher_for: 'Grade 3-A',
      subjects_taught: 'Mathematics, Vedic Math, Mental Ability',
      basic_salary: 36000,
      hra: 14400,
      conveyance: 4000,
      special_allowance: 7600,
      gross_salary: 62000,
      net_salary: 58500,
      bank_name: 'HDFC Bank',
      bank_account_no: '50100981726354',
      bank_ifsc: 'HDFC0001245',
      order_index: 4
    },
    {
      employee_id: 'CB-FAC-103',
      employee_code: 'FAC2026103',
      first_name: 'Pooja',
      last_name: 'Chopra',
      gender: 'Female',
      dob: '1992-08-14',
      blood_group: 'AB+',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9873344556',
      whatsapp_no: '9873344556',
      official_email: 'pooja.c@crayonboxschool.com',
      designation: 'Lead Pre-Primary Educator',
      role: 'Teacher',
      employee_category: 'Teaching',
      department: 'Early Childhood Education',
      wing: 'Early Years',
      qualification: 'NTT, M.A. Child Psychology, B.Ed',
      experience_years: '8 Years',
      total_experience: '9 Years',
      joining_date: '2021-04-01',
      employment_type: 'Permanent',
      status: 'Active',
      is_class_teacher: true,
      class_teacher_for: 'KG-A',
      subjects_taught: 'Phonics, Numeracy, Early Learning',
      basic_salary: 34000,
      hra: 13600,
      conveyance: 3500,
      special_allowance: 6900,
      gross_salary: 58000,
      net_salary: 54800,
      bank_name: 'Axis Bank',
      bank_account_no: '918029384756',
      bank_ifsc: 'UTIB0000192',
      order_index: 5
    },
    {
      employee_id: 'CB-FAC-104',
      employee_code: 'FAC2026104',
      first_name: 'Priya',
      last_name: 'Saxena',
      gender: 'Female',
      dob: '1993-05-18',
      blood_group: 'A-',
      nationality: 'Indian',
      marital_status: 'Single',
      personal_mobile: '9874455667',
      whatsapp_no: '9874455667',
      official_email: 'priya.s@crayonboxschool.com',
      designation: 'Senior Languages Faculty',
      role: 'Teacher',
      employee_category: 'Teaching',
      department: 'Languages',
      wing: 'Primary (1-5)',
      qualification: 'M.A. English Literature, B.Ed',
      experience_years: '5 Years',
      total_experience: '6 Years',
      joining_date: '2023-04-01',
      employment_type: 'Permanent',
      status: 'Active',
      is_class_teacher: true,
      class_teacher_for: 'Grade 2-A',
      subjects_taught: 'English Grammar, Literature, Creative Writing',
      basic_salary: 32000,
      hra: 12800,
      conveyance: 3500,
      special_allowance: 6700,
      gross_salary: 55000,
      net_salary: 52000,
      bank_name: 'HDFC Bank',
      bank_account_no: '50100483920192',
      bank_ifsc: 'HDFC0001245',
      order_index: 6
    },
    {
      employee_id: 'CB-FAC-105',
      employee_code: 'FAC2026105',
      first_name: 'Rahul',
      last_name: 'Verma',
      gender: 'Male',
      dob: '1991-10-30',
      blood_group: 'B+',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9875566778',
      whatsapp_no: '9875566778',
      official_email: 'rahul.v@crayonboxschool.com',
      designation: 'Head of Physical Education & Sports',
      role: 'Sports Coach',
      employee_category: 'Teaching',
      department: 'Sports & Physical Education',
      wing: 'Primary (1-5)',
      qualification: 'M.P.Ed, B.P.Ed, NIS Certified',
      experience_years: '5 Years',
      total_experience: '7 Years',
      joining_date: '2023-06-01',
      employment_type: 'Permanent',
      status: 'Active',
      subjects_taught: 'Physical Education, Athletics, Yoga, Football',
      basic_salary: 30000,
      hra: 12000,
      conveyance: 3000,
      special_allowance: 5000,
      gross_salary: 50000,
      net_salary: 47500,
      bank_name: 'Punjab National Bank',
      bank_account_no: '092817263541',
      bank_ifsc: 'PUNB0002910',
      order_index: 7
    },
    {
      employee_id: 'CB-FAC-106',
      employee_code: 'FAC2026106',
      first_name: 'Sneha',
      last_name: 'Roy',
      gender: 'Female',
      dob: '1994-02-17',
      blood_group: 'O-',
      nationality: 'Indian',
      marital_status: 'Single',
      personal_mobile: '9876677889',
      whatsapp_no: '9876677889',
      official_email: 'sneha.r@crayonboxschool.com',
      designation: 'Visual & Performing Arts Mentor',
      role: 'Teacher',
      employee_category: 'Teaching',
      department: 'Arts & Humanities',
      wing: 'Primary (1-5)',
      qualification: 'MFA (Fine Arts), B.A. Music',
      experience_years: '4 Years',
      total_experience: '5 Years',
      joining_date: '2023-08-01',
      employment_type: 'Permanent',
      status: 'Active',
      subjects_taught: 'Art & Craft, Pottery, Western Music',
      basic_salary: 28000,
      hra: 11200,
      conveyance: 3000,
      special_allowance: 5800,
      gross_salary: 48000,
      net_salary: 45600,
      bank_name: 'State Bank of India',
      bank_account_no: '30192847561',
      bank_ifsc: 'SBIN0004521',
      order_index: 8
    },
    {
      employee_id: 'CB-ADM-201',
      employee_code: 'ADM2026201',
      first_name: 'Anjali',
      last_name: 'Gupta',
      gender: 'Female',
      dob: '1990-12-05',
      blood_group: 'B+',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9877788990',
      whatsapp_no: '9877788990',
      official_email: 'admissions@crayonboxschool.com',
      designation: 'Admissions & Front Office Head',
      role: 'Admissions Lead',
      employee_category: 'Administration',
      department: 'Administration',
      wing: 'Administration',
      qualification: 'MBA in HR & Public Relations, B.Com',
      experience_years: '6 Years',
      total_experience: '8 Years',
      joining_date: '2022-02-01',
      employment_type: 'Permanent',
      status: 'Active',
      basic_salary: 31000,
      hra: 12400,
      conveyance: 3000,
      special_allowance: 5600,
      gross_salary: 52000,
      net_salary: 49200,
      bank_name: 'ICICI Bank',
      bank_account_no: '002109847261',
      bank_ifsc: 'ICIC0000021',
      order_index: 9
    },
    {
      employee_id: 'CB-SUP-301',
      employee_code: 'SUP2026301',
      first_name: 'Mukesh',
      last_name: 'Yadav',
      gender: 'Male',
      dob: '1986-04-20',
      blood_group: 'AB-',
      nationality: 'Indian',
      marital_status: 'Married',
      personal_mobile: '9878899001',
      whatsapp_no: '9878899001',
      official_email: 'transport@crayonboxschool.com',
      designation: 'Transport Supervisor & Fleet Manager',
      role: 'Support Staff',
      employee_category: 'Support Staff',
      department: 'Student Welfare',
      wing: 'Administration',
      qualification: 'Higher Secondary, Heavy Motor Driving License',
      experience_years: '8 Years',
      total_experience: '10 Years',
      joining_date: '2021-08-01',
      employment_type: 'Permanent',
      status: 'Active',
      basic_salary: 20000,
      hra: 8000,
      conveyance: 2000,
      special_allowance: 2000,
      gross_salary: 32000,
      net_salary: 30500,
      bank_name: 'Punjab National Bank',
      bank_account_no: '092837461928',
      bank_ifsc: 'PUNB0002910',
      order_index: 10
    }
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  for (const s of staffData) {
    const res = await client.query(`
      INSERT INTO public.staff (
        campus_id, employee_id, employee_code, first_name, last_name, gender, dob, blood_group,
        nationality, marital_status, personal_mobile, whatsapp_no, official_email, email, phone_number,
        designation, role, employee_category, department, wing, qualification, experience_years, total_experience,
        joining_date, employment_type, status, is_class_teacher, class_teacher_for, subjects_taught, is_leadership,
        basic_salary, hra, conveyance, special_allowance, gross_salary, net_salary,
        bank_name, bank_account_no, bank_ifsc, order_index, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $13, $11,
        $14, $15, $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34,
        $35, $36, $37, $38, true
      ) RETURNING id;
    `, [
      campusId, s.employee_id, s.employee_code, s.first_name, s.last_name, s.gender, s.dob, s.blood_group,
      s.nationality, s.marital_status, s.personal_mobile, s.whatsapp_no, s.official_email,
      s.designation, s.role, s.employee_category, s.department, s.wing, s.qualification, s.experience_years, s.total_experience,
      s.joining_date, s.employment_type, s.status, Boolean(s.is_class_teacher), s.class_teacher_for || null, s.subjects_taught || null, Boolean(s.is_leadership),
      s.basic_salary, s.hra, s.conveyance, s.special_allowance, s.gross_salary, s.net_salary,
      s.bank_name, s.bank_account_no, s.bank_ifsc, s.order_index
    ]);

    const staffId = res.rows[0].id;

    // 1. Address
    await client.query(`
      INSERT INTO public.staff_addresses (staff_id, address_type, address_line, locality, city, state, pincode)
      VALUES ($1, 'Current', 'Flat 302, Sector 18, Block B', 'Burari Main', 'Delhi', 'Delhi', '110084');
    `, [staffId]);

    // 2. Emergency Contact
    await client.query(`
      INSERT INTO public.staff_emergency_contacts (staff_id, name, relationship, mobile, address)
      VALUES ($1, 'Spouse', 'Spouse', $2, 'Burari, Delhi - 110084');
    `, [staffId, s.personal_mobile]);

    // 3. Qualifications
    await client.query(`
      INSERT INTO public.staff_qualifications (staff_id, qualification_type, degree_name, institution, board_university, passing_year, marks_grade_percentage)
      VALUES ($1, 'Post-Graduation', $2, 'Delhi University', 'UGC', '2016', '84%');
    `, [staffId, s.qualification]);

    // 4. Documents
    await client.query(`
      INSERT INTO public.staff_documents (staff_id, document_type, document_number, file_url, verification_status)
      VALUES ($1, 'Aadhaar Card', 'XXXX-XXXX-8912', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600', 'Verified');
    `, [staffId]);

    // 5. Leave Balances
    await client.query(`
      INSERT INTO public.staff_leave_balances (staff_id, academic_year, casual_leave_balance, medical_leave_balance, earned_leave_balance, emergency_leave_balance)
      VALUES ($1, '2026-2027', 10, 9, 15, 3);
    `, [staffId]);

    // 6. Assets
    await client.query(`
      INSERT INTO public.staff_assets (staff_id, asset_type, asset_name_code, issue_date, status)
      VALUES ($1, 'IT Asset', 'Dell Latitude / iPad Air', $2, 'Issued');
    `, [staffId, s.joining_date]);

    // 7. Appraisals
    await client.query(`
      INSERT INTO public.staff_appraisals (staff_id, appraisal_year, overall_rating, self_appraisal_notes)
      VALUES ($1, '2025-2026', '4.8', 'Promoted with annual increment for stellar student performance.');
    `, [staffId]);

    // 8. Timetable
    if (s.employee_category === 'Teaching') {
      await client.query(`
        INSERT INTO public.staff_timetable (staff_id, day_of_week, period_number, start_time, end_time, class_name, section_name, subject_name, room_number)
        VALUES 
        ($1, 'Monday', 1, '08:00', '08:45', $2, 'A', $3, 'Room 101'),
        ($1, 'Monday', 2, '08:45', '09:30', $2, 'A', $3, 'Room 101'),
        ($1, 'Tuesday', 1, '08:00', '08:45', $2, 'A', $3, 'Room 101');
      `, [staffId, s.class_teacher_for?.split('-')[0] || 'Grade 3', s.subjects_taught?.split(',')[0] || 'General']);

      // 9. Lesson Plans
      await client.query(`
        INSERT INTO public.staff_lesson_plans (staff_id, class_name, section_name, subject_name, chapter_name, topic_name, learning_objectives, status, target_date)
        VALUES ($1, $2, 'A', $3, 'Chapter 4: Core Concepts', 'Hands-on Experimentation & Practice', 'Ensure all students achieve mastery in chapter fundamentals.', 'Completed', $4);
      `, [staffId, s.class_teacher_for?.split('-')[0] || 'Grade 3', s.subjects_taught?.split(',')[0] || 'General', todayStr]);
    }

    // 10. Attendance Today
    await client.query(`
      INSERT INTO public.staff_attendance (staff_id, date, in_time, status, geofence_status)
      VALUES ($1, $2, '07:48 AM', 'Present', 'Inside Geofence');
    `, [staffId, todayStr]);
  }

  console.log('Successfully seeded 10 pristine staff members with full 360 dossier records!');
  await client.end();
}

resetFacultyData();
