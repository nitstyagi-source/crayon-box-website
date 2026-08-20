"use client";

import { useState, useEffect, use } from "react";
import { 
  User, FileText, HeartPulse, Bus, BookOpen, GraduationCap, 
  Clock, Phone, AlertTriangle, ShieldCheck, CheckCircle2, 
  Download, Printer, AlertCircle, Plus, RefreshCw, ChevronRight, 
  Activity, Edit3, Trash2, X, Upload, ExternalLink
} from "lucide-react";
import { 
  getStudentProfile, 
  updateStudentProfile, 
  updateStudentLifecycleStatus, 
  saveStudentMedicalRecord,
  uploadStudentDocument,
  deleteStudentDocument
} from "@/app/actions/students";

export default function StudentProfileDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Profile Modal State
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "",
    gender: "Male",
    category: "General",
    blood_group: "",
    nationality: "Indian",
    aadhaar_no: "",
    class_name: "",
    section_name: "",
    roll_no: "",
    parent_name: "",
    parent_mobile: "",
    parent_email: "",
    parent_occupation: "",
    parent_type: "Father"
  });

  // Document Upload Modal State
  const [uploadDocModal, setUploadDocModal] = useState(false);
  const [docFormData, setDocFormData] = useState({
    document_type: "Birth Certificate",
    document_no: "",
    file_url: "",
    verification_status: "Verified"
  });

  // Lifecycle Modal State
  const [lifecycleModal, setLifecycleModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("Promotion");
  const [actionReason, setActionReason] = useState("");

  // Medical Edit State
  const [medicalEdit, setMedicalEdit] = useState(false);
  const [medData, setMedData] = useState({
    blood_group: "",
    allergies: "",
    medical_conditions: "",
    emergency_instructions: "",
    doctor_contact: ""
  });

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  async function loadProfile() {
    setIsLoading(true);
    const res = await getStudentProfile(studentId);
    if (res.success) {
      const data = res.data;
      setProfile(data);

      const currentAc = data.academic?.find((a: any) => a.is_current_session) || data.academic?.[0] || {};
      const primaryParent = data.parents?.find((p: any) => p.is_primary_contact) || data.parents?.[0] || {};

      setProfileFormData({
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        dob: data.dob || "",
        gender: data.gender || "Male",
        category: data.category || "General",
        blood_group: data.blood_group || data.medical?.blood_group || "",
        nationality: data.nationality || "Indian",
        aadhaar_no: data.aadhaar_no || "",
        class_name: currentAc.class_name || "",
        section_name: currentAc.section_name || "",
        roll_no: currentAc.roll_no || "",
        parent_name: primaryParent.name || "",
        parent_mobile: primaryParent.mobile || "",
        parent_email: primaryParent.email || "",
        parent_occupation: primaryParent.occupation || "",
        parent_type: primaryParent.parent_type || "Father"
      });

      if (data.medical) {
        setMedData({
          blood_group: data.medical.blood_group || data.blood_group || "",
          allergies: data.medical.allergies || "",
          medical_conditions: data.medical.medical_conditions || "",
          emergency_instructions: data.medical.emergency_instructions || "",
          doctor_contact: data.medical.doctor_contact || ""
        });
      }
    }
    setIsLoading(false);
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateStudentProfile(studentId, profileFormData);
    setIsUpdating(false);
    if (res.success) {
      setEditProfileModal(false);
      loadProfile();
    } else {
      alert("Failed to update profile: " + res.error);
    }
  }

  async function handleDocUpload(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    const res = await uploadStudentDocument(studentId, {
      ...docFormData,
      file_url: docFormData.file_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    });
    setIsUpdating(false);
    if (res.success) {
      setUploadDocModal(false);
      setDocFormData({
        document_type: "Birth Certificate",
        document_no: "",
        file_url: "",
        verification_status: "Verified"
      });
      loadProfile();
    } else {
      alert("Failed to upload document: " + res.error);
    }
  }

  async function handleDocDelete(docId: string) {
    if (!confirm("Are you sure you want to remove this document from the vault?")) return;
    setIsUpdating(true);
    const res = await deleteStudentDocument(docId, studentId);
    setIsUpdating(false);
    if (res.success) {
      loadProfile();
    } else {
      alert("Failed to delete document: " + res.error);
    }
  }

  async function handleLifecycleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateStudentLifecycleStatus(studentId, selectedAction, actionReason);
    setIsUpdating(false);
    if (res.success) {
      setLifecycleModal(false);
      setActionReason("");
      loadProfile();
    } else {
      alert("Failed to update lifecycle: " + res.error);
    }
  }

  async function handleMedicalSave(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    const res = await saveStudentMedicalRecord(studentId, medData);
    setIsUpdating(false);
    if (res.success) {
      setMedicalEdit(false);
      loadProfile();
    } else {
      alert("Failed to save medical records: " + res.error);
    }
  }

  if (isLoading) return <div className="p-12 text-center font-bold text-stone-500">Loading 360° student profile...</div>;
  if (!profile) return <div className="p-12 text-center font-bold text-red-500">Student not found.</div>;

  const currentAcademic = profile.academic?.find((a: any) => a.is_current_session) || profile.academic?.[0] || {};
  
  // Calculate Fee Dues
  const totalInvoiced = profile.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.total_amount || 0), 0) || 0;
  const totalPaid = profile.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.amount_paid || 0), 0) || 0;
  const totalDues = Math.max(0, totalInvoiced - totalPaid);

  const TABS = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal", icon: FileText },
    { id: "parents", label: "Parents", icon: Phone },
    { id: "academic", label: "Academic History", icon: GraduationCap },
    { id: "fees", label: "Fees & Finance", icon: Clock },
    { id: "health", label: "Health & Clinic", icon: HeartPulse },
    { id: "documents", label: "Documents Vault", icon: ShieldCheck },
    { id: "lifecycle", label: "Lifecycle & TC", icon: Activity },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Universal 360° Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-3xl shrink-0 shadow-inner">
          {profile.first_name[0]}{profile.last_name[0]}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-stone-900">{profile.first_name} {profile.middle_name || ''} {profile.last_name}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                profile.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
              }`}>
                {profile.status}
              </span>
              {profile.category === 'EWS' ? (
                <span className="bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                  EWS Category
                </span>
              ) : (
                <span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  General
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-stone-500">
            <p>Admission No: <span className="text-stone-900 font-mono">{profile.admission_no}</span></p>
            <p>Class: <span className="text-stone-900">{currentAcademic.class_name || 'N/A'} {currentAcademic.section_name || ''}</span></p>
            <p>Roll No: <span className="text-stone-900">{currentAcademic.roll_no || 'N/A'}</span></p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
          <div className={`px-4 py-2 rounded-xl text-xs font-bold flex justify-between gap-4 ${
            totalDues > 0 ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-green-50 text-green-700 border border-green-100'
          }`}>
            <span>Fee Dues:</span>
            <span>₹{totalDues.toLocaleString('en-IN')}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setEditProfileModal(true)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button 
              onClick={() => setLifecycleModal(true)}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" /> Action
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-stone-900 text-white shadow-md' 
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 md:p-8 min-h-[420px]">
        
        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-stone-100 bg-stone-50 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Primary Guardian</p>
                  <button onClick={() => setEditProfileModal(true)} className="text-blue-600 hover:underline text-xs font-bold">Edit</button>
                </div>
                <h3 className="text-lg font-bold text-stone-900">{profile.parents?.[0]?.name || 'N/A'}</h3>
                <p className="text-stone-500 text-sm mt-0.5">{profile.parents?.[0]?.parent_type || 'Parent'} • {profile.parents?.[0]?.mobile || 'N/A'}</p>
                {profile.parents?.[0]?.email && <p className="text-stone-400 text-xs mt-1">{profile.parents[0].email}</p>}
              </div>

              <div className="border border-stone-100 bg-stone-50 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Academic Status</p>
                  <button onClick={() => setEditProfileModal(true)} className="text-blue-600 hover:underline text-xs font-bold">Edit</button>
                </div>
                <h3 className="text-lg font-bold text-stone-900">{currentAcademic.class_name || 'N/A'} {currentAcademic.section_name || ''}</h3>
                <p className="text-stone-500 text-sm mt-0.5">Session: 2026-2027 • Status: {profile.status}</p>
                <p className="text-stone-400 text-xs mt-1">Roll No: {currentAcademic.roll_no || 'Unassigned'}</p>
              </div>

              <div className="border border-stone-100 bg-stone-50 p-6 rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Finance Summary</p>
                <h3 className="text-lg font-bold text-stone-900">₹{totalPaid.toLocaleString('en-IN')} <span className="text-xs font-normal text-stone-500">Paid</span></h3>
                <p className={`text-sm font-bold mt-0.5 ${totalDues > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {totalDues > 0 ? `₹${totalDues.toLocaleString('en-IN')} Balance Due` : 'All Fees Cleared'}
                </p>
                <p className="text-stone-400 text-xs mt-1">{profile.invoices?.length || 0} Total Invoices Generated</p>
              </div>
            </div>

            {profile.medical?.allergies && (
              <div className="border border-red-200 bg-red-50 p-5 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Critical Medical Alert</h4>
                  <p className="text-red-700 text-xs mt-0.5">Allergies: {profile.medical.allergies}</p>
                  {profile.medical.emergency_instructions && (
                    <p className="text-red-600 text-xs mt-1">Instructions: {profile.medical.emergency_instructions}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Personal Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h3 className="text-lg font-bold text-stone-900">Student Demographics</h3>
              <button onClick={() => setEditProfileModal(true)} className="bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Edit Demographics
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div><p className="text-stone-400 text-xs font-bold uppercase">Date of Birth</p><p className="font-bold text-stone-900 mt-1">{profile.dob || 'N/A'}</p></div>
              <div><p className="text-stone-400 text-xs font-bold uppercase">Gender</p><p className="font-bold text-stone-900 mt-1">{profile.gender || 'N/A'}</p></div>
              <div><p className="text-stone-400 text-xs font-bold uppercase">Blood Group</p><p className="font-bold text-stone-900 mt-1">{profile.blood_group || profile.medical?.blood_group || 'N/A'}</p></div>
              <div><p className="text-stone-400 text-xs font-bold uppercase">Category</p><p className="font-bold text-stone-900 mt-1">{profile.category || 'General'}</p></div>
              <div><p className="text-stone-400 text-xs font-bold uppercase">Nationality</p><p className="font-bold text-stone-900 mt-1">{profile.nationality || 'Indian'}</p></div>
              <div><p className="text-stone-400 text-xs font-bold uppercase">Aadhaar UID</p><p className="font-bold text-stone-900 font-mono mt-1">{profile.aadhaar_no || 'Not Provided'}</p></div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Addresses on File</h3>
              {profile.addresses && profile.addresses.length > 0 ? (
                profile.addresses.map((addr: any) => (
                  <div key={addr.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-3">
                    <span className="text-xs font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{addr.address_type}</span>
                    <p className="font-bold text-stone-800 mt-2 text-sm">{addr.street}, {addr.city}, {addr.state} - {addr.pin_code}</p>
                  </div>
                ))
              ) : (
                <p className="text-stone-400 text-sm">No secondary address records attached.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. Parents Tab */}
        {activeTab === 'parents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Guardian Contact Directory</h3>
              <button onClick={() => setEditProfileModal(true)} className="bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Edit Parent Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.parents && profile.parents.length > 0 ? (
                profile.parents.map((p: any) => (
                  <div key={p.id} className="border border-stone-200 rounded-3xl p-6 relative bg-stone-50/50">
                    {p.is_primary_contact && (
                      <span className="absolute top-6 right-6 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">Primary Contact</span>
                    )}
                    <h4 className="font-bold text-lg text-stone-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-stone-400" /> {p.parent_type || 'Guardian'}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-stone-100 pb-2"><span className="text-stone-500 font-medium">Full Name</span><span className="font-bold text-stone-900">{p.name}</span></div>
                      <div className="flex justify-between border-b border-stone-100 pb-2"><span className="text-stone-500 font-medium">Mobile Number</span><span className="font-bold text-stone-900 font-mono">{p.mobile}</span></div>
                      <div className="flex justify-between border-b border-stone-100 pb-2"><span className="text-stone-500 font-medium">Email Address</span><span className="font-bold text-stone-900">{p.email || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500 font-medium">Occupation</span><span className="font-bold text-stone-900">{p.occupation || 'N/A'}</span></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-stone-400 text-sm">No parent records found.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. Academic History Tab */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Session & Class History</h3>
              <button onClick={() => setEditProfileModal(true)} className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100">
                Update Class / Roll No
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="p-3.5 font-bold rounded-l-xl">Academic Session</th>
                    <th className="p-3.5 font-bold">Class & Section</th>
                    <th className="p-3.5 font-bold">Roll Number</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right rounded-r-xl">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {profile.academic?.map((ac: any) => (
                    <tr key={ac.id} className="hover:bg-stone-50">
                      <td className="p-3.5 font-bold text-stone-900">2026-2027</td>
                      <td className="p-3.5 font-bold text-blue-700">{ac.class_name} {ac.section_name || ''}</td>
                      <td className="p-3.5 font-mono text-stone-700">{ac.roll_no || 'N/A'}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          ac.is_current_session ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {ac.is_current_session ? 'Current Session' : 'Past Session'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-stone-500 text-xs">
                        {ac.created_at ? new Date(ac.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Fees & Finance Tab */}
        {activeTab === 'fees' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Student Invoices</h3>
              {profile.invoices && profile.invoices.length > 0 ? (
                <div className="space-y-4">
                  {profile.invoices.map((inv: any) => (
                    <div key={inv.id} className="border border-stone-200 rounded-2xl p-5 bg-stone-50/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                        <div>
                          <span className="font-mono font-bold text-stone-900">{inv.invoice_number}</span>
                          <span className="text-stone-500 text-xs ml-2">({inv.billing_period || 'Term Fee'})</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold self-start uppercase tracking-wider ${
                          inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-4">
                        <div><span className="text-stone-400 block font-bold">Total Invoiced:</span><span className="font-bold text-stone-900 text-sm">₹{Number(inv.total_amount).toLocaleString('en-IN')}</span></div>
                        <div><span className="text-stone-400 block font-bold">Discount Applied:</span><span className="font-bold text-green-600 text-sm">₹{Number(inv.total_discount || 0).toLocaleString('en-IN')}</span></div>
                        <div><span className="text-stone-400 block font-bold">Amount Paid:</span><span className="font-bold text-stone-900 text-sm">₹{Number(inv.amount_paid || 0).toLocaleString('en-IN')}</span></div>
                        <div><span className="text-stone-400 block font-bold">Balance Due:</span><span className="font-bold text-orange-600 text-sm">₹{(Number(inv.total_amount) - Number(inv.amount_paid || 0)).toLocaleString('en-IN')}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 text-sm">No fee invoices generated yet for this student.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Payment Ledger History</h3>
              {profile.ledgers && profile.ledgers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 font-bold uppercase">
                        <th className="p-3">Type</th>
                        <th className="p-3">Remarks</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {profile.ledgers.map((l: any) => (
                        <tr key={l.id}>
                          <td className="p-3 font-bold text-stone-900">{l.transaction_type}</td>
                          <td className="p-3 text-stone-600">{l.remarks || 'Standard Transaction'}</td>
                          <td className={`p-3 font-bold ${l.amount < 0 ? 'text-green-700' : 'text-stone-900'}`}>
                            {l.amount < 0 ? `-₹${Math.abs(l.amount).toLocaleString('en-IN')}` : `₹${Number(l.amount).toLocaleString('en-IN')}`}
                          </td>
                          <td className="p-3 text-right text-stone-400">{new Date(l.created_at || l.transaction_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-stone-400 text-sm">No ledger transactions recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 6. Health & Clinic Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Medical Record & Emergency Protocols</h3>
              <button 
                onClick={() => setMedicalEdit(!medicalEdit)} 
                className="text-xs font-bold bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-800"
              >
                {medicalEdit ? "Cancel" : "Edit Medical Details"}
              </button>
            </div>

            {medicalEdit ? (
              <form onSubmit={handleMedicalSave} className="space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Blood Group</label>
                  <input 
                    type="text" 
                    value={medData.blood_group} 
                    onChange={e => setMedData({...medData, blood_group: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl text-sm" 
                    placeholder="e.g. O+, B+, A-"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Critical Allergies</label>
                  <input 
                    type="text" 
                    value={medData.allergies} 
                    onChange={e => setMedData({...medData, allergies: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl text-sm" 
                    placeholder="e.g. Peanut, Penicillin, Dust"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Chronic Medical Conditions</label>
                  <input 
                    type="text" 
                    value={medData.medical_conditions} 
                    onChange={e => setMedData({...medData, medical_conditions: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl text-sm" 
                    placeholder="e.g. Asthma, Diabetes"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Emergency Protocols / Instructions</label>
                  <textarea 
                    value={medData.emergency_instructions} 
                    onChange={e => setMedData({...medData, emergency_instructions: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl text-sm" 
                    rows={2}
                    placeholder="e.g. Keep inhaler in nurse station"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Family Doctor Contact</label>
                  <input 
                    type="text" 
                    value={medData.doctor_contact} 
                    onChange={e => setMedData({...medData, doctor_contact: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl text-sm" 
                    placeholder="Doctor Name & Phone"
                  />
                </div>
                <button type="submit" disabled={isUpdating} className="bg-primary text-white font-bold px-6 py-2 rounded-xl text-sm">
                  {isUpdating ? "Saving..." : "Save Medical Profile"}
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-xs font-bold uppercase text-stone-400">Blood Group</p>
                  <p className="font-bold text-stone-900 text-lg mt-1">{medData.blood_group || 'Not Specified'}</p>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-xs font-bold uppercase text-stone-400">Allergies</p>
                  <p className="font-bold text-red-600 mt-1">{medData.allergies || 'None Reported'}</p>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-xs font-bold uppercase text-stone-400">Medical Conditions</p>
                  <p className="font-bold text-stone-800 mt-1">{medData.medical_conditions || 'None'}</p>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-xs font-bold uppercase text-stone-400">Emergency Instructions</p>
                  <p className="text-stone-700 mt-1">{medData.emergency_instructions || 'Standard First-Aid Protocol'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Documents Vault Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Student Documents Vault</h3>
                <p className="text-xs text-stone-500">Secure cloud repository for certificates, IDs, and official verification files.</p>
              </div>
              <button 
                onClick={() => setUploadDocModal(true)}
                className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" /> Upload Document
              </button>
            </div>

            {profile.documents && profile.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.documents.map((doc: any) => (
                  <div key={doc.id} className="p-5 border border-stone-200 rounded-3xl bg-stone-50/50 flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-800">
                          {doc.verification_status || 'Verified'}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mt-2">{doc.document_type}</h4>
                      {doc.document_no && (
                        <p className="text-xs font-mono text-stone-600 mt-0.5">Doc No: {doc.document_no}</p>
                      )}
                      <p className="text-stone-400 text-[11px] mt-1">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-stone-200">
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 bg-white border border-stone-200 text-stone-700 text-xs font-bold py-2 rounded-xl hover:bg-stone-100 flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View File
                      </a>
                      <button 
                        onClick={() => handleDocDelete(doc.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-stone-700">No documents uploaded yet</h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  Upload the student&apos;s Birth Certificate, Aadhaar Card, Transfer Certificate, or report card to keep their digital vault up to date.
                </p>
                <button 
                  onClick={() => setUploadDocModal(true)}
                  className="mt-4 bg-stone-900 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload First Document
                </button>
              </div>
            )}
          </div>
        )}

        {/* 8. Lifecycle & TC Tab */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Student Lifecycle & TC Registry</h3>
              <button 
                onClick={() => setLifecycleModal(true)}
                className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Log Status Change
              </button>
            </div>

            {profile.lifecycle && profile.lifecycle.length > 0 ? (
              <div className="space-y-3">
                {profile.lifecycle.map((ev: any) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">{ev.action_type}</span>
                      <p className="font-bold text-stone-800 text-sm mt-1">{ev.reason || 'Status modification'}</p>
                    </div>
                    <span className="text-xs text-stone-400 font-medium">{ev.action_date || 'Recent'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-400 text-sm">
                No lifecycle events (Withdrawals, TC Issuances, Promotions) recorded yet.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal 1: Edit Profile */}
      {editProfileModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-stone-100 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-stone-900">Edit Student Profile</h3>
                <p className="text-stone-500 text-xs mt-0.5">Update personal demographics, academic enrollment, and guardian contact.</p>
              </div>
              <button onClick={() => setEditProfileModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Section 1: Demographics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">1. Personal Demographics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">First Name *</label>
                    <input required type="text" value={profileFormData.first_name} onChange={e => setProfileFormData({...profileFormData, first_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Middle Name</label>
                    <input type="text" value={profileFormData.middle_name} onChange={e => setProfileFormData({...profileFormData, middle_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Last Name *</label>
                    <input required type="text" value={profileFormData.last_name} onChange={e => setProfileFormData({...profileFormData, last_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Date of Birth</label>
                    <input type="date" value={profileFormData.dob} onChange={e => setProfileFormData({...profileFormData, dob: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Gender</label>
                    <select value={profileFormData.gender} onChange={e => setProfileFormData({...profileFormData, gender: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-medium">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Category</label>
                    <select value={profileFormData.category} onChange={e => setProfileFormData({...profileFormData, category: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800">
                      <option value="General">General</option>
                      <option value="EWS">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Blood Group</label>
                    <input type="text" placeholder="e.g. B+, O+, AB-" value={profileFormData.blood_group} onChange={e => setProfileFormData({...profileFormData, blood_group: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Aadhaar Number</label>
                    <input type="text" placeholder="12-digit UID" value={profileFormData.aadhaar_no} onChange={e => setProfileFormData({...profileFormData, aadhaar_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Enrollment */}
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">2. Current Class & Section</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Class / Grade *</label>
                    <input required type="text" placeholder="e.g. Grade 1" value={profileFormData.class_name} onChange={e => setProfileFormData({...profileFormData, class_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Section</label>
                    <input type="text" placeholder="e.g. A" value={profileFormData.section_name} onChange={e => setProfileFormData({...profileFormData, section_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Roll Number</label>
                    <input type="text" placeholder="e.g. 14" value={profileFormData.roll_no} onChange={e => setProfileFormData({...profileFormData, roll_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                  </div>
                </div>
              </div>

              {/* Section 3: Parent Contact */}
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">3. Primary Guardian Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Guardian Name *</label>
                    <input required type="text" value={profileFormData.parent_name} onChange={e => setProfileFormData({...profileFormData, parent_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Mobile Phone *</label>
                    <input required type="text" value={profileFormData.parent_mobile} onChange={e => setProfileFormData({...profileFormData, parent_mobile: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Email Address</label>
                    <input type="email" value={profileFormData.parent_email} onChange={e => setProfileFormData({...profileFormData, parent_email: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Occupation</label>
                    <input type="text" value={profileFormData.parent_occupation} onChange={e => setProfileFormData({...profileFormData, parent_occupation: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setEditProfileModal(false)} className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md">
                  {isUpdating ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Document */}
      {uploadDocModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-900">Upload Student Document</h3>
              <button onClick={() => setUploadDocModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-stone-500 text-xs mb-6">Attach official certificates, ID scans, or academic transcripts to the digital vault.</p>

            <form onSubmit={handleDocUpload} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Document Type *</label>
                <select 
                  value={docFormData.document_type} 
                  onChange={e => setDocFormData({...docFormData, document_type: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800"
                >
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="Aadhaar Card">Aadhaar Card (UID)</option>
                  <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                  <option value="Previous Report Card">Previous Report Card / Marks Sheet</option>
                  <option value="Immunization & Medical Record">Immunization & Medical Record</option>
                  <option value="Passport Size Photo">Passport Size Photo</option>
                  <option value="Other Official Document">Other Official Document</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Document / Certificate No. (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. BC-2024-8849" 
                  value={docFormData.document_no} 
                  onChange={e => setDocFormData({...docFormData, document_no: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">File Storage URL / Link</label>
                <input 
                  type="text" 
                  placeholder="https://... (or leave blank for standard cloud storage)" 
                  value={docFormData.file_url} 
                  onChange={e => setDocFormData({...docFormData, file_url: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Verification Status</label>
                <select 
                  value={docFormData.verification_status} 
                  onChange={e => setDocFormData({...docFormData, verification_status: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-medium"
                >
                  <option value="Verified">Verified (Original Checked)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setUploadDocModal(false)} className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isUpdating} className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md">
                  {isUpdating ? "Uploading..." : "Save to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Lifecycle Action */}
      {lifecycleModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-stone-900 mb-2">Change Student Lifecycle Status</h3>
            <p className="text-stone-500 text-xs mb-6">Record a formal status change in the official school register.</p>

            <form onSubmit={handleLifecycleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Action Type</label>
                <select 
                  value={selectedAction} 
                  onChange={e => setSelectedAction(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800"
                >
                  <option value="Promotion">Promote to Next Grade</option>
                  <option value="TC_Issued">Issue Transfer Certificate (TC)</option>
                  <option value="Withdrawal">Student Withdrawal</option>
                  <option value="Suspension">Disciplinary Suspension</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Official Reason / Remarks</label>
                <textarea 
                  required
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="Enter reason for TC or promotion details..."
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm text-stone-800"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={() => setLifecycleModal(false)}
                  className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Apply Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
