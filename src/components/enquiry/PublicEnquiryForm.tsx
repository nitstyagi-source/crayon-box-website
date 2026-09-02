"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles, Send, CheckCircle2, Phone, Mail, MapPin,
  Calendar, Users, Bus, Clock, ShieldCheck, ChevronRight,
  HelpCircle, ArrowRight, Download, RefreshCw, Check
} from "lucide-react";
import { createPublicEnquiryAction, PublicEnquiryInput } from "@/app/actions/enquiry";
import { Button } from "@/components/ui/Button";

interface PublicEnquiryFormProps {
  defaultInstitution?: string;
  defaultClass?: string;
  onSuccessRedirectUrl?: string;
}

export function PublicEnquiryForm({
  defaultInstitution = "CBS",
  defaultClass = "Class 1",
  onSuccessRedirectUrl
}: PublicEnquiryFormProps) {
  const [formData, setFormData] = useState<PublicEnquiryInput>({
    academicSession: "2026-2027",
    institutionCode: defaultInstitution,
    admissionClass: defaultClass,
    childFirstName: "",
    childMiddleName: "",
    childLastName: "",
    childDob: "2020-05-15",
    childGender: "Male",
    currentClass: "",
    currentSchool: "",
    currentBoard: "CBSE",
    primaryGuardianName: "",
    primaryGuardianRelation: "FATHER",
    primaryGuardianPhone: "",
    primaryGuardianWhatsapp: "",
    primaryGuardianEmail: "",
    localityArea: "",
    pincode: "110084",
    transportRequired: false,
    visitRequested: false,
    visitDate: "",
    visitSlot: "10:00 AM - 11:30 AM",
    interestAreas: ["Curriculum & NEP", "Fee Structure"],
    enquirySource: "Google Search",
    referralDetails: "",
    parentMessage: "",
    hasSibling: false,
    siblingAdmissionNo: "",
  });

  const [isSameWhatsapp, setIsSameWhatsapp] = useState(true);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    enquiryNumber: string;
    message: string;
  } | null>(null);

  // Capture UTM parameters from URL if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setFormData(prev => ({
        ...prev,
        utmSource: urlParams.get("utm_source") || prev.utmSource,
        utmMedium: urlParams.get("utm_medium") || prev.utmMedium,
        utmCampaign: urlParams.get("utm_campaign") || prev.utmCampaign,
        utmTerm: urlParams.get("utm_term") || prev.utmTerm,
        utmContent: urlParams.get("utm_content") || prev.utmContent,
        landingPage: window.location.pathname,
        referrerUrl: document.referrer || undefined,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
      }));
    }
  }, []);

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const targetDate = new Date("2026-03-31");
    let years = targetDate.getFullYear() - dob.getFullYear();
    let months = targetDate.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months };
  };

  const age = calculateAge(formData.childDob);

  const isEarlyYears =
    formData.admissionClass === "Pre-Nursery" ||
    formData.admissionClass === "Nursery" ||
    formData.admissionClass === "LKG" ||
    formData.admissionClass === "UKG";

  const handleInterestToggle = (area: string) => {
    setFormData(prev => {
      const exists = prev.interestAreas?.includes(area);
      const next = exists
        ? prev.interestAreas?.filter(a => a !== area)
        : [...(prev.interestAreas || []), area];
      return { ...prev, interestAreas: next };
    });
  };

  const handleSendOtp = () => {
    if (!formData.primaryGuardianPhone || formData.primaryGuardianPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsOtpSent(true);
    setOtpCode("1234"); // Preset demo OTP
  };

  const handleVerifyOtp = () => {
    if (otpCode === "1234" || otpCode.length === 4) {
      setIsOtpVerified(true);
    } else {
      alert("Invalid OTP code. Please enter 1234.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childFirstName || !formData.childLastName) {
      alert("Please enter Child's First and Last Name.");
      return;
    }
    if (!formData.primaryGuardianPhone || !formData.primaryGuardianEmail) {
      alert("Please provide Primary Parent Contact & Email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: PublicEnquiryInput = {
        ...formData,
        primaryGuardianWhatsapp: isSameWhatsapp ? formData.primaryGuardianPhone : formData.primaryGuardianWhatsapp
      };

      const res = await createPublicEnquiryAction(payload);
      if (res.success && res.enquiryNumber) {
        setSubmissionSuccess({
          enquiryNumber: res.enquiryNumber,
          message: res.message || "Your enquiry has been registered successfully!"
        });
      } else {
        alert(`Error submitting enquiry: ${res.error}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-emerald-500/30 shadow-2xl text-center space-y-6 max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Admission Enquiry Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Thank You, {formData.primaryGuardianName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Enquiry reference number: <strong className="font-mono text-indigo-700 text-base">{submissionSuccess.enquiryNumber}</strong>
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">Child Name:</span>
            <strong className="text-slate-900">{formData.childFirstName} {formData.childLastName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">Class Applied:</span>
            <strong className="text-slate-900">{formData.admissionClass}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">Session:</span>
            <strong className="text-slate-900">{formData.academicSession}</strong>
          </div>
          {formData.visitRequested && (
            <div className="flex justify-between text-indigo-700 font-bold">
              <span>Campus Visit:</span>
              <span>{formData.visitDate} ({formData.visitSlot})</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/campus-life"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
          >
            Explore Campus Tour &amp; Facilities
          </a>
          <button
            onClick={() => {
              setSubmissionSuccess(null);
              setIsOtpVerified(false);
              setIsOtpSent(false);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8 max-w-4xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Official Online Admission Enquiry 2026-2027
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          School Admission &amp; Campus Tour Enquiry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Fill in your details below for personalized fee structures, curriculum blueprints, bus transport routes, and guided campus walkthroughs.
        </p>
      </div>

      {/* SECTION 1: ADMISSION TARGET */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
          Target School &amp; Grade
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Academic Session *</label>
            <select
              value={formData.academicSession}
              onChange={e => setFormData({ ...formData, academicSession: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="2026-2027">Session 2026-2027 (Active)</option>
              <option value="2027-2028">Session 2027-2028 (Advance)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Admission Grade / Class *</label>
            <select
              value={formData.admissionClass}
              onChange={e => setFormData({ ...formData, admissionClass: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-indigo-900"
            >
              <option value="Pre-Nursery">Pre-Nursery (Age 2.5+)</option>
              <option value="Nursery">Nursery (Age 3+)</option>
              <option value="LKG">LKG / KG-1 (Age 4+)</option>
              <option value="UKG">UKG / KG-2 (Age 5+)</option>
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
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: CHILD BIO */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
          Child Demographics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Child First Name *</label>
            <input
              type="text"
              required
              value={formData.childFirstName}
              onChange={e => setFormData({ ...formData, childFirstName: e.target.value })}
              placeholder="Aarav"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Middle Name</label>
            <input
              type="text"
              value={formData.childMiddleName}
              onChange={e => setFormData({ ...formData, childMiddleName: e.target.value })}
              placeholder="Kumar"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={formData.childLastName}
              onChange={e => setFormData({ ...formData, childLastName: e.target.value })}
              placeholder="Sharma"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Date of Birth *</label>
              {age && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-200">
                  Age: {age.years} yrs {age.months} mos as on 31 Mar 2026
                </span>
              )}
            </div>
            <input
              type="date"
              required
              value={formData.childDob}
              onChange={e => setFormData({ ...formData, childDob: e.target.value })}
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Gender *</label>
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

        {/* Dynamic Previous School Fields (Hidden for Early Years) */}
        {!isEarlyYears && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Current / Previous School</label>
              <input
                type="text"
                value={formData.currentSchool}
                onChange={e => setFormData({ ...formData, currentSchool: e.target.value })}
                placeholder="St. Mary's Academy"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Current Class</label>
              <input
                type="text"
                value={formData.currentClass}
                onChange={e => setFormData({ ...formData, currentClass: e.target.value })}
                placeholder="Class 3"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Current Board / Curriculum</label>
              <select
                value={formData.currentBoard}
                onChange={e => setFormData({ ...formData, currentBoard: e.target.value })}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE / ISC</option>
                <option value="State Board">State Board</option>
                <option value="IB / Cambridge">IB / Cambridge</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: PARENT & CONTACT */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
          Parent &amp; Guardian Contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Parent / Guardian Full Name *</label>
            <input
              type="text"
              required
              value={formData.primaryGuardianName}
              onChange={e => setFormData({ ...formData, primaryGuardianName: e.target.value })}
              placeholder="Dr. Rajesh Sharma"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Relationship *</label>
            <select
              value={formData.primaryGuardianRelation}
              onChange={e => setFormData({ ...formData, primaryGuardianRelation: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="FATHER">Father</option>
              <option value="MOTHER">Mother</option>
              <option value="GUARDIAN">Legal Guardian</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Primary Mobile Number *</label>
            <div className="flex gap-2">
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.primaryGuardianPhone}
                onChange={e => setFormData({ ...formData, primaryGuardianPhone: e.target.value.replace(/\D/g, '') })}
                placeholder="9811102008"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
              {!isOtpVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shrink-0 cursor-pointer hover:bg-slate-800 transition"
                >
                  {isOtpSent ? "Resend OTP" : "Verify"}
                </button>
              )}
            </div>

            {/* OTP Verification Box */}
            {isOtpSent && !isOtpVerified && (
              <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-900">Enter OTP:</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="1234"
                    className="w-20 text-xs font-mono font-bold text-center px-2 py-1 bg-white border border-amber-300 rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 cursor-pointer"
                >
                  Confirm OTP
                </button>
              </div>
            )}

            {isOtpVerified && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <Check className="w-3.5 h-3.5" /> Mobile number verified via OTP
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.primaryGuardianEmail}
              onChange={e => setFormData({ ...formData, primaryGuardianEmail: e.target.value })}
              placeholder="rajesh.sharma@gmail.com"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Locality / Area *</label>
            <input
              type="text"
              required
              value={formData.localityArea}
              onChange={e => setFormData({ ...formData, localityArea: e.target.value })}
              placeholder="Sant Nagar, Burari"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">PIN Code *</label>
            <input
              type="text"
              required
              maxLength={6}
              value={formData.pincode}
              onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
              placeholder="110084"
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: SIBLINGS & PREFERENCES */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
          Preferences &amp; Information Areas
        </h3>

        {/* Sibling Check */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasSibling}
              onChange={e => setFormData({ ...formData, hasSibling: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
            />
            Does this child have a sibling currently studying in our school?
          </label>

          {formData.hasSibling && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Sibling Admission No / Roll No
                </label>
                <input
                  type="text"
                  value={formData.siblingAdmissionNo}
                  onChange={e => setFormData({ ...formData, siblingAdmissionNo: e.target.value })}
                  placeholder="e.g. CBS-ADM-1089"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 self-center">
                Linking sibling records qualifies for official Sibling Fee Concessions.
              </p>
            </div>
          )}
        </div>

        {/* Transport & Campus Visit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.transportRequired}
                onChange={e => setFormData({ ...formData, transportRequired: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-0"
              />
              <span>🚌 School Bus Transport Required</span>
            </label>
            <p className="text-[10px] text-slate-500">
              We operate GPS-tracked air-conditioned buses across Burari, Sant Nagar, Wazirabad, and North Delhi.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visitRequested}
                onChange={e => setFormData({ ...formData, visitRequested: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
              <span>🏫 Book a Guided Campus Tour</span>
            </label>
            {formData.visitRequested && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
                <select
                  value={formData.visitSlot}
                  onChange={e => setFormData({ ...formData, visitSlot: e.target.value })}
                  className="text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
                  <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM</option>
                  <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Select Interest Areas */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            What information are you most interested in? (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              "Curriculum & NEP",
              "Fee Structure",
              "Bus Transport Routes",
              "Sports & Martial Arts",
              "Smart Labs & Robotics",
              "Safety & Security",
              "Daycare & Dayboarding",
              "Sibling Concessions"
            ].map(topic => {
              const isSelected = formData.interestAreas?.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleInterestToggle(topic)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}{topic}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lead Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">How did you hear about us? *</label>
            <select
              value={formData.enquirySource}
              onChange={e => setFormData({ ...formData, enquirySource: e.target.value })}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="Google Search">Google Search</option>
              <option value="Instagram / Facebook">Instagram / Facebook</option>
              <option value="Parent Referral">Existing Parent Referral</option>
              <option value="School Hoarding / Banner">School Hoarding / Banner</option>
              <option value="Walk-in / Campus Proximity">Walk-in / Proximity</option>
              <option value="Word of Mouth">Word of Mouth</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Questions or Specific Notes</label>
            <input
              type="text"
              value={formData.parentMessage}
              onChange={e => setFormData({ ...formData, parentMessage: e.target.value })}
              placeholder="e.g. Please send the fee breakdown for Class 3"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: CONSENT & SUBMIT */}
      <div className="pt-4 border-t border-slate-200 space-y-4">
        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            required
            defaultChecked
            className="w-4 h-4 rounded text-emerald-600 focus:ring-0 mt-0.5"
          />
          <span>
            I agree to be contacted by Crayon Box School admissions representatives via Phone, WhatsApp, SMS, and Email regarding fee structures, syllabus, and scheduled campus tours.
          </span>
        </label>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full py-3.5 text-sm font-black shadow-lg"
          rightIcon={<Send className="w-4 h-4" />}
        >
          Submit Official Admission Enquiry
        </Button>
      </div>

    </form>
  );
}
