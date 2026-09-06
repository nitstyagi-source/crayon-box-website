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
const currentYear = new Date().getFullYear();
const currentYearShort = currentYear.toString().slice(-2);

const DEMO_PERSONAS: Record<string, UserAccountProfile> = {
  faculty_parent: {
    id: "USR-FAC-001",
    fullName: "Faculty Assessor & Parent",
    email: "faculty@crayonboxschool.com",
    phoneNumber: "+91 98765 00001",
    primaryRole: "Faculty",
    linkedRoles: ["Faculty", "Parent"],
    avatar: "/avatars/faculty.png",
    employeeCode: `EMP-${currentYear}-042`,
    department: "Academic Faculty",
    children: [
      {
        id: "STU-DEMO-01",
        admissionNo: `CB${currentYearShort}-05421`,
        firstName: "Enrolled",
        lastName: "Student A",
        grade: "Grade 5",
        section: "A",
        rollNo: "14",
        avatar: "/avatars/student1.png",
        busRoute: "Campus Transit Route 1",
        busStop: "Main Gate Bus Bay",
        classroomCamera: "Grade 5",
        attendancePercent: 95.0,
        pendingFee: 0
      },
      {
        id: "STU-DEMO-02",
        admissionNo: `CB${currentYearShort}-08194`,
        firstName: "Enrolled",
        lastName: "Student B",
        grade: "Grade 2",
        section: "B",
        rollNo: "07",
        avatar: "/avatars/student2.png",
        busRoute: "Campus Transit Route 1",
        busStop: "Main Gate Bus Bay",
        classroomCamera: "Grade 2",
        attendancePercent: 98.0,
        pendingFee: 0
      }
    ]
  },
  principal: {
    id: "USR-PRIN-002",
    fullName: "Principal Operations Desk",
    email: "principal@crayonboxschool.com",
    phoneNumber: "+91 99887 00002",
    primaryRole: "Principal",
    linkedRoles: ["Principal", "Management"],
    avatar: "/avatars/principal.png",
    employeeCode: "EMP-EXEC-001",
    department: "Executive Leadership"
  },
  admin: {
    id: "USR-ADM-003",
    fullName: "Executive Management / Super Admin",
    email: "director@crayonboxschool.com",
    phoneNumber: "+91 98111 00003",
    primaryRole: "Super Admin",
    linkedRoles: ["Super Admin", "Management", "Principal"],
    avatar: "/avatars/admin.png",
    employeeCode: "DIR-001",
    department: "Board of Management"
  },
  student: {
    id: "USR-STU-004",
    fullName: "Student Learner Profile",
    email: "student@crayonboxschool.com",
    phoneNumber: "+91 98765 00004",
    primaryRole: "Student",
    linkedRoles: ["Student"],
    avatar: "/avatars/student1.png",
    children: [
      {
        id: "STU-DEMO-01",
        admissionNo: `CB${currentYearShort}-05421`,
        firstName: "Enrolled",
        lastName: "Student",
        grade: "Grade 5",
        section: "A",
        rollNo: "14",
        avatar: "/avatars/student1.png",
        busRoute: "Campus Transit Route 1",
        busStop: "Main Gate Bus Bay",
        classroomCamera: "Grade 5",
        attendancePercent: 95.0,
        pendingFee: 0
      }
    ]
  },
  parent_only: {
    id: "USR-PAR-005",
    fullName: "Parent / Guardian Profile",
    email: "parent@crayonboxschool.com",
    phoneNumber: "+91 98100 00005",
    primaryRole: "Parent",
    linkedRoles: ["Parent"],
    avatar: "/avatars/parent.png",
    children: [
      {
        id: "STU-DEMO-03",
        admissionNo: `CB${currentYearShort}-03912`,
        firstName: "Ward",
        lastName: "Student",
        grade: "Grade 8",
        section: "A",
        rollNo: "21",
        avatar: "/avatars/student2.png",
        busRoute: "Campus Transit Route 2",
        busStop: "Sector Central Bus Stop",
        classroomCamera: "Grade 8",
        attendancePercent: 96.5,
        pendingFee: 0
      }
    ]
  }
};

export function MobileAuthProvider({ children }: { children: ReactNode }) {
  // Default to unauthenticated session requiring live login or active credentials
  const [user, setUser] = useState<UserAccountProfile | null>(null);
  const [activeRole, setActiveRole] = useState<RoleType>("Parent");
  const [activeChildId, setActiveChildId] = useState<string>("");
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
