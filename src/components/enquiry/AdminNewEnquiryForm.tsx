"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Phone, Mail, MapPin, Calendar, Clock,
  Building2, Sparkles, CheckCircle2, AlertCircle,
  FileText, ShieldCheck, Bus, Search, Plus, ArrowRight,
  RefreshCw, Check, Heart, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createInternalEnquiryAction,
  searchExistingSiblingStudentAction,
  InternalEnquiryInput
} from "@/app/actions/enquiry";

interface AdminNewEnquiryFormProps {
  onSuccess?: (enquiryId: string, enquiryNumber: string) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function AdminNewEnquiryForm({ onSuccess, onCancel, isModal = false }: AdminNewEnquiryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{ id: string; num: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // A. System
    academicSession: "2026-2027",
    institutionCode: "CBS",
    admissionClass: "Nursery",
    admissionType: "NEW",
    leadPriority: "HOT",

    // B. Child Demographics
    childFirstName: "",
    childMiddleName: "",
    childLastName: "",
    childDob: "2022-04-15",
    childGender: "Male",
    nationality: "Indian",
    bloodGroup: "O+",

    // C. Guardian 1
    primaryGuardianRelation: "FATHER",
    primaryGuardianName: "",
    primaryGuardianPhone: "",
    primaryGuardianWhatsapp: "",
    primaryGuardianEmail: "",
    primaryGuardianOccupation: "IT Professional",
    primaryGuardianCompany: "",
    primaryGuardianDesignation: "",

    // D. Guardian 2
    secondaryGuardianRelation: "MOTHER",
    secondaryGuardianName: "",
    secondaryGuardianPhone: "",
    secondaryGuardianEmail: "",
    secondaryGuardianOccupation: "Teacher / Professional",
    secondaryGuardianCompany: "",
    secondaryGuardianDesignation: "",

    // E. Address
    addressLine1: "",
    localityArea: "Burari Main",
    city: "Delhi",
    state: "Delhi",
    pincode: "110084",
    landmark: "",

    // F. Sibling
    hasSibling: false,
    siblingAdmissionNo: "",
    linkedSiblingStudentId: "",
    linkedSiblingName: "",

    // G. Prior History
    currentSchool: "",
    currentBoard: "Standard Early Framework",
    reasonForChange: "",
    streamPreference: "",
    secondLanguagePreference: "Hindi",
    specialTalents: "",

    // H. Parent Requirements
    transportRequired: false,
    pickupLocation: "",
    interestAreas: ["STEAM & Robotics", "Sports & Athletics"] as string[],

    // I. Campus Visit & Counselling
    visitRequested: true,
    visitDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    visitSlot: "10:30 AM - Morning Slot",
    assignedCounsellorName: "Pooja Verma (Admissions Lead)",
    counsellorNotes: "Parent enquired via phone / walk-in. Very keen on robotics and safe bus transit.",
    preferredContactChannel: "WHATSAPP",
    preferredContactTime: "Evening (4 PM - 7 PM)",

    // J. Lead Source
    enquirySource: "Campus Walk-in",
    referralDetails: ""
  });

  // Dynamic Age Computation
  const [calculatedAge, setCalculatedAge] = useState<{ years: number; months: number; text: string }>({
    years: 3,
    months: 11,
    text: "3 Yrs 11 Mos (Eligible for Nursery)"
  });

  useEffect(() => {
    if (!formData.childDob) return;
    const dob = new Date(formData.childDob);
    const cutoff = new Date("2026-03-31");
    if (isNaN(dob.getTime())) return;

    let yrs = cutoff.getFullYear() - dob.getFullYear();
    let mos = cutoff.getMonth() - dob.getMonth();
    if (cutoff.getDate() < dob.getDate()) mos--;
    if (mos < 0) {
      yrs--;
      mos += 12;
    }
    const txt = `${Math.max(0, yrs)} Yrs ${Math.max(0, mos)} Mos as on 31 Mar 2026`;
    setCalculatedAge({ years: yrs, months: mos, text: txt });
  }, [formData.childDob]);

  // Sibling Search State
  const [siblingSearchQuery, setSiblingSearchQuery] = useState("");
  const [siblingResults, setSiblingResults] = useState<any[]>([]);
  const [isSearchingSibling, setIsSearchingSibling] = useState(false);

  const handleSiblingSearch = async () => {
    if (!siblingSearchQuery.trim()) return;
    setIsSearchingSibling(true);
    const res = await searchExistingSiblingStudentAction(siblingSearchQuery);
    if (res.success) {
      setSiblingResults(res.students);
    }
    setIsSearchingSibling(false);
  };

  const handleLinkSibling = (student: any) => {
    setFormData(prev => ({
      ...prev,
      hasSibling: true,
      siblingAdmissionNo: student.admission_no,
      linkedSiblingStudentId: student.id,
      linkedSiblingName: `${student.first_name} ${student.last_name || ""} (${student.admission_no}) - ${student.class_name}`
    }));
    setSiblingResults([]);
  };

  const toggleInterest = (area: string) => {
    setFormData(prev => ({
      ...prev,
      interestAreas: prev.interestAreas.includes(area)
        ? prev.interestAreas.filter(a => a !== area)
        : [...prev.interestAreas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childFirstName || !formData.primaryGuardianName || !formData.primaryGuardianPhone) {
      alert("Please fill all mandatory fields (Child Name, Primary Guardian, and Phone).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: InternalEnquiryInput = {
        academicSession: formData.academicSession,
        institutionCode: formData.institutionCode,
        admissionClass: formData.admissionClass,
        admissionType: formData.admissionType,
        leadPriority: formData.leadPriority,

        childFirstName: formData.childFirstName,
        childMiddleName: formData.childMiddleName,
        childLastName: formData.childLastName,
        childDob: formData.childDob,
        childGender: formData.childGender,

        primaryGuardianRelation: formData.primaryGuardianRelation,
        primaryGuardianName: formData.primaryGuardianName,
        primaryGuardianPhone: formData.primaryGuardianPhone,
        primaryGuardianWhatsapp: formData.primaryGuardianWhatsapp || formData.primaryGuardianPhone,
        primaryGuardianEmail: formData.primaryGuardianEmail,
        primaryGuardianOccupation: formData.primaryGuardianOccupation,
        primaryGuardianCompany: formData.primaryGuardianCompany,
        primaryGuardianDesignation: formData.primaryGuardianDesignation,

        secondaryGuardianRelation: formData.secondaryGuardianRelation,
        secondaryGuardianName: formData.secondaryGuardianName,
        secondaryGuardianPhone: formData.secondaryGuardianPhone,
        secondaryGuardianEmail: formData.secondaryGuardianEmail,
        secondaryGuardianOccupation: formData.secondaryGuardianOccupation,
        secondaryGuardianCompany: formData.secondaryGuardianCompany,

        addressLine1: formData.addressLine1,
        localityArea: formData.localityArea,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark,

        hasSibling: formData.hasSibling,
        siblingAdmissionNo: formData.siblingAdmissionNo,

        currentSchool: formData.currentSchool,
        currentBoard: formData.currentBoard,
        reasonForChange: formData.reasonForChange,
        streamPreference: formData.streamPreference,
        secondLanguagePreference: formData.secondLanguagePreference,
        specialTalents: formData.specialTalents,

        transportRequired: formData.transportRequired,
        interestAreas: formData.interestAreas,

        visitRequested: formData.visitRequested,
        visitDate: formData.visitDate,
        visitSlot: formData.visitSlot,
        assignedCounsellorName: formData.assignedCounsellorName,
        counsellorNotes: formData.counsellorNotes,
        preferredContactChannel: formData.preferredContactChannel,
        preferredContactTime: formData.preferredContactTime,

        enquirySource: formData.enquirySource,
        referralDetails: formData.referralDetails
      };

      const res = await createInternalEnquiryAction(payload);
      if (res.success && res.enquiryNumber) {
        setSuccessMessage({ id: res.enquiryId, num: res.enquiryNumber });
        if (onSuccess) onSuccess(res.enquiryId, res.enquiryNumber);
      } else {
        alert("Failed to create enquiry: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 text-center space-y-6 max-w-2xl mx-auto font-sans">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Enquiry Recorded Successfully
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Reference No: <span className="text-indigo-600 font-mono">{successMessage.num}</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The candidate dossier has been added to the CRM pipeline. Automated WhatsApp welcome and calendar follow-ups have been queued.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={() => {
              setSuccessMessage(null);
              setFormData(prev => ({ ...prev, childFirstName: "", childLastName: "", primaryGuardianName: "", primaryGuardianPhone: "" }));
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Another Lead
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/admin/enquiries")}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Enquiries Pipeline
          </Button>
        </div>
      </div>
    );
  }

  const isSeniorGrade = !["Pre-Nursery", "Nursery", "KG / Prep", "Playschool"].includes(formData.admissionClass);

  return (
    <form onSubmit={handleSubmit} className={`bg-white space-y-8 font-sans ${isModal ? 'p-2 sm:p-4 border-0 shadow-none' : 'rounded-3xl border border-slate-200 p-6 md:p-10 shadow-xs'}`}>
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
              Internal ERP Intake
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-600">Session 2026-2027</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            New School Admission Enquiry Master
          </h2>
          <p className="text-xs text-slate-500">Complete 360° intake for walk-in parents, phone calls, and referrals</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={formData.leadPriority}
            onChange={e => setFormData({ ...formData, leadPriority: e.target.value })}
            className={`text-xs font-black px-3 py-2 rounded-xl border transition ${
              formData.leadPriority === "HOT"
                ? "bg-rose-50 border-rose-300 text-rose-700"
                : formData.leadPriority === "WARM"
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <option value="HOT">🔥 Priority: HOT (High Intent)</option>
            <option value="WARM">⚡ Priority: WARM (Exploring)</option>
            <option value="COLD">❄️ Priority: COLD (Long Term)</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION A & B: SYSTEM & CHILD DEMOGRAPHICS */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
          <User className="w-4 h-4 text-blue-600" /> A &amp; B. Child Bio &amp; Target Admission
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Applying For Class *</label>
            <select
              value={formData.admissionClass}
              onChange={e => setFormData({ ...formData, admissionClass: e.target.value })}
              className="w-full text-xs font-black px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-indigo-900 focus:bg-white transition"
            >
              <option value="Pre-Nursery">Pre-Nursery (Age 2+)</option>
              <option value="Nursery">Nursery (Age 3+)</option>
              <option value="KG / Prep">KG / Prep (Age 4+)</option>
              <option value="Grade 1">Grade 1 (Age 5+)</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Admission Type</label>
            <select
              value={formData.admissionType}
              onChange={e => setFormData({ ...formData, admissionType: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="NEW">New Admission</option>
              <option value="TRANSFER">Inter-School Transfer</option>
              <option value="SIBLING">Sibling Admission</option>
              <option value="READMISSION">Re-Admission</option>
            </select>
          </div>
        </div>

        {/* Child Names */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">First Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav"
              value={formData.childFirstName}
              onChange={e => setFormData({ ...formData, childFirstName: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Middle Name</label>
            <input
              type="text"
              placeholder="Optional"
              value={formData.childMiddleName}
              onChange={e => setFormData({ ...formData, childMiddleName: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Last Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sharma"
              value={formData.childLastName}
              onChange={e => setFormData({ ...formData, childLastName: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
            />
          </div>
        </div>

        {/* DOB, Age, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth *</label>
            <input
              type="date"
              required
              value={formData.childDob}
              onChange={e => setFormData({ ...formData, childDob: e.target.value })}
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Age as on 31 Mar 2026</label>
            <input
              type="text"
              readOnly
              value={calculatedAge.text}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
            <select
              value={formData.childGender}
              onChange={e => setFormData({ ...formData, childGender: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION C & D: GUARDIAN 1 & 2 */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
          <Phone className="w-4 h-4 text-emerald-600" /> C &amp; D. Guardian Information
        </div>

        {/* Primary Guardian */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase">Primary Contact Guardian *</span>
            <div className="flex gap-2">
              {["FATHER", "MOTHER", "LEGAL_GUARDIAN"].map(rel => (
                <label key={rel} className="flex items-center gap-1 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="primaryRel"
                    checked={formData.primaryGuardianRelation === rel}
                    onChange={() => setFormData({ ...formData, primaryGuardianRelation: rel })}
                  />
                  {rel}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.primaryGuardianName}
                onChange={e => setFormData({ ...formData, primaryGuardianName: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (WhatsApp) *</label>
              <input
                type="tel"
                required
                placeholder="9811102008"
                value={formData.primaryGuardianPhone}
                onChange={e => setFormData({ ...formData, primaryGuardianPhone: e.target.value, primaryGuardianWhatsapp: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={formData.primaryGuardianEmail}
                onChange={e => setFormData({ ...formData, primaryGuardianEmail: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Occupation / Profession</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer / Business"
                value={formData.primaryGuardianOccupation}
                onChange={e => setFormData({ ...formData, primaryGuardianOccupation: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Google India / Self Employed"
                value={formData.primaryGuardianCompany}
                onChange={e => setFormData({ ...formData, primaryGuardianCompany: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Secondary Guardian */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <span className="text-xs font-black text-slate-900 uppercase">Secondary Guardian (Optional)</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Sunita Sharma"
                value={formData.secondaryGuardianName}
                onChange={e => setFormData({ ...formData, secondaryGuardianName: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone</label>
              <input
                type="tel"
                placeholder="Optional"
                value={formData.secondaryGuardianPhone}
                onChange={e => setFormData({ ...formData, secondaryGuardianPhone: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Occupation</label>
              <input
                type="text"
                placeholder="e.g. Educator"
                value={formData.secondaryGuardianOccupation}
                onChange={e => setFormData({ ...formData, secondaryGuardianOccupation: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION E & F: ADDRESS & SIBLING INTELLIGENCE */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
          <MapPin className="w-4 h-4 text-purple-600" /> E &amp; F. Residential Address &amp; Sibling Linkage
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Locality / Sector / Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. House 42, Block C, Burari"
              value={formData.localityArea}
              onChange={e => setFormData({ ...formData, localityArea: e.target.value, addressLine1: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">PIN Code *</label>
            <input
              type="text"
              required
              placeholder="110084"
              value={formData.pincode}
              onChange={e => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
            />
          </div>
        </div>

        {/* Sibling Search */}
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-950 uppercase">Sibling Already Studying at Crayon Box?</span>
            <label className="flex items-center gap-2 text-xs font-bold text-purple-900 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasSibling}
                onChange={e => setFormData({ ...formData, hasSibling: e.target.checked })}
              />
              Yes, Sibling Enrolled
            </label>
          </div>

          {formData.hasSibling && (
            <div className="space-y-2 pt-2 border-t border-purple-200">
              {formData.linkedSiblingName ? (
                <div className="p-3 bg-white rounded-xl border border-purple-300 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-purple-900 block">{formData.linkedSiblingName}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Admission No: {formData.siblingAdmissionNo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, linkedSiblingName: "", linkedSiblingStudentId: "", siblingAdmissionNo: "" }))}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Unlink
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search enrolled sibling by student name or admission no..."
                      value={siblingSearchQuery}
                      onChange={e => setSiblingSearchQuery(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl border border-purple-300 bg-white w-full"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={handleSiblingSearch}
                      isLoading={isSearchingSibling}
                    >
                      Search
                    </Button>
                  </div>

                  {siblingResults.length > 0 && (
                    <div className="bg-white rounded-xl border border-purple-200 divide-y max-h-36 overflow-y-auto">
                      {siblingResults.map(s => (
                        <div key={s.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-purple-50 transition">
                          <div>
                            <strong className="text-slate-900">{s.first_name} {s.last_name}</strong> ({s.admission_no}) — {s.class_name}
                          </div>
                          <Button size="sm" variant="primary" type="button" onClick={() => handleLinkSibling(s)}>
                            Link
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION G & H: PRIOR SCHOOLING & REQUIREMENTS */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
          <FileText className="w-4 h-4 text-amber-600" /> G &amp; H. Academic Background &amp; Transport
        </div>

        {isSeniorGrade && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Previous / Current School</label>
              <input
                type="text"
                placeholder="e.g. Modern Public School"
                value={formData.currentSchool}
                onChange={e => setFormData({ ...formData, currentSchool: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Previous Board / Curriculum</label>
              <select
                value={formData.currentBoard}
                onChange={e => setFormData({ ...formData, currentBoard: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="National Standards">National Standards</option>
                <option value="State Framework">State Framework</option>
                <option value="International / IB">International / IB</option>
                <option value="Montessori / Playway">Montessori / Playway</option>
              </select>
            </div>
          </div>
        )}

        {/* Transport & Interests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">School Bus Transport</span>
              <span className="text-[10px] text-slate-500">Live GPS tracking and RFID escort verification</span>
            </div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.transportRequired}
                onChange={e => setFormData({ ...formData, transportRequired: e.target.checked })}
              />
              Required
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-900 block mb-2">Areas of Interest</span>
            <div className="flex flex-wrap gap-1.5">
              {["STEAM & Robotics", "Sports & Athletics", "Music & Performing Arts", "Coding & AI", "Languages"].map(area => {
                const isSelected = formData.interestAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleInterest(area)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                      isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "} {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION I & J: VISIT, COUNSELLING & MARKETING SOURCE */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
          <Clock className="w-4 h-4 text-rose-600" /> I &amp; J. Campus Tour &amp; Counsellor Action
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Campus Tour Date</label>
            <input
              type="date"
              value={formData.visitDate}
              onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tour Slot</label>
            <select
              value={formData.visitSlot}
              onChange={e => setFormData({ ...formData, visitSlot: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="09:30 AM - Morning Slot">09:30 AM - Morning Slot</option>
              <option value="11:30 AM - Mid-Day Slot">11:30 AM - Mid-Day Slot</option>
              <option value="02:30 PM - Afternoon Slot">02:30 PM - Afternoon Slot</option>
              <option value="04:00 PM - Evening Slot">04:00 PM - Evening Slot</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Lead Source *</label>
            <select
              value={formData.enquirySource}
              onChange={e => setFormData({ ...formData, enquirySource: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-emerald-800"
            >
              <option value="Campus Walk-in">Campus Walk-in</option>
              <option value="Phone Call">Phone Call / Helpline</option>
              <option value="Website Online">Website Online Form</option>
              <option value="Parent Referral">Parent Referral</option>
              <option value="Social Media">Instagram / FB Ad</option>
              <option value="Google Search">Google Maps / Search</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Counsellor Discussion Notes / Remarks</label>
          <textarea
            rows={3}
            value={formData.counsellorNotes}
            onChange={e => setFormData({ ...formData, counsellorNotes: e.target.value })}
            placeholder="Record discussion details, specific parent queries, fee sensitivity, or student background..."
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <Button size="md" variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          size="lg"
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md"
          rightIcon={<Check className="w-4 h-4 text-emerald-400" />}
        >
          Save &amp; Generate Enquiry Number
        </Button>
      </div>

    </form>
  );
}
