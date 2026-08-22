"use client";

import React from "react";
import { 
  X, Check, Users, GraduationCap, Briefcase, 
  ShieldAlert, UserCheck, Baby, ChevronRight, 
  Sparkles, RefreshCw, LogOut, ArrowRightLeft, Shield
} from "lucide-react";
import { useMobileAuth, RoleType } from "./MobileAuthProvider";

export default function ProfileSwitcherModal() {
  const { 
    user, 
    activeRole, 
    activeChild, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    switchProfile, 
    switchChild, 
    loginAsDemo,
    logout 
  } = useMobileAuth();

  if (!isProfileModalOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5 duration-300 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-400 shrink-0">
              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{user.fullName}</h3>
              <p className="text-xs text-slate-300 mt-0.5">Active Profile: <strong className="text-amber-300">{activeRole}</strong></p>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          
          {/* Section 1: Linked Profiles for this Account */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Linked Profiles
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Auto-switches permissions</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {user.linkedRoles.map(role => {
                const isActive = activeRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => switchProfile(role)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isActive 
                        ? "bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400/20 shadow-sm" 
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                        isActive ? "bg-amber-500 text-slate-950 shadow-sm" : "bg-white border border-slate-200 text-slate-600"
                      }`}>
                        {role === "Faculty" && <Briefcase className="w-4 h-4" />}
                        {role === "Parent" && <Users className="w-4 h-4" />}
                        {role === "Super Admin" && <Shield className="w-4 h-4" />}
                        {role === "Principal" && <GraduationCap className="w-4 h-4" />}
                        {role === "Student" && <Baby className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm leading-tight flex items-center gap-2">
                          <span>{role} Mode</span>
                          {isActive && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {role === "Faculty" && "Access assigned classes, periods & mark attendance"}
                          {role === "Parent" && "Access your children's fee, attendance & live stream"}
                          {role === "Super Admin" && "Full administrative controls & approvals"}
                          {role === "Principal" && "Operational oversight & staff substitutions"}
                          {role === "Student" && "View timetable, homework & exam results"}
                        </p>
                      </div>
                    </div>
                    {isActive && <Check className="w-5 h-5 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Active Child Selector (Visible if Parent mode and has multiple children) */}
          {activeRole === "Parent" && user.children && user.children.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Child Context
                </span>
                <span className="text-[10px] text-slate-500">Shifts all app data context</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {user.children.map(child => {
                  const isSelected = activeChild?.id === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        switchChild(child.id);
                        setIsProfileModalOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isSelected 
                          ? "bg-blue-50 border-blue-300 text-blue-950 ring-2 ring-blue-400/20 shadow-sm" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm shrink-0">
                          <img src={child.avatar} alt={child.firstName} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-sm text-slate-800 leading-tight">
                            {child.firstName} {child.lastName}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {child.grade} &bull; Section {child.section} &bull; Roll #{child.rollNo}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="bg-blue-600 text-white rounded-full p-1 shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Switch Demo Persona */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Demo Persona Switcher
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button 
                onClick={() => { loginAsDemo("faculty_parent"); setIsProfileModalOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-slate-800">Neha Sharma</div>
                <div className="text-[10px] text-slate-500">Faculty + Parent (2 Kids)</div>
              </button>

              <button 
                onClick={() => { loginAsDemo("principal"); setIsProfileModalOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-slate-800">Dr. Sunita Rao</div>
                <div className="text-[10px] text-slate-500">Principal Operations</div>
              </button>

              <button 
                onClick={() => { loginAsDemo("admin"); setIsProfileModalOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-slate-800">Dr. Rajesh Malhotra</div>
                <div className="text-[10px] text-slate-500">Super Admin / Director</div>
              </button>

              <button 
                onClick={() => { loginAsDemo("student"); setIsProfileModalOpen(false); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-slate-800">Aarav Sharma</div>
                <div className="text-[10px] text-slate-500">Student (Grade 5A)</div>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button 
            onClick={() => { logout(); setIsProfileModalOpen(false); }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 py-1 px-3 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button 
            onClick={() => setIsProfileModalOpen(false)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
}
