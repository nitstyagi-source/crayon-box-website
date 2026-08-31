export interface DesignationGroup {
  category: string;
  designations: string[];
}

export const DESIGNATION_GROUPS: DesignationGroup[] = [
  {
    category: "1. School Leadership & Management",
    designations: [
      "Managing Trustee",
      "Trustee",
      "Chairperson",
      "Director",
      "Executive Director",
      "Principal",
      "Vice Principal",
      "Head of School",
      "Academic Coordinator",
      "Section Head",
      "Head of Department (HOD)",
      "Coordinator"
    ]
  },
  {
    category: "2. Teaching Staff – Kindergarten / Early Years",
    designations: [
      "Head – Kindergarten",
      "Kindergarten Coordinator",
      "Montessori Coordinator",
      "Pre-Primary Teacher",
      "Montessori Directress / Teacher",
      "Nursery Teacher",
      "KG Teacher",
      "Assistant Teacher",
      "Co-Teacher",
      "Activity Teacher"
    ]
  },
  {
    category: "3. Teaching Staff – Primary",
    designations: [
      "Primary Coordinator",
      "Primary Teacher",
      "Class Teacher",
      "Subject Teacher",
      "Assistant Teacher"
    ]
  },
  {
    category: "4. Teaching Staff – Middle School",
    designations: [
      "Middle School Coordinator",
      "Middle School Teacher",
      "Subject Teacher",
      "Class Teacher",
      "HOD"
    ]
  },
  {
    category: "5. Teaching Staff – Secondary & Senior Secondary",
    designations: [
      "PGT Coordinator",
      "TGT Coordinator",
      "Subject Head",
      "HOD",
      "PGT (Post Graduate Teacher)",
      "TGT (Trained Graduate Teacher)",
      "Secondary Teacher",
      "Senior Secondary Teacher",
      "Lab Teacher / Instructor"
    ]
  },
  {
    category: "6. Specialist & Activity Faculty",
    designations: [
      "Computer Teacher",
      "IT Instructor",
      "Coding Teacher",
      "Robotics Teacher",
      "Mathematics Teacher",
      "Science Teacher",
      "Hindi Teacher",
      "English Teacher",
      "Sanskrit Teacher",
      "Social Science Teacher",
      "Art Teacher",
      "Craft Teacher",
      "Music Teacher",
      "Dance Teacher",
      "Drama Teacher",
      "Physical Education Teacher",
      "Sports Coach",
      "Yoga Instructor",
      "Abacus Teacher",
      "Special Educator",
      "Counsellor",
      "Librarian"
    ]
  },
  {
    category: "7. Administration & Front Office",
    designations: [
      "School Administrator",
      "Campus Administrator",
      "Administrative Officer",
      "Office Superintendent",
      "Office Executive",
      "Administrative Assistant",
      "Receptionist",
      "Front Office Executive",
      "Admission Counsellor",
      "Admission Manager",
      "Parent Relationship Executive",
      "Data Entry Operator",
      "Documentation Officer"
    ]
  },
  {
    category: "8. Accounts & Finance",
    designations: [
      "Chief Finance Officer / Finance Head",
      "Finance Manager",
      "Accounts Manager",
      "Senior Accountant",
      "Accountant",
      "Accounts Executive",
      "Fee Collection Executive",
      "Cashier",
      "Billing Executive",
      "Finance Assistant"
    ]
  },
  {
    category: "9. Human Resources (HR) & Payroll",
    designations: [
      "HR Head",
      "HR Manager",
      "HR Executive",
      "HR Officer",
      "HR Assistant",
      "Payroll Manager",
      "Payroll Executive",
      "Recruitment Manager",
      "Recruitment Executive"
    ]
  },
  {
    category: "10. Transport & Fleet",
    designations: [
      "Transport Manager",
      "Transport Coordinator",
      "Transport Supervisor",
      "Fleet Manager",
      "Route Coordinator",
      "Driver",
      "Bus Attendant / Conductor",
      "Transport Assistant"
    ]
  },
  {
    category: "11. Security & Campus Operations",
    designations: [
      "Security Manager",
      "Security Supervisor",
      "Security Guard",
      "Gate Security Officer",
      "CCTV Operator",
      "Visitor Desk Executive",
      "Safety Officer",
      "Emergency Response Officer"
    ]
  },
  {
    category: "12. Library",
    designations: [
      "Chief Librarian",
      "Librarian",
      "Assistant Librarian",
      "Library Assistant"
    ]
  },
  {
    category: "13. Medical / Infirmary",
    designations: [
      "School Medical Officer",
      "School Nurse",
      "Infirmary Assistant",
      "Visiting Doctor"
    ]
  },
  {
    category: "14. Maintenance & Support",
    designations: [
      "Facility Manager",
      "Maintenance Manager",
      "Maintenance Supervisor",
      "IT Manager",
      "IT Administrator",
      "IT Support Executive",
      "Technical Support Staff",
      "Store Manager",
      "Storekeeper",
      "Procurement Manager",
      "Procurement Executive",
      "Electrician",
      "Plumber",
      "Carpenter",
      "Housekeeping Supervisor",
      "Housekeeping Staff",
      "Gardener"
    ]
  },
  {
    category: "15. Counselling & Student Welfare",
    designations: [
      "School Counsellor",
      "Student Welfare Officer",
      "Child Protection Officer",
      "Special Educator",
      "Wellness Coordinator",
      "Career Counsellor"
    ]
  },
  {
    category: "16. Recruitment / Hiring",
    designations: [
      "Recruitment Head",
      "Recruitment Manager",
      "Recruitment Executive",
      "Interview Coordinator",
      "Interview Panel Member",
      "HR Interviewer",
      "Academic Interviewer"
    ]
  }
];

export const DEPARTMENTS_LIST = [
  "Academic Administration",
  "Early Childhood / Pre-Primary Wing",
  "Primary Wing (Grades 1–5)",
  "Middle School Wing (Grades 6–8)",
  "Secondary & Senior Secondary Wing (Grades 9–12)",
  "Languages & Literature",
  "Sciences & STEM",
  "Mathematics",
  "Arts & Performing Arts",
  "Sports & Physical Education",
  "General School Administration",
  "Admissions & Marketing",
  "Accounts & Finance",
  "Human Resources & Payroll",
  "Transport & Fleet Management",
  "Security, Safety & CCTV",
  "Library & Information Services",
  "Health & Medical Infirmary",
  "Facility Management & Housekeeping",
  "IT Systems & Infrastructure",
  "Student Welfare & Special Needs"
];

export interface ErpRoleOption {
  role: string;
  scope: string;
}

export const ERP_ROLES_LIST: ErpRoleOption[] = [
  { role: "Super Admin / Trustee", scope: "Unrestricted institutional access across all campuses, finances, CCTV, and HR" },
  { role: "Principal / Head of School", scope: "Complete academic and administrative control, appraisals, and approvals" },
  { role: "Vice Principal / Coordinator", scope: "Section-wide monitoring, timetable, exams, class allocations" },
  { role: "Teacher / Faculty", scope: "Digital diary, homework, attendance, gradebook, and parent messaging" },
  { role: "Class Teacher", scope: "Class attendance, report cards, student profiles, and PTM logs" },
  { role: "Accounts Manager", scope: "Fee structures, concessions, refunds, reconciliation, and audit reports" },
  { role: "Cashier / Fee Executive", scope: "Fee collection, receipt printing, and counter cash settlement" },
  { role: "Admission Officer", scope: "Inquiries, registration, document verification, and enrollment" },
  { role: "HR / Payroll Officer", scope: "Staff directory, biometric attendance, leaves, and salary structures" },
  { role: "Transport Supervisor / Driver", scope: "Route telemetry, student boarding check-in, and incident reporting" },
  { role: "Security / Gate Guard", scope: "Visitor management, QR gate scanner, and student pickup verification" },
  { role: "School Nurse / Doctor", scope: "Student medical records, infirmary visits, and health allergies" },
  { role: "Librarian", scope: "Book inventory, barcode issue/returns, and digital library catalog" },
  { role: "Store / Procurement Manager", scope: "Purchase requisitions, stock register, and book/uniform kits" }
];

export const EMPLOYMENT_TYPES = [
  "Full Time",
  "Part Time",
  "Contract",
  "Consultant",
  "Visiting",
  "Temporary",
  "Intern",
  "Outsourced",
  "Volunteer"
];

export const EMPLOYMENT_STATUSES = [
  "Active",
  "On Leave",
  "Probation",
  "Suspended",
  "Resigned",
  "Terminated",
  "Retired",
  "Inactive"
];
