"use client";

import React, { useState } from 'react';
import { HeaderShell } from '@/components/layout/HeaderShell';
import { SidebarNav } from '@/components/layout/SidebarNav';
import GlobalSearchModal from '@/components/layout/GlobalSearchModal';
import { GlobalCommandPalette } from '@/components/common/GlobalCommandPalette';
import { InstitutionProvider, useInstitution } from '@/components/providers/InstitutionContext';
import { CampusProvider } from '@/components/providers/CampusProvider';
import { VastuMandalaWatermark } from '@/components/common/VastuMandalaWatermark';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { currentRole } = useInstitution();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="relative flex h-screen bg-[#FDFBF7] overflow-hidden font-sans text-stone-900 antialiased">
      {/* Subtle Hairline Vastu Mandala Watermark in Center (4% Opacity) */}
      <VastuMandalaWatermark className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={680} opacity={0.04} />

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <GlobalCommandPalette />

      {/* Role-Based Sidebar Navigation (Desktop Static + Mobile Drawer) */}
      <SidebarNav 
        currentRole={currentRole} 
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Shell with Mobile Drawer Hamburger Toggle */}
        <HeaderShell 
          onOpenSearch={() => setIsSearchOpen(true)} 
          onToggleMobileMenu={() => setIsMobileNavOpen(true)}
        />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>

      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <InstitutionProvider>
      <CampusProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </CampusProvider>
    </InstitutionProvider>
  );
}
