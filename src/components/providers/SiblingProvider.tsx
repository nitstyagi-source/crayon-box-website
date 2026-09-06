"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSiblingsForContextAction } from "@/app/actions/students";

export type Sibling = {
  id: string;
  firstName: string;
  grade: string;
  avatar: string;
};

type SiblingContextType = {
  siblings: Sibling[];
  activeSibling: Sibling | null;
  setActiveSiblingId: (id: string) => void;
  loading: boolean;
  refreshSiblings: () => Promise<void>;
};

const SiblingContext = createContext<SiblingContextType | undefined>(undefined);

export function SiblingProvider({ 
  children,
  initialSiblings = [],
  studentId
}: { 
  children: ReactNode;
  initialSiblings?: Sibling[];
  studentId?: string;
}) {
  const [siblings, setSiblings] = useState<Sibling[]>(initialSiblings);
  const [activeSiblingId, setActiveSiblingId] = useState<string>(initialSiblings[0]?.id || "");
  const [loading, setLoading] = useState<boolean>(initialSiblings.length === 0);

  const fetchSiblings = async () => {
    try {
      setLoading(true);
      const res = await getSiblingsForContextAction(studentId);
      if (res.success && res.data.length > 0) {
        setSiblings(res.data);
        setActiveSiblingId((prev) => prev && res.data.some(s => s.id === prev) ? prev : res.data[0].id);
      } else if (res.success && res.data.length === 0 && initialSiblings.length === 0) {
        setSiblings([]);
        setActiveSiblingId("");
      }
    } catch (e) {
      console.error("Failed to load siblings dynamically:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSiblings.length === 0) {
      fetchSiblings();
    }
  }, [studentId]);

  const activeSibling = siblings.find(s => s.id === activeSiblingId) || (siblings.length > 0 ? siblings[0] : null);

  return (
    <SiblingContext.Provider value={{ 
      siblings, 
      activeSibling, 
      setActiveSiblingId,
      loading,
      refreshSiblings: fetchSiblings
    }}>
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
