"use client";

import React from "react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";
import AdminMobileDashboard from "@/components/mobile/dashboards/AdminMobileDashboard";
import PrincipalMobileDashboard from "@/components/mobile/dashboards/PrincipalMobileDashboard";
import FacultyMobileDashboard from "@/components/mobile/dashboards/FacultyMobileDashboard";
import FamilyMobileDashboard from "@/components/mobile/dashboards/FamilyMobileDashboard";

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
      return <FamilyMobileDashboard />;

    case "Student":
      return <FamilyMobileDashboard />;

    default:
      return <FacultyMobileDashboard />;
  }
}
