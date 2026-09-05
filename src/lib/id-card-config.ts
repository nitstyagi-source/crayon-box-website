"use client";

export interface IdCardCustomConfig {
  // Theme & Colors
  primaryColor: string;      // Header/Footer background, default: '#0B1B3D'
  accentColor: string;       // Arches, borders, dividers, default: '#C5A059'
  goldTextColor: string;     // Sanskrit motto / subtitle text, default: '#E5C378'
  cardBgColor: string;       // Body card background, default: '#FFFFFF'

  // Header Elements
  showTricolor: boolean;     // Show/Hide top tricolor band with Ashoka Chakra
  showLaurelSeal: boolean;   // Show/Hide gold laurel wreath emblem
  customLogoUrl?: string;    // Custom logo image override
  schoolName?: string;       // School name override (defaults to active institution)
  city?: string;             // City/Location override
  tagline?: string;          // Optional affiliation or tagline (default: empty, NO CBSE)
  showPillars: boolean;      // Show/Hide right-side vertical pillars
  frontPillars: [string, string, string]; // Default: ['LEARN', 'CREATE', 'BELONG']

  // Front Fields & Vitals
  showClass: boolean;        // Default: true
  classLabel: string;        // Default: 'Class'
  showAdmissionNo: boolean;  // Default: true
  admissionNoLabel: string;  // Default: 'Adm. No.'
  showDob: boolean;          // Default: true
  dobLabel: string;          // Default: 'DOB'
  showBloodGroup: boolean;   // Default: false
  bloodGroupLabel: string;   // Default: 'Blood Group'
  showRollNo: boolean;       // Default: false
  rollNoLabel: string;       // Default: 'Roll No.'

  // Barcode / QR Identification
  barcodeType: 'barcode' | 'qr' | 'both' | 'none'; // Default: 'barcode'
  barcodeLabel: string;      // Default: 'STUDENT BARCODE'

  // Footer & Motto
  showMotto: boolean;        // Default: true
  sanskritMotto: string;     // Default: 'विद्या ददाति विनयम्'
  englishSubtitle: string;   // Default: 'KNOWLEDGE LEADS TO HUMILITY'

  // Back Face Customization
  backHeaderTitle: string;   // Default: 'STUDENT INFORMATION'
  showFatherName: boolean;   // Default: true
  showMotherName: boolean;   // Default: true
  showAddress: boolean;      // Default: true
  showBusRoute: boolean;     // Default: true
  showValidUpto: boolean;    // Default: true
  validUptoText?: string;    // Default: '31 Mar 2027'

  // Back Guidelines
  guidelinesTitle: string;   // Default: 'CARD GUIDELINES'
  guideline1: string;        // Default: 'Card must be worn on campus and school bus.'
  guideline2: string;        // Default: 'If found, please return to School Office or call the school.'
  guideline3: string;        // Default: 'This card is non-transferable.'
  guideline4: string;        // Default: 'Report a lost card to the school immediately.'

  // Back Footer
  backPillars: [string, string, string]; // Default: ['PEOPLE', 'PURPOSE', 'PROGRESS']
  customWebsite?: string;    // Custom website override
  customPhone?: string;      // Custom phone override
}

/**
 * Clean reference default configuration matching the user's reference image
 * Notice: 'tagline' is empty (""), removing "Affiliated to CBSE" completely!
 */
export const DEFAULT_ID_CARD_CONFIG: IdCardCustomConfig = {
  primaryColor: '#0B1B3D',
  accentColor: '#C5A059',
  goldTextColor: '#E5C378',
  cardBgColor: '#FFFFFF',

  showTricolor: true,
  showLaurelSeal: true,
  schoolName: '',
  city: '',
  tagline: '', // EMPTY by default - No "Affiliated to CBSE"
  showPillars: true,
  frontPillars: ['LEARN', 'CREATE', 'BELONG'],

  showClass: true,
  classLabel: 'Class',
  showAdmissionNo: true,
  admissionNoLabel: 'Adm. No.',
  showDob: true,
  dobLabel: 'DOB',
  showBloodGroup: false,
  bloodGroupLabel: 'Blood Group',
  showRollNo: false,
  rollNoLabel: 'Roll No.',

  barcodeType: 'barcode',
  barcodeLabel: 'STUDENT BARCODE',

  showMotto: true,
  sanskritMotto: 'विद्या ददाति विनयम्',
  englishSubtitle: 'KNOWLEDGE LEADS TO HUMILITY',

  backHeaderTitle: 'STUDENT INFORMATION',
  showFatherName: true,
  showMotherName: true,
  showAddress: true,
  showBusRoute: true,
  showValidUpto: true,
  validUptoText: '31 Mar 2027',

  guidelinesTitle: 'CARD GUIDELINES',
  guideline1: 'Card must be worn on campus and school bus.',
  guideline2: 'If found, please return to School Office or call the school.',
  guideline3: 'This card is non-transferable.',
  guideline4: 'Report a lost card to the school immediately.',

  backPillars: ['PEOPLE', 'PURPOSE', 'PROGRESS'],
};

export interface IdCardThemePreset {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  primaryColor: string;
  accentColor: string;
  goldTextColor: string;
  cardBgColor: string;
}

export const ID_CARD_THEME_PRESETS: IdCardThemePreset[] = [
  {
    id: 'navy-gold',
    name: 'Rashtriya Navy & Gold',
    subtitle: 'Classic reference palette with royal navy & rich gold',
    icon: '🇮🇳',
    primaryColor: '#0B1B3D',
    accentColor: '#C5A059',
    goldTextColor: '#E5C378',
    cardBgColor: '#FFFFFF',
  },
  {
    id: 'crimson-gold',
    name: 'Imperial Crimson & Gold',
    subtitle: 'Prestigious heritage maroon with warm gold trims',
    icon: '🏛️',
    primaryColor: '#5C1D24',
    accentColor: '#D4AF37',
    goldTextColor: '#F3E5AB',
    cardBgColor: '#FFFFFF',
  },
  {
    id: 'emerald-gold',
    name: 'Gurukul Forest Green',
    subtitle: 'Natural Vedic elegance with deep emerald & satin gold',
    icon: '🌿',
    primaryColor: '#0F3826',
    accentColor: '#C5A059',
    goldTextColor: '#E5C378',
    cardBgColor: '#FFFFFF',
  },
  {
    id: 'sapphire-silver',
    name: 'Cyber Sapphire & Silver',
    subtitle: 'Modern digital aesthetic with deep cobalt & chrome silver',
    icon: '⚡',
    primaryColor: '#102A54',
    accentColor: '#94A3B8',
    goldTextColor: '#CBD5E1',
    cardBgColor: '#FFFFFF',
  },
  {
    id: 'slate-noir',
    name: 'Executive Onyx & Champagne',
    subtitle: 'Ultra-modern minimalist dark slate with champagne accents',
    icon: '🖤',
    primaryColor: '#1E293B',
    accentColor: '#D97706',
    goldTextColor: '#FDE68A',
    cardBgColor: '#FFFFFF',
  },
  {
    id: 'sunset-amber',
    name: 'Saffron Heritage & Teak',
    subtitle: 'Traditional Indian saffron glow with antique bronze',
    icon: '🌅',
    primaryColor: '#3B1F0B',
    accentColor: '#E08E2B',
    goldTextColor: '#FCD34D',
    cardBgColor: '#FFFFFF',
  },
];

const STORAGE_PREFIX = 'vet_idcard_config_';
const TEACHER_STORAGE_PREFIX = 'vet_teacher_idcard_config_';

/**
 * Retrieve saved customization for a specific institution code (e.g. 'CBS', 'CBPS', 'ALL')
 */
export function getIdCardConfig(institutionCode: string = 'DEFAULT'): IdCardCustomConfig {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_ID_CARD_CONFIG };
  }

  try {
    const key = `${STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ID_CARD_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn(`Error reading ID card config for ${institutionCode}:`, err);
  }

  return { ...DEFAULT_ID_CARD_CONFIG };
}

/**
 * Persist customization for a specific institution code
 */
export function saveIdCardConfig(institutionCode: string = 'DEFAULT', config: Partial<IdCardCustomConfig>): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `${STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    const existing = getIdCardConfig(institutionCode);
    const updated = { ...existing, ...config };
    localStorage.setItem(key, JSON.stringify(updated));
    // Dispatch an event so all listening cards on the page update immediately
    window.dispatchEvent(new CustomEvent('idcard_config_updated', { detail: { institutionCode, config: updated } }));
    return true;
  } catch (err) {
    console.error(`Error saving ID card config for ${institutionCode}:`, err);
    return false;
  }
}

/**
 * Reset customization for a specific institution code back to reference defaults
 */
export function resetIdCardConfig(institutionCode: string = 'DEFAULT'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `${STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('idcard_config_updated', { detail: { institutionCode, config: DEFAULT_ID_CARD_CONFIG } }));
    return true;
  } catch (err) {
    console.error(`Error resetting ID card config for ${institutionCode}:`, err);
    return false;
  }
}

// =========================================================================
// TEACHER / FACULTY ID CARD CONFIGURATION (Matching media_1788638761923.jpg)
// =========================================================================

export interface TeacherIdCardCustomConfig {
  // Theme & Colors
  primaryColor: string;      // Header/Footer background, default: '#0B1B3D'
  accentColor: string;       // Arches, borders, dividers, default: '#C5A059'
  goldTextColor: string;     // Sanskrit motto / subtitle text, default: '#E5C378'
  cardBgColor: string;       // Body card background, default: '#FFFFFF'

  // Header Elements
  showTricolor: boolean;     // Show/Hide top tricolor band with Ashoka Chakra
  showLaurelSeal: boolean;   // Show/Hide gold laurel wreath emblem
  customLogoUrl?: string;    // Custom logo image override
  schoolName?: string;       // School name override
  city?: string;             // City/Location override
  tagline?: string;          // Optional affiliation or tagline (default: empty, NO CBSE)
  showPillars: boolean;      // Show/Hide right-side vertical pillars
  frontPillars: [string, string, string]; // Default: ['LEARN', 'CREATE', 'BELONG']

  // Front Faculty Identity & Vitals
  categoryTag: string;       // Default: 'FACULTY'
  showCategoryTag: boolean;  // Default: true
  showDesignation: boolean;  // Default: true
  designationLabel: string;  // Default: 'Designation'
  showDepartment: boolean;   // Default: true
  departmentLabel: string;   // Default: 'Department'
  showEmployeeId: boolean;   // Default: true
  employeeIdLabel: string;   // Default: 'Employee ID'
  showDoj: boolean;          // Default: true
  dojLabel: string;          // Default: 'Date of Joining'

  // Footer & Motto
  showMotto: boolean;        // Default: true
  sanskritMotto: string;     // Default: 'विद्या ददाति विनयम्'
  englishSubtitle: string;   // Default: 'KNOWLEDGE LEADS TO HUMILITY'

  // Front Footer Core Values (Reference image 4 values separated by bars: SAFE | KIND | CURIOUS | CONFIDENT)
  showCoreValues: boolean;   // Default: true
  coreValues: [string, string, string, string]; // Default: ['SAFE', 'KIND', 'CURIOUS', 'CONFIDENT']

  // Back Face Customization
  backHeaderTitle: string;   // Default: 'IMPORTANT INFORMATION'
  showBackName: boolean;     // Default: true
  nameLabel: string;         // Default: 'Name'
  showBackDesignation: boolean; // Default: true
  showBackDepartment: boolean;  // Default: true
  showContactNo: boolean;    // Default: true
  contactNoLabel: string;    // Default: 'Contact No.'
  showEmail: boolean;        // Default: true
  emailLabel: string;        // Default: 'Email'
  showAddress: boolean;      // Default: true
  addressLabel: string;      // Default: 'Address'

  // Back Guidelines
  guidelinesTitle: string;   // Default: 'CARD GUIDELINES'
  guideline1: string;        // Default: 'This card is the property of the school.'
  guideline2: string;        // Default: 'Wear this card at all times on campus.'
  guideline3: string;        // Default: 'This card is non-transferable.'
  guideline4: string;        // Default: 'If found, please return to the School Office.'

  // Back Footer
  backPillars: [string, string, string]; // Default: ['PEOPLE', 'PURPOSE', 'PROGRESS']
  customWebsite?: string;    // Custom website override
  customPhone?: string;      // Custom phone override
}

export const DEFAULT_TEACHER_ID_CARD_CONFIG: TeacherIdCardCustomConfig = {
  primaryColor: '#0B1B3D',
  accentColor: '#C5A059',
  goldTextColor: '#E5C378',
  cardBgColor: '#FFFFFF',

  showTricolor: true,
  showLaurelSeal: true,
  schoolName: '',
  city: '',
  tagline: '', // EMPTY by default - No "Affiliated to CBSE"
  showPillars: true,
  frontPillars: ['LEARN', 'CREATE', 'BELONG'],

  categoryTag: 'FACULTY',
  showCategoryTag: true,
  showDesignation: true,
  designationLabel: 'Designation',
  showDepartment: true,
  departmentLabel: 'Department',
  showEmployeeId: true,
  employeeIdLabel: 'Employee ID',
  showDoj: true,
  dojLabel: 'Date of Joining',

  showMotto: true,
  sanskritMotto: 'विद्या ददाति विनयम्',
  englishSubtitle: 'KNOWLEDGE LEADS TO HUMILITY',

  showCoreValues: true,
  coreValues: ['SAFE', 'KIND', 'CURIOUS', 'CONFIDENT'],

  backHeaderTitle: 'IMPORTANT INFORMATION',
  showBackName: true,
  nameLabel: 'Name',
  showBackDesignation: true,
  showBackDepartment: true,
  showContactNo: true,
  contactNoLabel: 'Contact No.',
  showEmail: true,
  emailLabel: 'Email',
  showAddress: true,
  addressLabel: 'Address',

  guidelinesTitle: 'CARD GUIDELINES',
  guideline1: 'This card is the property of the school.',
  guideline2: 'Wear this card at all times on campus.',
  guideline3: 'This card is non-transferable.',
  guideline4: 'If found, please return to the School Office.',

  backPillars: ['PEOPLE', 'PURPOSE', 'PROGRESS'],
};

/**
 * Retrieve saved teacher customization for a specific institution code
 */
export function getTeacherIdCardConfig(institutionCode: string = 'DEFAULT'): TeacherIdCardCustomConfig {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_TEACHER_ID_CARD_CONFIG };
  }

  try {
    const key = `${TEACHER_STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_TEACHER_ID_CARD_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn(`Error reading Teacher ID card config for ${institutionCode}:`, err);
  }

  return { ...DEFAULT_TEACHER_ID_CARD_CONFIG };
}

/**
 * Persist teacher customization for a specific institution code
 */
export function saveTeacherIdCardConfig(institutionCode: string = 'DEFAULT', config: Partial<TeacherIdCardCustomConfig>): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `${TEACHER_STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    const existing = getTeacherIdCardConfig(institutionCode);
    const updated = { ...existing, ...config };
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('teacher_idcard_config_updated', { detail: { institutionCode, config: updated } }));
    return true;
  } catch (err) {
    console.error(`Error saving Teacher ID card config for ${institutionCode}:`, err);
    return false;
  }
}

/**
 * Reset teacher customization for a specific institution code back to reference defaults
 */
export function resetTeacherIdCardConfig(institutionCode: string = 'DEFAULT'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `${TEACHER_STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('teacher_idcard_config_updated', { detail: { institutionCode, config: DEFAULT_TEACHER_ID_CARD_CONFIG } }));
    return true;
  } catch (err) {
    console.error(`Error resetting Teacher ID card config for ${institutionCode}:`, err);
    return false;
  }
}

// =========================================================================
// ESCORT / AUTHORISED PICKUP PASS CONFIGURATION (Matching media_1788638977129.png & media_1788638951627.jpg)
// =========================================================================

export interface EscortIdCardCustomConfig {
  // Theme & Colors
  primaryColor: string;      // Header/Footer navy background, default: '#0B1B3D'
  accentColor: string;       // Arches, borders, dividers, default: '#C5A059'
  goldTextColor: string;     // Sanskrit motto / subtitle text, default: '#E5C378'
  cardBgColor: string;       // Body card background, default: '#FFFFFF'

  // Header Elements
  showTricolor: boolean;     // Show/Hide top tricolor band with Ashoka Chakra
  showLaurelSeal: boolean;   // Show/Hide gold laurel wreath emblem
  customLogoUrl?: string;    // Custom logo image override
  schoolName?: string;       // School name override
  city?: string;             // City/Location override
  tagline?: string;          // Optional affiliation or tagline (default: empty, NO CBSE)
  showPillars: boolean;      // Show/Hide pillars
  frontPillars: [string, string, string]; // Default: ['LEARN', 'CREATE', 'BELONG']

  // Front Header Titles
  frontCardTitle: string;    // Default: 'CHILD ESCORT CARD'
  academicYearLabel: string; // Default: 'ACADEMIC YEAR'
  academicYear: string;      // Default: '2026 – 2027'
  showAcademicYear: boolean; // Default: true

  // Front Student Identity & Vitals
  showClass: boolean;        // Default: true
  classLabel: string;        // Default: 'Class'
  showAdmissionNo: boolean;  // Default: true
  admissionNoLabel: string;  // Default: 'Admission No.'
  showDob: boolean;          // Default: true
  dobLabel: string;          // Default: 'Date of Birth'

  // Front Disclaimer Box
  showDisclaimer: boolean;   // Default: true
  disclaimerText: string;    // Default: 'This card authorises the people listed on the back to pick up the above child from school.'

  // Front Bottom Footer
  showMotto: boolean;        // Default: true
  sanskritMotto: string;     // Default: 'विद्या ददाति विनयम्'
  englishSubtitle: string;   // Default: 'KNOWLEDGE LEADS TO HUMILITY'
  showCoreValues: boolean;   // Default: true
  coreValues: [string, string, string, string]; // Default: ['SAFE', 'KIND', 'CURIOUS', 'CONFIDENT']

  // Back Header & Instructions
  backCardTitle: string;     // Default: 'AUTHORISED PERSONS'
  backSubtitle: string;      // Default: 'ONLY THE FOLLOWING PERSONS ARE AUTHORISED TO PICK UP THE CHILD FROM SCHOOL'

  // Back Escort Roster Labels
  nameLabel: string;         // Default: 'Name'
  relationLabel: string;     // Default: 'Relation'
  phoneLabel: string;        // Default: 'Phone No.'
  idProofLabel: string;      // Default: 'ID Proof'
  idNoLabel: string;         // Default: 'ID No.'

  // Back Bottom Contact Strip
  showSchoolAddress: boolean;// Default: true
  schoolAddress: string;     // Default: 'School Address Line 1, School Address Line 2, City - PIN'
  showSchoolPhone: boolean;  // Default: true
  schoolPhone: string;       // Default: 'School Phone'
  showSchoolWebsite: boolean;// Default: true
  schoolWebsite: string;     // Default: 'www.schoolwebsite.edu.in'
}

export const DEFAULT_ESCORT_ID_CARD_CONFIG: EscortIdCardCustomConfig = {
  primaryColor: '#0B1B3D',
  accentColor: '#C5A059',
  goldTextColor: '#E5C378',
  cardBgColor: '#FFFFFF',

  showTricolor: true,
  showLaurelSeal: true,
  schoolName: '',
  city: '',
  tagline: '', // Clean by default (NO CBSE)
  showPillars: true,
  frontPillars: ['LEARN', 'CREATE', 'BELONG'],

  frontCardTitle: 'CHILD ESCORT CARD',
  academicYearLabel: 'ACADEMIC YEAR',
  academicYear: '2026 – 2027',
  showAcademicYear: true,

  showClass: true,
  classLabel: 'Class',
  showAdmissionNo: true,
  admissionNoLabel: 'Admission No.',
  showDob: true,
  dobLabel: 'Date of Birth',

  showDisclaimer: true,
  disclaimerText: 'This card authorises the people listed on the back to pick up the above child from school.',

  showMotto: true,
  sanskritMotto: 'विद्या ददाति विनयम्',
  englishSubtitle: 'KNOWLEDGE LEADS TO HUMILITY',
  showCoreValues: true,
  coreValues: ['SAFE', 'KIND', 'CURIOUS', 'CONFIDENT'],

  backCardTitle: 'AUTHORISED PERSONS',
  backSubtitle: 'ONLY THE FOLLOWING PERSONS ARE AUTHORISED TO PICK UP THE CHILD FROM SCHOOL',

  nameLabel: 'Name',
  relationLabel: 'Relation',
  phoneLabel: 'Phone No.',
  idProofLabel: 'ID Proof',
  idNoLabel: 'ID No.',

  showSchoolAddress: true,
  schoolAddress: 'School Address Line 1, School Address Line 2, City - PIN',
  showSchoolPhone: true,
  schoolPhone: 'School Phone',
  showSchoolWebsite: true,
  schoolWebsite: 'www.schoolwebsite.edu.in',
};

const ESCORT_STORAGE_PREFIX = 'vet_escort_idcard_config_';

/**
 * Retrieve saved Escort customization for a specific institution code
 */
export function getEscortIdCardConfig(institutionCode: string = 'DEFAULT'): EscortIdCardCustomConfig {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_ESCORT_ID_CARD_CONFIG };
  }

  try {
    const key = `${ESCORT_STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ESCORT_ID_CARD_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn(`Error reading Escort ID card config for ${institutionCode}:`, err);
  }

  return { ...DEFAULT_ESCORT_ID_CARD_CONFIG };
}

/**
 * Persist Escort customization for a specific institution code
 */
export function saveEscortIdCardConfig(institutionCode: string = 'DEFAULT', config: Partial<EscortIdCardCustomConfig>): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `${ESCORT_STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    const existing = getEscortIdCardConfig(institutionCode);
    const updated = { ...existing, ...config };
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('escort_idcard_config_updated', { detail: { institutionCode, config: updated } }));
    return true;
  } catch (err) {
    console.error(`Error saving Escort ID card config for ${institutionCode}:`, err);
    return false;
  }
}

/**
 * Reset Escort customization for a specific institution code back to reference defaults
 */
export function resetEscortIdCardConfig(institutionCode: string = 'DEFAULT'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `${ESCORT_STORAGE_PREFIX}${institutionCode || 'DEFAULT'}`;
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('escort_idcard_config_updated', { detail: { institutionCode, config: DEFAULT_ESCORT_ID_CARD_CONFIG } }));
    return true;
  } catch (err) {
    console.error(`Error resetting Escort ID card config for ${institutionCode}:`, err);
    return false;
  }
}


