"use client";

import { useState, useEffect, use } from "react";
import { User, FileText, HeartPulse, Bus, BookOpen, GraduationCap, Clock, Phone, AlertTriangle, ShieldCheck } from "lucide-react";
import { getStudentProfile } from "@/app/actions/students";

export default function StudentProfileDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  async function loadProfile() {
    const res = await getStudentProfile(studentId);
    if (res.success) setProfile(res.data);
    setIsLoading(false);
  }

  if (isLoading) return <div className="p-10 text-center font-bold text-stone-500">Loading comprehensive profile...</div>;
  if (!profile) return <div className="p-10 text-center font-bold text-red-500">Student not found.</div>;

  const currentAcademic = profile.academic?.find((a:any) => a.is_current_session) || profile.academic?.[0] || {};

  const TABS = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal", icon: FileText },
    { id: "parents", label: "Parents", icon: Phone },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "fees", label: "Fees & Finance", icon: Clock }, // Using Clock icon temporarily
    { id: "health", label: "Health", icon: HeartPulse },
    { id: "transport", label: "Transport", icon: Bus },
    { id: "documents", label: "Documents", icon: ShieldCheck },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Universal Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-3xl shrink-0">
          {profile.first_name[0]}{profile.last_name[0]}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-stone-900">{profile.first_name} {profile.middle_name || ''} {profile.last_name}</h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider">{profile.status}</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-stone-500">
            <p>Admission No: <span className="text-stone-900">{profile.admission_no}</span></p>
            <p>Class: <span className="text-stone-900">{currentAcademic.class_name || 'N/A'} {currentAcademic.section_name || ''}</span></p>
            <p>Roll No: <span className="text-stone-900">{currentAcademic.roll_no || 'N/A'}</span></p>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
           <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold flex justify-between gap-4">
             <span>Fee Dues:</span><span>₹0</span>
           </div>
           <div className="bg-stone-50 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold flex justify-between gap-4">
             <span>Attendance:</span><span>92%</span>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-stone-900 text-white shadow-md' : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Areas */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 md:p-8 min-h-[400px]">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-stone-100 bg-stone-50 p-5 rounded-2xl">
              <h3 className="font-bold text-stone-900 mb-2">Primary Contact</h3>
              <p className="text-stone-600 text-sm">{profile.parents?.[0]?.name || 'N/A'} ({profile.parents?.[0]?.parent_type || 'Parent'})</p>
              <p className="text-stone-900 font-bold mt-1">{profile.parents?.[0]?.mobile || 'N/A'}</p>
            </div>
            {profile.medical?.allergies && (
              <div className="border border-red-100 bg-red-50 p-5 rounded-2xl col-span-1 md:col-span-2">
                <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Medical Alert</h3>
                <p className="text-red-700 text-sm font-bold">Allergies: {profile.medical.allergies}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-black text-stone-900 mb-4 border-b border-stone-100 pb-2">Basic Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div><p className="text-stone-500 font-bold mb-1">Date of Birth</p><p className="font-bold text-stone-900">{profile.dob}</p></div>
                <div><p className="text-stone-500 font-bold mb-1">Gender</p><p className="font-bold text-stone-900">{profile.gender}</p></div>
                <div><p className="text-stone-500 font-bold mb-1">Blood Group</p><p className="font-bold text-stone-900">{profile.blood_group}</p></div>
                <div><p className="text-stone-500 font-bold mb-1">Aadhaar No</p><p className="font-bold text-stone-900">{profile.aadhaar_no || 'N/A'}</p></div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-stone-900 mb-4 border-b border-stone-100 pb-2">Addresses</h3>
              {profile.addresses?.map((addr:any) => (
                <div key={addr.id} className="mb-4">
                  <p className="text-stone-500 font-bold mb-1 uppercase tracking-wider text-xs">{addr.address_type} Address</p>
                  <p className="font-bold text-stone-900">{addr.street}, {addr.city}, {addr.state} - {addr.pin_code}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'parents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.parents?.map((p:any) => (
              <div key={p.id} className="border border-stone-200 rounded-2xl p-6 relative">
                {p.is_primary_contact && <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Primary</span>}
                <h4 className="font-black text-lg text-stone-900 mb-4">{p.parent_type}</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-stone-50 pb-2"><span className="text-stone-500 font-bold">Name</span><span className="font-bold text-stone-900">{p.name}</span></div>
                  <div className="flex justify-between border-b border-stone-50 pb-2"><span className="text-stone-500 font-bold">Mobile</span><span className="font-bold text-stone-900">{p.mobile}</span></div>
                  <div className="flex justify-between border-b border-stone-50 pb-2"><span className="text-stone-500 font-bold">Occupation</span><span className="font-bold text-stone-900">{p.occupation}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500 font-bold">Email</span><span className="font-bold text-stone-900">{p.email || 'N/A'}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Placeholders for other tabs for brevity */}
        {(activeTab !== 'overview' && activeTab !== 'personal' && activeTab !== 'parents') && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="font-bold text-stone-900 text-xl mb-2">{TABS.find(t => t.id === activeTab)?.label} Module</h3>
            <p className="text-stone-500">This module is part of the extensive ERP architecture and will be fully wired in the next phase.</p>
          </div>
        )}

      </div>
    </div>
  );
}
