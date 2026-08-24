"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VANI_TRUST_INSTITUTIONS, InstitutionMaster } from '@/lib/core/institution/trust-hierarchy';
import { getInstitutionsListAction } from '@/app/actions/governance-analytics-actions';

interface InstitutionContextType {
  currentInstitution: string; // 'CBS' | 'AVM' | 'AS' | 'CBPS' | 'ALL'
  setInstitution: (code: string) => void;
  selectedInstitutionObj: InstitutionMaster | any | null;
  institutionsList: any[];
  refreshInstitutions: () => Promise<void>;
  currentSession: string;
  setSession: (session: string) => void;
  currentRole: string;
  setRole: (role: string) => void;
  isAllInstitutions: boolean;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [currentInstitution, setCurrentInstitutionState] = useState<string>('CBS');
  const [currentSession, setCurrentSession] = useState<string>('2026–2027 (Active)');
  const [currentRole, setCurrentRole] = useState<string>('SUPER_ADMIN');
  const [dbInstitutions, setDbInstitutions] = useState<any[]>([]);

  const fetchInstitutionsFromDb = useCallback(async () => {
    try {
      const res = await getInstitutionsListAction();
      if (res.success && res.institutions && res.institutions.length > 0) {
        setDbInstitutions(res.institutions);
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

  // Merge static metadata with dynamic PostgreSQL data
  const institutionsList = (dbInstitutions.length > 0 ? dbInstitutions : VANI_TRUST_INSTITUTIONS).map((inst) => {
    const staticMatch = VANI_TRUST_INSTITUTIONS.find(s => s.code === inst.code);
    return {
      ...staticMatch,
      ...inst,
      name: inst.name || staticMatch?.name || 'School Name',
      shortName: inst.shortName || inst.short_name || staticMatch?.shortName || inst.name || 'School',
      principalName: inst.principalName || inst.principal_name || staticMatch?.principalName || 'Principal',
      address: inst.address || staticMatch?.address || 'Main Campus',
      logoUrl: inst.logoUrl || inst.logo_url || staticMatch?.logoUrl || '/logo.png',
      boardAffiliation: inst.boardAffiliation || inst.board_affiliation || staticMatch?.boardAffiliation || 'CBSE',
      affiliationNumber: inst.affiliationNumber || inst.affiliation_number || staticMatch?.affiliationNumber || ''
    };
  });

  const selectedInstitutionObj =
    currentInstitution === 'ALL'
      ? null
      : institutionsList.find((i) => i.code === currentInstitution) || institutionsList[0] || VANI_TRUST_INSTITUTIONS[0];

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
        isAllInstitutions: currentInstitution === 'ALL',
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
      currentInstitution: 'CBS',
      setInstitution: () => {},
      selectedInstitutionObj: VANI_TRUST_INSTITUTIONS[0],
      institutionsList: VANI_TRUST_INSTITUTIONS,
      refreshInstitutions: async () => {},
      currentSession: '2026–2027 (Active)',
      setSession: () => {},
      currentRole: 'SUPER_ADMIN',
      setRole: () => {},
      isAllInstitutions: false,
    };
  }
  return context;
}
