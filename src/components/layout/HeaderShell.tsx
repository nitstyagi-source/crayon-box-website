"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, Calendar, ChevronDown, Check, 
  Search, Bell, LogOut, User, ShieldCheck, Menu, Sparkles,
  Edit3, KeyRound, Phone, Mail, Award, X, Save, CheckCircle2
} from 'lucide-react';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';
import { createClient } from '@/lib/supabase/client';
import { clearServerAuthSession } from '@/app/actions/auth';
import { getTrustDetailsAction, updateTrustDetailsAction } from '@/app/actions/governance-analytics-actions';

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
    institutionsList,
    currentSession,
    setSession,
    currentRole,
    isAllInstitutions,
  } = useInstitution();

  const [isInstOpen, setIsInstOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Profile Form State
  const [userName, setUserName] = useState('Nitin Tyagi');
  const [userEmail, setUserEmail] = useState('nits.tyagi@gmail.com');
  const [userPhone, setUserPhone] = useState('+91 9811102008');
  const [userTitle, setUserTitle] = useState('Trust Chairman & Super Administrator');

  useEffect(() => {
    // Load current trust chairman details
    getTrustDetailsAction().then(res => {
      if (res.success && res.trust) {
        if (res.trust.chairmanName) setUserName(res.trust.chairmanName);
        if (res.trust.contactEmail) setUserEmail(res.trust.contactEmail);
        if (res.trust.contactPhone) setUserPhone(res.trust.contactPhone);
      }
    });
  }, []);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updateTrustDetailsAction({
        name: 'Vaani Educational Trust',
        chairmanName: userName,
        contactEmail: userEmail,
        contactPhone: userPhone
      });

      if (res.success) {
        setProfileSuccessMsg("✓ Super User profile updated successfully!");
        setTimeout(() => {
          setProfileSuccessMsg(null);
          setIsEditProfileModalOpen(false);
        }, 1500);
      } else {
        alert("Error saving profile: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const activeLogo = selectedInstitutionObj?.logoUrl || '/logo.png';
  const activeName = isAllInstitutions 
    ? 'All Campuses (Trust HQ)' 
    : (selectedInstitutionObj?.name || 'Crayon Box School');
  const activeBrandColor = selectedInstitutionObj?.brandColor || '#2563eb';
  const activeAffiliation = selectedInstitutionObj?.boardAffiliation || 'CBSE';

  return (
    <>
      <div className="flex flex-col bg-white border-b border-slate-200/80 px-4 sm:px-6 pt-4 pb-3 sm:pt-5 sm:pb-4 font-sans shrink-0 relative z-30 shadow-xs">
        
        {/* Top Row: Mobile Menu Button + User Greeting & Active School Profile */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 w-full max-w-7xl mx-auto gap-3">
          
          {/* Left: Mobile Menu Toggle + School Logo & Dynamic Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Mobile Hamburger Button */}
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Active School Emblem */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white border-2 shadow-xs flex items-center justify-center overflow-hidden p-1 shrink-0"
                 style={{ borderColor: activeBrandColor }}>
               <img 
                 src={activeLogo} 
                 alt={activeName} 
                 className="w-full h-full object-contain" 
                 onError={(e) => { e.currentTarget.src = '/logo.png'; }} 
               />
            </div>

            <div className="flex flex-col min-w-0">
               <div className="flex items-center gap-1.5 flex-wrap">
                 <h1 className="text-[16px] sm:text-[19px] text-slate-900 font-black leading-tight truncate">
                   {activeName}
                 </h1>
                 <span 
                   className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                   style={{ 
                     backgroundColor: `${activeBrandColor}15`, 
                     color: activeBrandColor 
                   }}
                 >
                   <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeBrandColor }} />
                   {isAllInstitutions ? 'TRUST HQ' : activeAffiliation}
                 </span>
               </div>
               <p className="text-slate-500 text-[11px] sm:text-[12px] font-medium truncate mt-0.5">
                 {isAllInstitutions 
                   ? 'Vani Educational Trust Central Governance • 4 Campuses' 
                   : `${selectedInstitutionObj?.address || 'Delhi NCR'} • Session 2026–2027`}
               </p>
            </div>
          </div>

          {/* Right: Actions (Search, Notifications, Profile, Direct Logout) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
             {/* Global Command Search */}
             {onOpenSearch && (
               <button 
                 onClick={onOpenSearch} 
                 className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
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
                   {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SU'}
                 </div>
                 <div className="hidden md:flex flex-col text-left">
                   <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{userName}</span>
                   <span className="text-[10px] font-medium text-slate-500">{currentRole.replace(/_/g, ' ')}</span>
                 </div>
                 <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
               </button>

               {isProfileOpen && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                   <div className="px-4 py-3 border-b border-slate-100">
                     <p className="text-xs font-bold text-slate-900">{userName}</p>
                     <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{userEmail}</p>
                     <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                       {currentRole.replace(/_/g, ' ')}
                     </span>
                   </div>

                   <div className="py-1">
                     <button
                       onClick={() => { setIsProfileOpen(false); setIsEditProfileModalOpen(true); }}
                       className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                     >
                       <Edit3 className="w-4 h-4 text-indigo-600" />
                       <span>Edit Profile & Credentials</span>
                     </button>

                     <Link
                       href="/admin/trust"
                       onClick={() => setIsProfileOpen(false)}
                       className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                     >
                       <Award className="w-4 h-4 text-amber-500" />
                       <span>Trust Master Governance</span>
                     </Link>

                     <div className="my-1 border-t border-slate-100" />

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

        {/* Bottom Row: Context Selectors (Switch Active Campus Instantly) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full max-w-7xl mx-auto">
          {/* School Dropdown */}
          <div className="relative flex-1 sm:max-w-[320px]">
            <button
              onClick={() => setIsInstOpen(!isInstOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition text-xs font-bold text-slate-800 shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeBrandColor }} />
                <span className="truncate">{activeName}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            
            {isInstOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in">
                <button
                  onClick={() => { setInstitution('ALL'); setIsInstOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 flex items-center justify-between transition cursor-pointer ${currentInstitution === 'ALL' ? 'text-indigo-600 bg-indigo-50/60' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>🏛️ Trust HQ (All Campuses)</span>
                  </div>
                  {currentInstitution === 'ALL' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {institutionsList.map((inst) => (
                  <button
                    key={inst.code}
                    onClick={() => { setInstitution(inst.code); setIsInstOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 flex items-center justify-between transition cursor-pointer ${currentInstitution === inst.code ? 'text-indigo-600 bg-indigo-50/60' : 'text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: inst.brandColor || '#2563eb' }} />
                      <span className="truncate">{inst.name}</span>
                    </div>
                    {currentInstitution === inst.code && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative sm:w-[160px]">
            <button
              onClick={() => setIsSessionOpen(!isSessionOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition text-xs font-bold text-slate-700 shadow-2xs cursor-pointer"
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
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between cursor-pointer ${currentSession === s ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
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

      {/* EDIT SUPER USER PROFILE MODAL */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Super User Profile</h3>
                  <p className="text-xs text-slate-400">Manage administrator credentials &amp; identity</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 font-sans text-xs">
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-medium font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Active Security Role</label>
                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 font-bold flex items-center justify-between">
                  <span>Super Administrator (Root)</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-[#0A1A44] hover:bg-[#0F245E] text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
