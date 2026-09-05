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
