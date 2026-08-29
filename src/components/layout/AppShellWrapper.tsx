"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EmergencyBanner from "@/components/layout/EmergencyBanner";

export default function AppShellWrapper({
  children,
  headerNode,
  footerNode
}: {
  children: React.ReactNode;
  headerNode?: React.ReactNode;
  footerNode?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminOrLogin = pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/kiosk');

  if (isAdminOrLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <EmergencyBanner />
      {headerNode || <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {footerNode || <Footer />}
    </>
  );
}
