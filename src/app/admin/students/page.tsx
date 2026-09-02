"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users, Search, Filter, Download, Plus, ArrowRight,
  Eye, Phone, CreditCard, Sparkles, UserCheck, RefreshCw,
  Trash2, CheckCircle2, AlertTriangle, Building2, ShieldCheck,
  ChevronRight, ArrowLeft, Check, Lock, Archive, RotateCcw, CheckCheck, History, X,
  Printer, QrCode, Mail, MapPin, HeartPulse, Award, FileText
} from "lucide-react";
import { VANI_TRUST_INSTITUTIONS } from "@/lib/core/institution/trust-hierarchy";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { Student360ProfileModal } from "@/components/students/Student360ProfileModal";
import { StudentSuiteTabs, StudentSuiteTabType } from "@/components/students/StudentSuiteTabs";
import {
  getFilteredUniversalStudentsAction,
  enrollUniversalStudentTransactionalAction,
  deleteTestStudentTransactionalAction,
  archiveStudentAction,
  checkStudentDuplicateAction,
  readmitStudentAction,
  getFamilyHouseholdsAction,
  UniversalStudentEnrollmentInput,
  StudentFilterQuery
} from "@/app/actions/universal-student-actions";
import {
  generateTransferCertificateAction,
  getTransferCertificatesListAction,
  TcRecord
} from "@/app/actions/tc-generator-actions";

function UniversalStudentsDirectoryContent() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Tab Sync
  const tabParam = (searchParams.get("tab") || "roster").toLowerCase();
  const initialTab: StudentSuiteTabType =
    tabParam === "families" || tabParam === "family" ? "FAMILIES" :
    tabParam === "id-cards" || tabParam === "idcards" || tabParam === "id_cards" ? "ID_CARDS" :
    tabParam === "tc" || tabParam === "transfers" ? "TC" : "ROSTER";

  const [activeTab, setActiveTab] = useState<StudentSuiteTabType>(initialTab);

  useEffect(() => {
    const currentTabParam = (searchParams.get("tab") || "roster").toLowerCase();
    const resolved: StudentSuiteTabType =
      currentTabParam === "families" || currentTabParam === "family" ? "FAMILIES" :
      currentTabParam === "id-cards" || currentTabParam === "idcards" || currentTabParam === "id_cards" ? "ID_CARDS" :
      currentTabParam === "tc" || currentTabParam === "transfers" ? "TC" : "ROSTER";
    setActiveTab(resolved);
  }, [searchParams]);

  const handleTabChange = (newTab: StudentSuiteTabType) => {
    setActiveTab(newTab);
    const paramMap: Record<StudentSuiteTabType, string> = {
      ROSTER: "roster",
      FAMILIES: "families",
      ID_CARDS: "id-cards",
      TC: "tc"
    };
    router.replace(`/admin/students?tab=${paramMap[newTab]}`);
  };

  // -------------------------------------------------------------
  // TAB 1: ROSTER STATE & ACTIONS
  // -------------------------------------------------------------
  const [filters, setFilters] = useState<StudentFilterQuery>({
    institutionCode: currentInstitution,
    academicSession: "2026-2027",
    academicStage: "ALL",
    className: "ALL",
    sectionName: "ALL",
    status: "ACTIVE",
    search: "",
    showTestRecords: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalAll: 0,
    totalActive: 0,
    totalArchivedHub: 0,
    totalTransferred: 0,
    totalWithdrawn: 0,
    totalArchived: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [targetStudentForArchive, setTargetStudentForArchive] = useState<any>(null);
  const [archiveReason, setArchiveReason] = useState("Parent relocation");
  const [selectedStudentFor360, setSelectedStudentFor360] = useState<any>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => (prev.search === searchTerm ? prev : { ...prev, search: searchTerm }));
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Multi-Step Modal Wizard State (Step 1 to 4)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [isManualAdmissionNo, setIsManualAdmissionNo] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UniversalStudentEnrollmentInput>({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "2016-05-15",
    gender: "Male",
    bloodGroup: "O+",
    nationality: "Indian",
    category: "General",
    aadhaarNo: "",
    isTestRecord: false,

    institutionCode: currentInstitution === "ALL" ? "CBS" : currentInstitution,
    academicSession: "2026-2027",
    academicStage: selectedInstitutionObj?.institutionType === "PRE_SCHOOL" ? "FOUNDATION" : "PRIMARY",
    className: selectedInstitutionObj?.institutionType === "PRE_SCHOOL" ? "Nursery" : "Class 4",
    sectionName: "A",
    rollNumber: "1",
    admissionNumber: "",
    admissionDate: new Date().toISOString().split("T")[0],

    parentName: "",
    parentRelationship: "FATHER",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: "",
    parentAddress: "",
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, institutionCode: currentInstitution }));
    setFormData(prev => ({
      ...prev,
      institutionCode: currentInstitution === "ALL" ? "CBS" : currentInstitution,
      academicStage: selectedInstitutionObj?.institutionType === "PRE_SCHOOL" ? "FOUNDATION" : "PRIMARY",
      className: selectedInstitutionObj?.institutionType === "PRE_SCHOOL" ? "Nursery" : "Class 4",
    }));
  }, [currentInstitution, selectedInstitutionObj]);

  const fetchStudents = async () => {
    setIsLoading(true);
    const res = await getFilteredUniversalStudentsAction(filters);
    if (res.success) {
      setStudents(res.data);
      if (res.counts) {
        setCounts(res.counts);
      }
    } else {
      setStudents([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const getClassOptionsForStage = (stage: string, instCode: string) => {
    if (instCode === "AS" || instCode === "CBPS" || stage === "FOUNDATION") {
      return [
        { value: "Pre-Nursery", label: "Pre-Nursery" },
        { value: "Nursery", label: "Nursery" },
        { value: "LKG", label: "LKG" },
        { value: "UKG", label: "UKG" },
        { value: "Class 1", label: "Class 1" },
        { value: "Class 2", label: "Class 2" },
      ];
    }
    if (stage === "PRIMARY") {
      return [
        { value: "Class 3", label: "Class 3" },
        { value: "Class 4", label: "Class 4" },
        { value: "Class 5", label: "Class 5" },
      ];
    }
    if (stage === "MIDDLE") {
      return [
        { value: "Class 6", label: "Class 6" },
        { value: "Class 7", label: "Class 7" },
        { value: "Class 8", label: "Class 8" },
      ];
    }
    if (stage === "SECONDARY") {
      return [
        { value: "Class 9", label: "Class 9" },
        { value: "Class 10", label: "Class 10" },
      ];
    }
    return [
      { value: "Class 11", label: "Class 11" },
      { value: "Class 12", label: "Class 12" },
    ];
  };

  const handleNextStep1 = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dob) {
      alert("Please fill in Student First Name, Last Name and Date of Birth.");
      return;
    }
    if (formData.parentPhone && formData.parentPhone.length >= 10) {
      const dupRes = await checkStudentDuplicateAction(
        formData.firstName,
        formData.lastName,
        formData.dob,
        formData.parentPhone
      );
      if (dupRes.success && (dupRes.hasDuplicateStudent || dupRes.hasExistingFamily)) {
        setDuplicateWarning(dupRes);
      } else {
        setDuplicateWarning(null);
      }
    }
    setWizardStep(2);
  };

  const handleNextStep2 = () => {
    if (!formData.institutionCode || !formData.className || !formData.sectionName) {
      alert("Please select the Institution, Class and Section.");
      return;
    }
    setWizardStep(3);
  };

  const handleNextStep3 = () => {
    if (!formData.parentName || !formData.parentPhone) {
      alert("Please fill in Primary Guardian Name and Phone Number.");
      return;
    }
    setWizardStep(4);
  };

  const handleCompleteEnrollment = async () => {
    setIsSubmitting(true);
    const res = await enrollUniversalStudentTransactionalAction(formData);
    if (res.success) {
      setIsEnrollModalOpen(false);
      setWizardStep(1);
      setDuplicateWarning(null);
      setIsManualAdmissionNo(false);
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "2016-05-15",
        gender: "Male",
        bloodGroup: "O+",
        nationality: "Indian",
        category: "General",
        aadhaarNo: "",
        isTestRecord: false,

        institutionCode: currentInstitution === "ALL" ? "CBS" : currentInstitution,
        academicSession: "2026-2027",
        academicStage: selectedInstitutionObj?.institutionType === "PRE_SCHOOL" ? "FOUNDATION" : "PRIMARY",
        className: selectedInstitutionObj?.institutionType === "PRE_SCHOOL" ? "Nursery" : "Class 4",
        sectionName: "A",
        rollNumber: "1",
        admissionNumber: "",
        admissionDate: new Date().toISOString().split("T")[0],

        parentName: "",
        parentRelationship: "FATHER",
        parentPhone: "",
        parentEmail: "",
        parentOccupation: "",
        parentAddress: "",
      });
      fetchStudents();
    } else {
      alert(`Enrollment Failed: ${res.error}`);
    }
    setIsSubmitting(false);
  };

  const handleDeleteTestStudent = async (studentId: string) => {
    await deleteTestStudentTransactionalAction(studentId);
    fetchStudents();
  };

  // Re-Admission State
  const [isReadmitModalOpen, setIsReadmitModalOpen] = useState(false);
  const [targetStudentForReadmit, setTargetStudentForReadmit] = useState<any>(null);
  const [readmitForm, setReadmitForm] = useState({
    institutionCode: "CBS",
    academicSession: "2026-2027",
    className: "Class 3",
    sectionName: "A",
    academicStage: "PRIMARY",
    admissionNumber: "",
    admissionDate: new Date().toISOString().split("T")[0],
    remarks: "Student re-admitted to active roster."
  });
  const [isSubmittingReadmit, setIsSubmittingReadmit] = useState(false);
  const [readmitToastMsg, setReadmitToastMsg] = useState<string | null>(null);

  const handleConfirmArchive = async () => {
    if (targetStudentForArchive) {
      await archiveStudentAction(targetStudentForArchive.id, archiveReason);
      setIsArchiveModalOpen(false);
      setTargetStudentForArchive(null);
      fetchStudents();
    }
  };

  const handleOpenReadmitModal = (row: any) => {
    setTargetStudentForReadmit(row);
    setReadmitForm({
      institutionCode: row.institution_code || (currentInstitution === "ALL" ? "CBS" : currentInstitution),
      academicSession: "2026-2027",
      className: row.class_name || "Class 3",
      sectionName: row.section_name || "A",
      academicStage: row.academic_stage || "PRIMARY",
      admissionNumber: row.admission_number || row.admission_no || "",
      admissionDate: new Date().toISOString().split("T")[0],
      remarks: `Student re-admitted after previous departure period (Session ${row.academic_session || "2025-2026"}).`
    });
    setIsReadmitModalOpen(true);
  };

  const handleConfirmReadmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForReadmit) return;

    setIsSubmittingReadmit(true);
    const res = await readmitStudentAction({
      studentId: targetStudentForReadmit.id,
      institutionCode: readmitForm.institutionCode,
      academicSession: readmitForm.academicSession,
      className: readmitForm.className,
      sectionName: readmitForm.sectionName,
      academicStage: readmitForm.academicStage,
      admissionNumber: readmitForm.admissionNumber,
      admissionDate: readmitForm.admissionDate,
      remarks: readmitForm.remarks
    });
    setIsSubmittingReadmit(false);

    if (res.success) {
      setReadmitToastMsg(res.message || "Student re-admitted successfully!");
      setIsReadmitModalOpen(false);
      setTargetStudentForReadmit(null);
      fetchStudents();
      setTimeout(() => setReadmitToastMsg(null), 6000);
    } else {
      alert(`Error re-admitting student: ${res.error}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: FAMILIES & SIBLINGS STATE
  // -------------------------------------------------------------
  const [families, setFamilies] = useState<any[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState(false);
  const [familySearchTerm, setFamilySearchTerm] = useState("");

  const fetchFamilies = async () => {
    setFamiliesLoading(true);
    const res = await getFamilyHouseholdsAction({
      search: familySearchTerm,
      institutionCode: currentInstitution
    });
    if (res.success) {
      setFamilies(res.data);
    }
    setFamiliesLoading(false);
  };

  useEffect(() => {
    if (activeTab === "FAMILIES") {
      fetchFamilies();
    }
  }, [activeTab, familySearchTerm, currentInstitution]);

  // -------------------------------------------------------------
  // TAB 3: ID CARDS STATE
  // -------------------------------------------------------------
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<any>(null);
  const [idCardLayout, setIdCardLayout] = useState<"vertical" | "horizontal">("vertical");
  const [is8UpMode, setIs8UpMode] = useState(false);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentForIdCard) {
      setSelectedStudentForIdCard(students[0]);
    }
  }, [students]);

  // -------------------------------------------------------------
  // TAB 4: TRANSFER CERTIFICATES STATE
  // -------------------------------------------------------------
  const [tcCertificates, setTcCertificates] = useState<TcRecord[]>([]);
  const [selectedTc, setSelectedTc] = useState<TcRecord | null>(null);
  const [tcLoading, setTcLoading] = useState(false);
  const [isTcSubmitting, setIsTcSubmitting] = useState(false);

  // Form State for TC
  const [tcStudentName, setTcStudentName] = useState("Rohan Singhal");
  const [tcAdmissionNo, setTcAdmissionNo] = useState("ADM-2024-0089");
  const [tcFatherName, setTcFatherName] = useState("Mr. Vikram Singhal");
  const [tcMotherName, setTcMotherName] = useState("Mrs. Anita Singhal");
  const [tcDob, setTcDob] = useState("2014-08-15");
  const [tcAdmissionDate, setTcAdmissionDate] = useState("2024-04-01");
  const [tcClassLastAttended, setTcClassLastAttended] = useState("Class 6-A");
  const [tcReasonForLeaving, setTcReasonForLeaving] = useState("Parents relocated to Bangalore for corporate transfer.");
  const [tcAnnualResult, setTcAnnualResult] = useState("Promoted to Class 7 (Passed Term 2 Examinations)");

  const fetchTcList = async () => {
    setTcLoading(true);
    const res = await getTransferCertificatesListAction();
    if (res.success) {
      setTcCertificates(res.certificates);
      if (res.certificates.length > 0 && !selectedTc) {
        setSelectedTc(res.certificates[0]);
      }
    }
    setTcLoading(false);
  };

  useEffect(() => {
    if (activeTab === "TC") {
      fetchTcList();
    }
  }, [activeTab]);

  const handleGenerateTc = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTcSubmitting(true);
    try {
      const res = await generateTransferCertificateAction({
        studentName: tcStudentName,
        admissionNo: tcAdmissionNo,
        fatherName: tcFatherName,
        motherName: tcMotherName,
        dob: tcDob,
        admissionDate: tcAdmissionDate,
        classLastAttended: tcClassLastAttended,
        reasonForLeaving: tcReasonForLeaving,
        annualResult: tcAnnualResult
      });

      if (res.success) {
        alert(res.message);
        fetchTcList();
        setSelectedTc(res.tc);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsTcSubmitting(false);
    }
  };

  const handleSelectStudentForTc = (stu: any) => {
    setTcStudentName(`${stu.first_name} ${stu.last_name}`);
    setTcAdmissionNo(stu.admission_number || stu.admission_no || "");
    setTcFatherName(stu.guardian_first ? `${stu.guardian_first} ${stu.guardian_last || ""}` : "Father/Guardian");
    setTcMotherName(stu.mother_name || "Mother");
    setTcDob(stu.dob ? String(stu.dob).split("T")[0] : "2015-01-01");
    setTcAdmissionDate(stu.admission_date ? String(stu.admission_date).split("T")[0] : "2024-04-01");
    setTcClassLastAttended(`${stu.class_name || "Class 5"} (${stu.section_name || "A"})`);
  };

  // -------------------------------------------------------------
  // ROSTER TABLE COLUMNS
  // -------------------------------------------------------------
  const columns = [
    {
      key: "student",
      header: "Student & Universal ID",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs overflow-hidden border border-slate-200">
            {row.photo_url ? (
              <img src={row.photo_url} alt={row.first_name} className="w-full h-full object-cover" />
            ) : (
              <span>{row.first_name?.[0]}{row.last_name?.[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 block text-sm">
                {row.first_name} {row.middle_name ? `${row.middle_name} ` : ""}{row.last_name}
              </span>
              {row.is_test_record && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  TEST
                </span>
              )}
            </div>
            <span className="text-indigo-600 font-mono font-bold text-[10px]">
              {row.universal_id || `STU-VET-${row.id.slice(0, 6).toUpperCase()}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "admission_no",
      header: "Admission Number",
      render: (row: any) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.admission_number || "N/A"}
        </span>
      ),
    },
    {
      key: "enrollment",
      header: "School & Stage",
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">
            {row.institution_code} • {row.academic_stage || "PRIMARY"}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">
            {row.class_name || "Class Unallocated"} ({row.section_name || "A"})
          </span>
        </div>
      ),
    },
    {
      key: "transport",
      header: "Transport Mode",
      render: (row: any) => (
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 inline-flex items-center gap-1">
          🚌 {row.transport_mode ? row.transport_mode.replace("_", " ") : "SCHOOL BUS"}
        </span>
      ),
    },
    {
      key: "parent",
      header: "Family / Guardian",
      render: (row: any) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">
            {row.guardian_first ? `${row.guardian_first} ${row.guardian_last}` : row.family_name || "Primary Contact"}
          </span>
          <span className="text-slate-500 text-[10px]">📞 {row.guardian_phone || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Student Status",
      render: (row: any) => {
        const subStatus = row.subStatus || (row.student_status === "TRANSFERRED" || row.tc_number ? "TRANSFERRED" : row.student_status === "WITHDRAWN" ? "WITHDRAWN" : row.student_status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE");

        if (subStatus === "TRANSFERRED") {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-purple-50 text-purple-700 border-purple-200 inline-flex items-center gap-1 w-fit">
                <span>🔄</span> Transferred
              </span>
              {row.tc_number ? (
                <span className="text-[10px] text-purple-700 font-mono font-medium flex items-center gap-0.5">
                  <span>📜</span> {row.tc_number}
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-medium">TC Generated</span>
              )}
            </div>
          );
        }
        if (subStatus === "WITHDRAWN") {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1 w-fit">
                <span>⚠️</span> Withdrawn
              </span>
              <span className="text-[9px] text-rose-500 font-medium">Admission Cancelled</span>
            </div>
          );
        }
        if (subStatus === "ARCHIVED") {
          return (
            <div className="flex flex-col gap-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-slate-100 text-slate-600 border-slate-300 inline-flex items-center gap-1 w-fit">
                <span>📁</span> Archived
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Administrative</span>
            </div>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        );
      },
    },
    {
      key: "dues",
      header: "Fee Ledger / Dues",
      render: (row: any) => {
        const pending = Number(row.pending_balance || 0);
        if (pending > 0) {
          return (
            <Link href="/admin/finance/collections" title="Click to Collect Fee in Finance POS">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-300 inline-flex items-center gap-1 hover:bg-amber-100 transition cursor-pointer">
                <span>⚠️</span> ₹{pending.toLocaleString("en-IN")} Due
              </span>
            </Link>
          );
        }
        return (
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
            <span className="text-emerald-500">✓</span> Cleared
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.subStatus !== "ACTIVE" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenReadmitModal(row)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Re-Admit
            </Button>
          )}

          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setSelectedStudentFor360(row)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Dossier
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setSelectedStudentForIdCard(row);
              handleTabChange("ID_CARDS");
            }}
            title="Print ID Card"
            className="text-purple-600 hover:bg-purple-50"
          >
            <CreditCard className="w-3.5 h-3.5" />
          </Button>
          
          {row.is_test_record ? (
            <button
              onClick={() => handleDeleteTestStudent(row.id)}
              title="Delete Test Student (Permanent Cleanup)"
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : row.subStatus === "ACTIVE" ? (
            <button
              onClick={() => {
                setTargetStudentForArchive(row);
                setIsArchiveModalOpen(true);
              }}
              title="Archive / Deactivate Student"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <Archive className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Re-Admission Toast Alert */}
      {readmitToastMsg && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="text-xs font-bold">{readmitToastMsg}</span>
          </div>
          <button onClick={() => setReadmitToastMsg(null)} className="text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Student &amp; Family 360 Lifecycle Master
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">
              {activeTab === "ROSTER" ? `${students.length} Enrolled in Scope` :
               activeTab === "FAMILIES" ? `${families.length} Household Units` :
               activeTab === "ID_CARDS" ? `${students.length} Smart Badges Ready` :
               `${tcCertificates.length} Official TCs Issued`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Universal Student &amp; Family Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Permanent universal student identities, household relations, ID smart-badges, and official transfer certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === "ROSTER") fetchStudents();
              else if (activeTab === "FAMILIES") fetchFamilies();
              else if (activeTab === "TC") fetchTcList();
            }}
            isLoading={isLoading || familiesLoading || tcLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Live DB
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => { setWizardStep(1); setIsEnrollModalOpen(true); }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Enroll New Student
          </Button>
        </div>
      </div>

      {/* 🌟 PERSISTENT LIFECYCLE MASTER NAVIGATION TABS */}
      <StudentSuiteTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={{
          activeStudents: counts.totalActive || students.length,
          totalFamilies: families.length || 0,
          activeIdCards: students.length || 0,
          issuedTc: tcCertificates.length || counts.totalTransferred || 0
        }}
      />

      {/* ========================================================================= */}
      {/* TAB 1: STUDENT ROSTER (360°) */}
      {/* ========================================================================= */}
      {activeTab === "ROSTER" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Segmented Status Category Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: "ACTIVE" }))}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
                filters.status === "ACTIVE"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filters.status === "ACTIVE" ? "bg-white" : "bg-emerald-500"}`} />
              Active Enrolled Students
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filters.status === "ACTIVE" ? "bg-emerald-700 text-emerald-100" : "bg-slate-100 text-slate-600"
              }`}>
                {counts.totalActive}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: "ARCHIVED_HUB" }))}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
                filters.status === "ARCHIVED_HUB"
                  ? "bg-slate-800 text-white border-slate-800 shadow-slate-200"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span>📁</span>
              Archived &amp; Departed Hub
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filters.status === "ARCHIVED_HUB" ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"
              }`}>
                {counts.totalArchivedHub}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: "TRANSFERRED" }))}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
                filters.status === "TRANSFERRED"
                  ? "bg-purple-600 text-white border-purple-600 shadow-purple-200"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span>📜</span>
              TC Generated (Transferred)
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filters.status === "TRANSFERRED" ? "bg-purple-700 text-purple-100" : "bg-slate-100 text-slate-600"
              }`}>
                {counts.totalTransferred}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: "WITHDRAWN" }))}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
                filters.status === "WITHDRAWN"
                  ? "bg-rose-600 text-white border-rose-600 shadow-rose-200"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span>⚠️</span>
              Withdrawn Students
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filters.status === "WITHDRAWN" ? "bg-rose-700 text-rose-100" : "bg-slate-100 text-slate-600"
              }`}>
                {counts.totalWithdrawn}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: "ALL" }))}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap border shadow-2xs ${
                filters.status === "ALL"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span>🌐</span>
              All Historical Master Records
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                filters.status === "ALL" ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 text-slate-600"
              }`}>
                {counts.totalAll}
              </span>
            </button>
          </div>

          {/* Search & Academic Filter Bar */}
          <Card className="p-4 sm:p-5 bg-white shadow-xs border-slate-200/80 rounded-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Universal Search Input */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search name, universal ID, admission no, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {/* Institution Filter */}
              <div>
                <select
                  value={filters.institutionCode}
                  onChange={(e) => setFilters(prev => ({ ...prev, institutionCode: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Campuses (Trust-Wide)</option>
                  <option value="CBS">CBS (K-12 Senior Campus)</option>
                  <option value="AVM">AVM (K-12 Senior Campus)</option>
                  <option value="AS">AS (Kindergarten Montessori)</option>
                  <option value="CBPS">CBPS (Pre-School Foundation)</option>
                </select>
              </div>

              {/* Stage Filter */}
              <div>
                <select
                  value={filters.academicStage}
                  onChange={(e) => setFilters(prev => ({ ...prev, academicStage: e.target.value, className: "ALL" }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Stages</option>
                  <option value="FOUNDATION">Foundation (Early Years)</option>
                  <option value="PRIMARY">Primary (Grades 3-5)</option>
                  <option value="MIDDLE">Middle (Grades 6-8)</option>
                  <option value="SECONDARY">Secondary (Grades 9-10)</option>
                  <option value="SENIOR_SECONDARY">Senior Sec (Grades 11-12)</option>
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <select
                  value={filters.className}
                  onChange={(e) => setFilters(prev => ({ ...prev, className: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Classes</option>
                  {getClassOptionsForStage(filters.academicStage || "ALL", filters.institutionCode || "CBS").map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Main Student Data Table */}
          <DataTable
            title={`${filters.status === "ACTIVE" ? "Active Students Roster" : filters.status === "ARCHIVED_HUB" ? "Archived & Departed Students Hub" : filters.status === "TRANSFERRED" ? "Transferred Students (TC Records)" : filters.status === "WITHDRAWN" ? "Withdrawn Students" : "Universal Student Master List"}`}
            subtitle="Universal permanent student registry linked with academic enrollment history"
            columns={columns}
            data={students}
            emptyTitle="No Students Found in Selected Scope"
            emptyDescription="Try adjusting your search query, status filters, or campus selector."
            addLabel="Enroll Student"
            onAddFirst={() => { setWizardStep(1); setIsEnrollModalOpen(true); }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FAMILY 360° & SIBLINGS MASTER */}
      {/* ========================================================================= */}
      {activeTab === "FAMILIES" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Family Search & Actions */}
          <Card className="p-5 bg-white shadow-xs border-slate-200/80 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search household name, guardian phone, student, address..."
                value={familySearchTerm}
                onChange={(e) => setFamilySearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setWizardStep(1); setIsEnrollModalOpen(true); }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Enroll New Family Student
              </Button>
            </div>
          </Card>

          {/* Families Grid */}
          {familiesLoading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading Registered Households &amp; Sibling Trees...</p>
            </div>
          ) : families.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-800">No Family Households Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No registered family units match your filter. Households are automatically grouped and linked when students share a common parent or phone number.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {families.map((fam) => {
                const children = fam.children || [];
                const isMultiChild = children.length > 1;

                return (
                  <div
                    key={fam.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4 hover:shadow-md transition"
                  >
                    {/* Household Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 font-black text-sm shrink-0 shadow-2xs">
                          {fam.first_name?.[0]}{fam.last_name?.[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">
                              {fam.first_name} {fam.last_name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {fam.relationship || "GUARDIAN"}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 font-semibold">
                            {fam.family_code || `FAM-ID-${fam.id.substring(0, 8)}`}
                          </span>
                        </div>
                      </div>

                      {isMultiChild && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 shadow-2xs">
                          <span>👥</span> {children.length} Siblings Enrolled
                        </span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Primary Contact</span>
                        <strong className="text-slate-800 font-semibold">📞 {fam.phone || "N/A"}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Occupation</span>
                        <strong className="text-slate-800 font-semibold">💼 {fam.occupation || "General"}</strong>
                      </div>
                      {fam.email && (
                        <div className="col-span-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Email</span>
                          <span className="text-slate-700 font-medium truncate block">✉️ {fam.email}</span>
                        </div>
                      )}
                      {fam.address && (
                        <div className="col-span-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Residential Address</span>
                          <span className="text-slate-700 font-medium text-[11px] block">📍 {fam.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Linked Enrolled Children */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                        Enrolled Wards &amp; Sibling Connections ({children.length})
                      </span>

                      {children.length === 0 ? (
                        <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic">
                          No active student profiles currently linked
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {children.map((child: any) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {child.first_name?.[0]}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 text-xs block">
                                    {child.first_name} {child.last_name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {child.class_name || "Class"} ({child.section_name || "A"}) • {child.institution_code || "CBS"} • Roll #{child.admission_no || "ADM"}
                                  </span>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudentFor360(child)}
                                leftIcon={<Eye className="w-3 h-3" />}
                                className="text-[11px] font-bold"
                              >
                                View Dossier
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ID CARD & ESCORT PASS STUDIO */}
      {/* ========================================================================= */}
      {activeTab === "ID_CARDS" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Smart PVC Card &amp; Escort Pass Engine
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Student ID Smart-Card Studio
              </h2>
              <p className="text-xs text-blue-200/80 max-w-xl">
                Generate RFID/QR-enabled high-resolution smart badges, parent pickup escort passes, and printable 8-up batch sheets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print ID Sheet
              </button>
            </div>
          </div>

          {/* Student Card Inspector & Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Student Selector */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Select Enrolled Student
              </h3>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {students.map((stu) => (
                  <button
                    key={stu.id}
                    onClick={() => setSelectedStudentForIdCard(stu)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedStudentForIdCard?.id === stu.id
                        ? "bg-indigo-50/70 border-indigo-300 shadow-2xs"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {stu.first_name?.[0]}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 text-xs block truncate">
                          {stu.first_name} {stu.last_name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block truncate">
                          {stu.class_name} ({stu.section_name}) • {stu.admission_number}
                        </span>
                      </div>
                    </div>
                    {selectedStudentForIdCard?.id === stu.id && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Middle & Right: Live PVC Card Preview */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" /> Live Smart ID Card Preview (CR-80 Format)
                </h3>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                  300 DPI High-Def Vector
                </span>
              </div>

              {selectedStudentForIdCard ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
                  {/* Front of Card */}
                  <div className="w-[270px] h-[420px] bg-white rounded-3xl border-2 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between text-slate-900">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-3 text-center space-y-0.5">
                      <div className="text-[8px] font-bold text-amber-300 uppercase tracking-widest">
                        Recognized &amp; Registered Institution
                      </div>
                      <h4 className="text-xs font-black tracking-tight uppercase">
                        {selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
                      </h4>
                      <div className="text-[8px] text-blue-200 font-sans">
                        Burari, Delhi-110084 • Session 2026-2027
                      </div>
                    </div>

                    {/* Photo & Badge */}
                    <div className="px-4 py-2 text-center space-y-2">
                      <div className="w-24 h-28 mx-auto rounded-2xl bg-slate-100 border-2 border-indigo-900 flex flex-col items-center justify-center overflow-hidden shadow-xs">
                        {selectedStudentForIdCard.photo_url ? (
                          <img src={selectedStudentForIdCard.photo_url} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">👦</span>
                        )}
                      </div>
                      <div>
                        <h5 className="font-black text-sm text-slate-950 leading-tight">
                          {selectedStudentForIdCard.first_name} {selectedStudentForIdCard.last_name}
                        </h5>
                        <span className="text-[10px] font-bold text-indigo-700 block mt-0.5">
                          {selectedStudentForIdCard.class_name} - Section {selectedStudentForIdCard.section_name}
                        </span>
                      </div>
                    </div>

                    {/* Details Table */}
                    <div className="px-4 py-2 text-[10px] space-y-1 bg-slate-50 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Adm No:</span>
                        <strong className="font-mono font-bold text-slate-900">{selectedStudentForIdCard.admission_number}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Blood Group:</span>
                        <strong className="text-rose-700 font-bold">{selectedStudentForIdCard.blood_group || "O+"}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Emergency Phone:</span>
                        <strong className="font-mono text-slate-900">{selectedStudentForIdCard.guardian_phone || "9811102008"}</strong>
                      </div>
                    </div>

                    {/* Footer with Barcode */}
                    <div className="bg-slate-900 text-white p-2.5 text-center flex items-center justify-between text-[9px] font-mono font-bold">
                      <span>VERIFIED BADGE</span>
                      <span className="text-emerald-400">SECURE RFID</span>
                    </div>
                  </div>

                  {/* Back of Card (Escort Pickup Authorization) */}
                  <div className="w-[270px] h-[420px] bg-white rounded-3xl border-2 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between text-slate-900 p-4">
                    <div className="text-center border-b border-slate-200 pb-2">
                      <span className="text-[9px] font-black uppercase text-purple-700 tracking-wider block">
                        Official Parent / Escort Pickup Pass
                      </span>
                      <span className="text-[8px] text-slate-400 font-semibold">Authorized Security Gate Clearance</span>
                    </div>

                    <div className="text-center space-y-2 py-2">
                      <div className="w-24 h-24 mx-auto bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-2">
                        <QrCode className="w-20 h-20 text-slate-900" />
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 font-bold">
                        Scan for Instant Biometric Gate Validation
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div><strong>Guardian:</strong> {selectedStudentForIdCard.guardian_first || "Parent"} {selectedStudentForIdCard.guardian_last || ""}</div>
                      <div><strong>Address:</strong> Delhi NCR</div>
                      <div className="text-[8px] text-slate-400 pt-1 border-t border-slate-200 mt-1">
                        If found, please return to School Reception or Call +91 98111 02008.
                      </div>
                    </div>

                    <div className="pt-2 text-center text-[8px] font-mono font-bold text-slate-400">
                      AUTHENTICATED &amp; ISSUED 2026-2027
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-xs font-bold text-slate-400">
                  Select a student to inspect card
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TRANSFER CERTIFICATE (TC) STUDIO */}
      {/* ========================================================================= */}
      {activeTab === "TC" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Official School Transfer Certificate &amp; Leaving Certificate Studio
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <FileText className="w-8 h-8 text-amber-400" />
                School Leaving &amp; Transfer Certificate (TC) Studio
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
                Issue tamper-proof School Transfer Certificates with serial numbers, dues clearance, and public anti-forgery QR verification codes.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Official A4 Certificate
            </button>
          </div>

          {/* Main Form & Printable Document Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Issue Form */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  Transfer Certificate Issue Desk
                </h3>
                <p className="text-xs text-stone-500">Official student leaving dossier</p>
              </div>

              {/* Quick Auto-fill from Active Roster */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                <span className="font-bold text-amber-950 text-[11px] block">⚡ Auto-Fill from Enrolled Roster:</span>
                <select
                  onChange={(e) => {
                    const found = students.find(s => s.id === e.target.value);
                    if (found) handleSelectStudentForTc(found);
                  }}
                  className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="">-- Select Enrolled Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.admission_number || "ADM"}) — {s.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleGenerateTc} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={tcStudentName}
                    onChange={e => setTcStudentName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Admission No *</label>
                    <input
                      type="text"
                      required
                      value={tcAdmissionNo}
                      onChange={e => setTcAdmissionNo(e.target.value)}
                      placeholder="CBS-ADM-0921"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Class Left *</label>
                    <input
                      type="text"
                      required
                      value={tcClassLastAttended}
                      onChange={e => setTcClassLastAttended(e.target.value)}
                      placeholder="Class 5"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Father&apos;s Name *</label>
                    <input
                      type="text"
                      required
                      value={tcFatherName}
                      onChange={e => setTcFatherName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Mother&apos;s Name *</label>
                    <input
                      type="text"
                      required
                      value={tcMotherName}
                      onChange={e => setTcMotherName(e.target.value)}
                      placeholder="Mrs. Sunita Sharma"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={tcDob}
                      onChange={e => setTcDob(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={tcAdmissionDate}
                      onChange={e => setTcAdmissionDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Reason for Leaving School *</label>
                  <select
                    value={tcReasonForLeaving}
                    onChange={e => setTcReasonForLeaving(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                  >
                    <option value="Parent Relocation / Job Transfer">Parent Relocation / Job Transfer</option>
                    <option value="Admission to Higher Senior Secondary Institution">Admission to Higher Senior Secondary Institution</option>
                    <option value="Personal / Family Reasons">Personal / Family Reasons</option>
                    <option value="Completed Highest Class Available">Completed Highest Class Available</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Academic Result Status</label>
                  <input
                    type="text"
                    value={tcAnnualResult}
                    onChange={e => setTcAnnualResult(e.target.value)}
                    placeholder="Promoted to Higher Class (Passed)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isTcSubmitting}
                  className="w-full py-3 rounded-xl bg-[#0B1B30] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTcSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  Generate Official Certificate
                </button>
              </form>
            </div>

            {/* Right 2 Cols: Live Printable A4 TC Document */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-stone-300 shadow-xl space-y-6 text-stone-900">
                {/* Official Crest & Header */}
                <div className="text-center border-b-2 border-stone-900 pb-5 space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-600 tracking-widest uppercase">
                    Recognized &amp; Registered Educational Institution, Delhi NCR
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-blue-950">
                    {selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
                  </h2>
                  <div className="text-xs text-stone-600 font-medium">
                    Sant Nagar • Burari • Delhi-110084 | Registration Code: 1253481
                  </div>
                  <div className="inline-block mt-2 bg-stone-900 text-white px-5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    Official Transfer Certificate (TC) / School Leaving Certificate
                  </div>
                </div>

                {/* Certificate Meta Grid */}
                <div className="grid grid-cols-2 gap-4 border-b border-stone-200 pb-4 text-xs font-mono">
                  <div>
                    <span className="text-stone-400 font-bold block">TC Serial Number:</span>
                    <strong className="text-base text-amber-900">{selectedTc?.tc_number || "TC/2026/0148"}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 font-bold block">Issue Date:</span>
                    <strong className="text-stone-900">{selectedTc?.issue_date || new Date().toISOString().split("T")[0]}</strong>
                  </div>
                </div>

                {/* Statutory Schedule Table */}
                <div className="space-y-3 text-xs">
                  <table className="w-full text-left border border-stone-300">
                    <tbody>
                      <tr className="border-b border-stone-200 bg-stone-50/50">
                        <td className="p-2.5 font-bold w-1/3 text-stone-600">1. Name of Pupil</td>
                        <td className="p-2.5 font-black text-stone-950 uppercase">{tcStudentName}</td>
                      </tr>
                      <tr className="border-b border-stone-200">
                        <td className="p-2.5 font-bold text-stone-600">2. Father&apos;s / Guardian&apos;s Name</td>
                        <td className="p-2.5 font-bold text-stone-900">{tcFatherName}</td>
                      </tr>
                      <tr className="border-b border-stone-200 bg-stone-50/50">
                        <td className="p-2.5 font-bold text-stone-600">3. Mother&apos;s Name</td>
                        <td className="p-2.5 font-bold text-stone-900">{tcMotherName}</td>
                      </tr>
                      <tr className="border-b border-stone-200">
                        <td className="p-2.5 font-bold text-stone-600">4. Date of Birth (in figures)</td>
                        <td className="p-2.5 font-bold text-stone-900">{tcDob}</td>
                      </tr>
                      <tr className="border-b border-stone-200 bg-stone-50/50">
                        <td className="p-2.5 font-bold text-stone-600">5. Admission Number</td>
                        <td className="p-2.5 font-mono font-bold text-stone-900">{tcAdmissionNo}</td>
                      </tr>
                      <tr className="border-b border-stone-200">
                        <td className="p-2.5 font-bold text-stone-600">6. Class in which pupil last studied</td>
                        <td className="p-2.5 font-bold text-stone-900">{tcClassLastAttended}</td>
                      </tr>
                      <tr className="border-b border-stone-200 bg-stone-50/50">
                        <td className="p-2.5 font-bold text-stone-600">7. School / Board Annual Examination Status</td>
                        <td className="p-2.5 font-bold text-emerald-800">{tcAnnualResult}</td>
                      </tr>
                      <tr className="border-b border-stone-200">
                        <td className="p-2.5 font-bold text-stone-600">8. Month up to which school dues paid</td>
                        <td className="p-2.5 font-bold text-stone-900">All Dues Fully Cleared (No Arrears)</td>
                      </tr>
                      <tr className="border-b border-stone-200 bg-stone-50/50">
                        <td className="p-2.5 font-bold text-stone-600">9. Reason for leaving the school</td>
                        <td className="p-2.5 font-medium text-stone-800">{tcReasonForLeaving}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-stone-600">10. General Conduct</td>
                        <td className="p-2.5 font-bold text-stone-900">Exemplary &amp; Good</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* QR Code & Seals */}
                <div className="flex items-end justify-between pt-6 border-t-2 border-stone-900 text-xs font-black">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-stone-50 border border-stone-300 rounded-xl p-1 flex items-center justify-center">
                      <QrCode className="w-14 h-14 text-stone-900" />
                    </div>
                    <div className="text-[10px] space-y-0.5 font-mono text-stone-500">
                      <div>Scan to Verify Authenticity</div>
                      <div className="text-emerald-700 font-bold">✓ Valid Digital Document</div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-stone-900 pb-8" />
                    <span className="text-[10px] uppercase text-stone-500 block">Class In-Charge</span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-stone-900 pb-8" />
                    <span className="text-[10px] uppercase text-stone-900 block font-bold">Principal / Head</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 4-Step Transactional Student Enrollment Wizard */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Student (Permanent 360 Master Record)"
      >
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            {[
              { step: 1, label: "1. Demographics" },
              { step: 2, label: "2. Institution & Stage" },
              { step: 3, label: "3. Household & Parent" },
              { step: 4, label: "4. Confirmation" },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-1.5 text-xs font-bold">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  wizardStep === s.step ? "bg-slate-900 text-white" :
                  wizardStep > s.step ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {wizardStep > s.step ? "✓" : s.step}
                </span>
                <span className={wizardStep === s.step ? "text-slate-900" : "text-slate-400"}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: DEMOGRAPHICS */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="First Name *"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Aarav"
                />
                <Input
                  label="Middle Name"
                  value={formData.middleName || ""}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="Kumar"
                />
                <Input
                  label="Last Name *"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date of Birth *"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
                <Select
                  label="Gender *"
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Blood Group"
                  options={[
                    { value: "A+", label: "A+" },
                    { value: "A-", label: "A-" },
                    { value: "B+", label: "B+" },
                    { value: "B-", label: "B-" },
                    { value: "O+", label: "O+" },
                    { value: "O-", label: "O-" },
                    { value: "AB+", label: "AB+" },
                    { value: "AB-", label: "AB-" },
                  ]}
                  value={formData.bloodGroup || "O+"}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                />
                <Input
                  label="Primary Guardian Phone *"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="9811102008"
                />
              </div>

              {duplicateWarning && duplicateWarning.hasDuplicateStudent && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-black">Duplicate Student Alert</strong>
                    A student with the same name and DOB already exists: {duplicateWarning.existingStudent.universal_id} ({duplicateWarning.existingStudent.class_name}).
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="primary" onClick={handleNextStep1} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Next: Institution &amp; Class
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: INSTITUTION */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Assigned Institution *"
                  options={[
                    { value: "CBS", label: "CBS (Crayon Box School - K-12 Senior Campus)" },
                    { value: "AVM", label: "AVM (Avinya Vidya Mandir - K-12 Senior Campus)" },
                    { value: "AS", label: "AS (Avinya School - Kindergarten Montessori)" },
                    { value: "CBPS", label: "CBPS (Crayon Box Pre School - Foundation)" },
                  ]}
                  value={formData.institutionCode}
                  onChange={(e) => {
                    const inst = e.target.value;
                    const stage = (inst === "AS" || inst === "CBPS") ? "FOUNDATION" : "PRIMARY";
                    const cls = (inst === "AS" || inst === "CBPS") ? "Nursery" : "Class 4";
                    setFormData({ ...formData, institutionCode: inst, academicStage: stage, className: cls });
                  }}
                />
                <Select
                  label="Academic Stage *"
                  options={[
                    { value: "FOUNDATION", label: "Foundation (Early Childhood / Pre-School)" },
                    { value: "PRIMARY", label: "Primary (Class 3 to 5)" },
                    { value: "MIDDLE", label: "Middle (Class 6 to 8)" },
                    { value: "SECONDARY", label: "Secondary (Class 9 to 10)" },
                    { value: "SENIOR_SECONDARY", label: "Senior Secondary (Class 11 to 12)" },
                  ]}
                  value={formData.academicStage}
                  onChange={(e) => setFormData({ ...formData, academicStage: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Class *"
                  options={getClassOptionsForStage(formData.academicStage, formData.institutionCode)}
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />
                <Input
                  label="Section *"
                  required
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="A"
                />
                <Input
                  label="Roll Number"
                  value={formData.rollNumber || "1"}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="1"
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setWizardStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNextStep2} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Next: Guardian Info
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: GUARDIAN */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Primary Guardian Name *"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="Dr. Rajesh Sharma"
                />
                <Select
                  label="Relationship *"
                  options={[
                    { value: "FATHER", label: "Father" },
                    { value: "MOTHER", label: "Mother" },
                    { value: "LEGAL_GUARDIAN", label: "Legal Guardian" },
                  ]}
                  value={formData.parentRelationship}
                  onChange={(e) => setFormData({ ...formData, parentRelationship: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Guardian Email"
                  type="email"
                  value={formData.parentEmail || ""}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="parent@gmail.com"
                />
                <Input
                  label="Occupation"
                  value={formData.parentOccupation || ""}
                  onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <Input
                label="Primary Residential Address"
                value={formData.parentAddress || ""}
                onChange={(e) => setFormData({ ...formData, parentAddress: e.target.value })}
                placeholder="Sant Nagar, Burari, Delhi - 110084"
              />

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setWizardStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNextStep3} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Review &amp; Confirm
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {wizardStep === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Enrollment Summary Dossier</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
                  <div><strong>DOB:</strong> {formData.dob} ({formData.gender})</div>
                  <div><strong>Institution:</strong> {formData.institutionCode}</div>
                  <div><strong>Class:</strong> {formData.className} ({formData.sectionName})</div>
                  <div><strong>Guardian:</strong> {formData.parentName} ({formData.parentRelationship})</div>
                  <div><strong>Phone:</strong> {formData.parentPhone}</div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setWizardStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCompleteEnrollment}
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Confirm &amp; Generate Universal ID
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Student 360 Dossier Modal */}
      {selectedStudentFor360 && (
        <Student360ProfileModal
          isOpen={Boolean(selectedStudentFor360)}
          onClose={() => setSelectedStudentFor360(null)}
          student={selectedStudentFor360}
        />
      )}

      {/* Re-Admission Modal */}
      {isReadmitModalOpen && (
        <Modal
          isOpen={isReadmitModalOpen}
          onClose={() => setIsReadmitModalOpen(false)}
          title={`Re-Admit Student: ${targetStudentForReadmit?.first_name} ${targetStudentForReadmit?.last_name}`}
        >
          <form onSubmit={handleConfirmReadmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              Re-admitting restores the student to the active roster for Session <strong>{readmitForm.academicSession}</strong> while keeping previous departure records intact.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Target Campus *"
                options={[
                  { value: "CBS", label: "CBS (K-12 Senior Campus)" },
                  { value: "AVM", label: "AVM (K-12 Senior Campus)" },
                  { value: "AS", label: "AS (Kindergarten Montessori)" },
                  { value: "CBPS", label: "CBPS (Pre-School Foundation)" },
                ]}
                value={readmitForm.institutionCode}
                onChange={(e) => setReadmitForm({ ...readmitForm, institutionCode: e.target.value })}
              />
              <Input
                label="Academic Session *"
                value={readmitForm.academicSession}
                onChange={(e) => setReadmitForm({ ...readmitForm, academicSession: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Class Name *"
                value={readmitForm.className}
                onChange={(e) => setReadmitForm({ ...readmitForm, className: e.target.value })}
              />
              <Input
                label="Section *"
                value={readmitForm.sectionName}
                onChange={(e) => setReadmitForm({ ...readmitForm, sectionName: e.target.value })}
              />
            </div>

            <Input
              label="Re-Admission Remarks"
              value={readmitForm.remarks}
              onChange={(e) => setReadmitForm({ ...readmitForm, remarks: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsReadmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmittingReadmit}>
                Confirm Re-Admission
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Archive Modal */}
      {isArchiveModalOpen && (
        <Modal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          title="Archive Student Record"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to archive <strong>{targetStudentForArchive?.first_name} {targetStudentForArchive?.last_name}</strong>?
            </p>
            <Input
              label="Reason for Archival"
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsArchiveModalOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleConfirmArchive}>Archive Student</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default function UniversalStudentsDirectoryPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs font-bold text-slate-400">
        Loading Universal Student &amp; Family Master...
      </div>
    }>
      <UniversalStudentsDirectoryContent />
    </Suspense>
  );
}
