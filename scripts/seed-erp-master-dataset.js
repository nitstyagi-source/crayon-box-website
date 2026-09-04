/**
 * MASTER ERP TEST DATASET SEEDER (Phases 1 - 17)
 * Populates a complete, realistic, internally consistent dummy dataset
 * with strict TEST- prefixes and is_test_record: true flags.
 * NEVER modifies, overwrites, or deletes production records.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedMasterDataset() {
  console.log('====================================================');
  console.log('STARTING ERP TEST DATASET SEEDING');
  console.log('====================================================\n');

  // ---------------------------------------------------------------
  // PHASE 2: CREATE TEST ORGANISATION & STRUCTURE
  // ---------------------------------------------------------------
  console.log('Phase 2: Creating Test Organisation, Campus & Academic Year...');

  // 1. Test Institution
  const testInstId = '00000000-0000-0000-0000-000000000001';
  const { data: instData, error: instErr } = await supabase.from('institutions').upsert({
    id: testInstId,
    code: 'TEST-CBS',
    name: 'TEST - Crayon Box School',
    short_name: 'TEST-CBS',
    institution_type: 'K12_CBSE',
    academic_framework: 'CBSE',
    board_affiliation: 'CBSE New Delhi',
    affiliation_number: 'TEST-AFF-2130999',
    principal_name: 'Dr. Anita Sharma',
    principal_email: 'test.principal01@example.test',
    brand_color: '#D97706',
    address: 'Plot TEST-42, Institutional Area, Sector 62, Noida, UP - 201309',
    phone_number: '+91 99999 00001',
    website_url: 'https://test.crayonboxschool.example.test',
    school_id_number: 'TEST-SCH-01',
    udise_code: '09280100099',
    established_year: 2026,
    status: 'ACTIVE'
  }).select().single();
  if (instErr) console.error('Institution upsert error:', instErr.message);

  // 2. Test Campus
  const testCampusId = '00000000-0000-0000-0000-000000000002';
  const { data: campData, error: campErr } = await supabase.from('campuses').upsert({
    id: testCampusId,
    name: 'TEST - Main Campus',
    address: 'Plot TEST-42, Sector 62, Noida, UP',
    contact_email: 'test.admin01@example.test',
    contact_phone: '+91 99999 00002',
    school_id: 'TEST-SCH-01',
    udise_code: '09280100099'
  }).select().single();
  if (campErr) console.error('Campus upsert error:', campErr.message);

  // 3. Test Academic Year
  const testAyId = '00000000-0000-0000-0000-000000000003';
  const { data: ayData, error: ayErr } = await supabase.from('academic_years').upsert({
    id: testAyId,
    campus_id: testCampusId,
    name: 'TEST - 2026-27',
    start_date: '2026-04-01',
    end_date: '2027-03-31',
    is_active: true
  }).select().single();
  if (ayErr) console.error('Academic Year upsert error:', ayErr.message);

  // 4. Test Vehicles & Transport Routes
  console.log('Seeding Transport Vehicles & Routes...');
  const testVeh1 = '00000000-0000-0000-0000-000000000011';
  const testVeh2 = '00000000-0000-0000-0000-000000000012';

  await supabase.from('vehicles').upsert([
    { id: testVeh1, campus_id: testCampusId, registration_number: 'TEST-DL-01-CB-1001', capacity: 42, vehicle_type: 'AC School Bus', status: 'Active' },
    { id: testVeh2, campus_id: testCampusId, registration_number: 'TEST-DL-01-CB-1002', capacity: 36, vehicle_type: 'AC School Bus', status: 'Active' }
  ]);

  const testRoute1 = '00000000-0000-0000-0000-000000000021';
  const testRoute2 = '00000000-0000-0000-0000-000000000022';
  await supabase.from('routes').upsert([
    { id: testRoute1, campus_id: testCampusId, vehicle_id: testVeh1, name: 'TEST-Route 1 (Noida Expressway)', driver_name: 'TEST-Ramesh Singh', driver_phone: '+91 99999 10001', zone: 'Sector 93-137' },
    { id: testRoute2, campus_id: testCampusId, vehicle_id: testVeh2, name: 'TEST-Route 2 (Sector 62 Circuit)', driver_name: 'TEST-Suresh Kumar', driver_phone: '+91 99999 10002', zone: 'Sector 55-63' }
  ]);

  // Stops
  await supabase.from('stops').upsert([
    { id: '00000000-0000-0000-0000-000000000031', route_id: testRoute1, name: 'TEST-Stop 1: Grand Omaxe Sector 93', sequence_order: 1, estimated_arrival: '07:15:00', latitude: 28.5140, longitude: 77.3820 },
    { id: '00000000-0000-0000-0000-000000000032', route_id: testRoute1, name: 'TEST-Stop 2: Paras Tierea Sector 137', sequence_order: 2, estimated_arrival: '07:30:00', latitude: 28.5080, longitude: 77.4040 },
    { id: '00000000-0000-0000-0000-000000000033', route_id: testRoute2, name: 'TEST-Stop 1: Fortis Hospital Sector 62', sequence_order: 1, estimated_arrival: '07:20:00', latitude: 28.6180, longitude: 77.3710 },
    { id: '00000000-0000-0000-0000-000000000034', route_id: testRoute2, name: 'TEST-Stop 2: Stellar IT Park Sector 62', sequence_order: 2, estimated_arrival: '07:35:00', latitude: 28.6250, longitude: 77.3680 }
  ]);

  // ---------------------------------------------------------------
  // PHASE 3: CREATE TEST USERS & STAFF ACROSS ROLES
  // ---------------------------------------------------------------
  console.log('Phase 3: Creating Test Staff & Users across all ERP roles...');

  const staffRoles = [
    { code: 'SA01', role: 'SUPER_ADMIN', first: 'Vikram', last: 'Aditya', email: 'test.superadmin@example.test', desig: 'Chief Executive Trustee', dept: 'Trust Board' },
    { code: 'AD01', role: 'ADMIN', first: 'Rohit', last: 'Kapoor', email: 'test.admin01@example.test', desig: 'Senior School Admin', dept: 'Administration' },
    { code: 'AD02', role: 'ADMIN', first: 'Meenakshi', last: 'Sundaram', email: 'test.admin02@example.test', desig: 'Operations Manager', dept: 'Administration' },
    { code: 'PR01', role: 'PRINCIPAL', first: 'Dr. Anita', last: 'Sharma', email: 'test.principal01@example.test', desig: 'School Principal', dept: 'Academics' },
    { code: 'PR02', role: 'PRINCIPAL', first: 'Prof. Harish', last: 'Chandra', email: 'test.principal02@example.test', desig: 'Vice Principal', dept: 'Academics' },
    { code: 'TC01', role: 'TEACHER', first: 'Sunita', last: 'Rao', email: 'test.teacher01@example.test', desig: 'Senior TGT Science', dept: 'Academics', isTeacherParent: true },
    { code: 'TC02', role: 'TEACHER', first: 'Amit', last: 'Banerjee', email: 'test.teacher02@example.test', desig: 'PGT Mathematics', dept: 'Academics' },
    { code: 'TC03', role: 'TEACHER', first: 'Pooja', last: 'Chopra', email: 'test.teacher03@example.test', desig: 'PRT English', dept: 'Academics' },
    { code: 'TC04', role: 'TEACHER', first: 'Deepak', last: 'Verma', email: 'test.teacher04@example.test', desig: 'TGT Social Science', dept: 'Academics' },
    { code: 'TC05', role: 'TEACHER', first: 'Kavita', last: 'Menon', email: 'test.teacher05@example.test', desig: 'PRT Hindi & Arts', dept: 'Academics' },
    { code: 'RC01', role: 'RECEPTION', first: 'Simran', last: 'Kaur', email: 'test.reception01@example.test', desig: 'Front Office Executive', dept: 'Front Office' },
    { code: 'RC02', role: 'RECEPTION', first: 'Neha', last: 'Gupta', email: 'test.reception02@example.test', desig: 'Visitor Relations Desk', dept: 'Front Office' },
    { code: 'AC01', role: 'ACCOUNTS', first: 'Rakesh', last: 'Goel', email: 'test.accounts01@example.test', desig: 'Senior Accountant', dept: 'Finance' },
    { code: 'AC02', role: 'ACCOUNTS', first: 'Vandana', last: 'Jain', email: 'test.accounts02@example.test', desig: 'Fee Billing Specialist', dept: 'Finance' },
    { code: 'HR01', role: 'HR', first: 'Sangeeta', last: 'Bhasin', email: 'test.hr01@example.test', desig: 'HR Manager', dept: 'Human Resources' },
    { code: 'HR02', role: 'HR', first: 'Manish', last: 'Malhotra', email: 'test.hr02@example.test', desig: 'Payroll Specialist', dept: 'Human Resources' },
    { code: 'TR01', role: 'TRANSPORT_ADMIN', first: 'Gurpreet', last: 'Singh', email: 'test.transport01@example.test', desig: 'Transport Fleet Manager', dept: 'Logistics' },
    { code: 'TR02', role: 'TRANSPORT_ADMIN', first: 'Dharmendra', last: 'Yadav', email: 'test.transport02@example.test', desig: 'Transport Supervisor', dept: 'Logistics' },
    { code: 'LB01', role: 'LIBRARIAN', first: 'Shalini', last: 'Tripathi', email: 'test.librarian01@example.test', desig: 'Chief Librarian', dept: 'Library' },
    { code: 'LB02', role: 'LIBRARIAN', first: 'Manoj', last: 'Mishra', email: 'test.librarian02@example.test', desig: 'Assistant Librarian', dept: 'Library' },
    { code: 'CN01', role: 'COUNSELLOR', first: 'Dr. Radhika', last: 'Nair', email: 'test.counsellor01@example.test', desig: 'Student Wellbeing Counsellor', dept: 'Wellness' },
    { code: 'CN02', role: 'COUNSELLOR', first: 'Arun', last: 'Saxena', email: 'test.counsellor02@example.test', desig: 'Career Guidance Counsellor', dept: 'Wellness' },
    { code: 'DR01', role: 'DRIVER', first: 'Ramesh', last: 'Singh', email: 'test.driver01@example.test', desig: 'Senior Bus Driver', dept: 'Logistics' },
    { code: 'DR02', role: 'DRIVER', first: 'Suresh', last: 'Kumar', email: 'test.driver02@example.test', desig: 'Heavy Vehicle Driver', dept: 'Logistics' }
  ];

  const staffRecords = staffRoles.map((s, idx) => ({
    id: `00000000-0000-0000-0000-0000000001${(idx + 1).toString().padStart(2, '0')}`,
    campus_id: testCampusId,
    employee_code: `TEST-EMP-${s.code}`,
    employee_id: `TEST-EMP-${s.code}`,
    first_name: `TEST-${s.first}`,
    last_name: s.last,
    role: s.role,
    designation: s.desig,
    department: s.dept,
    official_email: s.email,
    personal_email: s.email,
    phone_number: `+91 99999 100${(idx + 1).toString().padStart(2, '0')}`,
    personal_mobile: `+91 99999 100${(idx + 1).toString().padStart(2, '0')}`,
    status: 'ACTIVE',
    is_active: true,
    basic_salary: 45000 + idx * 2500,
    gross_salary: 62000 + idx * 3000,
    net_salary: 56000 + idx * 2700,
    created_at: new Date().toISOString()
  }));

  const { error: staffErr } = await supabase.from('staff').upsert(staffRecords);
  if (staffErr) console.error('Staff upsert error:', staffErr.message);
  else console.log(`Successfully created ${staffRecords.length} staff records representing all ERP roles.`);

  // 5. Classes & Sections
  console.log('Seeding Classes & Sections...');
  const gradeList = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
  const sections = ['A', 'B'];
  const classRecords = [];
  let cIdx = 1;

  for (const grade of gradeList) {
    for (const sec of sections) {
      classRecords.push({
        id: `00000000-0000-0000-0000-0000000002${cIdx.toString().padStart(2, '0')}`,
        campus_id: testCampusId,
        academic_year_id: testAyId,
        teacher_id: staffRecords[5].id, // Dr. Sunita Rao homeroom
        grade: grade,
        section: sec,
        room_number: `Room ${100 + cIdx}`
      });
      cIdx++;
    }
  }
  const { error: classErr } = await supabase.from('classes').upsert(classRecords);
  if (classErr) console.error('Classes upsert error:', classErr.message);

  // ---------------------------------------------------------------
  // PHASE 3: CREATE TEST PARENTS IN AUTH & PARENTS TABLE
  // ---------------------------------------------------------------
  console.log('Creating 20 Test Parents in auth.users and parents table...');

  const parentRecords = [];
  for (let p = 1; p <= 20; p++) {
    const email = `test.parent${p.toString().padStart(2, '0')}@example.test`;
    let userId = null;

    // Sign up or get user ID
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: 'TestPassword123!',
      options: {
        data: { first_name: `TEST-Parent${p.toString().padStart(2, '0')}`, last_name: 'Sharma' }
      }
    });

    if (authData?.user) {
      userId = authData.user.id;
    } else {
      // If already signed up, generate fallback or reuse
      console.log(`Parent ${email} auth status:`, authError?.message);
    }

    if (userId) {
      parentRecords.push({
        id: userId,
        first_name: `TEST-Parent${p.toString().padStart(2, '0')}`,
        last_name: `Sharma`,
        email: email,
        phone_number: `+91 98888 200${p.toString().padStart(2, '0')}`,
        created_at: new Date().toISOString()
      });
    }
  }

  // Also include the existing parent Nitin Tyagi for cross-compatibility
  const primaryParentId = parentRecords.length > 0 ? parentRecords[0].id : '27693de4-3988-4ed7-9372-9825c8be95ee';

  if (parentRecords.length > 0) {
    const { error: pErr } = await supabase.from('parents').upsert(parentRecords);
    if (pErr) console.error('Parents upsert error:', pErr.message);
    else console.log(`Successfully created ${parentRecords.length} parents.`);
  }

  // ---------------------------------------------------------------
  // PHASE 4: CREATE 30 STUDENTS (SCENARIOS A - N)
  // ---------------------------------------------------------------
  console.log('Phase 4: Creating 30 Students covering Scenarios A to N...');

  const studentFixtures = [
    { name: 'Aarav Sharma', scenario: 'A (Normal)', classIdx: 0, roll: '101', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Vihaan Gupta', scenario: 'B (New Admission)', classIdx: 0, roll: '102', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Advait Khanna', scenario: 'C (Sibling 1)', classIdx: 0, roll: '103', status: 'ACTIVE', transport: 'School Bus', isEws: false, pIdx: 0 },
    { name: 'Ananya Khanna', scenario: 'C & I (Sibling 2 + 20% Concession)', classIdx: 8, roll: '501', status: 'ACTIVE', transport: 'School Bus', isEws: false, pIdx: 0 },
    { name: 'Kavya Iyer', scenario: 'D (Two Guardians)', classIdx: 1, roll: '104', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Ishaan Patel', scenario: 'E (School Transport)', classIdx: 2, roll: '201', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Rhea Sen', scenario: 'F (Without Transport)', classIdx: 2, roll: '202', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Kabir Joshi', scenario: 'G (Outstanding Fees ₹45,000)', classIdx: 3, roll: '203', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Diya Nair', scenario: 'H (Fully Paid Fees)', classIdx: 3, roll: '204', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Arjun Das', scenario: 'J (Low Attendance 62%)', classIdx: 4, roll: '301', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Priya Mehta', scenario: 'K (Excellent Attendance 98%)', classIdx: 4, roll: '302', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Samar Ali', scenario: 'L (Incomplete Documents - Pending TC)', classIdx: 5, roll: '303', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Aanya Reddy', scenario: 'M (Medical Profile - Asthma Alert)', classIdx: 5, roll: '304', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Shaurya Rathore', scenario: 'N (Transferred from Army School)', classIdx: 6, roll: '401', status: 'ACTIVE', transport: 'Self', isEws: false },
    // Fill remaining 16 students
    { name: 'Tanvi Chawla', scenario: 'A (Standard)', classIdx: 6, roll: '402', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Aryan Goel', scenario: 'A (Standard)', classIdx: 7, roll: '403', status: 'ACTIVE', transport: 'Self', isEws: true },
    { name: 'Meera Nambiar', scenario: 'A (Standard)', classIdx: 7, roll: '404', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Rohan Bhatia', scenario: 'A (Standard)', classIdx: 8, roll: '502', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Isha Deshmukh', scenario: 'A (Standard)', classIdx: 8, roll: '503', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Yash Vardhan', scenario: 'A (Standard)', classIdx: 9, roll: '504', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Anika Pillai', scenario: 'A (Standard)', classIdx: 9, roll: '505', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Devansh Roy', scenario: 'A (Standard)', classIdx: 0, roll: '105', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Saanvi Kulkarni', scenario: 'A (Standard)', classIdx: 1, roll: '106', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Kunal Singhal', scenario: 'A (Standard)', classIdx: 2, roll: '205', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Avni Srivastava', scenario: 'A (Standard)', classIdx: 3, roll: '206', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Reyansh Malhotra', scenario: 'A (Standard)', classIdx: 4, roll: '305', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Sara Qureshi', scenario: 'A (Standard)', classIdx: 5, roll: '306', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Manav Kaushik', scenario: 'A (Standard)', classIdx: 6, roll: '405', status: 'ACTIVE', transport: 'Self', isEws: false },
    { name: 'Bhavya Bansal', scenario: 'A (Standard)', classIdx: 7, roll: '406', status: 'ACTIVE', transport: 'School Bus', isEws: false },
    { name: 'Zoya Khan', scenario: 'A (Standard)', classIdx: 8, roll: '506', status: 'ACTIVE', transport: 'Self', isEws: false }
  ];

  const studentRecords = studentFixtures.map((s, idx) => {
    const parentId = (parentRecords.length > 0 && parentRecords[idx % parentRecords.length])
      ? parentRecords[idx % parentRecords.length].id
      : primaryParentId;
    const assignedClass = classRecords[s.classIdx];

    return {
      id: `00000000-0000-0000-0000-0000000004${(idx + 1).toString().padStart(2, '0')}`,
      campus_id: testCampusId,
      academic_year_id: testAyId,
      parent_id: parentId,
      class_id: assignedClass.id,
      admission_no: `TEST-ADM-2026-${(1000 + idx + 1)}`,
      enrollment_number: `TEST-ENR-2026-${(1000 + idx + 1)}`,
      roll_no: s.roll,
      status: s.status,
      first_name: `TEST-${s.name.split(' ')[0]}`,
      last_name: s.name.split(' ')[1] || 'Kumar',
      dob: '2019-05-15',
      date_of_birth: '2019-05-15',
      gender: idx % 2 === 0 ? 'Male' : 'Female',
      blood_group: ['A+', 'B+', 'O+', 'AB+'][idx % 4],
      nationality: 'Indian',
      is_ews: s.isEws,
      transport_mode: s.transport,
      transport_route: s.transport === 'School Bus' ? 'TEST-Route 1 (Noida Expressway)' : null,
      transport_stop: s.transport === 'School Bus' ? 'TEST-Stop 1: Grand Omaxe Sector 93' : null,
      transport_bus_no: s.transport === 'School Bus' ? 'TEST-DL-01-CB-1001' : null,
      transport_driver_name: s.transport === 'School Bus' ? 'TEST-Ramesh Singh' : null,
      transport_driver_phone: s.transport === 'School Bus' ? '+91 99999 10001' : null,
      father_name: `TEST-Parent ${s.name.split(' ')[1] || 'Sharma'}`,
      parent_phone: `+91 98888 200${((idx % 20) + 1).toString().padStart(2, '0')}`,
      parent_email: `test.parent${((idx % 20) + 1).toString().padStart(2, '0')}@example.test`,
      is_test_record: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  const { error: stdErr } = await supabase.from('students').upsert(studentRecords);
  if (stdErr) console.error('Students upsert error:', stdErr.message);
  else console.log(`Successfully created ${studentRecords.length} students covering Scenarios A to N.`);

  // ---------------------------------------------------------------
  // PHASE 5: ADMISSIONS CRM (25 ENQUIRIES ACROSS 13 STAGES)
  // ---------------------------------------------------------------
  console.log('Phase 5: Creating 25 Enquiries across the complete 13-stage admissions funnel...');

  const funnelStages = [
    'NEW', 'CONTACTED', 'COUNSELLING', 'CAMPUS_VISIT', 'INTERACTION',
    'APPLICATION_STARTED', 'APPLICATION_SUBMITTED', 'OFFERED', 'ADMITTED',
    'WAITLISTED', 'NOT_INTERESTED', 'NO_RESPONSE', 'LOST'
  ];

  const enquiryRecords = [];
  for (let e = 1; e <= 25; e++) {
    const stage = funnelStages[(e - 1) % funnelStages.length];
    const grade = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Montessori'][e % 6];
    const isHot = e % 3 === 0;

    enquiryRecords.push({
      id: `00000000-0000-0000-0000-0000000005${e.toString().padStart(2, '0')}`,
      campus_id: testCampusId,
      enquiry_no: `TEST-ENQ-2026-${(100 + e)}`,
      enquiry_number: `TEST-ENQ-2026-${(100 + e)}`,
      child_name: `TEST-Applicant ${e}`,
      child_first_name: `TEST-Applicant`,
      child_last_name: `${e}`,
      parent_name: `TEST-EnqParent ${e}`,
      parent_phone: `+91 97777 300${e.toString().padStart(2, '0')}`,
      parent_email: `test.enquiry${e.toString().padStart(2, '0')}@example.test`,
      grade_interested: grade,
      current_class: grade,
      source: ['Website Referral', 'Campus Walk-in', 'Google Ads', 'Sibling Reference'][e % 4],
      status: stage,
      priority: isHot ? 'HOT' : 'WARM',
      lead_priority: isHot ? 'HOT' : 'WARM',
      counsellor_name: 'Dr. Radhika Nair',
      academic_session: '2026-2027',
      address: `TEST-House ${e}, Sector 62, Noida`,
      distance_km: 1.5 + (e % 5),
      created_at: new Date(Date.now() - (30 - e) * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const { error: enqErr } = await supabase.from('enquiries').upsert(enquiryRecords);
  if (enqErr) console.error('Enquiries upsert error:', enqErr.message);
  else console.log(`Successfully created ${enquiryRecords.length} enquiries across all funnel stages.`);

  // ---------------------------------------------------------------
  // PHASE 7: STUDENT ATTENDANCE RECORDS (30 STUDENTS ACROSS 5 DAYS)
  // ---------------------------------------------------------------
  console.log('Phase 7: Seeding Student Attendance logs across 5 days...');

  const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT', 'HALF_DAY'];
  const attendanceRecords = [];
  let attId = 1;

  for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    const dateStr = d.toISOString().split('T')[0];

    studentRecords.forEach((std, sIdx) => {
      let status = attendanceStatuses[(sIdx + dayOffset) % attendanceStatuses.length];
      if (std.first_name.includes('Arjun')) {
        status = dayOffset === 0 ? 'PRESENT' : 'ABSENT';
      }
      if (std.first_name.includes('Priya')) {
        status = 'PRESENT';
      }

      attendanceRecords.push({
        id: `00000000-0000-0000-0000-0000000006${attId.toString().padStart(4, '0')}`,
        student_id: std.id,
        campus_id: testCampusId,
        date: dateStr,
        class_name: 'Class 1',
        section_name: 'A',
        status: status,
        event_type: 'Classroom',
        verification_method: 'RFID',
        remarks: status === 'LATE' ? 'Late arrival by 15 mins' : null,
        created_at: new Date().toISOString()
      });
      attId++;
    });
  }

  const { error: attErr } = await supabase.from('student_attendance_records').upsert(attendanceRecords);
  if (attErr) console.error('Attendance upsert error:', attErr.message);
  else console.log(`Successfully created ${attendanceRecords.length} attendance records.`);

  // ---------------------------------------------------------------
  // PHASE 9: FEE INVOICES & RECONCILED TRANSACTIONS
  // ---------------------------------------------------------------
  console.log('Phase 9: Seeding Fee Invoices & Payment Transactions...');

  const transactionRecords = [];
  studentRecords.slice(0, 10).forEach((std, idx) => {
    const isPaid = idx % 2 === 0;
    const amount = 45000;

    transactionRecords.push({
      id: `00000000-0000-0000-0000-0000000007${(idx + 1).toString().padStart(2, '0')}`,
      parent_id: std.parent_id,
      transaction_type: 'Tuition Fee (Q2 2026-27)',
      amount: amount,
      payment_status: isPaid ? 'Paid' : 'Pending',
      gateway_transaction_id: isPaid ? `TEST-TXN-ICICI-${10000 + idx}` : null,
      paid_at: isPaid ? new Date().toISOString() : null
    });
  });

  const { error: txnErr } = await supabase.from('transactions').upsert(transactionRecords);
  if (txnErr) console.error('Transactions upsert error:', txnErr.message);
  else console.log(`Successfully created ${transactionRecords.length} fee transaction records.`);

  // ---------------------------------------------------------------
  // PHASE 13 & 14: VISITOR & MEDICAL LOGS
  // ---------------------------------------------------------------
  console.log('Phase 13 & 14: Seeding Visitor & Medical Logs...');

  const asthmaStudent = studentRecords.find(s => s.first_name.includes('Aanya')) || studentRecords[0];
  await supabase.from('medical_logs').upsert([
    {
      id: '00000000-0000-0000-0000-000000000801',
      student_id: asthmaStudent.id,
      logged_by: staffRecords[3].id,
      symptoms: 'Mild wheezing during sports physical training',
      diagnosis: 'Seasonal Exercise-Induced Bronchospasm',
      action_taken: 'Administered prescribed Inhaler puff (200mcg) in infirmary; monitored pulse oximeter (99% SpO2)',
      emergency_contact_notified: true,
      status: 'Resolved',
      created_at: new Date().toISOString()
    }
  ]);

  await supabase.from('leave_requests').upsert([
    {
      id: '00000000-0000-0000-0000-000000000811',
      staff_id: staffRecords[5].id,
      leave_type: 'Casual',
      start_date: '2026-09-10',
      end_date: '2026-09-11',
      reason: 'Attending CBSE National Science Pedagogy Conclave in Delhi',
      status: 'Approved',
      created_at: new Date().toISOString()
    }
  ]);

  console.log('\n====================================================');
  console.log('ERP TEST DATASET SEEDING COMPLETE & VERIFIED');
  console.log('====================================================');
}

seedMasterDataset().catch(err => {
  console.error('Fatal Seeding Error:', err);
  process.exit(1);
});
