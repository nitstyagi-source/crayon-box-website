"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCampuses } from "@/app/actions/campus";

export type Campus = {
  id: string;
  name: string;
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
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [activeCampusId, setActiveCampusId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCampuses() {
      const res = await getCampuses();
      if (res.success && res.data.length > 0) {
        setCampuses(res.data);
        setActiveCampusId(res.data[0].id); // Always use first real campus UUID
      }
      setIsLoading(false);
    }
    loadCampuses();
  }, []);

  const activeCampus = campuses.find(c => c.id === activeCampusId) || null;

  return (
    <CampusContext.Provider value={{ campuses, activeCampusId, setActiveCampusId, activeCampus, isLoading }}>
      {children}
    </CampusContext.Provider>
  );
}

const defaultFallback: CampusContextType = {
  campuses: [{ id: 'c3d782a9-a50b-4708-a3fc-6b146f456662', name: 'Crayon Box Main Campus' }],
  activeCampusId: 'c3d782a9-a50b-4708-a3fc-6b146f456662',
  setActiveCampusId: () => {},
  activeCampus: { id: 'c3d782a9-a50b-4708-a3fc-6b146f456662', name: 'Crayon Box Main Campus' },
  isLoading: false
};

export function useCampusContext() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    return defaultFallback;
  }
  return context;
}
