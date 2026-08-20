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

export function useCampusContext() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error("useCampusContext must be used within a CampusProvider");
  }
  return context;
}
