"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  Bus,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Users,
  Heart,
  Award,
  BookOpen,
  Check,
  Upload,
  Link as LinkIcon
} from "lucide-react";
import {
  getEnquiryForPrefillAction,
  searchEnrolledSiblingsAction,
  getAdmissionsMasterDataAction,
  saveMasterAdmissionApplicationAction
} from "@/app/actions/admissions-application-actions";
import { AadhaarOcrValidator } from "./AadhaarOcrValidator";

interface Props {
  initialEnquiryNo?: string;
  onSuccess?: (appNo: string) => void;
}

export const MasterAdmissionForm: React.FC<Props> = ({ initialEnquiryNo, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAppNo, setSuccessAppNo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enquiry Pre-fill bar state
  const [enquirySearchQuery, setEnquirySearchQuery] = useState(initialEnquiryNo || "");
  const [isSearchingEnquiry, setIsSearchingEnquiry] = useState(false);
  const [prefillSuccessMsg, setPrefillSuccessMsg] = useState<string | null>(null);

  // Live Master Data
  const [campuses, setCampuses] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);

  // Sibling Search State
  const [siblingSearch, setSiblingSearch] = useState("");
  const [siblingResults, setSiblingResults] = useState<any[]>([]);
  const [selectedSibling, setSelectedSibling] = useState<any | null>(null);

  // 12-Section Form State
  const [form, setForm] = useState({
    // Step 1: Admission Details
    application_no: "",
    enquiry_no: initialEnquiryNo || "",
    academic_year: "2026-2027",
    campus_id: "",
    class_applied: "Class 1",
    admission_type: "NEW_ADMISSION",
    admission_date: new Date().toISOString().split("T")[0],

    // Step 2: Student Personal Details
    first_name: "",
    middle_name: "",
    last_name: "",
    name_as_per_birth_cert: "",
    dob: "2021-05-15",
    gender: "MALE",
    blood_group: "B+",
    nationality: "Indian",
    mother_tongue: "Hindi",
    category: "GENERAL",
    aadhaar_number: "",
    student_photo_url: "",
    id_mark_1: "",
    id_mark_2: "",

    // Step 3: Birth Details
    birth_place: "Delhi",
    birth_city: "Delhi",
    birth_district: "North Delhi",
    birth_state: "Delhi",
    birth_country: "India",
    birth_certificate_no: "",
    birth_cert_issuing_authority: "MCD Delhi",
    birth_cert_issue_date: "2021-06-01",

    // Step 4: Parents & Guardian
    father_name: "",
    father_dob: "1988-04-12",
    father_aadhaar: "",
    father_qualification: "Post Graduate",
    father_occupation: "Private Service",
    father_designation: "Senior Manager",
    father_organization: "Tech Corp",
    father_office_address: "",
    father_phone: "",
    father_whatsapp: "",
    father_email: "",
    father_annual_income: "1200000",
    is_father_primary: true,

    mother_name: "",
    mother_dob: "1990-08-20",
    mother_aadhaar: "",
    mother_qualification: "Graduate",
    mother_occupation: "Professional",
    mother_designation: "Consultant",
    mother_organization: "",
    mother_office_address: "",
    mother_phone: "",
    mother_whatsapp: "",
    mother_email: "",
    mother_annual_income: "800000",
    is_mother_primary: false,

    has_legal_guardian: false,
    guardian_name: "",
    guardian_relationship: "",
    guardian_phone: "",
    guardian_email: "",
    guardian_address: "",

    // Step 5: Address & Family
    current_address_line1: "",
    current_locality: "Burari",
    current_landmark: "",
    current_city: "Delhi",
    current_district: "Central North",
    current_state: "Delhi",
    current_pincode: "110084",
    is_permanent_same: true,
    permanent_address_line1: "",
    permanent_city: "Delhi",
    permanent_state: "Delhi",
    permanent_pincode: "110084",
    distance_from_campus_km: "3.5",
    family_marital_status: "Married",
    child_lives_with: "Both Parents",

    // Step 6: Previous School & Academics (Class-Aware)
    previous_school_name: "",
    previous_school_address: "",
    previous_school_board: "",
    previous_school_medium: "English",
    previous_class_attended: "",
    previous_academic_year: "2025-2026",
    previous_tc_number: "",
    previous_tc_date: "",
    previous_marks_percentage: "92",
    previous_reason_for_leaving: "Relocation to school neighborhood",

    // Step 7: Language & Sibling
    first_language: "English",
    second_language: "Hindi",
    languages_known: ["English", "Hindi"],
    has_sibling_in_school: false,
    sibling_student_id: "",
    sibling_admission_no: "",
    sibling_name: "",
    sibling_class: "",

    // Step 8: Health & Emergency
    medical_allergies: "None",
    medical_conditions: "Healthy, No chronic conditions",
    doctor_name: "Dr. A. K. Verma",
    doctor_phone: "9876543210",
    preferred_hospital: "Max Healthcare",
    emergency_contact_1_name: "",
    emergency_contact_1_relation: "Father",
    emergency_contact_1_phone: "",
    emergency_contact_2_name: "",
    emergency_contact_2_relation: "Mother",
    emergency_contact_2_phone: "",

    // Step 9: Transport & Escort
    transport_required: false,
    transport_type: "TWO_WAY",
    bus_route_id: "",
    pickup_point: "Sant Nagar Main Stand",
    drop_point: "Sant Nagar Main Stand",
    authorized_escort_1_name: "",
    authorized_escort_1_phone: "",

    // Step 10: Activities & Special Needs
    sports_talents: ["Football", "Chess"],
    arts_talents: ["Music", "Robotics"],
    special_learning_support_needed: false,
    special_support_details: "",

    // Step 11: Document Checklist
    documents_checklist: [
      { docType: "BIRTH_CERT", name: "Birth Certificate", uploaded: true },
      { docType: "STUDENT_PHOTO", name: "Student Passport Photograph", uploaded: true },
      { docType: "PARENT_PHOTO", name: "Parent Photograph", uploaded: true },
      { docType: "ADDRESS_PROOF", name: "Proof of Residential Address", uploaded: true },
      { docType: "AADHAAR_CARD", name: "Aadhaar / UID Card", uploaded: true }
    ],

    // Step 12: Declaration
    parent_declaration_accepted: true
  });

  useEffect(() => {
    // Load live master data
    getAdmissionsMasterDataAction().then((res) => {
      if (res.success) {
        setCampuses(res.campuses || []);
        setBuses(res.buses || []);
        if (res.campuses.length > 0 && !form.campus_id) {
          setForm((f) => ({ ...f, campus_id: res.campuses[0].id }));
        }
      }
    });

    if (initialEnquiryNo) {
      handlePrefillFromEnquiry(initialEnquiryNo);
    }
  }, []);

  // Is Class 2+ (requires previous school details)?
  const isHigherClass = !["NURSERY", "PRE-NURSERY", "LKG", "UKG", "PLAYGROUP", "CLASS 1"].includes(
    form.class_applied.toUpperCase()
  );

  // Auto calculate age
  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const birth = new Date(dobString);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return `${years} Years`;
  };

  // Prefill Handler
  async function handlePrefillFromEnquiry(idToSearch?: string) {
    const id = idToSearch || enquirySearchQuery;
    if (!id.trim()) return;

    setIsSearchingEnquiry(true);
    setPrefillSuccessMsg(null);
    setErrorMessage(null);

    try {
      const res = await getEnquiryForPrefillAction(id);
      if (res.success && res.enquiry) {
        const e = res.enquiry;
        setForm((prev) => ({
          ...prev,
          enquiry_no: e.enquiry_no,
          first_name: e.child_name.split(" ")[0] || prev.first_name,
          last_name: e.child_name.split(" ").slice(1).join(" ") || prev.last_name,
          class_applied: e.grade_interested || prev.class_applied,
          father_name: e.parent_name || prev.father_name,
          father_phone: e.parent_phone || prev.father_phone,
          father_whatsapp: e.parent_phone || prev.father_whatsapp,
          father_email: e.parent_email || prev.father_email,
          current_locality: e.locality || prev.current_locality,
          transport_required: Boolean(e.transport_required),
          emergency_contact_1_name: e.parent_name || prev.emergency_contact_1_name,
          emergency_contact_1_phone: e.parent_phone || prev.emergency_contact_1_phone
        }));
        setPrefillSuccessMsg(`✓ Linked to Enquiry #${e.enquiry_no} (${e.child_name}). Form pre-filled successfully!`);
      } else {
        setErrorMessage(res.message || "No enquiry found with this number.");
      }
    } finally {
      setIsSearchingEnquiry(false);
    }
  }

  // Sibling Search Handler
  async function handleSiblingSearch(q: string) {
    setSiblingSearch(q);
    if (q.length > 2) {
      const res = await searchEnrolledSiblingsAction(q);
      if (res.success) setSiblingResults(res.students || []);
    } else {
      setSiblingResults([]);
    }
  }

  function handleSelectSibling(student: any) {
    setSelectedSibling(student);
    setForm((prev) => ({
      ...prev,
      has_sibling_in_school: true,
      sibling_student_id: student.id,
      sibling_admission_no: student.admission_no,
      sibling_name: student.name,
      sibling_class: student.class_name,
      admission_type: "SIBLING"
    }));
    setSiblingResults([]);
  }

  // Submit Handler
  async function handleSubmitApplication(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await saveMasterAdmissionApplicationAction(form);
      if (res.success && res.applicationNo) {
        setSuccessAppNo(res.applicationNo);
        if (onSuccess) onSuccess(res.applicationNo);
      } else {
        setErrorMessage(res.error || "Failed to submit application. Please review fields.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error submitting application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepsList = [
    { num: 1, title: "Admission Meta" },
    { num: 2, title: "Student Details" },
    { num: 3, title: "Birth Details" },
    { num: 4, title: "Parents & Guardian" },
    { num: 5, title: "Address & Family" },
    { num: 6, title: "Previous School", hide: !isHigherClass },
    { num: 7, title: "Language & Sibling" },
    { num: 8, title: "Health & Emergency" },
    { num: 9, title: "Transport & Escort" },
    { num: 10, title: "Activities & Talents" },
    { num: 11, title: "Document Checklist" },
    { num: 12, title: "Review & Submit" }
  ].filter((s) => !s.hide);

  if (successAppNo) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-2xl text-center max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-stone-900 font-serif">Application Submitted Successfully!</h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Your master admission application for <strong>{form.first_name} {form.last_name}</strong> ({form.class_applied}) has been registered in the school database.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 max-w-sm mx-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">Permanent Application Reference</span>
          <strong className="text-2xl font-mono font-black text-blue-950">{successAppNo}</strong>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-left text-xs text-blue-900 space-y-1">
          <strong className="font-black text-blue-950 block">Next Steps for Admissions:</strong>
          <p className="text-blue-800">
            1. Our Admissions Committee will verify your submitted documents.<br />
            2. You will receive an SMS and WhatsApp notification regarding your interactive interaction slot.<br />
            3. Upon confirmation, your child&apos;s Admission Number (<code>ADM-2026-XXXX</code>) and Parent App login will be activated.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`/admin/admissions/assessments?appNo=${successAppNo}`}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white transition shadow-md flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Select Interview &amp; Assessment Slot</span>
          </a>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-xs text-stone-800 transition"
          >
            Print Application PDF
          </button>
          <button
            onClick={() => {
              setSuccessAppNo(null);
              setCurrentStep(1);
            }}
            className="px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 font-bold text-xs text-white transition shadow-md"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden font-sans">
      
      {/* Top Pre-fill Linker Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-6 border-b border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">Master Admission Application (2026–27)</h2>
              <p className="text-[11px] text-slate-300">12-Section Master Student Ledger Form</p>
            </div>
          </div>

          {/* Quick Enquiry Autofill Input */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <Search className="w-3.5 h-3.5 text-amber-400 ml-2" />
            <input
              type="text"
              value={enquirySearchQuery}
              onChange={(e) => setEnquirySearchQuery(e.target.value)}
              placeholder="Enter Enquiry No or Mobile..."
              className="bg-transparent border-none text-xs text-white placeholder:text-slate-400 focus:outline-none w-44 sm:w-56 font-medium"
            />
            <button
              type="button"
              disabled={isSearchingEnquiry}
              onClick={() => handlePrefillFromEnquiry()}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSearchingEnquiry ? "Searching..." : "Auto-Fill"}
            </button>
          </div>
        </div>

        {prefillSuccessMsg && (
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{prefillSuccessMsg}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Step Pills Navigator */}
      <div className="bg-stone-50 border-b border-stone-200 p-3 overflow-x-auto flex gap-2">
        {stepsList.map((st, i) => (
          <button
            key={st.num}
            type="button"
            onClick={() => setCurrentStep(st.num)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              currentStep === st.num
                ? "bg-blue-950 text-white shadow-xs"
                : currentStep > st.num
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
              currentStep === st.num ? "bg-amber-400 text-slate-950" : currentStep > st.num ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-700"
            }`}>
              {currentStep > st.num ? "✓" : i + 1}
            </span>
            <span>{st.title}</span>
          </button>
        ))}
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmitApplication} className="p-6 sm:p-8 space-y-6">
        
        {/* ======================================================== */}
        {/* STEP 1: ADMISSION META */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 1: Admission &amp; Campus Choice</h3>
              <p className="text-xs text-stone-500">Institution, campus allocation, and applied academic grade</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Academic Session *</label>
                <select
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="2026-2027">2026–2027 (Active Intake)</option>
                  <option value="2027-2028">2027–2028 (Advance Booking)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Select Campus *</label>
                <select
                  value={form.campus_id}
                  onChange={(e) => setForm({ ...form, campus_id: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                  {campuses.length === 0 && <option value="">Main Campus (Burari, Delhi)</option>}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Class Applied For *</label>
                <select
                  value={form.class_applied}
                  onChange={(e) => setForm({ ...form, class_applied: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="Playgroup">Playgroup (Age 2+)</option>
                  <option value="Nursery">Nursery (Age 3+)</option>
                  <option value="LKG">LKG (Age 4+)</option>
                  <option value="UKG">UKG (Age 5+)</option>
                  <option value="Class 1">Class 1 (Age 6+)</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Admission Type *</label>
                <select
                  value={form.admission_type}
                  onChange={(e) => setForm({ ...form, admission_type: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="NEW_ADMISSION">New Admission</option>
                  <option value="TRANSFER">Transfer Admission (Other School)</option>
                  <option value="SIBLING">Sibling Admission (10% Concession)</option>
                  <option value="READMISSION">Re-admission</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Application Date</label>
                <input
                  type="date"
                  value={form.admission_date}
                  onChange={(e) => setForm({ ...form, admission_date: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Linked Enquiry No</label>
                <input
                  type="text"
                  value={form.enquiry_no}
                  readOnly
                  placeholder="Auto-linked if enquiry exists"
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl p-2.5 text-xs font-bold text-stone-600 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: STUDENT PERSONAL DETAILS */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 2: Student Personal Details</h3>
              <p className="text-xs text-stone-500">Legal name, date of birth, category, and identity details</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Aarav"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Middle Name</label>
                <input
                  type="text"
                  value={form.middle_name}
                  onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                  placeholder="Kumar"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Sharma"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Calculated Age (Auto)</label>
                <input
                  type="text"
                  readOnly
                  value={calculateAge(form.dob)}
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl p-2.5 text-xs font-bold text-blue-950"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Gender *</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Blood Group</label>
                <select
                  value={form.blood_group}
                  onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Social Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="GENERAL">General</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Aadhaar / UID Number</label>
                <input
                  type="text"
                  value={form.aadhaar_number}
                  onChange={(e) => setForm({ ...form, aadhaar_number: e.target.value })}
                  placeholder="12-digit UID"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: BIRTH DETAILS */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 3: Birth Certificate Details</h3>
              <p className="text-xs text-stone-500">Official birth registration for statutory record verification</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Birth Certificate No *</label>
                <input
                  type="text"
                  required
                  value={form.birth_certificate_no}
                  onChange={(e) => setForm({ ...form, birth_certificate_no: e.target.value })}
                  placeholder="e.g. MCD/2021/88921"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Issuing Authority *</label>
                <input
                  type="text"
                  value={form.birth_cert_issuing_authority}
                  onChange={(e) => setForm({ ...form, birth_cert_issuing_authority: e.target.value })}
                  placeholder="Municipal Corporation of Delhi"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={form.birth_cert_issue_date}
                  onChange={(e) => setForm({ ...form, birth_cert_issue_date: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Birth City</label>
                <input
                  type="text"
                  value={form.birth_city}
                  onChange={(e) => setForm({ ...form, birth_city: e.target.value })}
                  placeholder="Delhi"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Birth State</label>
                <input
                  type="text"
                  value={form.birth_state}
                  onChange={(e) => setForm({ ...form, birth_state: e.target.value })}
                  placeholder="Delhi"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Birth Country</label>
                <input
                  type="text"
                  value={form.birth_country}
                  onChange={(e) => setForm({ ...form, birth_country: e.target.value })}
                  placeholder="India"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: PARENTS & GUARDIAN */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Father Details */}
            <div className="space-y-3">
              <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-950" /> Father&apos;s Information
                </h4>
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                  <input
                    type="checkbox"
                    checked={form.is_father_primary}
                    onChange={(e) => setForm({ ...form, is_father_primary: e.target.checked })}
                    className="rounded text-blue-950"
                  />
                  <span>Primary Contact for App &amp; SMS</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Father&apos;s Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.father_name}
                    onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                    placeholder="Mr. Nitin Sharma"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={form.father_phone}
                    onChange={(e) => setForm({ ...form, father_phone: e.target.value, father_whatsapp: e.target.value })}
                    placeholder="9811102008"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.father_email}
                    onChange={(e) => setForm({ ...form, father_email: e.target.value })}
                    placeholder="father@example.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={form.father_occupation}
                    onChange={(e) => setForm({ ...form, father_occupation: e.target.value })}
                    placeholder="Service / Business"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Organization / Company</label>
                  <input
                    type="text"
                    value={form.father_organization}
                    onChange={(e) => setForm({ ...form, father_organization: e.target.value })}
                    placeholder="Company Name"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Annual Income</label>
                  <input
                    type="text"
                    value={form.father_annual_income}
                    onChange={(e) => setForm({ ...form, father_annual_income: e.target.value })}
                    placeholder="₹12,00,000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div className="space-y-3 pt-2">
              <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-950" /> Mother&apos;s Information
                </h4>
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                  <input
                    type="checkbox"
                    checked={form.is_mother_primary}
                    onChange={(e) => setForm({ ...form, is_mother_primary: e.target.checked })}
                    className="rounded text-blue-950"
                  />
                  <span>Primary Contact for App &amp; SMS</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Mother&apos;s Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.mother_name}
                    onChange={(e) => setForm({ ...form, mother_name: e.target.value })}
                    placeholder="Mrs. Priya Sharma"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={form.mother_phone}
                    onChange={(e) => setForm({ ...form, mother_phone: e.target.value, mother_whatsapp: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={form.mother_occupation}
                    onChange={(e) => setForm({ ...form, mother_occupation: e.target.value })}
                    placeholder="Professional / Homemaker"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Legal Guardian Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.has_legal_guardian}
                  onChange={(e) => setForm({ ...form, has_legal_guardian: e.target.checked })}
                  className="rounded text-blue-950"
                />
                <span>Child has a Legal Court-Appointed Guardian (Other than Parents)</span>
              </label>

              {form.has_legal_guardian && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl mt-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Guardian Name *</label>
                    <input
                      type="text"
                      value={form.guardian_name}
                      onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={form.guardian_relationship}
                      onChange={(e) => setForm({ ...form, guardian_relationship: e.target.value })}
                      placeholder="Uncle / Grandfather"
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Guardian Mobile</label>
                    <input
                      type="tel"
                      value={form.guardian_phone}
                      onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs font-semibold font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: ADDRESS & FAMILY */}
        {/* ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 5: Residential Address &amp; Family</h3>
              <p className="text-xs text-stone-500">Current residential address and transport distance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">House / Flat / Street Address *</label>
                <input
                  type="text"
                  required
                  value={form.current_address_line1}
                  onChange={(e) => setForm({ ...form, current_address_line1: e.target.value })}
                  placeholder="Flat 302, Royal Residency, Main Road"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Locality / Area *</label>
                <input
                  type="text"
                  required
                  value={form.current_locality}
                  onChange={(e) => setForm({ ...form, current_locality: e.target.value })}
                  placeholder="Burari"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">City</label>
                <input
                  type="text"
                  value={form.current_city}
                  onChange={(e) => setForm({ ...form, current_city: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={form.current_pincode}
                  onChange={(e) => setForm({ ...form, current_pincode: e.target.value })}
                  placeholder="110084"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Approx Distance from School (km)</label>
                <input
                  type="text"
                  value={form.distance_from_campus_km}
                  onChange={(e) => setForm({ ...form, distance_from_campus_km: e.target.value })}
                  placeholder="3.5 km"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 6: PREVIOUS SCHOOL (CLASS-AWARE) */}
        {/* ======================================================== */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 6: Previous School &amp; Academics</h3>
              <p className="text-xs text-stone-500">Class-aware academic history and transfer certificate records</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">Previous School Name</label>
                <input
                  type="text"
                  value={form.previous_school_name}
                  onChange={(e) => setForm({ ...form, previous_school_name: e.target.value })}
                  placeholder="Delhi Public School / St. Xavier's"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Board Affiliation</label>
                <select
                  value={form.previous_school_board}
                  onChange={(e) => setForm({ ...form, previous_school_board: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE / CISCE</option>
                  <option value="STATE">State Board</option>
                  <option value="IB">IB / Cambridge</option>
                  <option value="OTHER">Other Recognized Board</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Transfer Certificate (TC) Number</label>
                <input
                  type="text"
                  value={form.previous_tc_number}
                  onChange={(e) => setForm({ ...form, previous_tc_number: e.target.value })}
                  placeholder="TC/2026/0921"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Last Class Result / Percentage</label>
                <input
                  type="text"
                  value={form.previous_marks_percentage}
                  onChange={(e) => setForm({ ...form, previous_marks_percentage: e.target.value })}
                  placeholder="92%"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Reason for Leaving</label>
                <input
                  type="text"
                  value={form.previous_reason_for_leaving}
                  onChange={(e) => setForm({ ...form, previous_reason_for_leaving: e.target.value })}
                  placeholder="Relocation / Better curriculum"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 7: LANGUAGE & SIBLING DETAILS */}
        {/* ======================================================== */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 7: Language &amp; Sibling Concessions</h3>
              <p className="text-xs text-stone-500">Languages spoken and live linking of existing enrolled siblings for 10% waiver</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">First Language</label>
                <select
                  value={form.first_language}
                  onChange={(e) => setForm({ ...form, first_language: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Second Language</label>
                <select
                  value={form.second_language}
                  onChange={(e) => setForm({ ...form, second_language: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            {/* Sibling Live Linker */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-black text-stone-900 block">Existing Sibling in Crayon Box School?</strong>
                  <p className="text-[11px] text-stone-500">Links to the student master ledger and automatically applies 10% Sibling Fee Concession.</p>
                </div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-blue-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.has_sibling_in_school}
                    onChange={(e) => setForm({ ...form, has_sibling_in_school: e.target.checked })}
                    className="rounded text-blue-950"
                  />
                  <span>Yes, Sibling Enrolled</span>
                </label>
              </div>

              {form.has_sibling_in_school && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={siblingSearch}
                      onChange={(e) => handleSiblingSearch(e.target.value)}
                      placeholder="Type Sibling Name or Admission No..."
                      className="flex-1 bg-white border border-stone-200 rounded-xl p-2 text-xs font-semibold text-stone-900"
                    />
                  </div>

                  {siblingResults.length > 0 && (
                    <div className="bg-white border border-stone-200 rounded-xl shadow-md divide-y divide-stone-100 max-h-40 overflow-y-auto">
                      {siblingResults.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSibling(s)}
                          className="p-2.5 hover:bg-amber-50/60 cursor-pointer flex items-center justify-between text-xs transition"
                        >
                          <div>
                            <strong className="font-bold text-stone-900">{s.name}</strong>
                            <span className="text-[10px] text-stone-500 ml-2">({s.class_name})</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded">
                            {s.admission_no}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedSibling && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">
                          Linked Sibling: {selectedSibling.name} ({selectedSibling.admission_no}, {selectedSibling.class_name})
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                        10% Waiver Tagged
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 8: HEALTH & EMERGENCY */}
        {/* ======================================================== */}
        {currentStep === 8 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 8: Health, Allergies &amp; Emergency Contacts</h3>
              <p className="text-xs text-stone-500">Medical emergency details for child infirmary and safeguarding</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={form.medical_allergies}
                  onChange={(e) => setForm({ ...form, medical_allergies: e.target.value })}
                  placeholder="None / Peanut / Dust"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Family Doctor Name</label>
                <input
                  type="text"
                  value={form.doctor_name}
                  onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                  placeholder="Dr. A. K. Verma"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Doctor Phone</label>
                <input
                  type="tel"
                  value={form.doctor_phone}
                  onChange={(e) => setForm({ ...form, doctor_phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Emergency Contact 1 Name *</label>
                <input
                  type="text"
                  required
                  value={form.emergency_contact_1_name}
                  onChange={(e) => setForm({ ...form, emergency_contact_1_name: e.target.value })}
                  placeholder="Primary Emergency Contact"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Relationship *</label>
                <input
                  type="text"
                  required
                  value={form.emergency_contact_1_relation}
                  onChange={(e) => setForm({ ...form, emergency_contact_1_relation: e.target.value })}
                  placeholder="Father / Mother / Guardian"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Emergency Phone 1 *</label>
                <input
                  type="tel"
                  required
                  value={form.emergency_contact_1_phone}
                  onChange={(e) => setForm({ ...form, emergency_contact_1_phone: e.target.value })}
                  placeholder="9811102008"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 9: TRANSPORT & ESCORT PICKUPS */}
        {/* ======================================================== */}
        {currentStep === 9 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 9: Transport &amp; Gate Escort Passes</h3>
              <p className="text-xs text-stone-500">Live GPS bus route allocation and authorized pickup escort verification</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.transport_required}
                  onChange={(e) => setForm({ ...form, transport_required: e.target.checked })}
                  className="rounded text-blue-950"
                />
                <span>School AC Bus Transport Facility Required</span>
              </label>

              {form.transport_required && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Select Bus Route *</label>
                    <select
                      value={form.bus_route_id}
                      onChange={(e) => setForm({ ...form, bus_route_id: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                    >
                      <option value="">Select Route</option>
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bus_number} — {b.route_name}
                        </option>
                      ))}
                      {buses.length === 0 && <option value="BUS-01">BUS-01 — Burari Main Stand</option>}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Pickup Stop</label>
                    <input
                      type="text"
                      value={form.pickup_point}
                      onChange={(e) => setForm({ ...form, pickup_point: e.target.value })}
                      placeholder="Sant Nagar Main Stand"
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Drop Stop</label>
                    <input
                      type="text"
                      value={form.drop_point}
                      onChange={(e) => setForm({ ...form, drop_point: e.target.value })}
                      placeholder="Sant Nagar Main Stand"
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <strong className="text-xs font-black text-stone-900 block">Authorized Escort / Pickup Person</strong>
              <p className="text-[11px] text-stone-500">Designated person permitted to pick up the child from school gate.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Escort Full Name</label>
                  <input
                    type="text"
                    value={form.authorized_escort_1_name}
                    onChange={(e) => setForm({ ...form, authorized_escort_1_name: e.target.value })}
                    placeholder="Grandmother / Escort Name"
                    className="w-full bg-white border border-stone-200 rounded-xl p-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Escort Mobile</label>
                  <input
                    type="tel"
                    value={form.authorized_escort_1_phone}
                    onChange={(e) => setForm({ ...form, authorized_escort_1_phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-white border border-stone-200 rounded-xl p-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 10: ACTIVITIES & SPECIAL NEEDS */}
        {/* ======================================================== */}
        {currentStep === 10 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 10: Activities, Talents &amp; Special Support</h3>
              <p className="text-xs text-stone-500">Co-curricular inclinations and access-controlled accommodations</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Sports &amp; Athletics Interests</label>
                <input
                  type="text"
                  value={form.sports_talents.join(", ")}
                  onChange={(e) => setForm({ ...form, sports_talents: e.target.value.split(",").map((s) => s.trim()) })}
                  placeholder="Football, Swimming, Chess"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Creative Arts &amp; STEM Interests</label>
                <input
                  type="text"
                  value={form.arts_talents.join(", ")}
                  onChange={(e) => setForm({ ...form, arts_talents: e.target.value.split(",").map((s) => s.trim()) })}
                  placeholder="Music, Robotics, Painting"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 11: DOCUMENT CHECKLIST */}
        {/* ======================================================== */}
        {currentStep === 11 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 11: Statutory Document Checklist &amp; Neural OCR</h3>
              <p className="text-xs text-stone-500">Auto-verify demographic accuracy against uploaded IDs</p>
            </div>

            {/* Neural Document OCR Validator */}
            <AadhaarOcrValidator
              expectedStudentName={`${form.first_name} ${form.last_name}`.trim()}
              expectedDob={form.dob}
              expectedParentName={form.father_name || form.mother_name}
            />

            <div className="space-y-2 pt-2">
              {form.documents_checklist.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-950" />
                    <div>
                      <strong className="text-xs font-bold text-stone-900 block">{doc.name}</strong>
                      <span className="text-[10px] text-emerald-700 font-semibold">Ready for verification</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Attached
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 12: DECLARATION & SUBMIT */}
        {/* ======================================================== */}
        {currentStep === 12 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-base font-black text-stone-900">Step 12: Parent Declaration &amp; Submission</h3>
              <p className="text-xs text-stone-500">Statutory confirmation of supplied records</p>
            </div>

            <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4 text-xs text-stone-700 leading-relaxed">
              <strong className="font-black text-stone-900 block text-sm">Parent / Guardian Declaration:</strong>
              <p>
                I/We hereby confirm that all information provided in this admission form and the documents submitted are true, authentic, and correct to the best of our knowledge. I/We agree to abide by the rules, code of conduct, and policies of Crayon Box School.
              </p>

              <label className="flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  required
                  checked={form.parent_declaration_accepted}
                  onChange={(e) => setForm({ ...form, parent_declaration_accepted: e.target.checked })}
                  className="rounded text-blue-950 w-4 h-4"
                />
                <span>I accept the statutory admission declaration and terms of enrollment.</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : <div />}

          {currentStep < 12 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 font-bold text-xs text-white transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !form.parent_declaration_accepted}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs text-white transition flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Master Application...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Master Admission Application</span>
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
