"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Campus = {
  id: string;
  name: string;
};

type CampusContextType = {
  campuses: Campus[];
  activeCampusId: string;
  setActiveCampusId: (id: string) => void;
  activeCampus: Campus | null;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const MOCK_CAMPUSES: Campus[] = [
  { id: "ALL", name: "All Branches" },
  { id: "DEL-MAIN", name: "Delhi Main Branch" },
  { id: "SOUTH-CAMP", name: "South Campus" }
];

export function CampusProvider({ children }: { children: ReactNode }) {
  const [campuses] = useState<Campus[]>(MOCK_CAMPUSES);
  const [activeCampusId, setActiveCampusId] = useState<string>("ALL");

  const activeCampus = campuses.find(c => c.id === activeCampusId) || null;

  return (
    <CampusContext.Provider value={{ campuses, activeCampusId, setActiveCampusId, activeCampus }}>
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
