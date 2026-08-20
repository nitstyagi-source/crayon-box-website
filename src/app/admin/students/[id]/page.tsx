"use client";

import { useState, useEffect, use } from "react";
import { 
  User, FileText, HeartPulse, Bus, BookOpen, GraduationCap, 
  Clock, Phone, AlertTriangle, ShieldCheck, CheckCircle2, 
  Download, Printer, AlertCircle, Plus, RefreshCw, ChevronRight, 
  Activity, Edit3, Trash2, X, Upload, ExternalLink, ArrowUpRight, ArrowRightLeft
} from "lucide-react";
import { 
  getStudentProfile, 
  updateStudentProfile, 
  updateStudentLifecycleStatus, 
  saveStudentMedicalRecord,
  uploadStudentDocument,
  deleteStudentDocument,
  promoteStudent,
  transferStudentClass,
  deleteStudentPermanently,
  saveStudentAddress,
  deleteStudentAddress
} from "@/app/actions/students";
import { useRouter } from "next/navigation";

export default function StudentProfileDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Profile Modal State
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editSection, setEditSection] = useState<"student" | "parents">("student");
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

    // Father
    father_name: "",
    father_mobile: "",
    father_email: "",
    father_occupation: "",
    father_income: "",
    father_qualification: "",
    father_aadhaar: "",

    // Mother
    mother_name: "",
    mother_mobile: "",
    mother_email: "",
    mother_occupation: "",
    mother_income: "",
    mother_qualification: "",
    mother_aadhaar: "",

    // Guardian
    guardian_name: "",
    guardian_mobile: "",
    guardian_email: "",
    guardian_occupation: "",

    primary_contact: "Father"
  });

  // Transfer Modal State
  const [transferModal, setTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    target_class: "Grade 1",
    target_section: "A",
    target_roll_no: "",
    reason: "Section reallocation"
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState(false);

  // Document Upload Modal State
  const [uploadDocModal, setUploadDocModal] = useState(false);
  const [docFormData, setDocFormData] = useState({
    document_type: "Birth Certificate",
    document_no: "",
    file_url: "",
    verification_status: "Verified"
  });

  // Lifecycle / Promotion Modal State
  const [lifecycleModal, setLifecycleModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("Promotion");
  const [promotionData, setPromotionData] = useState({
    next_class: "",
    next_section: "A",
    next_roll_no: "",
    academic_session: "2026-2027",
    remarks: ""
  });
  const [actionReason, setActionReason] = useState("");

  // Address Modal State
  const [addressModal, setAddressModal] = useState(false);
  const [addressData, setAddressData] = useState({
    address_type: "Residential",
    street: "",
    city: "New Delhi",
    state: "Delhi",
    pin_code: ""
  });

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
      const father = data.parents?.find((p: any) => p.parent_type === 'Father') || {};
      const mother = data.parents?.find((p: any) => p.parent_type === 'Mother') || {};
      const guardian = data.parents?.find((p: any) => p.parent_type === 'Guardian') || {};
      const primary = data.parents?.find((p: any) => p.is_primary_contact)?.parent_type || 'Father';

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

        father_name: father.name || "",
        father_mobile: father.mobile || "",
        father_email: father.email || "",
        father_occupation: father.occupation || "",
        father_income: father.income || "",
        father_qualification: father.qualification || "",
        father_aadhaar: father.aadhaar_no || "",

        mother_name: mother.name || "",
        mother_mobile: mother.mobile || "",
        mother_email: mother.email || "",
        mother_occupation: mother.occupation || "",
        mother_income: mother.income || "",
        mother_qualification: mother.qualification || "",
        mother_aadhaar: mother.aadhaar_no || "",

        guardian_name: guardian.name || "",
        guardian_mobile: guardian.mobile || "",
        guardian_email: guardian.email || "",
        guardian_occupation: guardian.occupation || "",

        primary_contact: primary
      });

      const currentClassName = currentAc.class_name || "Grade 1";
      const match = currentClassName.match(/\d+/);
      const nextNum = match ? parseInt(match[0]) + 1 : 2;
      const suggestedNext = currentClassName.includes("Grade") ? `Grade ${nextNum}` : `Class ${nextNum}`;

      setPromotionData({
        next_class: suggestedNext,
        next_section: currentAc.section_name || "A",
        next_roll_no: currentAc.roll_no || "",
        academic_session: "2026-2027",
        remarks: `Promoted from ${currentClassName}`
      });

      setTransferData({
        target_class: currentAc.class_name || "Grade 1",
        target_section: currentAc.section_name === "A" ? "B" : "A",
        target_roll_no: currentAc.roll_no || "",
        reason: "Administrative Section Reallocation"
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

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    const res = await transferStudentClass(studentId, transferData);
    setIsUpdating(false);
    if (res.success) {
      setTransferModal(false);
      loadProfile();
    } else {
      alert("Failed to transfer: " + res.error);
    }
  }

  async function handleDeletePermanent() {
    setIsUpdating(true);
    const res = await deleteStudentPermanently(studentId);
    setIsUpdating(false);
    if (res.success) {
      router.push("/admin/students");
    } else {
      alert("Failed to delete student: " + res.error);
    }
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdating(true);
    const res = await saveStudentAddress(studentId, addressData);
    setIsUpdating(false);
    if (res.success) {
      setAddressModal(false);
      setAddressData({ address_type: "Residential", street: "", city: "New Delhi", state: "Delhi", pin_code: "" });
      loadProfile();
    } else {
      alert("Failed to save address: " + res.error);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    if (!confirm("Remove this address record?")) return;
    setIsUpdating(true);
    const res = await deleteStudentAddress(addressId, studentId);
    setIsUpdating(false);
    if (res.success) {
      loadProfile();
    } else {
      alert("Failed to delete address: " + res.error);
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

    if (selectedAction === "Promotion") {
      const res = await promoteStudent(studentId, promotionData);
      setIsUpdating(false);
      if (res.success) {
        setLifecycleModal(false);
        loadProfile();
      } else {
        alert("Failed to promote student: " + res.error);
      }
    } else {
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
  const isFormer = ['Withdrawn', 'TC Issued', 'Suspended', 'Alumni'].includes(profile.status);
  
  // Multi-parent extractions
  const father = profile.parents?.find((p: any) => p.parent_type === 'Father');
  const mother = profile.parents?.find((p: any) => p.parent_type === 'Mother');
  const guardian = profile.parents?.find((p: any) => p.parent_type === 'Guardian');

  const totalInvoiced = profile.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.total_amount || 0), 0) || 0;
  const totalPaid = profile.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.amount_paid || 0), 0) || 0;
  const totalDues = Math.max(0, totalInvoiced - totalPaid);

  const TABS = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal", icon: FileText },
    { id: "parents", label: "Parents & Guardians", icon: Phone },
    { id: "academic", label: "Academic History", icon: GraduationCap },
    { id: "fees", label: "Fees & Finance", icon: Clock },
    { id: "health", label: "Health & Clinic", icon: HeartPulse },
    { id: "documents", label: "Documents Vault", icon: ShieldCheck },
    { id: "lifecycle", label: "Lifecycle & TC", icon: Activity },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Universal 360° Header Card */}
      <div className={`rounded-3xl p-6 md:p-8 border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 ${
        isFormer ? 'bg-stone-100 border-stone-300' : 'bg-white border-stone-200'
      }`}>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center font-black text-3xl shrink-0 shadow-inner ${
          isFormer ? 'bg-stone-300 text-stone-700' : 'bg-blue-100 text-blue-600'
        }`}>
          {profile.first_name[0]}{profile.last_name[0]}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-stone-900">{profile.first_name} {profile.middle_name || ''} {profile.last_name}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                isFormer 
                  ? 'bg-stone-300 text-stone-800'
                  : profile.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
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
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setEditProfileModal(true)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button 
              onClick={() => setTransferModal(true)}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Class
            </button>
            <button 
              onClick={() => setLifecycleModal(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" /> Promote / TC
            </button>
            <button 
              onClick={() => setDeleteModal(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center"
              title="Delete Student Record Completely"
            >
              <Trash2 className="w-4 h-4" />
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
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Primary Contact</p>
                  <button onClick={() => { setEditSection("parents"); setEditProfileModal(true); }} className="text-blue-600 hover:underline text-xs font-bold">Edit</button>
                </div>
                <h3 className="text-lg font-bold text-stone-900">{profile.parents?.find((p: any) => p.is_primary_contact)?.name || father?.name || mother?.name || 'N/A'}</h3>
                <p className="text-stone-500 text-sm mt-0.5">{profile.parents?.find((p: any) => p.is_primary_contact)?.parent_type || 'Parent'} • {profile.parents?.find((p: any) => p.is_primary_contact)?.mobile || father?.mobile || 'N/A'}</p>
              </div>

              <div className="border border-stone-100 bg-stone-50 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Academic Enrollment</p>
                  <button onClick={() => setTransferModal(true)} className="text-blue-600 hover:underline text-xs font-bold">Shift Class</button>
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
                <p className="text-stone-400 text-xs mt-1">{profile.invoices?.length || 0} Invoices Generated</p>
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
              <button onClick={() => { setEditSection("student"); setEditProfileModal(true); }} className="bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
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
              <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                <h3 className="text-lg font-bold text-stone-900">Addresses on File</h3>
                <button 
                  onClick={() => setAddressModal(true)} 
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              {profile.addresses && profile.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.addresses.map((addr: any) => (
                    <div key={addr.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">{addr.address_type}</span>
                        <p className="font-bold text-stone-800 mt-2 text-sm">{addr.street}</p>
                        <p className="text-xs text-stone-500">{addr.city}, {addr.state} - {addr.pin_code}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <p className="text-stone-400 text-xs">No address records attached yet.</p>
                  <button onClick={() => setAddressModal(true)} className="mt-2 text-xs font-bold text-blue-600 hover:underline">Add Residential Address</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Parents & Guardians Tab (Separated Father, Mother, Guardian) */}
        {activeTab === 'parents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Family & Guardian Records</h3>
                <p className="text-xs text-stone-500">Dedicated records for Father, Mother, and Local Guardian.</p>
              </div>
              <button onClick={() => { setEditSection("parents"); setEditProfileModal(true); }} className="bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Edit3 className="w-3.5 h-3.5" /> Edit Parents / Guardian Info
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Father Card */}
              <div className="border border-stone-200 rounded-3xl p-6 relative bg-stone-50/50 flex flex-col justify-between">
                {father?.is_primary_contact && (
                  <span className="absolute top-5 right-5 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Primary</span>
                )}
                <div>
                  <h4 className="font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" /> Father&apos;s Profile
                  </h4>
                  {father?.name ? (
                    <div className="space-y-2.5 text-xs">
                      <div><span className="text-stone-400 block font-bold">Full Name</span><span className="font-bold text-stone-900 text-sm">{father.name}</span></div>
                      <div><span className="text-stone-400 block font-bold">Mobile Phone</span><span className="font-bold text-stone-900 font-mono">{father.mobile}</span></div>
                      <div><span className="text-stone-400 block font-bold">Email Address</span><span className="text-stone-800">{father.email || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Occupation</span><span className="text-stone-800">{father.occupation || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Annual Income</span><span className="text-stone-800">{father.income || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Qualification</span><span className="text-stone-800">{father.qualification || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Aadhaar UID</span><span className="text-stone-800 font-mono">{father.aadhaar_no || 'N/A'}</span></div>
                    </div>
                  ) : (
                    <p className="text-stone-400 text-xs py-6 text-center">No Father record recorded.</p>
                  )}
                </div>
              </div>

              {/* Mother Card */}
              <div className="border border-stone-200 rounded-3xl p-6 relative bg-stone-50/50 flex flex-col justify-between">
                {mother?.is_primary_contact && (
                  <span className="absolute top-5 right-5 bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Primary</span>
                )}
                <div>
                  <h4 className="font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-600" /> Mother&apos;s Profile
                  </h4>
                  {mother?.name ? (
                    <div className="space-y-2.5 text-xs">
                      <div><span className="text-stone-400 block font-bold">Full Name</span><span className="font-bold text-stone-900 text-sm">{mother.name}</span></div>
                      <div><span className="text-stone-400 block font-bold">Mobile Phone</span><span className="font-bold text-stone-900 font-mono">{mother.mobile || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Email Address</span><span className="text-stone-800">{mother.email || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Occupation</span><span className="text-stone-800">{mother.occupation || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Annual Income</span><span className="text-stone-800">{mother.income || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Qualification</span><span className="text-stone-800">{mother.qualification || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Aadhaar UID</span><span className="text-stone-800 font-mono">{mother.aadhaar_no || 'N/A'}</span></div>
                    </div>
                  ) : (
                    <p className="text-stone-400 text-xs py-6 text-center">No Mother record recorded.</p>
                  )}
                </div>
              </div>

              {/* Local Guardian Card */}
              <div className="border border-stone-200 rounded-3xl p-6 relative bg-stone-50/50 flex flex-col justify-between">
                {guardian?.is_primary_contact && (
                  <span className="absolute top-5 right-5 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Primary</span>
                )}
                <div>
                  <h4 className="font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" /> Local Guardian
                  </h4>
                  {guardian?.name ? (
                    <div className="space-y-2.5 text-xs">
                      <div><span className="text-stone-400 block font-bold">Full Name</span><span className="font-bold text-stone-900 text-sm">{guardian.name}</span></div>
                      <div><span className="text-stone-400 block font-bold">Mobile Phone</span><span className="font-bold text-stone-900 font-mono">{guardian.mobile}</span></div>
                      <div><span className="text-stone-400 block font-bold">Email Address</span><span className="text-stone-800">{guardian.email || 'N/A'}</span></div>
                      <div><span className="text-stone-400 block font-bold">Occupation</span><span className="text-stone-800">{guardian.occupation || 'N/A'}</span></div>
                    </div>
                  ) : (
                    <p className="text-stone-400 text-xs py-6 text-center">No Local Guardian recorded.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. Academic History Tab */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Multi-Session Academic Progression</h3>
                <p className="text-xs text-stone-500">Chronological history of classes, sections, and roll numbers across academic years.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTransferModal(true)}
                  className="text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-stone-200"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Shift Section / Class
                </button>
                <button 
                  onClick={() => { setSelectedAction("Promotion"); setLifecycleModal(true); }}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Promote to Next Class
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="p-3.5 font-bold rounded-l-xl">Status</th>
                    <th className="p-3.5 font-bold">Class & Grade</th>
                    <th className="p-3.5 font-bold">Section</th>
                    <th className="p-3.5 font-bold">Roll Number</th>
                    <th className="p-3.5 font-bold text-right rounded-r-xl">Record Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {profile.academic?.map((ac: any) => (
                    <tr key={ac.id} className={ac.is_current_session ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-stone-50 opacity-80"}>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          ac.is_current_session ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {ac.is_current_session ? 'Current Active Class' : 'Previous Class'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">{ac.class_name}</td>
                      <td className="p-3.5 font-bold text-stone-700">{ac.section_name || 'A'}</td>
                      <td className="p-3.5 font-mono text-stone-700">{ac.roll_no || 'Unassigned'}</td>
                      <td className="p-3.5 text-right text-stone-500 text-xs">
                        {ac.created_at ? new Date(ac.created_at).toLocaleDateString() : 'Active'}
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
              <div>
                <h3 className="text-lg font-bold text-stone-900">Student Lifecycle & TC Registry</h3>
                <p className="text-xs text-stone-500">Official log of class promotions, school withdrawals, and TC issuances.</p>
              </div>
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
                      <p className="font-bold text-stone-800 text-sm mt-1">{ev.remarks || ev.reason || 'Status modification'}</p>
                    </div>
                    <span className="text-xs text-stone-400 font-medium">{ev.action_date || 'Recent'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-400 text-sm">
                No lifecycle events recorded yet.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal 1: Edit Profile (Demographics + Separate Parents) */}
      {editProfileModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-stone-100 my-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-bold text-stone-900">Edit Student Profile</h3>
                <p className="text-stone-500 text-xs mt-0.5">Modify demographics or parent contact details.</p>
              </div>
              <button onClick={() => setEditProfileModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs for Edit */}
            <div className="flex gap-2 border-b border-stone-200 pb-3 mb-6">
              <button
                type="button"
                onClick={() => setEditSection("student")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  editSection === "student" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                1. Student Demographics & Class
              </button>
              <button
                type="button"
                onClick={() => setEditSection("parents")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  editSection === "parents" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                2. Parents & Guardian Details
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              
              {editSection === "student" ? (
                <div className="space-y-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Blood Group</label>
                      <input type="text" placeholder="e.g. B+, O+, AB-" value={profileFormData.blood_group} onChange={e => setProfileFormData({...profileFormData, blood_group: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Aadhaar Number</label>
                      <input type="text" placeholder="12-digit UID" value={profileFormData.aadhaar_no} onChange={e => setProfileFormData({...profileFormData, aadhaar_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Class / Grade *</label>
                      <input required type="text" value={profileFormData.class_name} onChange={e => setProfileFormData({...profileFormData, class_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Section</label>
                      <input type="text" value={profileFormData.section_name} onChange={e => setProfileFormData({...profileFormData, section_name: e.target.value.toUpperCase()})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Roll Number</label>
                      <input type="text" value={profileFormData.roll_no} onChange={e => setProfileFormData({...profileFormData, roll_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Father Details */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700">Father&apos;s Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Father&apos;s Name</label>
                        <input type="text" value={profileFormData.father_name} onChange={e => setProfileFormData({...profileFormData, father_name: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Mobile Phone</label>
                        <input type="text" value={profileFormData.father_mobile} onChange={e => setProfileFormData({...profileFormData, father_mobile: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm font-mono bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Email Address</label>
                        <input type="email" value={profileFormData.father_email} onChange={e => setProfileFormData({...profileFormData, father_email: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Occupation</label>
                        <input type="text" value={profileFormData.father_occupation} onChange={e => setProfileFormData({...profileFormData, father_occupation: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Annual Income</label>
                        <input type="text" value={profileFormData.father_income} onChange={e => setProfileFormData({...profileFormData, father_income: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Mother Details */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pink-700">Mother&apos;s Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Mother&apos;s Name</label>
                        <input type="text" value={profileFormData.mother_name} onChange={e => setProfileFormData({...profileFormData, mother_name: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Mobile Phone</label>
                        <input type="text" value={profileFormData.mother_mobile} onChange={e => setProfileFormData({...profileFormData, mother_mobile: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm font-mono bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Email Address</label>
                        <input type="email" value={profileFormData.mother_email} onChange={e => setProfileFormData({...profileFormData, mother_email: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Occupation</label>
                        <input type="text" value={profileFormData.mother_occupation} onChange={e => setProfileFormData({...profileFormData, mother_occupation: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Annual Income</label>
                        <input type="text" value={profileFormData.mother_income} onChange={e => setProfileFormData({...profileFormData, mother_income: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Local Guardian Details */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Local Guardian (Optional)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Guardian Name</label>
                        <input type="text" value={profileFormData.guardian_name} onChange={e => setProfileFormData({...profileFormData, guardian_name: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 block mb-1">Mobile Phone</label>
                        <input type="text" value={profileFormData.guardian_mobile} onChange={e => setProfileFormData({...profileFormData, guardian_mobile: e.target.value})} className="w-full border border-stone-200 p-2 rounded-xl text-sm font-mono bg-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 flex items-center justify-between">
                    <span>Primary Communication Contact:</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="p_contact" checked={profileFormData.primary_contact === "Father"} onChange={() => setProfileFormData({...profileFormData, primary_contact: "Father"})} /> Father
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="p_contact" checked={profileFormData.primary_contact === "Mother"} onChange={() => setProfileFormData({...profileFormData, primary_contact: "Mother"})} /> Mother
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="p_contact" checked={profileFormData.primary_contact === "Guardian"} onChange={() => setProfileFormData({...profileFormData, primary_contact: "Guardian"})} /> Guardian
                      </label>
                    </div>
                  </div>
                </div>
              )}

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

      {/* Modal 2: Shift / Transfer Class */}
      {transferModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Shift / Transfer Class</h3>
                <p className="text-stone-500 text-xs mt-0.5">Move student to another class or section.</p>
              </div>
              <button onClick={() => setTransferModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Target Class / Grade *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Grade 1"
                  value={transferData.target_class}
                  onChange={e => setTransferData({...transferData, target_class: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-900" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Target Section *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. B"
                    value={transferData.target_section}
                    onChange={e => setTransferData({...transferData, target_section: e.target.value.toUpperCase()})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold uppercase" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">New Roll No.</label>
                  <input 
                    type="text" 
                    placeholder="Optional"
                    value={transferData.target_roll_no}
                    onChange={e => setTransferData({...transferData, target_roll_no: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Reason for Transfer</label>
                <textarea 
                  value={transferData.reason}
                  onChange={e => setTransferData({...transferData, reason: e.target.value})}
                  rows={2}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm text-stone-800" 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setTransferModal(false)} className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md">
                  {isUpdating ? "Transferring..." : "Complete Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Permanent Delete Double Confirmation */}
      {deleteModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-100 animate-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">Purge Student Record Completely?</h3>
            <p className="text-stone-500 text-xs mb-4">
              This will <strong>permanently delete</strong> <span className="font-bold text-stone-900">{profile.first_name} {profile.last_name}</span> (Admission No: {profile.admission_no}) and cascade-delete all invoices, ledgers, parents, medical records, and uploaded documents from the database.
            </p>
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold mb-6">
              ⚠️ No backup or history will be retained.
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setDeleteModal(false)} 
                className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isUpdating}
                onClick={handleDeletePermanent}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md"
              >
                {isUpdating ? "Purging..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Upload Document */}
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

      {/* Modal 5: Promotion & Lifecycle Action */}
      {lifecycleModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-stone-900">
                {selectedAction === "Promotion" ? "Promote to Next Class" : "Change Lifecycle Status"}
              </h3>
              <button onClick={() => setLifecycleModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-stone-500 text-xs mb-6">
              {selectedAction === "Promotion" 
                ? "Promoting moves the student's active enrollment to the next class and archives the past session."
                : "Record school withdrawal, TC issuance, or disciplinary actions. Withdrawn / TC students are moved to the Former Students list."}
            </p>

            <form onSubmit={handleLifecycleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Action Type *</label>
                <select 
                  value={selectedAction} 
                  onChange={e => setSelectedAction(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800"
                >
                  <option value="Promotion">🎓 Promote to Next Class</option>
                  <option value="TC_Issued">📜 Issue Transfer Certificate (TC)</option>
                  <option value="Withdrawal">🚪 Student Withdrawal (Left School)</option>
                  <option value="Suspension">⚠️ Disciplinary Suspension</option>
                </select>
              </div>

              {selectedAction === "Promotion" ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Promoted Class / Grade *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Grade 2" 
                      value={promotionData.next_class}
                      onChange={e => setPromotionData({...promotionData, next_class: e.target.value})}
                      className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-blue-700" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Section</label>
                      <input 
                        type="text" 
                        value={promotionData.next_section}
                        onChange={e => setPromotionData({...promotionData, next_section: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">New Roll No.</label>
                      <input 
                        type="text" 
                        placeholder="Optional"
                        value={promotionData.next_roll_no}
                        onChange={e => setPromotionData({...promotionData, next_roll_no: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Academic Session</label>
                    <input 
                      type="text" 
                      value={promotionData.academic_session}
                      onChange={e => setPromotionData({...promotionData, academic_session: e.target.value})}
                      className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Reason / Remarks / TC Details *</label>
                  <textarea 
                    required
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder="Enter reason for leaving, TC certificate number, or relocation details..."
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm text-stone-800"
                    rows={3}
                  />
                </div>
              )}

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
                  className={`text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md ${
                    selectedAction === "Promotion" ? "bg-blue-600 hover:bg-blue-700" : "bg-stone-900 hover:bg-stone-800"
                  }`}
                >
                  {isUpdating ? "Processing..." : selectedAction === "Promotion" ? "Promote Student" : "Apply & Move"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Add Address */}
      {addressModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Add Address Record</h3>
                <p className="text-stone-500 text-xs mt-0.5">Attach residential or permanent address for this student.</p>
              </div>
              <button onClick={() => setAddressModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Address Type</label>
                <select 
                  value={addressData.address_type} 
                  onChange={e => setAddressData({...addressData, address_type: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800"
                >
                  <option value="Residential">Residential / Current Address</option>
                  <option value="Permanent">Permanent Home Address</option>
                  <option value="Postal">Postal / Communication Address</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Street / House No. / Area *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="e.g. Flat 302, Green Valley Apartments, Sector 14" 
                  value={addressData.street}
                  onChange={e => setAddressData({...addressData, street: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm text-stone-900" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">City *</label>
                  <input 
                    required
                    type="text" 
                    value={addressData.city}
                    onChange={e => setAddressData({...addressData, city: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">State *</label>
                  <input 
                    required
                    type="text" 
                    value={addressData.state}
                    onChange={e => setAddressData({...addressData, state: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">PIN / Postal Code *</label>
                <input 
                  required
                  type="text" 
                  placeholder="6-digit PIN"
                  value={addressData.pin_code}
                  onChange={e => setAddressData({...addressData, pin_code: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setAddressModal(false)} className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isUpdating} className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md">
                  {isUpdating ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
