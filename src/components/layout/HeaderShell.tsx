"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Calendar, ChevronDown, Check, 
  Search, Bell, LogOut, User, ShieldCheck, Menu
} from 'lucide-react';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';
import { createClient } from '@/lib/supabase/client';
import { clearServerAuthSession } from '@/app/actions/auth';

interface HeaderShellProps {
  onOpenSearch?: () => void;
  onToggleMobileMenu?: () => void;
}

export function HeaderShell({ onOpenSearch, onToggleMobileMenu }: HeaderShellProps) {
  const router = useRouter();
  const {
    currentInstitution,
    selectedInstitutionObj,
    setInstitution,
    currentSession,
    setSession,
    currentRole,
  } = useInstitution();

  const [isInstOpen, setIsInstOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const sessions = ['2026–2027 (Active)', '2025–2026 (Archived)'];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await clearServerAuthSession();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col bg-white border-b border-slate-200/80 px-4 sm:px-6 pt-4 pb-3 sm:pt-5 sm:pb-4 font-sans shrink-0 relative z-30 shadow-xs">
      
      {/* Top Row: Mobile Menu Button + User Greeting & Profile */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 w-full max-w-7xl mx-auto gap-3">
        
        {/* Left: Mobile Menu Toggle + Logo & Greeting */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Mobile Hamburger Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden p-1 shrink-0">
             <img 
               src="/logo.png" 
               alt="Crayon Box School Logo" 
               className="w-full h-full object-contain" 
               onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} 
             />
             <Building2 className="hidden text-[#0A1A44] w-5 h-5" />
          </div>

          <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-1.5 flex-wrap">
               <h1 className="text-[16px] sm:text-[19px] text-slate-900 font-black leading-tight truncate">
                 {currentRole.replace(/_/g, ' ')}
               </h1>
               <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Live
               </span>
             </div>
             <p className="text-slate-500 text-[11px] sm:text-[12px] font-medium truncate mt-0.5">
               {selectedInstitutionObj?.name || 'All Institutions (Trust HQ)'}
             </p>
          </div>
        </div>

        {/* Right: Actions (Search, Notifications, Profile, Direct Logout) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
           {/* Global Command Search */}
           {onOpenSearch && (
             <button 
               onClick={onOpenSearch} 
               className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition shadow-2xs"
               title="Search (⌘K)"
             >
               <Search className="w-4 h-4" />
             </button>
           )}

           {/* User Profile Dropdown */}
           <div className="relative">
             <button 
               onClick={() => setIsProfileOpen(!isProfileOpen)}
               className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer"
             >
               <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0A1A44] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                 {currentRole.slice(0, 2).toUpperCase()}
               </div>
               <div className="hidden md:flex flex-col text-left">
                 <span className="text-xs font-bold text-slate-800 leading-tight">Admin</span>
                 <span className="text-[10px] font-medium text-slate-500">Super Admin</span>
               </div>
               <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
             </button>

             {isProfileOpen && (
               <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                 <div className="px-4 py-3 border-b border-slate-100">
                   <p className="text-xs font-bold text-slate-900">Signed in as</p>
                   <p className="text-xs text-slate-500 font-medium truncate mt-0.5">nits.tyagi@gmail.com</p>
                   <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                     {currentRole.replace(/_/g, ' ')}
                   </span>
                 </div>

                 <div className="py-1">
                   <button
                     onClick={handleLogout}
                     disabled={isLoggingOut}
                     className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                   >
                     <LogOut className="w-4 h-4 text-rose-500" />
                     <span>{isLoggingOut ? 'Signing out...' : 'Sign Out / Logout'}</span>
                   </button>
                 </div>
               </div>
             )}
           </div>

           {/* Direct Logout Button */}
           <button
             onClick={handleLogout}
             disabled={isLoggingOut}
             className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100 text-xs font-bold transition shadow-2xs cursor-pointer"
             title="Sign Out of ERP"
           >
             <LogOut className="w-3.5 h-3.5 text-rose-600" />
             <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
           </button>
        </div>
      </div>

      {/* Bottom Row: Context Selectors (Responsive Grid) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full max-w-7xl mx-auto">
        {/* School Dropdown */}
        <div className="relative flex-1 sm:max-w-[280px]">
          <button
            onClick={() => setIsInstOpen(!isInstOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition text-xs font-bold text-slate-700 shadow-2xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedInstitutionObj ? selectedInstitutionObj.name : 'All Institutions'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
          
          {isInstOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => { setInstitution('ALL'); setIsInstOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${currentInstitution === 'ALL' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
              >
                <span>Trust HQ (All)</span>
                {currentInstitution === 'ALL' && <Check className="w-4 h-4" />}
              </button>
              {Object.values(VANI_TRUST_INSTITUTIONS).map((inst) => (
                <button
                  key={inst.code}
                  onClick={() => { setInstitution(inst.code); setIsInstOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${currentInstitution === inst.code ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: inst.brandColor }} />
                    <span className="truncate">{inst.name}</span>
                  </div>
                  {currentInstitution === inst.code && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Dropdown */}
        <div className="relative sm:w-[150px]">
          <button
            onClick={() => setIsSessionOpen(!isSessionOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition text-xs font-bold text-slate-700 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentSession.split(' ')[0]}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isSessionOpen && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              {sessions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSession(s); setIsSessionOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${currentSession === s ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <span>{s.split(' ')[0]}</span>
                  {currentSession === s && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
