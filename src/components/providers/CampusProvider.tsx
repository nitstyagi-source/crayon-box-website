"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCampuses } from "@/app/actions/campus";
import { useInstitution } from "./InstitutionContext";

export type Campus = {
  id: string;
  name: string;
  code?: string;
};

type CampusContextType = {
  campuses: Campus[];
  activeCampusId: string;
  setActiveCampusId: (id: string) => void;
  activeCampus: Campus | null;
  isLoading: boolean;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const { currentInstitution } = useInstitution();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [activeCampusId, setActiveCampusId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCampuses() {
      const res = await getCampuses();
      if (res.success && res.data.length > 0) {
        setCampuses(res.data);
        // If currentInstitution matches one of the campuses, use it; otherwise use the first
        const matched = res.data.find(
          (c: any) => c.code === currentInstitution || c.id === currentInstitution
        );
        setActiveCampusId(matched ? matched.id : res.data[0].id);
      }
      setIsLoading(false);
    }
    loadCampuses();
  }, [currentInstitution]);

  useEffect(() => {
    if (campuses.length > 0 && currentInstitution && currentInstitution !== 'ALL') {
      const matched = campuses.find(
        (c: any) => c.code === currentInstitution || c.id === currentInstitution
      );
      if (matched && matched.id !== activeCampusId) {
        setActiveCampusId(matched.id);
      }
    }
  }, [currentInstitution, campuses]);

  const activeCampus = campuses.find(c => c.id === activeCampusId) || campuses[0] || null;

  return (
    <CampusContext.Provider value={{ campuses, activeCampusId, setActiveCampusId, activeCampus, isLoading }}>
      {children}
    </CampusContext.Provider>
  );
}

const defaultFallback: CampusContextType = {
  campuses: [],
  activeCampusId: '',
  setActiveCampusId: () => {},
  activeCampus: null,
  isLoading: false
};

export function useCampusContext() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    return defaultFallback;
  }
  return context;
}
