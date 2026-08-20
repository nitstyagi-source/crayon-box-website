"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Printer, Plus, Edit3, Trash2, BookOpen, Layers, 
  CheckCircle2, FileText, Download, Sparkles, Filter, 
  ChevronDown, ChevronRight, Eye, Save, HelpCircle, 
  Award, Copy, ArrowUp, ArrowDown, FileQuestion, Upload
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAcademicSubjects, getSubjectFullSyllabus,
  getQuestionBank, saveQuestionBankItem, deleteQuestionBankItem,
  getGeneratedPapers, getGeneratedPaperById, saveGeneratedPaper, deleteGeneratedPaper,
  getDistinctTeachers
} from "@/app/actions/syllabus-core";
import PdfUploader from "@/components/ui/PdfUploader";

interface PaperQuestion {
  q_num: number;
  text: string;
  marks: number;
  options?: string[];
  or_choice?: string;
  correct_answer?: string;
  marking_scheme?: string;
}

interface PaperSection {
  section_name: string;
  instructions?: string;
  marks_per_question?: number;
  questions: PaperQuestion[];
}

interface PaperFormState {
  class_name: string;
  subject_id: string;
  exam_title: string;
  max_marks: number;
  duration_minutes: number;
  general_instructions: string[];
  sections: PaperSection[];
  status: string;
}

export default function QuestionPaperGeneratorPage() {
  const { activeCampusId } = useCampusContext();
  const [activeTab, setActiveTab] = useState<"generator" | "bank">("generator");
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [selectedTeacher, setSelectedTeacher] = useState("All");
  const [teacherList, setTeacherList] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [fullSyllabus, setFullSyllabus] = useState<any>(null);

  // Question Bank State
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [qBankModalOpen, setQBankModalOpen] = useState(false);
  const [editingQItem, setEditingQItem] = useState<any>(null);
  const [qForm, setQForm] = useState({
    subject_id: "",
    chapter_id: "",
    question_type: "MCQ",
    marks: 1,
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    marking_scheme: "",
    difficulty: "Medium",
    blooms_level: "Understand",
    pdf_attachment_url: ""
  });

  // Generated Papers State
  const [generatedPapers, setGeneratedPapers] = useState<any[]>([]);
  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [activePreviewPaper, setActivePreviewPaper] = useState<any>(null);
  const [showMarkingScheme, setShowMarkingScheme] = useState(false);

  // Paper Designer Form
  const [paperForm, setPaperForm] = useState<PaperFormState>({
    class_name: "Grade 5",
    subject_id: "",
    exam_title: "Mid-Term Examination 2026-27",
    max_marks: 80,
    duration_minutes: 180,
    general_instructions: [
      "This question paper contains 5 sections: A, B, C, D and E.",
      "Section A comprises MCQs of 1 mark each.",
      "Section B comprises Short Answer questions of 2 marks each.",
      "Section C comprises Short Answer questions of 3 marks each.",
      "Section D comprises Long Answer questions of 5 marks each with internal choice.",
      "Section E comprises Case Study / Competency based questions of 4 marks each.",
      "All questions are compulsory. There is no overall choice, however internal choice is provided.",
      "Use of calculators or digital devices is strictly prohibited."
    ],
    sections: [
      {
        section_name: "SECTION A — Objective & MCQs",
        instructions: "Question numbers 1 to 4 carry 1 mark each. Choose the correct option.",
        marks_per_question: 1,
        questions: [
          { q_num: 1, text: "What is the place value of digit 7 in 4,75,82,310?", marks: 1, options: ["(A) 70,00,000", "(B) 7,00,000", "(C) 70,000", "(D) 7,00,00,000"] },
          { q_num: 2, text: "1 Million is equal to how many Lakhs in the Indian number system?", marks: 1, options: ["(A) 1 Lakh", "(B) 10 Lakhs", "(C) 100 Lakhs", "(D) 1 Crore"] },
          { q_num: 3, text: "Find the product of the largest 4-digit number and smallest 3-digit number.", marks: 1, options: ["(A) 9,99,900", "(B) 99,99,000", "(C) 99,990", "(D) 10,00,000"] },
          { q_num: 4, text: "Which of the following is equivalent to the fraction 3/5?", marks: 1, options: ["(A) 6/15", "(B) 9/15", "(C) 12/25", "(D) 15/20"] }
        ]
      },
      {
        section_name: "SECTION B — Short Answer Type I",
        instructions: "Question numbers 5 to 7 carry 2 marks each. Show all working steps.",
        marks_per_question: 2,
        questions: [
          { q_num: 5, text: "Write the Roman Numeral for: (a) 78  (b) 94", marks: 2 },
          { q_num: 6, text: "Evaluate and express in simplest fraction form: 5/12 + 7/18", marks: 2 },
          { q_num: 7, text: "A factory produces 2,450 light bulbs each day. How many bulbs will it produce in April?", marks: 2 }
        ]
      },
      {
        section_name: "SECTION C — Short Answer Type II",
        instructions: "Question numbers 8 and 9 carry 3 marks each.",
        marks_per_question: 3,
        questions: [
          { q_num: 8, text: "Rohan painted 2/7 of a wall on Saturday and 3/5 of the remainder on Sunday. What fraction of the wall is still unpainted?", marks: 3 },
          { q_num: 9, text: "Find the greatest number which divides 68 and 116 leaving a remainder of 4 in each case.", marks: 3 }
        ]
      },
      {
        section_name: "SECTION D — Long Answer",
        instructions: "Question number 10 carries 5 marks. Internal choice is provided.",
        marks_per_question: 5,
        questions: [
          { 
            q_num: 10, 
            text: "A school auditorium has 45 rows of seats with 32 seats in each row. For the Annual Day function, ticket prices were ₹150 for adults and ₹80 for students. If 850 adult tickets and 520 student tickets were sold, calculate:\n(a) Total seating capacity of the auditorium.\n(b) Number of vacant seats during the show.\n(c) Total revenue collected from ticket sales.", 
            marks: 5,
            or_choice: "OR\nEvaluate the following expression using the DMAS rule:\n[ 4,500 ÷ 15 + 25 × 18 - (120 + 35) ]"
          }
        ]
      },
      {
        section_name: "SECTION E — Case Study Based",
        instructions: "Question number 11 is a Case Study carrying 4 marks.",
        marks_per_question: 4,
        questions: [
          {
            q_num: 11,
            text: "CASE STUDY: School Eco-Garden Project\nStudents of Grade 5 are allocated a rectangular garden plot of 120 square meters. The plot is divided into fractional sections:\n- 1/4 of the area is for Organic Vegetables.\n- 1/3 of the area is for Medicinal Herbs.\n- 1/6 of the area is for Flowering Plants.\n- The remaining area is paved with gravel walkway.\n\nQuestions:\n(i) Calculate the exact area (in sq. m) allocated for Organic Vegetables. [1 Mark]\n(ii) Find the total area occupied by Medicinal Herbs and Flowering Plants combined. [1.5 Marks]\n(iii) What fraction of the total garden plot is reserved for the gravel walkway? [1.5 Marks]",
            marks: 4
          }
        ]
      }
    ],
    status: "Published"
  });

  // Question Picker from Bank Drawer
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [targetSectionIndex, setTargetSectionIndex] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTeachers();
  }, [activeCampusId, selectedSession]);

  useEffect(() => {
    loadSubjects();
  }, [activeCampusId, selectedClass, selectedSession, selectedTeacher]);

  useEffect(() => {
    loadQuestionBank();
    loadGeneratedPapers();
  }, [activeCampusId, selectedSubjectId, selectedClass, selectedSession, selectedTeacher]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadFullSyllabus(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  async function loadTeachers() {
    try {
      const res = await getDistinctTeachers(activeCampusId, selectedSession);
      if (res.success && res.data) {
        setTeacherList(res.data);
      }
    } catch (e) {
      console.error("Error loading teachers:", e);
    }
  }

  async function loadSubjects() {
    try {
      const res = await getAcademicSubjects(
        activeCampusId, 
        selectedSession, 
        selectedClass, 
        selectedTeacher !== "All" ? selectedTeacher : undefined
      );
      if (res.success && res.data) {
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedSubjectId(res.data[0].id);
          setPaperForm(prev => ({ ...prev, subject_id: res.data[0].id }));
        } else {
          setSelectedSubjectId("");
        }
      }
    } catch (e) {
      console.error("Error loading subjects:", e);
    }
  }

  async function loadFullSyllabus(subId: string) {
    try {
      const res = await getSubjectFullSyllabus(subId);
      if (res.success && res.data) setFullSyllabus(res.data);
    } catch (e) {
      console.error("Error loading syllabus:", e);
    }
  }

  async function loadQuestionBank() {
    setIsLoading(true);
    try {
      const res = await getQuestionBank(activeCampusId, selectedSubjectId, undefined, filterType, filterDiff);
      if (res.success && res.data) setQuestionBank(res.data);
    } catch (e) {
      console.error("Error loading question bank:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadGeneratedPapers() {
    try {
      const res = await getGeneratedPapers(
        activeCampusId, 
        selectedSession, 
        selectedClass, 
        selectedSubjectId || undefined,
        selectedTeacher !== "All" ? selectedTeacher : undefined
      );
      if (res.success && res.data) {
        setGeneratedPapers(res.data);
        if (res.data.length > 0) {
          setActivePreviewPaper(res.data[0]);
        } else {
          setActivePreviewPaper(null);
        }
      }
    } catch (e) {
      console.error("Error loading generated papers:", e);
    }
  }

  // --- Question Bank Actions ---
  function openAddQuestion() {
    setEditingQItem(null);
    const firstCh = fullSyllabus?.units?.[0]?.chapters?.[0] || fullSyllabus?.unassignedChapters?.[0];
    setQForm({
      subject_id: selectedSubjectId || subjects[0]?.id || "",
      chapter_id: firstCh?.id || "",
      question_type: "MCQ",
      marks: 1,
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      marking_scheme: "",
      difficulty: "Medium",
      blooms_level: "Understand",
      pdf_attachment_url: ""
    });
    setQBankModalOpen(true);
  }

  function openEditQuestion(q: any) {
    setEditingQItem(q);
    const opts = q.options || [];
    setQForm({
      subject_id: q.subject_id,
      chapter_id: q.chapter_id || "",
      question_type: q.question_type || "MCQ",
      marks: q.marks || 1,
      question_text: q.question_text,
      option_a: opts[0] || "",
      option_b: opts[1] || "",
      option_c: opts[2] || "",
      option_d: opts[3] || "",
      correct_answer: q.correct_answer || "",
      marking_scheme: q.marking_scheme || "",
      difficulty: q.difficulty || "Medium",
      blooms_level: q.blooms_level || "Understand",
      pdf_attachment_url: q.pdf_attachment_url || ""
    });
    setQBankModalOpen(true);
  }

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!qForm.subject_id || !qForm.question_text) {
      alert("Please enter subject and question text.");
      return;
    }

    setIsSaving(true);
    try {
      const optionsArray = qForm.question_type === "MCQ" ? [
        qForm.option_a ? `(A) ${qForm.option_a}` : "",
        qForm.option_b ? `(B) ${qForm.option_b}` : "",
        qForm.option_c ? `(C) ${qForm.option_c}` : "",
        qForm.option_d ? `(D) ${qForm.option_d}` : ""
      ].filter(Boolean) : [];

      const res = await saveQuestionBankItem({
        id: editingQItem?.id,
        campus_id: activeCampusId,
        subject_id: qForm.subject_id,
        chapter_id: qForm.chapter_id || null,
        question_type: qForm.question_type,
        marks: Number(qForm.marks),
        question_text: qForm.question_text,
        options: optionsArray,
        correct_answer: qForm.correct_answer,
        marking_scheme: qForm.marking_scheme,
        difficulty: qForm.difficulty,
        blooms_level: qForm.blooms_level,
        pdf_attachment_url: qForm.pdf_attachment_url,
        created_by: "Faculty"
      });

      if (res.success) {
        setQBankModalOpen(false);
        loadQuestionBank();
      } else {
        alert("Error saving question: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm("Delete this question from question bank?")) return;
    const res = await deleteQuestionBankItem(id);
    if (res.success) loadQuestionBank();
  }

  // --- Paper Designer Actions ---
  function openNewPaperDesigner() {
    setEditingPaperId(null);
    setPaperForm({
      class_name: selectedClass,
      subject_id: selectedSubjectId || subjects[0]?.id || "",
      exam_title: "Periodic Assessment / Examination 2026-27",
      max_marks: 80,
      duration_minutes: 180,
      general_instructions: [
        "This question paper contains 5 sections: A, B, C, D and E.",
        "Section A comprises MCQs of 1 mark each.",
        "Section B comprises Short Answer questions of 2 marks each.",
        "Section C comprises Short Answer questions of 3 marks each.",
        "Section D comprises Long Answer questions of 5 marks each with internal choice.",
        "Section E comprises Case Study / Competency based questions of 4 marks each.",
        "All questions are compulsory. There is no overall choice, however internal choice is provided.",
        "Use of calculators or digital devices is strictly prohibited."
      ],
      sections: [
        {
          section_name: "SECTION A — Objective & MCQs",
          instructions: "1 mark each.",
          marks_per_question: 1,
          questions: []
        },
        {
          section_name: "SECTION B — Short Answer Type I",
          instructions: "2 marks each.",
          marks_per_question: 2,
          questions: []
        },
        {
          section_name: "SECTION C — Short Answer Type II",
          instructions: "3 marks each.",
          marks_per_question: 3,
          questions: []
        },
        {
          section_name: "SECTION D — Long Answer",
          instructions: "5 marks each.",
          marks_per_question: 5,
          questions: []
        }
      ],
      status: "Published"
    });
    setPaperModalOpen(true);
  }

  function openEditPaperDesigner(paper: any) {
    setEditingPaperId(paper.id);
    setPaperForm({
      class_name: paper.class_name,
      subject_id: paper.subject_id,
      exam_title: paper.exam_title,
      max_marks: paper.max_marks || 80,
      duration_minutes: paper.duration_minutes || 180,
      general_instructions: paper.general_instructions || [],
      sections: paper.sections || [],
      status: paper.status || "Published"
    });
    setPaperModalOpen(true);
  }

  function addSectionToPaper() {
    const nextLetter = String.fromCharCode(65 + paperForm.sections.length);
    setPaperForm({
      ...paperForm,
      sections: [
        ...paperForm.sections,
        {
          section_name: `SECTION ${nextLetter} — Custom Questions`,
          instructions: "Solve all questions.",
          marks_per_question: 2,
          questions: []
        }
      ]
    });
  }

  function removeSectionFromPaper(idx: number) {
    const updated = [...paperForm.sections];
    updated.splice(idx, 1);
    setPaperForm({ ...paperForm, sections: updated });
  }

  function addQuestionToSection(sectionIdx: number) {
    const updated = [...paperForm.sections];
    const s = updated[sectionIdx];
    const totalQCount = updated.reduce((sum, sec) => sum + sec.questions.length, 0) + 1;
    s.questions.push({
      q_num: totalQCount,
      text: "",
      marks: s.marks_per_question || 1,
      options: s.marks_per_question === 1 ? ["(A) ", "(B) ", "(C) ", "(D) "] : []
    });
    setPaperForm({ ...paperForm, sections: updated });
  }

  function openBankPickerForSection(secIdx: number) {
    setTargetSectionIndex(secIdx);
    setPickerModalOpen(true);
  }

  function insertBankQuestionToSection(q: any) {
    const updated = [...paperForm.sections];
    const s = updated[targetSectionIndex];
    const totalQCount = updated.reduce((sum, sec) => sum + sec.questions.length, 0) + 1;

    s.questions.push({
      q_num: totalQCount,
      text: q.question_text,
      marks: q.marks || s.marks_per_question || 1,
      options: q.options || [],
      correct_answer: q.correct_answer,
      marking_scheme: q.marking_scheme
    });

    setPaperForm({ ...paperForm, sections: updated });
    alert("✓ Question inserted into " + s.section_name);
  }

  async function handleSavePaper(e: React.FormEvent) {
    e.preventDefault();
    if (!paperForm.subject_id || !paperForm.exam_title) {
      alert("Please enter subject and exam title.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveGeneratedPaper({
        id: editingPaperId || undefined,
        campus_id: activeCampusId,
        academic_session: selectedSession,
        class_name: paperForm.class_name,
        subject_id: paperForm.subject_id,
        exam_title: paperForm.exam_title,
        max_marks: Number(paperForm.max_marks),
        duration_minutes: Number(paperForm.duration_minutes),
        general_instructions: paperForm.general_instructions,
        sections: paperForm.sections,
        status: paperForm.status,
        created_by: "Academic Dean & Teachers"
      });

      if (res.success) {
        setPaperModalOpen(false);
        await loadGeneratedPapers();
        if (res.data) setActivePreviewPaper(res.data);
      } else {
        alert("Error saving paper: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePaper(id: string) {
    if (!confirm("Delete this generated question paper?")) return;
    const res = await deleteGeneratedPaper(id);
    if (res.success) {
      loadGeneratedPapers();
      if (activePreviewPaper?.id === id) setActivePreviewPaper(null);
    }
  }

  function handlePrintPaper() {
    window.print();
  }

  const allChapters = [
    ...(fullSyllabus?.units?.flatMap((u: any) => u.chapters || []) || []),
    ...(fullSyllabus?.unassignedChapters || [])
  ];

  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Examinations & Assessment Suite
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Standard CBSE / ICSE Question Paper Engine</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Printer className="w-8 h-8 text-amber-600" />
            Standard Question Paper Generator & Bank
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Assemble, formulate, and print standardized examination question papers and model answer keys with school headers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Academic Session Selector */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-stone-400 font-bold">Session:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent text-xs font-black text-stone-900 focus:outline-none"
            >
              <option value="2026-2027">2026–2027 (Active)</option>
              <option value="2025-2026">2025–2026 (Archived)</option>
              <option value="2024-2025">2024–2025 (Archived)</option>
              <option value="2027-2028">2027–2028 (Upcoming)</option>
            </select>
          </div>

          {/* Teacher Subject Access Filter */}
          <div className="flex items-center gap-2 bg-purple-50/70 border border-purple-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-purple-700 font-bold">Teacher Access:</span>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="bg-transparent text-xs font-black text-purple-950 focus:outline-none max-w-[180px] truncate"
            >
              <option value="All">👑 Admin View (All Subjects)</option>
              {teacherList.map(t => (
                <option key={t.teacher_name} value={t.teacher_name}>
                  👨‍🏫 {t.teacher_name} ({t.subjects.length} Sub)
                </option>
              ))}
            </select>
          </div>

          {/* Class Selector */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-stone-400 font-bold">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubjectId("");
              }}
              className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
            >
              {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={activeTab === "generator" ? openNewPaperDesigner : openAddQuestion}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> 
            {activeTab === "generator" ? "Design Question Paper" : "Add Question to Bank"}
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("generator")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "generator" 
              ? "bg-white text-stone-900 shadow-xs border border-stone-200" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Printer className="w-4 h-4 text-amber-600" />
          <span>Question Paper Generator & Print View ({generatedPapers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "bank" 
              ? "bg-white text-stone-900 shadow-xs border border-stone-200" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Question Bank Master & PDF Uploads ({questionBank.length})</span>
        </button>
      </div>

      {/* TAB 1: QUESTION PAPER GENERATOR & PRINT VIEW */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          
          {/* Top Paper Selector Bar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-400">Select Paper:</span>
              <select
                value={activePreviewPaper?.id || ""}
                onChange={(e) => {
                  const paper = generatedPapers.find(p => p.id === e.target.value);
                  if (paper) setActivePreviewPaper(paper);
                }}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900"
              >
                {generatedPapers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.exam_title} — {p.academic_subjects?.name} ({p.class_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  showMarkingScheme 
                    ? "bg-purple-100 text-purple-900 border-purple-300" 
                    : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                }`}
              >
                {showMarkingScheme ? "🔑 View Question Paper" : "🔑 View Marking Scheme / Answer Key"}
              </button>

              {activePreviewPaper && (
                <>
                  <button
                    type="button"
                    onClick={() => openEditPaperDesigner(activePreviewPaper)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
                    title="Edit Question Paper"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePaper(activePreviewPaper.id)}
                    className="p-2 bg-stone-100 hover:bg-red-100 text-red-600 rounded-xl transition"
                    title="Delete Paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handlePrintPaper}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print (A4 Format)
              </button>
            </div>
          </div>

          {/* OFFICIAL CBSE/ICSE STANDARDIZED PRINTABLE EXAMINATION SHEET */}
          {activePreviewPaper ? (
            <div 
              ref={printAreaRef}
              className="bg-white rounded-3xl border border-stone-300 shadow-lg p-8 sm:p-12 max-w-4xl mx-auto text-stone-900 font-serif space-y-6 print:shadow-none print:border-none print:p-0 print:m-0"
            >
              
              {/* Header Box */}
              <div className="text-center border-b-2 border-stone-900 pb-4 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-sans">
                  CRAYON BOX SCHOOL
                </h1>
                <p className="text-xs font-sans font-bold text-stone-600 uppercase tracking-widest">
                  Affiliated to CBSE, New Delhi • School ID: 1253481 • UDISE: 07124100151
                </p>
                <div className="pt-2 text-sm sm:text-base font-black font-sans uppercase tracking-tight text-stone-900">
                  {activePreviewPaper.exam_title} • SESSION {activePreviewPaper.academic_session}
                </div>
              </div>

              {/* Student Candidate & Exam Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans font-bold border-b border-stone-300 pb-3">
                <div>
                  <span className="text-stone-500 block text-[10px]">CLASS / GRADE:</span>
                  <strong className="text-stone-900 text-sm">{activePreviewPaper.class_name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">SUBJECT:</span>
                  <strong className="text-stone-900 text-sm">{activePreviewPaper.academic_subjects?.name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">MAXIMUM MARKS:</span>
                  <strong className="text-stone-900 text-sm font-mono">{activePreviewPaper.max_marks} MARKS</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">TIME ALLOWED:</span>
                  <strong className="text-stone-900 text-sm font-mono">{Math.floor(activePreviewPaper.duration_minutes / 60)} Hours ({activePreviewPaper.duration_minutes} Mins)</strong>
                </div>
              </div>

              {/* Candidate Details Line */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans border-b border-stone-300 pb-3">
                <div className="border border-stone-400 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-stone-500 font-bold">Roll Number:</span>
                  <span className="font-mono text-stone-400">________________________</span>
                </div>
                <div className="border border-stone-400 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-stone-500 font-bold">Student Name:</span>
                  <span className="font-mono text-stone-400">________________________</span>
                </div>
              </div>

              {/* General Instructions */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-sans space-y-1.5">
                <strong className="block text-stone-900 uppercase tracking-wider text-[11px]">General Instructions:</strong>
                <ol className="list-decimal pl-5 space-y-0.5 text-stone-700 text-[11.5px]">
                  {(activePreviewPaper.general_instructions || []).map((inst: string, idx: number) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>

              {/* SECTIONS & QUESTIONS */}
              <div className="space-y-8 pt-4">
                {(activePreviewPaper.sections || []).map((sec: any, sIdx: number) => (
                  <div key={sIdx} className="space-y-4">
                    
                    {/* Section Header */}
                    <div className="border-b-2 border-stone-800 pb-1 flex justify-between items-baseline font-sans">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider text-stone-900">
                          {sec.section_name}
                        </h3>
                        {sec.instructions && (
                          <p className="text-[11px] text-stone-500 italic font-serif">{sec.instructions}</p>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-700">
                        {sec.questions?.reduce((sum: number, q: any) => sum + (q.marks || sec.marks_per_question || 1), 0)} Marks
                      </span>
                    </div>

                    {/* Questions in Section */}
                    <div className="space-y-5">
                      {(sec.questions || []).map((q: any, qIdx: number) => (
                        <div key={qIdx} className="space-y-2 text-sm leading-relaxed">
                          
                          {/* Question Text & Marks */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <span className="font-sans font-black mr-2">Q{q.q_num || qIdx + 1}.</span>
                              <span className="text-stone-900 whitespace-pre-line">{q.text}</span>
                            </div>
                            <span className="font-sans font-bold font-mono text-stone-900 shrink-0 text-xs bg-stone-100 px-2 py-0.5 rounded">
                              [{q.marks || sec.marks_per_question || 1}]
                            </span>
                          </div>

                          {/* Multiple Choice Options */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pt-1 text-xs font-sans font-medium text-stone-800">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} className="flex items-center gap-1.5">
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Internal Choice (OR Question) */}
                          {q.or_choice && (
                            <div className="pt-2 pl-6 space-y-1 text-xs italic font-sans border-l-2 border-stone-300 ml-2">
                              <span className="font-black uppercase tracking-wider text-stone-700 not-italic block">OR</span>
                              <p className="text-stone-800 whitespace-pre-line not-italic">{q.or_choice}</p>
                            </div>
                          )}

                          {/* Marking Scheme Answer Key Preview (If toggled) */}
                          {showMarkingScheme && (q.correct_answer || q.marking_scheme) && (
                            <div className="mt-2 p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs font-sans text-purple-950 space-y-1">
                              <strong className="block text-purple-900 font-bold">🔑 Model Solution & Marking Scheme:</strong>
                              {q.correct_answer && <div><strong>Correct Answer:</strong> {q.correct_answer}</div>}
                              {q.marking_scheme && <div className="text-[11px] text-purple-800">{q.marking_scheme}</div>}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

              {/* Examination Footer */}
              <div className="pt-8 border-t border-stone-300 text-center text-xs font-sans font-bold text-stone-400 uppercase tracking-widest">
                *** END OF QUESTION PAPER — ALL THE BEST ***
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <Printer className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-black text-stone-900">No Question Papers Created</h3>
              <p className="text-xs text-stone-500">Click "Design Question Paper" to construct your first examination sheet.</p>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: QUESTION BANK MASTER */}
      {activeTab === "bank" && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-stone-400 font-bold">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-stone-400 font-bold">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="MCQ">MCQs (1M)</option>
                  <option value="ShortAnswer">Short Answer (2-3M)</option>
                  <option value="LongAnswer">Long Answer (5M)</option>
                  <option value="CaseStudy">Case Study (4M)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-stone-400 font-bold">Difficulty:</span>
                <select
                  value={filterDiff}
                  onChange={(e) => setFilterDiff(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddQuestion}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Question to Bank
            </button>
          </div>

          {/* Question Bank List */}
          <div className="space-y-4">
            {questionBank.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 shadow-xs space-y-3">
                <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-black text-stone-900">Question Bank is Empty</h3>
                <p className="text-xs text-stone-500">Add questions with options, step-wise marking schemes, and PDF attachments.</p>
              </div>
            ) : (
              questionBank.map((q) => (
                <div key={q.id} className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-3 hover:border-purple-200 transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-900 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                        {q.question_type} • {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-800' :
                        q.difficulty === 'Medium' ? 'bg-blue-50 text-blue-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold">
                        Bloom: {q.blooms_level}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEditQuestion(q)} className="p-1.5 text-stone-400 hover:text-stone-800 transition">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 text-stone-400 hover:text-red-600 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-stone-900 whitespace-pre-line">
                    {q.question_text}
                  </p>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-100 text-xs">
                      {q.options.map((opt: string, idx: number) => (
                        <div key={idx} className="text-stone-700">{opt}</div>
                      ))}
                    </div>
                  )}

                  {/* Answer & Marking Scheme */}
                  <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-950 space-y-1">
                    {q.correct_answer && <div><strong>Correct Answer:</strong> {q.correct_answer}</div>}
                    {q.marking_scheme && <div className="text-[11px] text-purple-800"><strong>Marking Scheme:</strong> {q.marking_scheme}</div>}
                  </div>

                  {/* PDF Attachment (If any) */}
                  {q.pdf_attachment_url && (
                    <div className="pt-1">
                      <a
                        href={q.pdf_attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Attached Question PDF / Diagram
                      </a>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10.5px] text-stone-400 pt-1 border-t border-stone-100">
                    <span>Subject: <strong>{q.academic_subjects?.name} ({q.academic_subjects?.class_name})</strong></span>
                    <span>Chapter: <strong>{q.syllabus_chapters?.chapter_name || 'General'}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* --- MODAL 1: ADD / EDIT QUESTION TO BANK (WITH PDF UPLOADER) --- */}
      {qBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingQItem ? "Edit Question in Bank" : "Add Question to Question Bank"}
              </h3>
              <button onClick={() => setQBankModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject *</label>
                  <select
                    value={qForm.subject_id}
                    onChange={(e) => setQForm({ ...qForm, subject_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Chapter Master</label>
                  <select
                    value={qForm.chapter_id}
                    onChange={(e) => setQForm({ ...qForm, chapter_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="">-- All Chapters / General --</option>
                    {allChapters.map(ch => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.chapter_number}: {ch.chapter_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Question Type</label>
                  <select
                    value={qForm.question_type}
                    onChange={(e) => {
                      const t = e.target.value;
                      const marksMap: any = { MCQ: 1, FillBlanks: 1, VeryShort: 1, ShortAnswer: 2, LongAnswer: 5, CaseStudy: 4 };
                      setQForm({ ...qForm, question_type: t, marks: marksMap[t] || 1 });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="FillBlanks">Fill in the Blanks</option>
                    <option value="VeryShort">Very Short (1 Mark)</option>
                    <option value="ShortAnswer">Short Answer (2-3 Marks)</option>
                    <option value="LongAnswer">Long Answer (5 Marks)</option>
                    <option value="CaseStudy">Case Study (4 Marks)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Marks</label>
                  <input
                    type="number"
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Difficulty Level</label>
                  <select
                    value={qForm.difficulty}
                    onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Question Statement / Text *</label>
                <textarea
                  placeholder="Enter the complete question text, scenario or problem..."
                  value={qForm.question_text}
                  onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                  required
                />
              </div>

              {/* MCQ Options (If MCQ) */}
              {qForm.question_type === "MCQ" && (
                <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <label className="font-bold text-stone-700 block text-xs">MCQ Options:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option A"
                      value={qForm.option_a}
                      onChange={(e) => setQForm({ ...qForm, option_a: e.target.value })}
                      className="bg-white border border-stone-200 rounded-xl p-2 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Option B"
                      value={qForm.option_b}
                      onChange={(e) => setQForm({ ...qForm, option_b: e.target.value })}
                      className="bg-white border border-stone-200 rounded-xl p-2 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      value={qForm.option_c}
                      onChange={(e) => setQForm({ ...qForm, option_c: e.target.value })}
                      className="bg-white border border-stone-200 rounded-xl p-2 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Option D"
                      value={qForm.option_d}
                      onChange={(e) => setQForm({ ...qForm, option_d: e.target.value })}
                      className="bg-white border border-stone-200 rounded-xl p-2 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Correct Answer</label>
                  <input
                    type="text"
                    placeholder="e.g. (B) 10 Lakhs"
                    value={qForm.correct_answer}
                    onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Bloom's Taxonomy Level</label>
                  <select
                    value={qForm.blooms_level}
                    onChange={(e) => setQForm({ ...qForm, blooms_level: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Remember">Remember</option>
                    <option value="Understand">Understand</option>
                    <option value="Apply">Apply</option>
                    <option value="Analyse">Analyse</option>
                    <option value="Evaluate">Evaluate</option>
                    <option value="Create">Create</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Marking Scheme / Step Marks Breakdown</label>
                <textarea
                  placeholder="e.g. 1 mark for formula, 1 mark for calculation, 1 mark for unit"
                  value={qForm.marking_scheme}
                  onChange={(e) => setQForm({ ...qForm, marking_scheme: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                />
              </div>

              {/* UNIVERSAL PDF UPLOADER FOR QUESTION ATTACHMENTS */}
              <PdfUploader
                label="Attach Reference Diagram or Question Worksheet (PDF)"
                helperText="Upload PDF for diagrams, geometry sheets, or passages"
                initialUrl={qForm.pdf_attachment_url}
                onPdfUploaded={(data) => setQForm({ ...qForm, pdf_attachment_url: data.fileUrl })}
                onPdfRemoved={() => setQForm({ ...qForm, pdf_attachment_url: "" })}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setQBankModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingQItem ? "Update Question" : "Save Question to Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: QUESTION PAPER DESIGNER & BLUEPRINT BUILDER --- */}
      {paperModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  Examination Paper Designer
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  {editingPaperId ? "Edit Examination Question Paper" : "Design New Question Paper"}
                </h3>
              </div>
              <button onClick={() => setPaperModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePaper} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Exam Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-Term Examination 2026-27"
                    value={paperForm.exam_title}
                    onChange={(e) => setPaperForm({ ...paperForm, exam_title: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject *</label>
                  <select
                    value={paperForm.subject_id}
                    onChange={(e) => setPaperForm({ ...paperForm, subject_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    value={paperForm.max_marks}
                    onChange={(e) => setPaperForm({ ...paperForm, max_marks: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="10"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={paperForm.duration_minutes}
                    onChange={(e) => setPaperForm({ ...paperForm, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="30"
                    max="300"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={paperForm.status}
                    onChange={(e) => setPaperForm({ ...paperForm, status: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Sections & Questions Builder */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <span className="font-black text-stone-900 text-sm">
                    Paper Sections & Question Layout ({paperForm.sections.length} Sections)
                  </span>
                  <button
                    type="button"
                    onClick={addSectionToPaper}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition"
                  >
                    + Add Section
                  </button>
                </div>

                <div className="space-y-4">
                  {paperForm.sections.map((sec, secIdx) => (
                    <div key={secIdx} className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex justify-between items-center gap-3 border-b border-stone-200 pb-2">
                        <input
                          type="text"
                          value={sec.section_name}
                          onChange={(e) => {
                            const updated = [...paperForm.sections];
                            updated[secIdx].section_name = e.target.value;
                            setPaperForm({ ...paperForm, sections: updated });
                          }}
                          className="font-black text-stone-900 bg-transparent border-b border-dashed border-stone-300 focus:outline-none text-xs sm:text-sm flex-1"
                        />

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openBankPickerForSection(secIdx)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-lg text-[11px]"
                          >
                            + Bank Question
                          </button>
                          <button
                            type="button"
                            onClick={() => addQuestionToSection(secIdx)}
                            className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                          >
                            + Custom Question
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSectionFromPaper(secIdx)}
                            className="p-1 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Questions in Section */}
                      <div className="space-y-2.5">
                        {sec.questions.map((q: any, qIdx: number) => (
                          <div key={qIdx} className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-stone-400 shrink-0">Q{q.q_num || qIdx + 1}.</span>
                              <textarea
                                value={q.text}
                                onChange={(e) => {
                                  const updated = [...paperForm.sections];
                                  updated[secIdx].questions[qIdx].text = e.target.value;
                                  setPaperForm({ ...paperForm, sections: updated });
                                }}
                                placeholder="Enter question statement..."
                                rows={2}
                                className="w-full bg-stone-50/50 border border-stone-100 rounded-lg p-1.5 font-medium text-stone-900 text-xs"
                              />
                              <input
                                type="number"
                                value={q.marks}
                                onChange={(e) => {
                                  const updated = [...paperForm.sections];
                                  updated[secIdx].questions[qIdx].marks = Number(e.target.value);
                                  setPaperForm({ ...paperForm, sections: updated });
                                }}
                                className="w-12 bg-stone-50 border border-stone-200 rounded-lg p-1 font-mono font-bold text-center text-xs"
                                min="1"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...paperForm.sections];
                                  updated[secIdx].questions.splice(qIdx, 1);
                                  setPaperForm({ ...paperForm, sections: updated });
                                }}
                                className="p-1 text-stone-300 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </div>

                            {/* Options if provided */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-2 gap-1.5 pl-6 text-[11px]">
                                {q.options.map((opt: string, optIdx: number) => (
                                  <input
                                    key={optIdx}
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...paperForm.sections];
                                      const currentQ = updated[secIdx]?.questions?.[qIdx];
                                      if (currentQ && currentQ.options) {
                                        const newOpts = [...currentQ.options];
                                        newOpts[optIdx] = e.target.value;
                                        currentQ.options = newOpts;
                                        setPaperForm({ ...paperForm, sections: updated });
                                      }
                                    }}
                                    className="bg-stone-50 border border-stone-200 rounded-lg p-1"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setPaperModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-xs">
                  {isSaving ? "Saving Paper..." : editingPaperId ? "Update Question Paper" : "Generate Examination Paper"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: QUESTION BANK PICKER DRAWER --- */}
      {pickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">
                Insert Question from Bank into {paperForm.sections[targetSectionIndex]?.section_name}
              </h3>
              <button onClick={() => setPickerModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              {questionBank.map((q) => (
                <div key={q.id} className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2 text-xs flex justify-between items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-purple-100 text-purple-900 font-bold text-[10px] px-2 py-0.5 rounded">
                        {q.question_type} • {q.marks}M
                      </span>
                      <span className="text-stone-400 font-bold">{q.difficulty}</span>
                    </div>
                    <p className="font-semibold text-stone-800">{q.question_text}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      insertBankQuestionToSection(q);
                      setPickerModalOpen(false);
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shrink-0"
                  >
                    + Insert
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
