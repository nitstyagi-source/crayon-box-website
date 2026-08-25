"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type RoleType = 
  | "Super Admin" 
  | "Management" 
  | "Principal" 
  | "Vice Principal" 
  | "Faculty" 
  | "HR" 
  | "Accounts" 
  | "Librarian" 
  | "Transport Manager" 
  | "Nurse" 
  | "Security" 
  | "Front Office" 
  | "Driver"
  | "Parent" 
  | "Student";

export interface StudentProfile {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  rollNo?: string;
  avatar: string;
  busRoute?: string;
  busStop?: string;
  classroomCamera?: string;
  attendancePercent?: number;
  pendingFee?: number;
}

export interface UserAccountProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  primaryRole: RoleType;
  linkedRoles: RoleType[];
  avatar: string;
  employeeCode?: string;
  department?: string;
  children?: StudentProfile[];
}

interface MobileAuthContextType {
  user: UserAccountProfile | null;
  activeRole: RoleType;
  activeChild: StudentProfile | null;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  switchProfile: (role: RoleType) => void;
  switchChild: (childId: string) => void;
  loginAsDemo: (persona: "faculty_parent" | "principal" | "admin" | "student" | "parent_only") => void;
  logout: () => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

// Preset Demo Personas mirroring modern K-12 ERP multi-role environments
const DEMO_PERSONAS: Record<string, UserAccountProfile> = {
  faculty_parent: {
    id: "USR-NEHA-001",
    fullName: "Neha Sharma",
    email: "neha.sharma@crayonboxschool.com",
    phoneNumber: "+91 98765 43210",
    primaryRole: "Faculty",
    linkedRoles: ["Faculty", "Parent"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    employeeCode: "EMP-2026-042",
    department: "Mathematics & Science",
    children: [
      {
        id: "STU-AARAV-01",
        admissionNo: "CB26-05421",
        firstName: "Aarav",
        lastName: "Sharma",
        grade: "Grade 5",
        section: "A",
        rollNo: "14",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        busRoute: "Route 4 - Sector 62",
        busStop: "Shipra Sun City Gate 2",
        classroomCamera: "Grade 5",
        attendancePercent: 94.2,
        pendingFee: 12500
      },
      {
        id: "STU-ANAYA-02",
        admissionNo: "CB26-08194",
        firstName: "Anaya",
        lastName: "Sharma",
        grade: "Grade 2",
        section: "B",
        rollNo: "07",
        avatar: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150&auto=format&fit=crop&q=80",
        busRoute: "Route 4 - Sector 62",
        busStop: "Shipra Sun City Gate 2",
        classroomCamera: "Grade 2",
        attendancePercent: 98.0,
        pendingFee: 0
      }
    ]
  },
  principal: {
    id: "USR-SUNITA-002",
    fullName: "Dr. Sunita Rao",
    email: "principal@crayonboxschool.com",
    phoneNumber: "+91 99887 76655",
    primaryRole: "Principal",
    linkedRoles: ["Principal", "Management"],
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80",
    employeeCode: "EMP-EXEC-001",
    department: "Executive Leadership"
  },
  admin: {
    id: "USR-RAJESH-003",
    fullName: "Dr. Rajesh Malhotra",
    email: "director@crayonboxschool.com",
    phoneNumber: "+91 98111 22334",
    primaryRole: "Super Admin",
    linkedRoles: ["Super Admin", "Management", "Principal"],
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    employeeCode: "DIR-001",
    department: "Board of Management"
  },
  student: {
    id: "USR-AARAV-STU",
    fullName: "Aarav Sharma",
    email: "aarav.cb26@crayonboxschool.com",
    phoneNumber: "+91 98765 43210",
    primaryRole: "Student",
    linkedRoles: ["Student"],
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    children: [
      {
        id: "STU-AARAV-01",
        admissionNo: "CB26-05421",
        firstName: "Aarav",
        lastName: "Sharma",
        grade: "Grade 5",
        section: "A",
        rollNo: "14",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        busRoute: "Route 4 - Sector 62",
        busStop: "Shipra Sun City Gate 2",
        classroomCamera: "Grade 5",
        attendancePercent: 94.2,
        pendingFee: 12500
      }
    ]
  },
  parent_only: {
    id: "USR-VIKRAM-004",
    fullName: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    phoneNumber: "+91 98100 99887",
    primaryRole: "Parent",
    linkedRoles: ["Parent"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    children: [
      {
        id: "STU-ROHIT-03",
        admissionNo: "CB26-03912",
        firstName: "Rohit",
        lastName: "Malhotra",
        grade: "Grade 8",
        section: "A",
        rollNo: "21",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        busRoute: "Route 2 - Indirapuram",
        busStop: "Habitat Centre Gate 1",
        classroomCamera: "Grade 8",
        attendancePercent: 96.5,
        pendingFee: 18500
      }
    ]
  }
};

export function MobileAuthProvider({ children }: { children: ReactNode }) {
  // Default to multi-role persona Neha Sharma (Faculty + Parent of 2)
  const [user, setUser] = useState<UserAccountProfile | null>(DEMO_PERSONAS.faculty_parent);
  const [activeRole, setActiveRole] = useState<RoleType>("Faculty");
  const [activeChildId, setActiveChildId] = useState<string>("STU-AARAV-01");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Load persisted session from localStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("crayonbox_mobile_user");
      const savedRole = localStorage.getItem("crayonbox_mobile_active_role");
      const savedChild = localStorage.getItem("crayonbox_mobile_active_child");

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (savedRole) setActiveRole(savedRole as RoleType);
        if (savedChild) setActiveChildId(savedChild);
      }
    } catch (e) {
      console.warn("Could not parse saved mobile session", e);
    }
  }, []);

  const switchProfile = (role: RoleType) => {
    setActiveRole(role);
    localStorage.setItem("crayonbox_mobile_active_role", role);
    setIsProfileModalOpen(false);
  };

  const switchChild = (childId: string) => {
    setActiveChildId(childId);
    localStorage.setItem("crayonbox_mobile_active_child", childId);
  };

  const loginAsDemo = (personaKey: "faculty_parent" | "principal" | "admin" | "student" | "parent_only") => {
    const selected = DEMO_PERSONAS[personaKey];
    if (selected) {
      setUser(selected);
      setActiveRole(selected.primaryRole);
      if (selected.children && selected.children.length > 0) {
        setActiveChildId(selected.children[0].id);
      }
      localStorage.setItem("crayonbox_mobile_user", JSON.stringify(selected));
      localStorage.setItem("crayonbox_mobile_active_role", selected.primaryRole);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crayonbox_mobile_user");
    localStorage.removeItem("crayonbox_mobile_active_role");
    localStorage.removeItem("crayonbox_mobile_active_child");
  };

  const activeChild = user?.children?.find(c => c.id === activeChildId) || user?.children?.[0] || null;

  return (
    <MobileAuthContext.Provider
      value={{
        user,
        activeRole,
        activeChild,
        isProfileModalOpen,
        setIsProfileModalOpen,
        switchProfile,
        switchChild,
        loginAsDemo,
        logout,
        isLocked,
        setIsLocked
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) {
    throw new Error("useMobileAuth must be used within a MobileAuthProvider");
  }
  return context;
}
