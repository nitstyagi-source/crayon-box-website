/**
 * VANI EDUCATIONAL TRUST - HIERARCHICAL OPERATING MODEL (FINAL LOCKED SPECIFICATION)
 * Hierarchy: Trust -> Legal Entity -> Institution -> Campus -> Academic Session -> Wing -> Class -> Section -> Student / Staff
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * Vani Educational Trust is the governance and shared-services layer;
 * Legal Entity defines the legal/financial ownership boundary;
 * Institution defines the academic and operational identity;
 * Campus defines the physical operating boundary;
 * Academic Session defines the time-bound configuration; and
 * Enrollment/Assignment defines the student's or employee's relationship with an institution.
 */

export interface TrustOrganization {
  id: string;
  code: string;
  name: string;
  registrationNumber: string;
  headquarters: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
}

export interface LegalEntityMaster {
  id: string;
  trustId: string;
  legalName: string;
  cinOrRegistrationNo: string;
  panNumber: string;
  tanNumber: string;
  gstinNumber?: string;
  registeredAddress: string;
  bankAccountsCount: number;
}

export type InstitutionType = 'K12_SCHOOL' | 'PRE_SCHOOL' | 'EARLY_CHILDHOOD_CENTRE' | 'HIGHER_ED';
export type AcademicFrameworkType = 'CBSE' | 'MONTESSORI' | 'STATE_BOARD' | 'ICSE' | 'CUSTOM';

export interface InstitutionMaster {
  id: string;
  code: string;
  trustId: string;
  legalEntityId: string;
  name: string;
  shortName: string;
  institutionType: InstitutionType;
  academicFramework: AcademicFrameworkType;
  boardAffiliation: 'CBSE' | 'MONTESSORI' | 'STATE_BOARD' | 'ICSE';
  affiliationNumber?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
  principalName: string;
  principalEmail: string;
  logoUrl: string;
  brandColor: string;
  address: string;
  totalStudents: number;
  totalStaff: number;

  // Institution Profile Configuration with Effective Dating & Approval Lifecycle
  config: {
    billingIdentity: {
      receiptPrefix: string;
      invoicePrefix: string;
      taxGstin?: string;
      primaryBankAccountId: string;
    };
    schoolTimings: { start: string; end: string };
    cctvParentStreamDurationMins: number;
    dailyLateFeeAmount: number;
    lateFeeGracePeriodDays: number;
    effectiveFrom: string;
    effectiveTo?: string;
    versionNumber: number;
    approvalStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'EFFECTIVE' | 'SUPERSEDED';
    approvedBy?: string;
    approvedAt?: string;
  };
}

export interface CampusMaster {
  id: string;
  code: string;
  institutionId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
  contactEmail: string;
  campusAdminName: string;
  isMainCampus: boolean;
  status: 'ACTIVE' | 'MAINTENANCE';
}

export interface AcademicSessionMaster {
  id: string;
  institutionId: string;
  name: string; // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  calendarModel: 'CBSE_ANNUAL' | 'MONTESSORI_CONTINUOUS' | 'STATE_BOARD_ANNUAL';
  isCurrent: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'ARCHIVED';
}

// -------------------------------------------------------------
// SEEDED MASTER DATA FOR VANI EDUCATIONAL TRUST ECOSYSTEM
// -------------------------------------------------------------

export const VANI_TRUST_ORGANIZATION: TrustOrganization = {
  id: 'org-vani-trust',
  code: 'VET',
  name: 'Vani Educational Trust',
  registrationNumber: 'VET/REG/2012/DEL-8891',
  headquarters: 'Sector 62, Institutional Area, Noida, Uttar Pradesh, 201309',
  contactEmail: 'governance@vanitrust.edu.in',
  contactPhone: '+91 120 4567890',
  website: 'https://vanitrust.edu.in',
};

export const VANI_TRUST_LEGAL_ENTITIES: LegalEntityMaster[] = [
  {
    id: 'leg-vet-main',
    trustId: 'org-vani-trust',
    legalName: 'Vani Educational Trust Society',
    cinOrRegistrationNo: 'DEL-SOC-8891-2012',
    panNumber: 'AAATV1234F',
    tanNumber: 'DELV12345A',
    gstinNumber: '07AAATV1234F1Z5',
    registeredAddress: 'Plot 4A, Sector 62, Institutional Area, Noida, UP',
    bankAccountsCount: 6,
  },
];

export const VANI_TRUST_INSTITUTIONS: InstitutionMaster[] = [
  {
    id: 'ins-cbs',
    code: 'CBS',
    trustId: 'org-vani-trust',
    legalEntityId: 'leg-vet-main',
    name: 'Crayon Box School',
    shortName: 'Crayon Box School',
    institutionType: 'K12_SCHOOL',
    academicFramework: 'CBSE',
    boardAffiliation: 'CBSE',
    affiliationNumber: 'CBSE/AFF/2130894',
    status: 'ACTIVE',
    principalName: 'Dr. Ananya Roy',
    principalEmail: 'principal@crayonboxschool.com',
    logoUrl: '/logo.png',
    brandColor: '#2563eb', // Blue
    address: 'Shastri Park Extn., Delhi NCR',
    totalStudents: 1250,
    totalStaff: 85,
    config: {
      billingIdentity: {
        receiptPrefix: 'CBS-REC-2026',
        invoicePrefix: 'CBS-INV-2026',
        primaryBankAccountId: 'bnk-cbs-fee',
      },
      schoolTimings: { start: '08:00', end: '15:30' },
      cctvParentStreamDurationMins: 15,
      dailyLateFeeAmount: 100,
      lateFeeGracePeriodDays: 5,
      effectiveFrom: '2026-04-01',
      effectiveTo: '2027-03-31',
      versionNumber: 1,
      approvalStatus: 'EFFECTIVE',
      approvedBy: 'Trustee Board',
      approvedAt: '2026-03-15T10:00:00Z',
    },
  },
  {
    id: 'ins-cbps',
    code: 'CBPS',
    trustId: 'org-vani-trust',
    legalEntityId: 'leg-vet-main',
    name: 'Crayon Box Pre School',
    shortName: 'Crayon Box Pre-School',
    institutionType: 'PRE_SCHOOL',
    academicFramework: 'MONTESSORI',
    boardAffiliation: 'MONTESSORI',
    status: 'ACTIVE',
    principalName: 'Mrs. Shalini Mehta',
    principalEmail: 'headmistress@crayonboxpreschool.com',
    logoUrl: '/logo.png',
    brandColor: '#ec4899', // Pink
    address: 'Shastri Park Extn., Delhi NCR',
    totalStudents: 320,
    totalStaff: 28,
    config: {
      billingIdentity: {
        receiptPrefix: 'CBPS-REC-2026',
        invoicePrefix: 'CBPS-INV-2026',
        primaryBankAccountId: 'bnk-cbps-fee',
      },
      schoolTimings: { start: '09:00', end: '13:00' },
      cctvParentStreamDurationMins: 20,
      dailyLateFeeAmount: 50,
      lateFeeGracePeriodDays: 7,
      effectiveFrom: '2026-04-01',
      effectiveTo: '2027-03-31',
      versionNumber: 1,
      approvalStatus: 'EFFECTIVE',
      approvedBy: 'Trustee Board',
      approvedAt: '2026-03-15T10:00:00Z',
    },
  },
  {
    id: 'ins-as',
    code: 'AS',
    trustId: 'org-vani-trust',
    legalEntityId: 'leg-vet-main',
    name: 'Avinya School',
    shortName: 'Avinya School',
    institutionType: 'K12_SCHOOL',
    academicFramework: 'CBSE',
    boardAffiliation: 'CBSE',
    affiliationNumber: 'CBSE/AFF/2130992',
    status: 'ACTIVE',
    principalName: 'Dr. Rajeshwar Sen',
    principalEmail: 'principal@avinyaschool.edu.in',
    logoUrl: '/logo.png',
    brandColor: '#7c3aed', // Purple
    address: 'Virender Nagar Burari, Delhi 110084',
    totalStudents: 780,
    totalStaff: 68,
    config: {
      billingIdentity: {
        receiptPrefix: 'AS-REC-2026',
        invoicePrefix: 'AS-INV-2026',
        primaryBankAccountId: 'bnk-as-fee',
      },
      schoolTimings: { start: '08:00', end: '15:30' },
      cctvParentStreamDurationMins: 15,
      dailyLateFeeAmount: 100,
      lateFeeGracePeriodDays: 7,
      effectiveFrom: '2026-04-01',
      effectiveTo: '2027-03-31',
      versionNumber: 1,
      approvalStatus: 'EFFECTIVE',
      approvedBy: 'Trustee Board',
      approvedAt: '2026-03-15T10:00:00Z',
    },
  },
  {
    id: 'ins-avm',
    code: 'AVM',
    trustId: 'org-vani-trust',
    legalEntityId: 'leg-vet-main',
    name: 'Avinya Vidya Mandir',
    shortName: 'Avinya Vidya Mandir',
    institutionType: 'K12_SCHOOL',
    academicFramework: 'STATE_BOARD',
    boardAffiliation: 'STATE_BOARD',
    status: 'ACTIVE',
    principalName: 'Prof. Ramesh Chandra',
    principalEmail: 'principal@avinyavidyamandir.edu.in',
    logoUrl: '/logo.png',
    brandColor: '#ea580c', // Orange
    address: 'Virender Nagar Burari, Delhi 110084',
    totalStudents: 500,
    totalStaff: 42,
    config: {
      billingIdentity: {
        receiptPrefix: 'AVM-REC-2026',
        invoicePrefix: 'AVM-INV-2026',
        primaryBankAccountId: 'bnk-avm-fee',
      },
      schoolTimings: { start: '07:45', end: '14:45' },
      cctvParentStreamDurationMins: 15,
      dailyLateFeeAmount: 50,
      lateFeeGracePeriodDays: 10,
      effectiveFrom: '2026-04-01',
      effectiveTo: '2027-03-31',
      versionNumber: 1,
      approvalStatus: 'EFFECTIVE',
      approvedBy: 'Trustee Board',
      approvedAt: '2026-03-15T10:00:00Z',
    },
  },
];

export const VANI_TRUST_CAMPUSES: CampusMaster[] = [
  {
    id: 'cmp-cbs-spe',
    code: 'CBS-SPE',
    institutionId: 'ins-cbs',
    name: 'CBS — Shastri Park Extn.',
    address: 'Plot 4A, Shastri Park Extension',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110053',
    contactPhone: '+91 11 2289 1234',
    contactEmail: 'admin.cbs@crayonboxschool.com',
    campusAdminName: 'Mr. Vikram Singh',
    isMainCampus: true,
    status: 'ACTIVE',
  },
  {
    id: 'cmp-cbps-spe',
    code: 'CBPS-SPE',
    institutionId: 'ins-cbps',
    name: 'CBPS — Shastri Park Extn.',
    address: 'Plot 4B, Shastri Park Extension',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110053',
    contactPhone: '+91 11 2289 1235',
    contactEmail: 'admin.cbps@crayonboxpreschool.com',
    campusAdminName: 'Ms. Reena Joshi',
    isMainCampus: true,
    status: 'ACTIVE',
  },
  {
    id: 'cmp-as-vnb',
    code: 'AS-VNB',
    institutionId: 'ins-as',
    name: 'AS — Virender Nagar Burari',
    address: 'Khasra 42/1, Virender Nagar, Burari',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110084',
    contactPhone: '+91 11 2761 4321',
    contactEmail: 'admin.as@avinyaschool.edu.in',
    campusAdminName: 'Mr. Pradeep Sharma',
    isMainCampus: true,
    status: 'ACTIVE',
  },
  {
    id: 'cmp-avm-vnb',
    code: 'AVM-VNB',
    institutionId: 'ins-avm',
    name: 'AVM — Virender Nagar Burari',
    address: 'Khasra 42/2, Virender Nagar, Burari',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110084',
    contactPhone: '+91 11 2761 4322',
    contactEmail: 'admin.avm@avinyavidyamandir.edu.in',
    campusAdminName: 'Mr. Manoj Bajpayee',
    isMainCampus: true,
    status: 'ACTIVE',
  },
];
