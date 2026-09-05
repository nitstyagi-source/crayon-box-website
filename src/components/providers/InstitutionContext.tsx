"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getInstitutionsListAction } from '@/app/actions/governance-analytics-actions';

export interface DynamicInstitution {
  id?: string;
  code: string;
  name: string;
  shortName?: string;
  short_name?: string;
  institution_name?: string;
  institutionType?: string;
  institution_type?: string;
  boardAffiliation?: string;
  board_affiliation?: string;
  affiliationNumber?: string;
  affiliation_number?: string;
  status?: string;
  principalName?: string;
  principal_name?: string;
  principalEmail?: string;
  principal_email?: string;
  logoUrl?: string;
  logo_url?: string;
  brandColor?: string;
  brand_color?: string;
  address?: string;
  phone?: string;
  website?: string;
  students?: number;
  faculty?: number;
}

interface InstitutionContextType {
  currentInstitution: string; // 'ALL' | string
  setInstitution: (code: string) => void;
  selectedInstitutionObj: DynamicInstitution | any | null;
  institutionsList: DynamicInstitution[];
  refreshInstitutions: () => Promise<void>;
  currentSession: string;
  setSession: (session: string) => void;
  currentRole: string;
  setRole: (role: string) => void;
  isAllInstitutions: boolean;
}

const DEFAULT_FALLBACK_INST: DynamicInstitution = {
  code: 'ALL',
  name: 'Trust Headquarters',
  shortName: 'Trust HQ',
  principalName: 'Administrator',
  address: '',
  logoUrl: '/logo.png',
  boardAffiliation: 'Recognized Board',
  affiliationNumber: '',
  brandColor: '#2563eb'
};

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [currentInstitution, setCurrentInstitutionState] = useState<string>('ALL');
  const [currentSession, setCurrentSession] = useState<string>('2026–2027 (Active)');
  const [currentRole, setCurrentRole] = useState<string>('SUPER_ADMIN');
  const [dbInstitutions, setDbInstitutions] = useState<DynamicInstitution[]>([]);

  const fetchInstitutionsFromDb = useCallback(async () => {
    try {
      const res = await getInstitutionsListAction();
      if (res.success && Array.isArray(res.institutions)) {
        setDbInstitutions(res.institutions);
        
        const savedInst = typeof window !== 'undefined' ? localStorage.getItem('vet_current_institution') : null;
        if (res.institutions.length > 0) {
          if (savedInst && (savedInst === 'ALL' || res.institutions.some((i: any) => i.code === savedInst))) {
            setCurrentInstitutionState(savedInst);
          } else {
            setCurrentInstitutionState(res.institutions[0].code);
          }
        } else {
          setCurrentInstitutionState('ALL');
        }
      }
    } catch (e) {
      console.error('Error fetching dynamic institutions in context:', e);
    }
  }, []);

  useEffect(() => {
    const savedInst = localStorage.getItem('vet_current_institution');
    if (savedInst) setCurrentInstitutionState(savedInst);

    const savedSession = localStorage.getItem('vet_current_session');
    if (savedSession) setCurrentSession(savedSession);

    const savedRole = localStorage.getItem('vet_current_role');
    if (savedRole) setCurrentRole(savedRole);

    fetchInstitutionsFromDb();
  }, [fetchInstitutionsFromDb]);

  const setInstitution = (code: string) => {
    setCurrentInstitutionState(code);
    localStorage.setItem('vet_current_institution', code);
    document.cookie = `vet_institution=${code}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const setSession = (sess: string) => {
    setCurrentSession(sess);
    localStorage.setItem('vet_current_session', sess);
  };

  const setRole = (r: string) => {
    setCurrentRole(r);
    localStorage.setItem('vet_current_role', r);
  };

  // Pure dynamic mapping from database institutions (empty array if 0 institutions in DB)
  const institutionsList: DynamicInstitution[] = dbInstitutions.map((inst) => {
    return {
      ...inst,
      code: inst.code,
      name: inst.name || inst.institution_name || `School (${inst.code})`,
      shortName: inst.shortName || inst.short_name || inst.code,
      principalName: inst.principalName || inst.principal_name || 'Principal',
      address: inst.address || '',
      logoUrl: inst.logoUrl || inst.logo_url || '/logo.png',
      boardAffiliation: inst.boardAffiliation || inst.board_affiliation || 'Recognized Board',
      affiliationNumber: inst.affiliationNumber || inst.affiliation_number || '',
      brandColor: inst.brandColor || inst.brand_color || '#2563eb'
    };
  });

  const selectedInstitutionObj =
    currentInstitution === 'ALL' || institutionsList.length === 0
      ? (institutionsList.length === 0 ? DEFAULT_FALLBACK_INST : null)
      : institutionsList.find((i) => i.code === currentInstitution) || institutionsList[0] || DEFAULT_FALLBACK_INST;

  return (
    <InstitutionContext.Provider
      value={{
        currentInstitution,
        setInstitution,
        selectedInstitutionObj,
        institutionsList,
        refreshInstitutions: fetchInstitutionsFromDb,
        currentSession,
        setSession,
        currentRole,
        setRole,
        isAllInstitutions: currentInstitution === 'ALL' || institutionsList.length === 0,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) {
    return {
      currentInstitution: 'ALL',
      setInstitution: () => {},
      selectedInstitutionObj: DEFAULT_FALLBACK_INST,
      institutionsList: [] as DynamicInstitution[],
      refreshInstitutions: async () => {},
      currentSession: '2026–2027 (Active)',
      setSession: () => {},
      currentRole: 'SUPER_ADMIN',
      setRole: () => {},
      isAllInstitutions: true,
    };
  }
  return context;
}
