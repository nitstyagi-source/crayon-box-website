"use client";

import React from "react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";
import AdminMobileDashboard from "@/components/mobile/dashboards/AdminMobileDashboard";
import PrincipalMobileDashboard from "@/components/mobile/dashboards/PrincipalMobileDashboard";
import FacultyMobileDashboard from "@/components/mobile/dashboards/FacultyMobileDashboard";
import ParentMobileDashboard from "@/components/mobile/dashboards/ParentMobileDashboard";
import StudentMobileDashboard from "@/components/mobile/dashboards/StudentMobileDashboard";

export default function MobileDashboardPage() {
  const { activeRole } = useMobileAuth();

  switch (activeRole) {
    case "Super Admin":
    case "Management":
      return <AdminMobileDashboard />;

    case "Principal":
    case "Vice Principal":
      return <PrincipalMobileDashboard />;

    case "Faculty":
    case "HR":
    case "Accounts":
    case "Librarian":
    case "Transport Manager":
    case "Nurse":
    case "Security":
    case "Front Office":
      return <FacultyMobileDashboard />;

    case "Parent":
      return <ParentMobileDashboard />;

    case "Student":
      return <StudentMobileDashboard />;

    default:
      return <FacultyMobileDashboard />;
  }
}
