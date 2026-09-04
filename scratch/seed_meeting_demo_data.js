const pg = require("pg");
const connectionString = "postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function seedMeetingDemoData() {
  const client = await pool.connect();
  console.log("Connected to Supabase PostgreSQL for Meeting Demo Data Seeding...");

  try {
    // 1. Resolve Target Class: Class 1-A
    const classRes = await client.query("SELECT id, campus_id, academic_year_id FROM public.classes WHERE grade = 'Class 1' AND section = 'A' LIMIT 1");
    const classRecord = classRes.rows[0];
    const classId = classRecord.id;
    const campusId = classRecord.campus_id || '1811b729-df9a-4334-b840-d239dd935084';
    const academicYearId = classRecord.academic_year_id || '00000000-0000-0000-0000-000000000003';

    console.log(`Targeting Class 1-A (ID: ${classId}, Campus: ${campusId})`);

    // 2. Comprehensive 28 Student Roster for Class 1-A
    const demoStudents = [
      { first: "Aarav", last: "Sharma", roll: 1, gender: "MALE", blood: "O+", house: "Agni", father: "Rajesh Sharma", mother: "Pooja Sharma", phone: "9811122301", route: "Route 01 - Burari" },
      { first: "Aditi", last: "Verma", roll: 2, gender: "FEMALE", blood: "B+", house: "Varun", father: "Sunil Verma", mother: "Anuradha Verma", phone: "9811122302", route: "Route 02 - Model Town" },
      { first: "Arjun", last: "Patel", roll: 3, gender: "MALE", blood: "A+", house: "Prithvi", father: "Manish Patel", mother: "Kavita Patel", phone: "9811122303", route: "Self / Escort" },
      { first: "Ananya", last: "Mishra", roll: 4, gender: "FEMALE", blood: "AB+", house: "Vayu", father: "Dr. Alok Mishra", mother: "Dr. Nidhi Mishra", phone: "9811122304", route: "Route 01 - Burari" },
      { first: "Dev", last: "Malhotra", roll: 5, gender: "MALE", blood: "O-", house: "Agni", father: "Vikas Malhotra", mother: "Deepa Malhotra", phone: "9811122305", route: "Route 03 - Rohini" },
      { first: "Diya", last: "Kapoor", roll: 6, gender: "FEMALE", blood: "B-", house: "Varun", father: "Gaurav Kapoor", mother: "Ritu Kapoor", phone: "9811122306", route: "Route 04 - Pitampura" },
      { first: "Ishaan", last: "Gupta", roll: 7, gender: "MALE", blood: "A-", house: "Prithvi", father: "Sanjay Gupta", mother: "Sangeeta Gupta", phone: "9811122307", route: "Route 01 - Burari" },
      { first: "Kavya", last: "Nair", roll: 8, gender: "FEMALE", blood: "O+", house: "Vayu", father: "Manoj Nair", mother: "Lakshmi Nair", phone: "9811122308", route: "Self / Escort" },
      { first: "Kabir", last: "Bhatia", roll: 9, gender: "MALE", blood: "B+", house: "Agni", father: "Harish Bhatia", mother: "Simran Bhatia", phone: "9811122309", route: "Route 02 - Model Town" },
      { first: "Kiara", last: "Singhania", roll: 10, gender: "FEMALE", blood: "AB+", house: "Varun", father: "Rohan Singhania", mother: "Tanvi Singhania", phone: "9811122310", route: "Route 04 - Pitampura" },
      { first: "Madhav", last: "Iyer", roll: 11, gender: "MALE", blood: "A+", house: "Prithvi", father: "Karthik Iyer", mother: "Meera Iyer", phone: "9811122311", route: "Route 03 - Rohini" },
      { first: "Myra", last: "Deshmukh", roll: 12, gender: "FEMALE", blood: "O+", house: "Vayu", father: "Amit Deshmukh", mother: "Sayali Deshmukh", phone: "9811122312", route: "Route 01 - Burari" },
      { first: "Pranav", last: "Joshi", roll: 13, gender: "MALE", blood: "B+", house: "Agni", father: "Naveen Joshi", mother: "Rekha Joshi", phone: "9811122313", route: "Self / Escort" },
      { first: "Pari", last: "Choudhary", roll: 14, gender: "FEMALE", blood: "A+", house: "Varun", father: "Kuldeep Choudhary", mother: "Monika Choudhary", phone: "9811122314", route: "Route 02 - Model Town" },
      { first: "Reyansh", last: "Mehta", roll: 15, gender: "MALE", blood: "AB-", house: "Prithvi", father: "Anil Mehta", mother: "Geeta Mehta", phone: "9811122315", route: "Route 04 - Pitampura" },
      { first: "Rhea", last: "Saxena", roll: 16, gender: "FEMALE", blood: "O-", house: "Vayu", father: "Ashok Saxena", mother: "Vandana Saxena", phone: "9811122316", route: "Route 03 - Rohini" },
      { first: "Samar", last: "Chawla", roll: 17, gender: "MALE", blood: "B+", house: "Agni", father: "Praveen Chawla", mother: "Neetu Chawla", phone: "9811122317", route: "Route 01 - Burari" },
      { first: "Saanvi", last: "Aggarwal", roll: 18, gender: "FEMALE", blood: "A+", house: "Varun", father: "Deepak Aggarwal", mother: "Shweta Aggarwal", phone: "9811122318", route: "Self / Escort" },
      { first: "Shaurya", last: "Rawat", roll: 19, gender: "MALE", blood: "O+", house: "Prithvi", father: "Col. BS Rawat", mother: "Anjali Rawat", phone: "9811122319", route: "Route 02 - Model Town" },
      { first: "Tanya", last: "Reddy", roll: 20, gender: "FEMALE", blood: "B+", house: "Vayu", father: "Dr. Srinivas Reddy", mother: "Padma Reddy", phone: "9811122320", route: "Route 04 - Pitampura" },
      { first: "Tanmay", last: "Dubey", roll: 21, gender: "MALE", blood: "A+", house: "Agni", father: "Ramesh Dubey", mother: "Kalpana Dubey", phone: "9811122321", route: "Route 01 - Burari" },
      { first: "Trisha", last: "Bansal", roll: 22, gender: "FEMALE", blood: "AB+", house: "Varun", father: "Mohit Bansal", mother: "Prerna Bansal", phone: "9811122322", route: "Route 03 - Rohini" },
      { first: "Vivaan", last: "Seth", roll: 23, gender: "MALE", blood: "O+", house: "Prithvi", father: "Abhishek Seth", mother: "Neha Seth", phone: "9811122323", route: "Self / Escort" },
      { first: "Vanya", last: "Pandey", roll: 24, gender: "FEMALE", blood: "B-", house: "Vayu", father: "Sudarshan Pandey", mother: "Bimla Pandey", phone: "9811122324", route: "Route 02 - Model Town" },
      { first: "Yash", last: "Trivedi", roll: 25, gender: "MALE", blood: "A-", house: "Agni", father: "Hemant Trivedi", mother: "Pallavi Trivedi", phone: "9811122325", route: "Route 01 - Burari" },
      { first: "Zoya", last: "Khan", roll: 26, gender: "FEMALE", blood: "O+", house: "Varun", father: "Farhan Khan", mother: "Shabana Khan", phone: "9811122326", route: "Route 04 - Pitampura" },
      { first: "Yuvan", last: "Chauhan", roll: 27, gender: "MALE", blood: "B+", house: "Prithvi", father: "Vijay Chauhan", mother: "Sunita Chauhan", phone: "9811122327", route: "Route 03 - Rohini" },
      { first: "Anika", last: "Sood", roll: 28, gender: "FEMALE", blood: "A+", house: "Vayu", father: "Tarun Sood", mother: "Divya Sood", phone: "9811122328", route: "Self / Escort" }
    ];

    let insertedCount = 0;
    for (const s of demoStudents) {
      const admNo = `ADM-2026-${String(s.roll).padStart(3, '0')}`;
      const dob = `2019-0${(s.roll % 9) + 1}-1${(s.roll % 8) + 1}`;

      await client.query(`
        INSERT INTO public.students (
          campus_id, academic_year_id, class_id, admission_no, enrollment_number, roll_no,
          first_name, last_name, gender, dob, blood_group, nationality, category,
          status, father_name, mother_name, parent_phone, parent_email, transport_route, house, is_test_record
        ) VALUES (
          $1, $2, $3, $4, $4, $5,
          $6, $7, $8, $9, $10, 'Indian', 'General',
          'ACTIVE', $11, $12, $13, $14, $15, $16, true
        )
        ON CONFLICT (admission_no) DO UPDATE
        SET first_name = $6, last_name = $7, roll_no = $5, class_id = $3,
            father_name = $11, mother_name = $12, parent_phone = $13, transport_route = $15, house = $16;
      `, [
        campusId, academicYearId, classId, admNo, s.roll,
        s.first, s.last, s.gender, dob, s.blood,
        s.father, s.mother, s.phone, `${s.first.toLowerCase()}.${s.last.toLowerCase()}@crayonboxparents.com`,
        s.route, s.house
      ]);
      insertedCount++;
    }
    console.log(`✓ Inserted/Updated ${insertedCount} students in Class 1-A roster!`);

    // 3. Faculty with Diverse Roles & Functional Designations
    const demoStaff = [
      {
        first: "Dr. Ananya", last: "Sharma",
        role: "PRINCIPAL",
        designation: "Academic Dean & Principal",
        department: "Academics",
        phone: "9810190001",
        email: "ananya.sharma@crayonboxschool.com",
        exp: 18,
        qual: "Ph.D. in Educational Pedagogy, M.Sc Physics",
        subjects: "Physics, Advanced Science",
        isLeader: true,
        empId: "EMP-1001"
      },
      {
        first: "Vikramaditya", last: "Rao",
        role: "ACCOUNTS",
        designation: "Chief Financial Officer & Bursar",
        department: "Accounts & Treasury",
        phone: "9810190002",
        email: "vikram.rao@crayonboxschool.com",
        exp: 15,
        qual: "Chartered Accountant (FCA), M.Com",
        subjects: "Financial Audits, Fee Reconciliation",
        isLeader: true,
        empId: "EMP-1002"
      },
      {
        first: "Pooja", last: "Bhattacharya",
        role: "TEACHER",
        designation: "Class 1-A Primary Homeroom Lead",
        department: "Primary School",
        phone: "9810190003",
        email: "pooja.bhatt@crayonboxschool.com",
        exp: 8,
        qual: "B.Ed, M.A. English Literature",
        subjects: "English, Foundational Phonics",
        isLeader: false,
        empId: "EMP-1003"
      },
      {
        first: "Suresh", last: "Nambiar",
        role: "TEACHER",
        designation: "Senior STEM & Robotics Mentor",
        department: "Science & Innovation",
        phone: "9810190004",
        email: "suresh.nambiar@crayonboxschool.com",
        exp: 10,
        qual: "B.Tech Computer Science, B.Ed",
        subjects: "Mathematics, AI & Robotics",
        isLeader: false,
        empId: "EMP-1004"
      },
      {
        first: "Meenakshi", last: "Sundaram",
        role: "ADMIN",
        designation: "Registrar & Admissions Director",
        department: "Admissions CRM",
        phone: "9810190005",
        email: "meenakshi.s@crayonboxschool.com",
        exp: 12,
        qual: "MBA Educational Administration",
        subjects: "Enquiry Pipeline, Parent Counseling",
        isLeader: true,
        empId: "EMP-1005"
      },
      {
        first: "Sister Mary", last: "Joseph",
        role: "TEACHER",
        designation: "Head of Pastoral Care & SEN Specialist",
        department: "Student Well-being",
        phone: "9810190006",
        email: "mary.joseph@crayonboxschool.com",
        exp: 14,
        qual: "M.Sc Clinical Psychology, RCI Certified SEN",
        subjects: "Inclusive Learning, PBIS House Points",
        isLeader: false,
        empId: "EMP-1006"
      },
      {
        first: "Ramesh", last: "Kumar Yadav",
        role: "DRIVER",
        designation: "Fleet Transit Captain (Route #04)",
        department: "Logistics & Transport",
        phone: "9810190007",
        email: "ramesh.transit@crayonboxschool.com",
        exp: 11,
        qual: "Commercial Heavy Vehicle Certified",
        subjects: "GPS Beacon Telematics, Route Safety",
        isLeader: false,
        empId: "EMP-1007"
      },
      {
        first: "Subedar Major Ram", last: "Singh",
        role: "ADMIN",
        designation: "Chief Security Officer & Campus Marshal",
        department: "Safety & Gate Security",
        phone: "9810190008",
        email: "ram.singh@crayonboxschool.com",
        exp: 20,
        qual: "Ex-Indian Army (Infantry), Safety Protocols",
        subjects: "Turnstile Barcode Gate Control, POCSO Compliance",
        isLeader: false,
        empId: "EMP-1008"
      }
    ];

    let staffCount = 0;
    for (const st of demoStaff) {
      // Check if already exists by employee_id or email
      const checkRes = await client.query("SELECT id FROM public.staff WHERE employee_id = $1 OR official_email = $2", [st.empId, st.email]);
      if (checkRes.rows.length > 0) {
        await client.query(`
          UPDATE public.staff
          SET first_name = $1, last_name = $2, role = $3, designation = $4, department = $5,
              phone_number = $6, experience_years = $7, qualification = $8, subjects_taught = $9, is_leadership = $10, is_active = true
          WHERE id = $11;
        `, [
          st.first, st.last, st.role, st.designation, st.department,
          st.phone, st.exp, st.qual, st.subjects, st.isLeader, checkRes.rows[0].id
        ]);
      } else {
        await client.query(`
          INSERT INTO public.staff (
            campus_id, employee_id, first_name, last_name, role, designation, department,
            phone_number, official_email, email, experience_years, qualification,
            subjects_taught, is_leadership, status, is_active, joining_date
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $9, $10, $11,
            $12, $13, 'ACTIVE', true, '2024-04-01'
          );
        `, [
          campusId, st.empId, st.first, st.last, st.role, st.designation, st.department,
          st.phone, st.email, st.exp, st.qual, st.subjects, st.isLeader
        ]);
      }
      staffCount++;
    }
    console.log(`✓ Inserted/Updated ${staffCount} faculty & staff members with distinct operational roles!`);

    // 4. Verify Final Counts in Database
    const resS = await client.query("SELECT count(*) FROM public.students WHERE class_id = $1", [classId]);
    const resF = await client.query("SELECT count(*) FROM public.staff WHERE is_active = true");
    console.log("==================================================");
    console.log(`✓ Class 1-A Active Students: ${resS.rows[0].count}`);
    console.log(`✓ Total Institutional Staff: ${resF.rows[0].count}`);
    console.log("==================================================");

  } catch (err) {
    console.error("Error seeding demo data:", err);
  } finally {
    await client.release();
    await pool.end();
  }
}

seedMeetingDemoData();
