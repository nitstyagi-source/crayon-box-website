"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users, Search, Filter, Download, Plus, ArrowRight,
  Eye, Phone, CreditCard, Sparkles, UserCheck, RefreshCw,
  Trash2, CheckCircle2, AlertTriangle, Building2, ShieldCheck,
  ChevronRight, ArrowLeft, Check, Lock, Archive, RotateCcw, CheckCheck, History, X,
  Printer, QrCode, Mail, MapPin, HeartPulse, Award, FileText, BookOpen
} from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { Student360ProfileModal } from "@/components/students/Student360ProfileModal";
import { StudentSuiteTabs, StudentSuiteTabType } from "@/components/students/StudentSuiteTabs";
import { StudentIDCard } from "@/components/id-cards/StudentIDCard";
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
import { printIsolatedElement } from "@/lib/printUtils";

function UniversalStudentsDirectoryContent() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions, institutionsList } = useInstitution();
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
  const [filters, setFilters] = useState<StudentFilterQuery>(() => {
    const y = new Date().getFullYear();
    return {
      institutionCode: currentInstitution,
      academicSession: `${y}-${y + 1}`,
      academicStage: "ALL",
      className: "ALL",
      sectionName: "ALL",
      status: "ACTIVE",
      search: "",
      showTestRecords: true,
    };
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
    dob: "",
    gender: "Male",
    bloodGroup: "O+",
    nationality: "Indian",
    category: "General",
    aadhaarNo: "",
    isTestRecord: false,

    institutionCode: currentInstitution === "ALL" ? "CBS" : currentInstitution,
    academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
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
        dob: "",
        gender: "Male",
        bloodGroup: "O+",
        nationality: "Indian",
        category: "General",
        aadhaarNo: "",
        isTestRecord: false,

        institutionCode: currentInstitution === "ALL" ? "CBS" : currentInstitution,
        academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
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
  const [readmitForm, setReadmitForm] = useState(() => {
    const y = new Date().getFullYear();
    return {
      institutionCode: "CBS",
      academicSession: `${y}-${y + 1}`,
      className: "Class 3",
      sectionName: "A",
      academicStage: "PRIMARY",
      admissionNumber: "",
      admissionDate: new Date().toISOString().split("T")[0],
      remarks: "Student re-admitted to active roster."
    };
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
    const y = new Date().getFullYear();
    setTargetStudentForReadmit(row);
    setReadmitForm({
      institutionCode: row.institution_code || (currentInstitution === "ALL" ? "CBS" : currentInstitution),
      academicSession: `${y}-${y + 1}`,
      className: row.class_name || "Class 3",
      sectionName: row.section_name || "A",
      academicStage: row.academic_stage || "PRIMARY",
      admissionNumber: row.admission_number || row.admission_no || "",
      admissionDate: new Date().toISOString().split("T")[0],
      remarks: `Student re-admitted after previous departure period (Session ${row.academic_session || `${y - 1}-${y}`}).`
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
  const [tcStudentName, setTcStudentName] = useState("");
  const [tcAdmissionNo, setTcAdmissionNo] = useState("");
  const [tcFatherName, setTcFatherName] = useState("");
  const [tcMotherName, setTcMotherName] = useState("");
  const [tcDob, setTcDob] = useState("");
  const [tcAdmissionDate, setTcAdmissionDate] = useState("");
  const [tcClassLastAttended, setTcClassLastAttended] = useState("");
  const [tcSectionLastAttended, setTcSectionLastAttended] = useState("A");
  const [tcClassAdmitted, setTcClassAdmitted] = useState("");
  const [tcPenNo, setTcPenNo] = useState("");
  const [tcWithdrawalDate, setTcWithdrawalDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [tcSlcDate, setTcSlcDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [tcDuesStatus, setTcDuesStatus] = useState("Yes - All Dues Paid");
  const [tcAcademicSession, setTcAcademicSession] = useState(() => `${new Date().getFullYear()}-${((new Date().getFullYear() + 1) % 100).toString().padStart(2, '0')}`);
  const [tcTotalAttendance, setTcTotalAttendance] = useState("218");
  const [tcStudentAttendance, setTcStudentAttendance] = useState("204");
  const [tcReasonForLeaving, setTcReasonForLeaving] = useState("");
  const [tcAnnualResult, setTcAnnualResult] = useState("Promoted to Higher Class (Passed)");
  const [tcRemarks, setTcRemarks] = useState("Diligent, well-behaved student. Possesses good moral character and demonstrated keen academic proficiency.");
  const printTcRef = React.useRef<HTMLDivElement>(null);

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
    setTcFatherName(stu.guardian_first ? `${stu.guardian_first} ${stu.guardian_last || ""}` : (stu.parent_name || ""));
    setTcMotherName(stu.mother_name || "");
    setTcDob(stu.dob ? String(stu.dob).split("T")[0] : "");
    setTcAdmissionDate(stu.admission_date ? String(stu.admission_date).split("T")[0] : (stu.created_at ? String(stu.created_at).split("T")[0] : new Date().toISOString().split("T")[0]));
    setTcClassLastAttended(stu.class_name ? String(stu.class_name).split("-")[0].trim() : "5th");
    setTcSectionLastAttended(stu.section_name || stu.section || "A");
    setTcClassAdmitted(stu.enrolled_class || stu.class_name || "1st");
    setTcPenNo(stu.pen_number || stu.pen_no || `PEN-2024-${stu.id?.slice(0, 4)?.toUpperCase() || "7821"}`);
    setTcWithdrawalDate(new Date().toISOString().split("T")[0]);
    setTcSlcDate(new Date().toISOString().split("T")[0]);
    setTcDuesStatus("Yes - All Dues Cleared");
    setTcTotalAttendance("218");
    setTcStudentAttendance("204");
    setTcAnnualResult("Promoted to Higher Class (Passed)");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" /> Student &amp; Family 360 Lifecycle Master
            </span>
            <span className="text-stone-300 text-xs">•</span>
            <span className="text-stone-600 text-xs font-semibold">
              {activeTab === "ROSTER" ? `${students.length} Enrolled in Scope` :
               activeTab === "FAMILIES" ? `${families.length} Household Units` :
               activeTab === "ID_CARDS" ? `${students.length} Smart Badges Ready` :
               `${tcCertificates.length} Official TCs Issued`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Universal Student &amp; Family Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
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
            className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Live DB
          </Button>
          <Button
            variant="saffron"
            size="md"
            onClick={() => { setWizardStep(1); setIsEnrollModalOpen(true); }}
            className="bg-[#D97706] hover:bg-[#B45309] text-white font-black shadow-xs"
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
                  {institutionsList.map((inst) => (
                    <option key={inst.code} value={inst.code}>
                      {inst.code} ({inst.name})
                    </option>
                  ))}
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
                <div className="flex items-center justify-center py-4">
                  <StudentIDCard
                    student={selectedStudentForIdCard}
                    schoolInfo={selectedInstitutionObj}
                    layoutMode="DUAL"
                  />
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
              onClick={() => {
                if (printTcRef.current) {
                  printIsolatedElement(printTcRef.current, `Transfer-Certificate-${selectedTc?.tc_number || tcAdmissionNo || "Document"}`, {
                    pageSize: "A4 portrait",
                    margin: "0mm"
                  });
                } else {
                  window.print();
                }
              }}
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

              <form onSubmit={handleGenerateTc} className="space-y-3.5 max-h-[780px] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">3. Name of Student *</label>
                  <input
                    type="text"
                    required
                    value={tcStudentName}
                    onChange={e => setTcStudentName(e.target.value)}
                    placeholder="e.g. Student Full Name"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">4. Father Name *</label>
                    <input
                      type="text"
                      required
                      value={tcFatherName}
                      onChange={e => setTcFatherName(e.target.value)}
                      placeholder="e.g. Father's Full Name"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">5. Mother Name *</label>
                    <input
                      type="text"
                      required
                      value={tcMotherName}
                      onChange={e => setTcMotherName(e.target.value)}
                      placeholder="e.g. Mother's Full Name"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">6. Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={tcDob}
                      onChange={e => setTcDob(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">7b. Admission Date</label>
                    <input
                      type="date"
                      value={tcAdmissionDate}
                      onChange={e => setTcAdmissionDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">7a. Admission No *</label>
                    <input
                      type="text"
                      required
                      value={tcAdmissionNo}
                      onChange={e => setTcAdmissionNo(e.target.value)}
                      placeholder="ADM-001"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">8. Class Admitted</label>
                    <input
                      type="text"
                      value={tcClassAdmitted}
                      onChange={e => setTcClassAdmitted(e.target.value)}
                      placeholder="e.g. 1st / Nursery"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">9a. Class Last Attended *</label>
                    <input
                      type="text"
                      required
                      value={tcClassLastAttended}
                      onChange={e => setTcClassLastAttended(e.target.value)}
                      placeholder="e.g. 5th"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">9b. Section</label>
                    <input
                      type="text"
                      value={tcSectionLastAttended}
                      onChange={e => setTcSectionLastAttended(e.target.value)}
                      placeholder="e.g. A"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">10. PEN Number</label>
                    <input
                      type="text"
                      value={tcPenNo}
                      onChange={e => setTcPenNo(e.target.value)}
                      placeholder="PEN-2024-XXXX"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">11. Date of Withdrawal</label>
                    <input
                      type="date"
                      value={tcWithdrawalDate}
                      onChange={e => setTcWithdrawalDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">12. Date of SLC Issue</label>
                    <input
                      type="date"
                      value={tcSlcDate}
                      onChange={e => setTcSlcDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">13. Dues Paid Status</label>
                    <input
                      type="text"
                      value={tcDuesStatus}
                      onChange={e => setTcDuesStatus(e.target.value)}
                      placeholder="Yes / Cleared"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">14. Session</label>
                    <input
                      type="text"
                      value={tcAcademicSession}
                      onChange={e => setTcAcademicSession(e.target.value)}
                      placeholder="2025-26"
                      className="w-full text-xs px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">15. Total Days</label>
                    <input
                      type="text"
                      value={tcTotalAttendance}
                      onChange={e => setTcTotalAttendance(e.target.value)}
                      placeholder="218"
                      className="w-full text-xs px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">16. Attended</label>
                    <input
                      type="text"
                      value={tcStudentAttendance}
                      onChange={e => setTcStudentAttendance(e.target.value)}
                      placeholder="204"
                      className="w-full text-xs px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">17. Result Status</label>
                    <input
                      type="text"
                      value={tcAnnualResult}
                      onChange={e => setTcAnnualResult(e.target.value)}
                      placeholder="Promoted to Higher Class (Passed)"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Reason for Leaving</label>
                    <select
                      value={tcReasonForLeaving}
                      onChange={e => setTcReasonForLeaving(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    >
                      <option value="Parent Relocation / Job Transfer">Parent Relocation</option>
                      <option value="Admission to Higher Senior Secondary Institution">Higher Studies</option>
                      <option value="Personal / Family Reasons">Personal Reasons</option>
                      <option value="Completed Highest Class Available">Course Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Remarks (if any)</label>
                  <textarea
                    rows={2}
                    value={tcRemarks}
                    onChange={e => setTcRemarks(e.target.value)}
                    placeholder="Enter official remarks..."
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium resize-none"
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

            {/* Right 2 Cols: Live Printable A4 TC Document (EXACT MATCH TO USER SPECIFICATION) */}
            <div className="lg:col-span-2 space-y-4">
              <div 
                ref={printTcRef} 
                className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-stone-300 shadow-xl space-y-4 text-stone-900 mx-auto relative overflow-hidden"
                style={{ 
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  maxWidth: '820px',
                  minHeight: '1100px'
                }}
              >
                {/* 1. TOP HEADER LETTERHEAD: LOGO | SCHOOL NAME & TRUST | CONTACT INFO */}
                <div className="flex items-start justify-between pb-3 border-b-2 border-stone-300 gap-4">
                  {/* Left Shield Emblem Logo */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#0F2942] flex flex-col items-center justify-center p-1 bg-[#FAF7F2] shadow-xs">
                      <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center mb-0.5">
                        <span className="text-amber-600 text-[10px] font-black">🔥</span>
                      </div>
                      <BookOpen className="w-8 h-8 text-[#0F2942]" />
                    </div>
                  </div>

                  {/* Center School Name & Trust Meta */}
                  <div className="flex-1 text-center px-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black tracking-wider text-[#0F2942] uppercase leading-tight">
                      {selectedInstitutionObj?.name || (isAllInstitutions ? "CRAYON BOX ACADEMY" : "SCHOOL OF EXCELLENCE")}
                    </h1>
                    <p className="text-[10px] sm:text-[11px] font-bold text-stone-700 tracking-widest uppercase mt-0.5">
                      {selectedInstitutionObj?.address || "CAMPUS NAME | LOCATION | CITY"}
                    </p>
                    
                    <div className="h-[1px] bg-[#C59B27] w-36 mx-auto my-1.5" />
                    
                    <p className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-widest text-[#0F2942]">
                      MANAGED BY VANI EDUCATIONAL TRUST
                    </p>
                    <p className="text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-widest text-stone-600">
                      RECOGNISED BY DIRECTORATE OF EDUCATION
                    </p>
                  </div>

                  {/* Right Contact Meta Box */}
                  <div className="text-[8px] sm:text-[8.5px] font-medium text-stone-700 space-y-1 border-l-2 border-[#C59B27] pl-3 shrink-0 max-w-[190px]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-[#0F2942] shrink-0 mt-0.5" />
                      <span className="leading-tight">{selectedInstitutionObj?.address || "Delhi NCR - 110084"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#0F2942] shrink-0" />
                      <span>{selectedInstitutionObj?.phone || "+91 9911102027"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[#0F2942] shrink-0" />
                      <span className="truncate">{selectedInstitutionObj?.principalEmail || "info@crayonboxschool.com"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-[#0F2942] shrink-0" />
                      <span>{selectedInstitutionObj?.websiteUrl || "www.crayonboxschool.com"}</span>
                    </div>
                  </div>
                </div>

                {/* 2. REF NO. & DATE BAR */}
                <div className="flex justify-between items-center text-xs font-bold text-stone-900 pt-1 pb-1">
                  <div className="flex items-center gap-1">
                    <span className="uppercase tracking-wider">REF NO. :</span>
                    <span className="font-mono border-b border-stone-600 px-2 py-0.5 min-w-[160px] text-stone-900 font-bold">
                      {selectedTc?.ref_number || (selectedTc?.tc_number ? `REF/${selectedTc.tc_number.replace('TC/', '')}` : `REF/CBS/${new Date().getFullYear()}/001`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="uppercase tracking-wider">DATE :</span>
                    <span className="font-mono border-b border-stone-600 px-2 py-0.5 min-w-[140px] text-right text-stone-900 font-bold">
                      {selectedTc?.issue_date 
                        ? new Date(selectedTc.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* 3. CERTIFICATE TITLE BANNER */}
                <div className="text-center py-2 relative">
                  <div className="inline-block relative">
                    {/* Ribbon Banner Shape */}
                    <div className="bg-[#EAEFF5] border-y-2 border-[#0F2942] px-8 sm:px-14 py-1.5 rounded-xs shadow-xs">
                      <h2 className="text-xl sm:text-2xl font-serif font-black tracking-widest text-[#0F2942] uppercase">
                        TRANSFER CERTIFICATE
                      </h2>
                    </div>
                  </div>
                  <p className="text-[9.5px] sm:text-[10.5px] font-bold text-[#0F2942] uppercase tracking-[0.2em] mt-1">
                    (SCHOOL LEAVING CERTIFICATE)
                  </p>
                  
                  {/* Flanking Golden Diamond Motif */}
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="h-[1px] bg-[#C59B27] w-12" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#C59B27]" />
                    <div className="h-[1px] bg-[#C59B27] w-12" />
                  </div>
                </div>

                {/* 4. EXACT 17-ROW STATUTORY SCHEDULE TABLE */}
                <div className="border border-stone-400 rounded-lg overflow-hidden bg-white text-[10.5px]">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-stone-200">
                      {/* 1. Name of School & I.D. */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 w-8 font-mono text-stone-600 font-bold">1.</td>
                        <td className="p-1.5 font-bold text-stone-800 w-[38%]">Name of School &amp; I.D.</td>
                        <td className="p-1.5 font-bold text-stone-400 w-4">:</td>
                        <td className="p-1.5 pr-3 font-bold text-stone-900 uppercase">
                          {selectedInstitutionObj?.name || "CRAYON BOX ACADEMY"} ({selectedInstitutionObj?.code || selectedInstitutionObj?.schoolId || "CBS-01"})
                        </td>
                      </tr>

                      {/* 2. UDISE Code of School */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">2.</td>
                        <td className="p-1.5 font-bold text-stone-800">UDISE Code of School</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono font-bold text-stone-900">
                          {selectedInstitutionObj?.udiseCode || selectedInstitutionObj?.affiliationNumber || "07010101802"}
                        </td>
                      </tr>

                      {/* 3. Name of Student */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">3.</td>
                        <td className="p-1.5 font-bold text-stone-800">Name of Student</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-black text-[#0F2942] uppercase text-[11.5px]">
                          {tcStudentName || selectedTc?.student_name || "STUDENT FULL NAME"}
                        </td>
                      </tr>

                      {/* 4. Father's Name */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">4.</td>
                        <td className="p-1.5 font-bold text-stone-800">Father&apos;s Name</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-bold text-stone-900 uppercase">
                          {tcFatherName || selectedTc?.father_name || "FATHER FULL NAME"}
                        </td>
                      </tr>

                      {/* 5. Mother's Name */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">5.</td>
                        <td className="p-1.5 font-bold text-stone-800">Mother&apos;s Name</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-bold text-stone-900 uppercase">
                          {tcMotherName || selectedTc?.mother_name || "MOTHER FULL NAME"}
                        </td>
                      </tr>

                      {/* 6. Date of Birth */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">6.</td>
                        <td className="p-1.5 font-bold text-stone-800">Date of Birth</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono font-bold text-stone-900">
                          {tcDob 
                            ? new Date(tcDob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                            : (selectedTc?.dob ? new Date(selectedTc.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "01-Jan-2015")}
                        </td>
                      </tr>

                      {/* 7. Admission No. & Date */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">7.</td>
                        <td className="p-1.5 font-bold text-stone-800">Admission No. &amp; Date</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono font-bold text-stone-900">
                          {tcAdmissionNo || selectedTc?.admission_no || "ADM-001"} &nbsp;|&nbsp; {tcAdmissionDate ? new Date(tcAdmissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (selectedTc?.admission_date ? new Date(selectedTc.admission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "01-Apr-2020")}
                        </td>
                      </tr>

                      {/* 8. Class in which admitted */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">8.</td>
                        <td className="p-1.5 font-bold text-stone-800">Class in which admitted</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-bold text-stone-900">
                          {tcClassAdmitted || "1st Standard"}
                        </td>
                      </tr>

                      {/* 9. Class & Section last attended */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">9.</td>
                        <td className="p-1.5 font-bold text-stone-800">Class &amp; Section last attended</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-bold text-stone-900">
                          {tcClassLastAttended || selectedTc?.class_last_attended || "5th"} &nbsp;|&nbsp; Section {tcSectionLastAttended || selectedTc?.section_last_attended || "A"}
                        </td>
                      </tr>

                      {/* 10. Permanent Education Number (PEN) */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">10.</td>
                        <td className="p-1.5 font-bold text-stone-800">Permanent Education Number (PEN)</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono font-bold text-stone-900">
                          {tcPenNo || selectedTc?.pen_no || "PEN-2024-7821"}
                        </td>
                      </tr>

                      {/* 11. Date of withdrawal of admission */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">11.</td>
                        <td className="p-1.5 font-bold text-stone-800">Date of withdrawal of admission</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono text-stone-900 font-bold">
                          {tcWithdrawalDate ? new Date(tcWithdrawalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (selectedTc?.withdrawal_date ? new Date(selectedTc.withdrawal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))}
                        </td>
                      </tr>

                      {/* 12. Date of SLC issue */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">12.</td>
                        <td className="p-1.5 font-bold text-stone-800">Date of SLC issue</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono text-stone-900 font-bold">
                          {tcSlcDate ? new Date(tcSlcDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (selectedTc?.issue_date ? new Date(selectedTc.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))}
                        </td>
                      </tr>

                      {/* 13. Whether he or she has paid all dues of the school */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">13.</td>
                        <td className="p-1.5 font-bold text-stone-800">Whether he or she has paid all dues of the school (Yes/No)</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-bold text-emerald-800">
                          {tcDuesStatus || (selectedTc?.dues_paid ? "Yes - All Dues Fully Cleared (No Arrears)" : "Yes - All Dues Paid")}
                        </td>
                      </tr>

                      {/* 14. Last attended academic session and class */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">14.</td>
                        <td className="p-1.5 font-bold text-stone-800">Last attended academic session and class</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-bold text-stone-900">
                          Session {tcAcademicSession || "2025-26"} &nbsp;|&nbsp; Class {tcClassLastAttended || selectedTc?.class_last_attended || "5th"}
                        </td>
                      </tr>

                      {/* 15. Total Attendance during session */}
                      <tr className="hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">15.</td>
                        <td className="p-1.5 font-bold text-stone-800">Total Attendance during session</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono font-bold text-stone-900">
                          {tcTotalAttendance || "218"} Days
                        </td>
                      </tr>

                      {/* 16. Student Attendance during session */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">16.</td>
                        <td className="p-1.5 font-bold text-stone-800">Student Attendance during session</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-mono font-bold text-stone-900">
                          {tcStudentAttendance || "204"} Days ({Math.round((Number(tcStudentAttendance || 204) / Number(tcTotalAttendance || 218)) * 100)}%)
                        </td>
                      </tr>

                      {/* 17. Result */}
                      <tr className="bg-stone-50/30 hover:bg-stone-50/50">
                        <td className="p-1.5 pl-3 font-mono text-stone-600 font-bold">17.</td>
                        <td className="p-1.5 font-bold text-stone-800">Result</td>
                        <td className="p-1.5 font-bold text-stone-400">:</td>
                        <td className="p-1.5 pr-3 font-bold text-[#0F2942]">
                          {tcAnnualResult || selectedTc?.annual_result || "Promoted to Higher Class (Passed)"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. REMARKS SECTION */}
                <div className="pt-2 text-xs">
                  <div className="font-bold text-stone-900 mb-1">
                    Remarks (if any) :
                  </div>
                  <div className="border-b border-stone-400 pb-1 text-stone-800 leading-relaxed italic min-h-[32px]">
                    {tcRemarks || "Diligent, well-behaved student. Possesses good moral character and demonstrated keen academic proficiency."}
                  </div>
                </div>

                {/* 6. SIGNATORIES & GOLDEN SEAL */}
                <div className="pt-8 pb-4 flex items-end justify-between text-xs">
                  {/* Checked By */}
                  <div className="text-center w-36">
                    <div className="border-b border-stone-800 pb-10" />
                    <span className="text-[11px] font-bold text-stone-900 block mt-1.5">Checked By</span>
                  </div>

                  {/* Admission In-Charge */}
                  <div className="text-center w-40">
                    <div className="border-b border-stone-800 pb-10" />
                    <span className="text-[11px] font-bold text-stone-900 block mt-1.5">Admission In-Charge</span>
                  </div>

                  {/* Center Official Gold Circular Seal Emblem */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#C59B27] flex flex-col items-center justify-center p-1 bg-[#FAF7F2] shadow-sm">
                      <div className="w-16 h-16 rounded-full border border-[#C59B27] flex flex-col items-center justify-center text-center">
                        <BookOpen className="w-5 h-5 text-[#C59B27] mb-0.5" />
                        <span className="text-[7px] font-serif font-black tracking-widest text-[#8C6D1F] uppercase">
                          SCHOOL
                        </span>
                        <span className="text-[6.5px] font-serif font-black tracking-widest text-[#8C6D1F] uppercase">
                          SEAL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Principal */}
                  <div className="text-center w-36">
                    <div className="border-b border-stone-800 pb-10" />
                    <span className="text-[11px] font-bold text-stone-900 block mt-1.5">Principal</span>
                  </div>
                </div>

                {/* 7. FOOTER MOTTO */}
                <div className="pt-4 border-t border-stone-300 text-center">
                  <p className="text-[9.5px] sm:text-[10px] font-serif font-bold tracking-[0.25em] text-[#0F2942] uppercase">
                    DISCIPLINE &nbsp;|&nbsp; COMPASSION &nbsp;|&nbsp; OPPORTUNITY
                  </p>
                  <p className="text-[7.5px] font-serif font-semibold tracking-widest text-stone-500 uppercase mt-0.5">
                    KNOWLEDGE LEADS TO HUMILITY
                  </p>
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
                  placeholder="98XXXXXXXX"
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
                  options={institutionsList.map(inst => ({
                    value: inst.code,
                    label: `${inst.code} (${inst.name})`
                  }))}
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
                  placeholder="e.g. Guardian Full Name"
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
                options={institutionsList.map(inst => ({
                  value: inst.code,
                  label: `${inst.code} (${inst.name})`
                }))}
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
