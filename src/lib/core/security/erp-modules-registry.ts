/**
 * CANONICAL ERP MODULES & PERMISSIONS REGISTRY
 * Single source of truth for all modules across Vani Educational Trust ERP.
 * Any new module added here is automatically discovered across IAM, RBAC matrix,
 * sidebar navigation, and individual staff permission grantors.
 */

export interface ErpModuleDefinition {
  code: string;
  name: string;
  category: 'Governance & Overview' | 'Students & Admissions' | 'Academic Operations' | 'Finance & Procurement' | 'Campus Logistics & Safety' | 'Parent & Community Services' | 'System & Security';
  href: string;
  description: string;
  defaultRoles: ('SUPER_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'ACCOUNTS' | 'STAFF')[];
  supportsActions: ('can_view' | 'can_create' | 'can_edit' | 'can_delete' | 'can_export')[];
}

export const ERP_MODULES_REGISTRY: ErpModuleDefinition[] = [
  // 1. Governance & Overview
  {
    code: 'DASHBOARD',
    name: 'Unified Command Desk',
    category: 'Governance & Overview',
    href: '/admin/dashboard',
    description: 'Executive telematics, cross-campus enrollment KPIs, and operational alerts.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_export']
  },
  {
    code: 'INSTITUTIONS',
    name: 'Multi-Campus Matrix',
    category: 'Governance & Overview',
    href: '/admin/institutions',
    description: 'Multi-school configuration, school creation, campus switching, and brand settings.',
    defaultRoles: ['SUPER_ADMIN'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete']
  },
  {
    code: 'TRUST_GOVERNANCE',
    name: 'Trust Master Governance',
    category: 'Governance & Overview',
    href: '/admin/trust',
    description: 'Central Vaani Educational Trust leadership, statutory 80G, PAN, and trust seals.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_edit']
  },
  {
    code: 'GOVERNANCE_MIS',
    name: 'Governance MIS Analytics',
    category: 'Governance & Overview',
    href: '/admin/reports/governance',
    description: 'Consolidated executive reports, regulatory compliance matrices, and trust benchmarks.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_export']
  },

  // 2. Students & Admissions
  {
    code: 'STUDENTS',
    name: 'Student Roster Directory',
    category: 'Students & Admissions',
    href: '/admin/students',
    description: 'Universal student registry, 360 dossiers, roll-calls, and demographic profiles.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export']
  },
  {
    code: 'ADMISSIONS',
    name: 'Enquiries & Leads',
    category: 'Students & Admissions',
    href: '/admin/admissions',
    description: 'Lead capture, Kanban enquiry pipeline, document verification, and seat allocation.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export']
  },
  {
    code: 'FAMILIES',
    name: 'Family 360° Household Master',
    category: 'Students & Admissions',
    href: '/admin/families',
    description: 'Household linking, multi-child parent directories, sibling concession links.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },

  // 3. Academic Operations
  {
    code: 'FACULTY',
    name: 'Faculty Staff Directory',
    category: 'Academic Operations',
    href: '/admin/faculty',
    description: 'Teacher profiles, qualifications, class allocations, and police verification status.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export']
  },
  {
    code: 'ATTENDANCE',
    name: 'Daily Student Attendance',
    category: 'Academic Operations',
    href: '/admin/attendance',
    description: 'Classroom roll-call, RFID badge scan logs, leave requests, and journey tracking.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'SUBSTITUTIONS',
    name: 'Teacher Substitutions Engine',
    category: 'Academic Operations',
    href: '/admin/faculty/substitutions',
    description: 'Automated proxy period assignment and teacher leave load-balancing.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit']
  },
  {
    code: 'CURRICULUM',
    name: 'Curriculum & Syllabus',
    category: 'Academic Operations',
    href: '/admin/curriculum',
    description: 'CBSE & Montessori learning frameworks, unit planners, and competency rubrics.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'LESSON_DIARY',
    name: 'Teacher Lesson Diary',
    category: 'Academic Operations',
    href: '/admin/lesson-diary',
    description: 'Daily classroom teaching logs, homework broadcast, and principal sign-off.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit']
  },
  {
    code: 'TIMETABLE',
    name: 'Master Timetable',
    category: 'Academic Operations',
    href: '/admin/timetable',
    description: 'Class schedules, teacher subject mappings, period collision detection.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export']
  },
  {
    code: 'EXAMS',
    name: 'Exams & Moderation',
    category: 'Academic Operations',
    href: '/admin/exams',
    description: 'Scholastic gradebooks, CBSE marks entry, report card generation, and hall tickets.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'CALENDAR',
    name: 'Academic Calendar & Events',
    category: 'Academic Operations',
    href: '/admin/calendar',
    description: 'School term schedules, gazetted holidays, institutional event planner.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete']
  },

  // 4. Finance & Procurement
  {
    code: 'FINANCE',
    name: 'Executive Finance & GL',
    category: 'Finance & Procurement',
    href: '/admin/finance',
    description: 'Double-entry general ledger, revenue charts, budget forecasting, and audits.',
    defaultRoles: ['SUPER_ADMIN', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export']
  },
  {
    code: 'FEE_COLLECTIONS',
    name: 'Fee Collections & Invoices',
    category: 'Finance & Procurement',
    href: '/admin/finance/collections',
    description: 'Quarterly billing, counter cash receipts, UPI QR verification, and arrears reconciliation.',
    defaultRoles: ['SUPER_ADMIN', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export']
  },
  {
    code: 'FEE_STRUCTURE',
    name: 'Fee Structure & Concessions',
    category: 'Finance & Procurement',
    href: '/admin/finance/structure',
    description: 'Tuition slabs, fee heads, sibling discount rules, and trust scholarship policies.',
    defaultRoles: ['SUPER_ADMIN', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete']
  },
  {
    code: 'HR_PAYROLL',
    name: 'HR & Statutory Payroll',
    category: 'Finance & Procurement',
    href: '/admin/hr/payroll',
    description: 'Staff biometric attendance sync, monthly salary slips, EPF, ESI, and TDS deductions.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'PROCUREMENT',
    name: 'Spend & Procurement',
    category: 'Finance & Procurement',
    href: '/admin/procurement',
    description: 'Vendor purchase orders, quotation comparisons, and expense approvals.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'INVENTORY',
    name: 'Fixed Asset Inventory',
    category: 'Finance & Procurement',
    href: '/admin/inventory',
    description: 'School furniture, lab equipment, IT hardware assets, and depreciation tracking.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export']
  },

  // 5. Campus Logistics & Safety
  {
    code: 'TRANSPORT',
    name: 'Transport Fleet Radar',
    category: 'Campus Logistics & Safety',
    href: '/admin/transport',
    description: 'School bus telematics, route waypoints, driver allocations, and QR boarding passes.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'INCIDENTS',
    name: 'Child Safeguarding & POCSO',
    category: 'Campus Logistics & Safety',
    href: '/admin/incidents',
    description: 'Confidential incident reporting, designated safeguarding leads, and safety compliance.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create', 'can_edit']
  },
  {
    code: 'HEALTH',
    name: 'Health Clinic Infirmary',
    category: 'Campus Logistics & Safety',
    href: '/admin/health',
    description: 'Medical health checkups, allergies, vaccination tracker, and clinic visits.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'LIBRARY',
    name: 'Digital Library Master',
    category: 'Campus Logistics & Safety',
    href: '/admin/library',
    description: 'Book cataloging, ISBN barcode search, issue/returns, and fine management.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'LIVE_STREAM',
    name: 'Live CCTV Security Stream',
    category: 'Campus Logistics & Safety',
    href: '/admin/live-stream',
    description: 'Authorized parental CCTV classroom streaming and security camera feeds.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_edit']
  },
  {
    code: 'VISITORS',
    name: 'Visitor Gate Pass',
    category: 'Campus Logistics & Safety',
    href: '/admin/visitors',
    description: 'Digital visitor check-in, photo badge printing, and escort OTP authorization.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_export']
  },
  {
    code: 'EMERGENCY',
    name: 'Emergency Red Broadcast',
    category: 'Campus Logistics & Safety',
    href: '/admin/emergency',
    description: 'Instant campus lockdown alerts, SMS/WhatsApp emergency dispatches.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create']
  },

  // 6. Parent & Community Services
  {
    code: 'CAMPAIGNS',
    name: 'Broadcasts & Circulars',
    category: 'Parent & Community Services',
    href: '/admin/campaigns',
    description: 'Omnichannel SMS, WhatsApp, and email circular dispatches to parent cohorts.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_export']
  },
  {
    code: 'CONSENT',
    name: 'Digital Parent Consent',
    category: 'Parent & Community Services',
    href: '/admin/consent',
    description: 'Excursion permissions, medical consent, and e-signatures.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create', 'can_export']
  },
  {
    code: 'PTM',
    name: 'PTM Slot Booking',
    category: 'Parent & Community Services',
    href: '/admin/ptm',
    description: 'Parent-Teacher meeting scheduling, slot selection, and feedback logs.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
    supportsActions: ['can_view', 'can_create', 'can_edit']
  },
  {
    code: 'GRIEVANCES',
    name: 'Parent Grievance Desk',
    category: 'Parent & Community Services',
    href: '/admin/grievances',
    description: 'Ticketing system for parent concerns, SLA tracking, and resolution history.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create', 'can_edit']
  },
  {
    code: 'EARLY_DEPARTURE',
    name: 'Early Departure Passes',
    category: 'Parent & Community Services',
    href: '/admin/early-departure',
    description: 'Gate security clearance QR codes for early student pickups.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create']
  },
  {
    code: 'CMS',
    name: 'Website CMS & News',
    category: 'Parent & Community Services',
    href: '/admin/cms',
    description: 'Public portal content editor, photo gallery updates, and notice board.',
    defaultRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
    supportsActions: ['can_view', 'can_create', 'can_edit', 'can_delete']
  },

  // 7. System & Security
  {
    code: 'IAM',
    name: 'Identity & Access (IAM)',
    category: 'System & Security',
    href: '/admin/iam',
    description: 'Super Admin module access selector, RBAC matrix, and staff overrides.',
    defaultRoles: ['SUPER_ADMIN'],
    supportsActions: ['can_view', 'can_edit']
  },
  {
    code: 'DATA_QUALITY',
    name: 'Data Quality & Integrity',
    category: 'System & Security',
    href: '/admin/data-quality',
    description: 'Automated database schema audits and orphan record resolution.',
    defaultRoles: ['SUPER_ADMIN'],
    supportsActions: ['can_view', 'can_export']
  }
];

export function getAllCategories(): string[] {
  const cats = new Set<string>();
  ERP_MODULES_REGISTRY.forEach(m => cats.add(m.category));
  return Array.from(cats);
}
