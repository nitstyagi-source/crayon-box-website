"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Sibling = {
  id: string;
  firstName: string;
  grade: string;
  avatar: string;
};

type SiblingContextType = {
  siblings: Sibling[];
  activeSibling: Sibling | null;
  setActiveSiblingId: (id: string) => void;
};

const SiblingContext = createContext<SiblingContextType | undefined>(undefined);

// Dummy data for the prototype
const MOCK_SIBLINGS: Sibling[] = [
  { id: "S-1001", firstName: "Aarav", grade: "Grade 4", avatar: "https://ui-avatars.com/api/?name=Aarav&background=0D8ABC&color=fff" },
  { id: "S-1002", firstName: "Diya", grade: "Grade 8", avatar: "https://ui-avatars.com/api/?name=Diya&background=f97316&color=fff" }
];

export function SiblingProvider({ children }: { children: ReactNode }) {
  const [siblings] = useState<Sibling[]>(MOCK_SIBLINGS);
  const [activeSiblingId, setActiveSiblingId] = useState<string>(MOCK_SIBLINGS[0].id);

  const activeSibling = siblings.find(s => s.id === activeSiblingId) || null;

  return (
    <SiblingContext.Provider value={{ siblings, activeSibling, setActiveSiblingId }}>
      {children}
    </SiblingContext.Provider>
  );
}

export function useSiblingContext() {
  const context = useContext(SiblingContext);
  if (context === undefined) {
    throw new Error("useSiblingContext must be used within a SiblingProvider");
  }
  return context;
}
