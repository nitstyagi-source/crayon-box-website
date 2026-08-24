"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Printer, Plus, Edit3, Trash2, BookOpen, Layers, 
  CheckCircle2, FileText, Download, Sparkles, Filter, 
  ChevronDown, ChevronRight, Eye, Save, HelpCircle, 
  Award, Copy, ArrowUp, ArrowDown, FileQuestion, Upload,
  Palette, Star, Smile, Heart, CheckSquare, Compass,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  Maximize2, Minimize2, Grid, Hash, AlignJustify
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { printIsolatedElement } from "@/lib/printUtils";
import { 
  getAcademicSubjects, getSubjectFullSyllabus,
  getQuestionBank, saveQuestionBankItem, deleteQuestionBankItem,
  getGeneratedPapers, getGeneratedPaperById, saveGeneratedPaper, deleteGeneratedPaper,
  getDistinctTeachers
} from "@/app/actions/syllabus-core";
import PdfUploader from "@/components/ui/PdfUploader";
import ImageUploader from "@/components/ui/ImageUploader";
import WritingGuideRenderer, { WritingGuideType } from "@/components/ui/WritingGuideRenderer";

interface PaperQuestion {
  q_num: number;
  text: string;
  marks: number;
  options?: string[];
  or_choice?: string;
  correct_answer?: string;
  marking_scheme?: string;
  image_url?: string;
  image_size?: "small" | "medium" | "large" | "full";
  image_alignment?: "left" | "center" | "right";
  image_caption?: string;
  writing_guide_type?: WritingGuideType;
  writing_guide_rows?: number;
  math_column_op?: "+" | "-" | "×" | "÷";
  math_column_num1?: string;
  math_column_num2?: string;
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

const FOUNDATIONAL_CLASSES = ["Nursery", "LKG", "UKG", "Grade 1", "Grade 2"];
const ALL_CLASSES = [
  "Nursery", "LKG", "UKG", 
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
];

export default function QuestionPaperGeneratorPage() {
  const { activeCampusId } = useCampusContext();
  const { selectedInstitutionObj } = useInstitution();
  const [activeTab, setActiveTab] = useState<"generator" | "worksheets" | "bank">("generator");
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [selectedTeacher, setSelectedTeacher] = useState("All");
  const [myPapersOnly, setMyPapersOnly] = useState(false);
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
    pdf_attachment_url: "",
    image_url: "",
    image_size: "medium" as "small" | "medium" | "large" | "full",
    image_alignment: "center" as "left" | "center" | "right",
    image_caption: "",
    writing_guide_type: "none" as WritingGuideType,
    writing_guide_rows: 2,
    math_column_op: "+" as "+" | "-" | "×" | "÷",
    math_column_num1: "458",
    math_column_num2: "273"
  });

  // Generated Papers State
  const [generatedPapers, setGeneratedPapers] = useState<any[]>([]);
  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [activePreviewPaper, setActivePreviewPaper] = useState<any>(null);
  const [showMarkingScheme, setShowMarkingScheme] = useState(false);

  // Expanded tools per question inside designer modal
  const [activeToolIndex, setActiveToolIndex] = useState<{ secIdx: number; qIdx: number; tool: "image" | "lines" | null }>({
    secIdx: -1,
    qIdx: -1,
    tool: null
  });

  // Paper / Worksheet Designer Form
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
          { q_num: 5, text: "Write the Roman Numeral for: (a) 78  (b) 94", marks: 2, writing_guide_type: "none" },
          { q_num: 6, text: "Evaluate and express in simplest fraction form: 5/12 + 7/18", marks: 2, writing_guide_type: "none" },
          { q_num: 7, text: "A factory produces 2,450 light bulbs each day. How many bulbs will it produce in April?", marks: 2, writing_guide_type: "none" }
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

  const isMotherTeacherClass = FOUNDATIONAL_CLASSES.includes(selectedClass);

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
        let papers = res.data;
        if (myPapersOnly && selectedTeacher !== "All") {
          papers = papers.filter((p: any) => 
            p.created_by?.toLowerCase().includes(selectedTeacher.toLowerCase()) ||
            p.academic_subjects?.teacher_name?.toLowerCase().includes(selectedTeacher.toLowerCase())
          );
        }
        setGeneratedPapers(papers);
        if (papers.length > 0) {
          setActivePreviewPaper(papers[0]);
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
    setQForm({
      subject_id: selectedSubjectId || (subjects[0]?.id || ""),
      chapter_id: "",
      question_type: isMotherTeacherClass ? "ShortAnswer" : "MCQ",
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
      pdf_attachment_url: "",
      image_url: "",
      image_size: "medium",
      image_alignment: "center",
      image_caption: "",
      writing_guide_type: isMotherTeacherClass ? "english_4lines" : "none",
      writing_guide_rows: 2,
      math_column_op: "+",
      math_column_num1: "458",
      math_column_num2: "273"
    });
    setQBankModalOpen(true);
  }

  function openEditQuestion(q: any) {
    setEditingQItem(q);
    setQForm({
      subject_id: q.subject_id,
      chapter_id: q.chapter_id || "",
      question_type: q.question_type || "MCQ",
      marks: q.marks || 1,
      question_text: q.question_text || "",
      option_a: q.options?.[0] || "",
      option_b: q.options?.[1] || "",
      option_c: q.options?.[2] || "",
      option_d: q.options?.[3] || "",
      correct_answer: q.correct_answer || "",
      marking_scheme: q.marking_scheme || "",
      difficulty: q.difficulty || "Medium",
      blooms_level: q.blooms_level || "Understand",
      pdf_attachment_url: q.pdf_attachment_url || "",
      image_url: q.image_url || "",
      image_size: q.image_size || "medium",
      image_alignment: q.image_alignment || "center",
      image_caption: q.image_caption || "",
      writing_guide_type: q.writing_guide_type || "none",
      writing_guide_rows: q.writing_guide_rows || 2,
      math_column_op: q.math_column_op || "+",
      math_column_num1: q.math_column_num1 || "458",
      math_column_num2: q.math_column_num2 || "273"
    });
    setQBankModalOpen(true);
  }

  async function handleSaveQuestionBankItem(e: React.FormEvent) {
    e.preventDefault();
    if (!qForm.subject_id || !qForm.question_text) {
      alert("Please fill in Subject and Question text.");
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
        pdf_attachment_url: qForm.pdf_attachment_url || undefined,
        image_url: qForm.image_url || undefined,
        image_size: qForm.image_size,
        image_alignment: qForm.image_alignment,
        image_caption: qForm.image_caption,
        writing_guide_type: qForm.writing_guide_type,
        writing_guide_rows: Number(qForm.writing_guide_rows),
        math_column_op: qForm.math_column_op,
        math_column_num1: qForm.math_column_num1,
        math_column_num2: qForm.math_column_num2,
        created_by: selectedTeacher !== "All" ? selectedTeacher : "Academic Staff"
      });

      if (res.success) {
        setQBankModalOpen(false);
        loadQuestionBank();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm("Delete this question from the bank?")) return;
    const res = await deleteQuestionBankItem(id);
    if (res.success) loadQuestionBank();
  }

  // --- Paper Designer Actions ---
  function openNewPaperDesigner(isWorksheet = false) {
    setEditingPaperId(null);
    const defSubId = selectedSubjectId || (subjects[0]?.id || "");
    
    if (isWorksheet || isMotherTeacherClass) {
      // Early childhood Worksheet format with 4-lines and Math Column options
      setPaperForm({
        class_name: selectedClass,
        subject_id: defSubId,
        exam_title: `${selectedClass} Activity & Skill Evaluation Worksheet`,
        max_marks: 25,
        duration_minutes: 60,
        general_instructions: [
          "Encourage the child to hold the crayon/pencil independently.",
          "Read instructions clearly and cheerfully to the student.",
          "Write neatly inside the guided 4-lines and math boxes."
        ],
        sections: [
          {
            section_name: "ACTIVITY 1: English Handwriting & Phonics (4-Lines Guide)",
            instructions: "Write the capital and small letters neatly inside the 4-lines.",
            marks_per_question: 5,
            questions: [
              { 
                q_num: 1, 
                text: "Look at the letter and write 3 times on the 4-lines:\nLetter 'A a' (Apple 🍎)", 
                marks: 5,
                writing_guide_type: "english_4lines",
                writing_guide_rows: 2
              }
            ]
          },
          {
            section_name: "ACTIVITY 2: Hindi Swar & Vyanjan (Hindi 2-Lines)",
            instructions: "सुंदर अक्षरों में नीचे दी गई दो-लाइनों में लिखिए।",
            marks_per_question: 5,
            questions: [
              { 
                q_num: 2, 
                text: "चित्र देखकर पहला अक्षर लिखिए: अ से अनार (🍎), आ से आम (🥭)", 
                marks: 5,
                writing_guide_type: "hindi_2lines",
                writing_guide_rows: 2
              }
            ]
          },
          {
            section_name: "ACTIVITY 3: Math Place Value Column Addition",
            instructions: "Add the numbers in place value columns (H T O).",
            marks_per_question: 5,
            questions: [
              { 
                q_num: 3, 
                text: "Solve the column addition problem:", 
                marks: 5,
                writing_guide_type: "math_column",
                math_column_op: "+",
                math_column_num1: "452",
                math_column_num2: "326"
              }
            ]
          },
          {
            section_name: "ACTIVITY 4: Number Writing (Square-Grid Box)",
            instructions: "Write numbers from 21 to 30 in the square grid boxes.",
            marks_per_question: 5,
            questions: [
              { 
                q_num: 4, 
                text: "Fill in the numbers in the square grid boxes:", 
                marks: 5,
                writing_guide_type: "math_grid",
                writing_guide_rows: 2
              }
            ]
          }
        ],
        status: "Published"
      });
    } else {
      // Standard CBSE Examination format
      setPaperForm({
        class_name: selectedClass,
        subject_id: defSubId,
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
            section_name: "SECTION A — OBJECTIVE & MCQS",
            instructions: "1 mark each",
            marks_per_question: 1,
            questions: []
          },
          {
            section_name: "SECTION B — SHORT ANSWER TYPE I",
            instructions: "2 marks each",
            marks_per_question: 2,
            questions: []
          },
          {
            section_name: "SECTION C — SHORT ANSWER TYPE II",
            instructions: "3 marks each",
            marks_per_question: 3,
            questions: []
          },
          {
            section_name: "SECTION D — LONG ANSWER",
            instructions: "5 marks each",
            marks_per_question: 5,
            questions: []
          }
        ],
        status: "Published"
      });
    }
    setPaperModalOpen(true);
  }

  function openEditPaperDesigner(paper: any) {
    setEditingPaperId(paper.id);
    setPaperForm({
      class_name: paper.class_name,
      subject_id: paper.subject_id,
      exam_title: paper.exam_title,
      max_marks: paper.max_marks,
      duration_minutes: paper.duration_minutes,
      general_instructions: paper.general_instructions || [],
      sections: paper.sections || [],
      status: paper.status || "Published"
    });
    setPaperModalOpen(true);
  }

  function addSectionToPaper() {
    const secLetter = String.fromCharCode(65 + paperForm.sections.length);
    setPaperForm({
      ...paperForm,
      sections: [
        ...paperForm.sections,
        {
          section_name: isMotherTeacherClass ? `ACTIVITY ${paperForm.sections.length + 1}: Skill Practice` : `SECTION ${secLetter} — Questions`,
          instructions: isMotherTeacherClass ? "Complete the activity neatly." : "Answer all questions.",
          marks_per_question: 2,
          questions: []
        }
      ]
    });
  }

  function addCustomQuestionToSection(secIdx: number) {
    const totalQCount = paperForm.sections.reduce((sum, s) => sum + s.questions.length, 0) + 1;
    const updated = [...paperForm.sections];
    updated[secIdx].questions.push({
      q_num: totalQCount,
      text: isMotherTeacherClass ? "Write or draw in the given space: ____________________" : "State and explain...",
      marks: updated[secIdx].marks_per_question || (isMotherTeacherClass ? 5 : 2),
      options: [],
      image_size: "medium",
      image_alignment: "center",
      writing_guide_type: isMotherTeacherClass ? "english_4lines" : "none",
      writing_guide_rows: 2
    });
    setPaperForm({ ...paperForm, sections: updated });
  }

  function openQuestionPicker(secIdx: number) {
    setTargetSectionIndex(secIdx);
    setPickerModalOpen(true);
  }

  function insertQuestionFromBank(bankItem: any) {
    const updated = [...paperForm.sections];
    const totalQCount = paperForm.sections.reduce((sum, s) => sum + s.questions.length, 0) + 1;
    updated[targetSectionIndex].questions.push({
      q_num: totalQCount,
      text: bankItem.question_text,
      marks: bankItem.marks,
      options: bankItem.options || [],
      correct_answer: bankItem.correct_answer,
      marking_scheme: bankItem.marking_scheme,
      image_url: bankItem.image_url,
      image_size: bankItem.image_size || "medium",
      image_alignment: bankItem.image_alignment || "center",
      image_caption: bankItem.image_caption,
      writing_guide_type: bankItem.writing_guide_type || "none",
      writing_guide_rows: bankItem.writing_guide_rows || 2,
      math_column_op: bankItem.math_column_op || "+",
      math_column_num1: bankItem.math_column_num1,
      math_column_num2: bankItem.math_column_num2
    });
    setPaperForm({ ...paperForm, sections: updated });
    setPickerModalOpen(false);
  }

  function removeQuestionFromSection(secIdx: number, qIdx: number) {
    const updated = [...paperForm.sections];
    updated[secIdx].questions.splice(qIdx, 1);
    setPaperForm({ ...paperForm, sections: updated });
  }

  async function handleSavePaper(e: React.FormEvent) {
    e.preventDefault();
    if (!paperForm.subject_id || !paperForm.exam_title) {
      alert("Please fill in Subject and Exam Title.");
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
        created_by: isMotherTeacherClass ? `Mother Teacher (${selectedTeacher !== "All" ? selectedTeacher : "Class Faculty"})` : "Academic Dean & Teachers"
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

  async function handleDuplicatePaper(paper: any) {
    if (!paper) return;
    if (!confirm(`Duplicate "${paper.exam_title}" as a new editable copy?`)) return;
    setIsSaving(true);
    try {
      const res = await saveGeneratedPaper({
        campus_id: activeCampusId,
        academic_session: selectedSession,
        class_name: paper.class_name,
        subject_id: paper.subject_id,
        exam_title: `${paper.exam_title} (Copy)`,
        max_marks: Number(paper.max_marks || 80),
        duration_minutes: Number(paper.duration_minutes || 180),
        general_instructions: paper.general_instructions || [],
        sections: paper.sections || [],
        status: "Draft",
        created_by: selectedTeacher !== "All" ? selectedTeacher : (paper.created_by || "Faculty")
      });
      if (res.success) {
        alert("🎉 Document duplicated successfully as a new draft!");
        await loadGeneratedPapers();
        if (res.data) setActivePreviewPaper(res.data);
      } else {
        alert("Error duplicating document: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePaper(id: string) {
    if (!confirm("Delete this generated paper/worksheet?")) return;
    const res = await deleteGeneratedPaper(id);
    if (res.success) {
      loadGeneratedPapers();
      if (activePreviewPaper?.id === id) setActivePreviewPaper(null);
    }
  }

  function handlePrintPaper() {
    if (printAreaRef.current) {
      printIsolatedElement(printAreaRef.current, activePreviewPaper?.exam_title || "Exam-Paper");
    } else {
      window.print();
    }
  }

  const allChapters = [
    ...(fullSyllabus?.units?.flatMap((u: any) => u.chapters || []) || []),
    ...(fullSyllabus?.unassignedChapters || [])
  ];

  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  // Filter out empty sections for clean printing
  const nonEmptySections = (activePreviewPaper?.sections || []).filter((s: any) => s.questions && s.questions.length > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* GLOBAL PRINT ISOLATION STYLES */}
      <style jsx global>{`
        @media print {
          /* Hide EVERYTHING on the entire webpage */
          body * {
            visibility: hidden !important;
          }
          
          /* Show ONLY the printable paper container */
          #printable-exam-sheet,
          #printable-exam-sheet * {
            visibility: visible !important;
          }

          #printable-exam-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 6mm 10mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 14pt !important;
            line-height: 1.4 !important;
          }

          .print\\:hidden,
          header,
          nav,
          aside,
          button,
          .no-print {
            display: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Examinations & Assessment Suite
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Standard CBSE Question Papers & Foundational Worksheets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Printer className="w-8 h-8 text-amber-600" />
            Standard Question Paper & Worksheet Studio
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Assemble, formulate, and print standardized examination question papers and early childhood activity worksheets with image insertion, 4-line guides, and math columns.
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
                const c = e.target.value;
                setSelectedClass(c);
                setSelectedSubjectId("");
                if (FOUNDATIONAL_CLASSES.includes(c)) {
                  setActiveTab("worksheets");
                }
              }}
              className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
            >
              {ALL_CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openNewPaperDesigner(false)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <FileText className="w-4 h-4 text-amber-400" /> 
              Design Question Paper
            </button>
            <button
              type="button"
              onClick={() => openNewPaperDesigner(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Palette className="w-4 h-4 text-purple-200" /> 
              Generate Worksheet
            </button>
          </div>
        </div>
      </div>

      {/* MOTHER TEACHER BANNER FOR NURSERY TO CLASS 2 */}
      {isMotherTeacherClass && (
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-amber-50 border border-purple-200 p-4 sm:p-5 rounded-3xl shadow-xs flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                  Mother Teacher Concept Active
                </span>
                <span className="bg-purple-200/70 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  {selectedClass}
                </span>
              </div>
              <p className="text-xs text-purple-950/80 mt-0.5 font-medium">
                For <strong>{selectedClass}</strong>, exams are conducted in <strong>Worksheet / Activity Evaluation Format</strong>. Mother Teachers have access to all subjects of this class to insert images, English 4-lines, Hindi double-lines, and math calculation columns.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openNewPaperDesigner(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 hidden sm:flex items-center gap-1.5"
          >
            <Palette className="w-4 h-4" /> New {selectedClass} Worksheet
          </button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 print:hidden">
        
        {/* Tab 1: Standard Question Papers (Grade 3 - 10) */}
        <button
          type="button"
          onClick={() => setActiveTab("generator")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "generator" 
              ? "bg-white text-stone-900 shadow-xs border border-stone-200 ring-2 ring-amber-500/20" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Printer className="w-4 h-4 text-amber-600" />
          <span>Question Paper Studio (Grade 3–10)</span>
        </button>

        {/* Tab 2: Early Years Worksheet Studio (Nursery - Class 2) */}
        <button
          type="button"
          onClick={() => setActiveTab("worksheets")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "worksheets" 
              ? "bg-white text-purple-900 shadow-xs border border-purple-200 ring-2 ring-purple-500/20" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Palette className="w-4 h-4 text-purple-600" />
          <span>Early Years Worksheets (Nursery–Class 2) 🎨</span>
        </button>

        {/* Tab 3: Question Bank */}
        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "bank" 
              ? "bg-white text-stone-900 shadow-xs border border-stone-200" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Question & Activity Bank Master ({questionBank.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1 & TAB 2: QUESTION PAPER & FOUNDATIONAL WORKSHEET VIEW */}
      {/* ========================================================================= */}
      {(activeTab === "generator" || activeTab === "worksheets") && (
        <div className="space-y-6">
          
          {/* Top Paper Selector Bar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-stone-400">Select Document:</span>
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
                    {p.exam_title} — {p.academic_subjects?.name} ({p.class_name}) {p.created_by ? `• by ${p.created_by}` : ""}
                  </option>
                ))}
              </select>

              {/* My Papers Filter Toggle */}
              <button
                type="button"
                onClick={() => {
                  setMyPapersOnly(!myPapersOnly);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  myPapersOnly
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
                title="Filter to view your own authored question papers & worksheets"
              >
                {myPapersOnly ? "👤 My Papers Only" : "🏫 All School Papers"}
              </button>

              <span className="text-xs font-mono font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded">
                Total: {generatedPapers.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  showMarkingScheme 
                    ? "bg-purple-100 text-purple-900 border-purple-300" 
                    : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                }`}
              >
                {showMarkingScheme ? "🔑 View Student Paper" : "🔑 View Marking Key"}
              </button>

              {activePreviewPaper && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicatePaper(activePreviewPaper)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                    title="Duplicate / Clone Document"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden md:inline">Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditPaperDesigner(activePreviewPaper)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
                    title="Edit Document"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePaper(activePreviewPaper.id)}
                    className="p-2 bg-stone-100 hover:bg-red-100 text-red-600 rounded-xl transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handlePrintPaper}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-amber-400" /> Print (Full A4 Format)
              </button>
            </div>
          </div>

          {/* DOCUMENT PREVIEW CONTAINER (ISOLATED FOR A4 PRINTING) */}
          {activePreviewPaper ? (
            <div 
              id="printable-exam-sheet"
              ref={printAreaRef}
              className="bg-white rounded-3xl border border-stone-300 shadow-xl p-8 sm:p-14 max-w-4xl mx-auto text-stone-950 space-y-7"
            >
              
              {/* 1. OFFICIAL SCHOOL HEADER */}
              <div className="text-center border-b-2 border-stone-900 pb-5 space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-sans text-stone-950">
                  {selectedInstitutionObj?.name || "CRAYON BOX SCHOOL"}
                </h1>
                <p className="text-xs sm:text-sm font-sans font-bold text-stone-700 tracking-wide">
                  {selectedInstitutionObj?.affiliation_number 
                    ? `Affiliation No: ${selectedInstitutionObj.affiliation_number} • CBSE, New Delhi`
                    : "Affiliated to CBSE, New Delhi • School ID: 1253481 • UDISE: 07124100151"}
                </p>
                <div className="pt-1.5 text-base sm:text-lg font-black font-sans uppercase tracking-tight text-stone-900">
                  {activePreviewPaper.exam_title} • SESSION {activePreviewPaper.academic_session}
                </div>
              </div>

              {/* 2. CANDIDATE & META GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm font-sans font-bold border-b border-stone-300 pb-4 bg-stone-50/50 p-4 rounded-2xl">
                <div>
                  <span className="text-stone-500 block text-[11px]">CLASS / GRADE:</span>
                  <strong className="text-stone-900 text-base">{activePreviewPaper.class_name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">SUBJECT:</span>
                  <strong className="text-stone-900 text-base">{activePreviewPaper.academic_subjects?.name || "Integrated"}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">MAX MARKS:</span>
                  <strong className="text-stone-900 text-base font-mono">{activePreviewPaper.max_marks} MARKS</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">TIME ALLOWED:</span>
                  <strong className="text-stone-900 text-base font-mono">{activePreviewPaper.duration_minutes} Minutes</strong>
                </div>
              </div>

              {/* 3. STUDENT NAME & ROLL NO. BOXES */}
              <div className="grid grid-cols-2 gap-4 text-sm font-sans border-b border-stone-300 pb-4">
                <div className="border border-stone-400 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-stone-700 font-bold">Roll Number:</span>
                  <span className="font-mono text-stone-400">________________________</span>
                </div>
                <div className="border border-stone-400 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-stone-700 font-bold">Student Name:</span>
                  <span className="font-mono text-stone-400">________________________</span>
                </div>
              </div>

              {/* 4. GENERAL INSTRUCTIONS */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs sm:text-sm font-sans space-y-1.5">
                <strong className="block text-stone-900 uppercase tracking-wider text-xs font-black">General Instructions:</strong>
                <ol className="list-decimal pl-5 space-y-1 text-stone-800 text-xs sm:text-sm font-medium">
                  {(activePreviewPaper.general_instructions || []).map((inst: string, idx: number) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>

              {/* 5. SECTIONS & LARGE READABLE QUESTIONS WITH IMAGES & WRITING LINES */}
              <div className="space-y-10 pt-4">
                {nonEmptySections.map((sec: any, sIdx: number) => (
                  <div key={sIdx} className="space-y-5 page-break-inside-avoid">
                    
                    {/* Section Header */}
                    <div className="border-b-2 border-stone-900 pb-1.5 flex justify-between items-baseline font-sans">
                      <div>
                        <h3 className="font-black text-base sm:text-lg uppercase tracking-wider text-stone-950">
                          {sec.section_name}
                        </h3>
                        {sec.instructions && (
                          <p className="text-xs sm:text-sm text-stone-600 italic font-serif mt-0.5">{sec.instructions}</p>
                        )}
                      </div>
                      <span className="text-sm font-mono font-black text-stone-900 bg-stone-100 px-3 py-0.5 rounded-md">
                        {sec.questions?.reduce((sum: number, q: any) => sum + (q.marks || sec.marks_per_question || 1), 0)} Marks
                      </span>
                    </div>

                    {/* Questions in Section */}
                    <div className="space-y-7">
                      {(sec.questions || []).map((q: any, qIdx: number) => (
                        <div key={qIdx} className="space-y-3 leading-relaxed page-break-inside-avoid">
                          
                          {/* Question Text & Marks */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5 flex-1">
                              <span className="font-sans font-black text-base sm:text-lg text-stone-950 mr-2">Q{q.q_num || qIdx + 1}.</span>
                              <span className="text-stone-950 text-base sm:text-lg font-medium whitespace-pre-line leading-relaxed">{q.text}</span>
                            </div>
                            <span className="font-sans font-black font-mono text-stone-950 shrink-0 text-sm sm:text-base bg-stone-100 px-2.5 py-1 rounded-md border border-stone-300">
                              [{q.marks || sec.marks_per_question || 1}]
                            </span>
                          </div>

                          {/* QUESTION IMAGE / DIAGRAM (USER RESIZABLE) */}
                          {q.image_url && (
                            <div className={`my-3 flex ${
                              q.image_alignment === "left" ? "justify-start" :
                              q.image_alignment === "right" ? "justify-end" : "justify-center"
                            }`}>
                              <div className="space-y-1 text-center">
                                <img
                                  src={q.image_url}
                                  alt={q.image_caption || `Diagram for Question ${q.q_num}`}
                                  className={`rounded-2xl border border-stone-400 bg-white object-contain ${
                                    q.image_size === "small" ? "max-w-[140px] max-h-[120px]" :
                                    q.image_size === "medium" ? "max-w-[260px] max-h-[200px]" :
                                    q.image_size === "large" ? "max-w-[420px] max-h-[300px]" :
                                    "w-full max-h-[400px]"
                                  }`}
                                />
                                {q.image_caption && (
                                  <p className="text-xs italic text-stone-500 font-sans">{q.image_caption}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Multiple Choice Options */}
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8 pt-1 text-sm sm:text-base font-sans font-semibold text-stone-900">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Internal Choice (OR Question) */}
                          {q.or_choice && (
                            <div className="pt-3 pl-8 space-y-2 text-sm sm:text-base italic font-sans border-l-4 border-stone-400 ml-4">
                              <span className="font-black uppercase tracking-wider text-stone-900 not-italic block text-sm">OR</span>
                              <p className="text-stone-950 whitespace-pre-line not-italic font-medium">{q.or_choice}</p>
                            </div>
                          )}

                          {/* WORKSHEET WRITING LINE GUIDES & MATH COLUMNS */}
                          {q.writing_guide_type && q.writing_guide_type !== "none" && (
                            <div className="pl-4 sm:pl-8 pt-2">
                              <WritingGuideRenderer
                                type={q.writing_guide_type}
                                rows={q.writing_guide_rows || 2}
                                mathOp={q.math_column_op || "+"}
                                num1={q.math_column_num1 || "458"}
                                num2={q.math_column_num2 || "273"}
                              />
                            </div>
                          )}

                          {/* Marking Scheme Answer Key Preview (If toggled) */}
                          {showMarkingScheme && (q.correct_answer || q.marking_scheme) && (
                            <div className="mt-3 p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs sm:text-sm font-sans text-purple-950 space-y-1.5 print:hidden">
                              <strong className="block text-purple-900 font-black text-xs uppercase tracking-wide">🔑 Model Solution & Marking Scheme:</strong>
                              {q.correct_answer && <div><strong>Correct Answer:</strong> {q.correct_answer}</div>}
                              {q.marking_scheme && <div className="text-xs text-purple-900 font-medium">{q.marking_scheme}</div>}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

              {/* 6. FOUNDATIONAL WORKSHEET STAR & SMILEY EVALUATION RUBRIC (FOR NURSERY - GRADE 2) */}
              {isMotherTeacherClass && (
                <div className="mt-10 pt-6 border-2 border-dashed border-stone-400 rounded-3xl p-6 bg-amber-50/40 space-y-4 page-break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="font-sans font-black text-sm uppercase tracking-wider text-amber-900 flex items-center gap-2">
                      ⭐ Mother Teacher Foundational Assessment Rubric
                    </span>
                    <span className="text-xs font-bold text-amber-800">Grade: {selectedClass}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="border border-amber-200 bg-white p-3 rounded-xl space-y-1">
                      <strong className="text-stone-900 block font-bold">1. Concept Mastery & Understanding:</strong>
                      <div className="flex items-center gap-1 text-amber-500 text-base">
                        <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                        <span className="text-[10px] text-stone-500 font-medium ml-2">(Circle Stars)</span>
                      </div>
                    </div>

                    <div className="border border-amber-200 bg-white p-3 rounded-xl space-y-1">
                      <strong className="text-stone-900 block font-bold">2. Fine Motor Grip & Neatness:</strong>
                      <div className="flex items-center gap-1 text-amber-500 text-base">
                        <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                        <span className="text-[10px] text-stone-500 font-medium ml-2">(Circle Stars)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-sans pt-2">
                    <div>
                      <span className="text-stone-500 font-bold block mb-1">Teacher's Encouraging Remark:</span>
                      <div className="border-b border-stone-400 h-6"></div>
                    </div>
                    <div>
                      <span className="text-stone-500 font-bold block mb-1">Teacher's Signature & Date:</span>
                      <div className="border-b border-stone-400 h-6"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. EXAMINATION FOOTER */}
              <div className="pt-10 border-t-2 border-stone-300 text-center text-xs font-sans font-bold text-stone-500 uppercase tracking-widest">
                *** {isMotherTeacherClass ? "WELL DONE! KEEP SHINING ⭐" : "END OF QUESTION PAPER — ALL THE BEST"} ***
              </div>

            </div>
          ) : (
            <div className="bg-white p-14 text-center rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <Printer className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-black text-stone-900">
                {isMotherTeacherClass ? `No Worksheets Created for ${selectedClass}` : "No Question Papers Found"}
              </h3>
              <p className="text-xs text-stone-500">
                Click "{isMotherTeacherClass ? "Create Foundational Worksheet" : "Design Question Paper"}" to assemble a new document.
              </p>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUESTION & ACTIVITY BANK MASTER */}
      {/* ========================================================================= */}
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
                  <option value="ShortAnswer">Short Answer / Worksheet Activity (2-3M)</option>
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
                  <option value="Easy">Easy / Foundational</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddQuestion}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Item to Bank
            </button>
          </div>

          {/* Question Bank List */}
          <div className="space-y-4">
            {questionBank.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 shadow-xs space-y-3">
                <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-black text-stone-900">Question Bank is Empty</h3>
                <p className="text-xs text-stone-500">Add questions or early years tracing/matching activities with options, images, and model answers.</p>
              </div>
            ) : (
              questionBank.map((q) => (
                <div key={q.id} className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-3 hover:border-emerald-200 transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                        {q.question_type} • {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-800' :
                        q.difficulty === 'Medium' ? 'bg-blue-50 text-blue-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.image_url && (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Image Included
                        </span>
                      )}
                      {q.writing_guide_type && q.writing_guide_type !== "none" && (
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                          📝 {q.writing_guide_type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditQuestion(q)}
                        className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-stone-900 whitespace-pre-line">{q.question_text}</p>

                  {/* Question Bank Image Preview */}
                  {q.image_url && (
                    <div className={`my-2 flex ${q.image_alignment === "left" ? "justify-start" : q.image_alignment === "right" ? "justify-end" : "justify-center"}`}>
                      <img
                        src={q.image_url}
                        alt="Question asset"
                        className="rounded-xl border border-stone-300 max-h-32 object-contain bg-stone-50"
                      />
                    </div>
                  )}

                  {/* Writing Guide Preview */}
                  {q.writing_guide_type && q.writing_guide_type !== "none" && (
                    <div className="pt-2">
                      <WritingGuideRenderer
                        type={q.writing_guide_type}
                        rows={q.writing_guide_rows || 2}
                        mathOp={q.math_column_op || "+"}
                        num1={q.math_column_num1 || "458"}
                        num2={q.math_column_num2 || "273"}
                      />
                    </div>
                  )}

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl">
                      {q.options.map((opt: string, idx: number) => (
                        <div key={idx}>{opt}</div>
                      ))}
                    </div>
                  )}

                  {q.correct_answer && (
                    <div className="text-xs bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl text-emerald-900">
                      <strong>Correct Answer:</strong> {q.correct_answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: QUESTION PAPER & WORKSHEET DESIGNER MODAL */}
      {/* ========================================================================= */}
      {paperModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  {isMotherTeacherClass ? "Early Childhood Worksheet Designer" : "Standard Examination Designer"}
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {editingPaperId ? "Edit Examination / Worksheet" : isMotherTeacherClass ? `Design ${selectedClass} Activity Worksheet` : "Design Standard CBSE Question Paper"}
                </h3>
              </div>
              <button onClick={() => setPaperModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePaper} className="space-y-6 text-xs">
              
              {/* Paper Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Class / Grade *</label>
                  <select
                    value={paperForm.class_name}
                    onChange={(e) => setPaperForm({ ...paperForm, class_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject *</label>
                  <select
                    value={paperForm.subject_id}
                    onChange={(e) => setPaperForm({ ...paperForm, subject_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Document Title *</label>
                  <input
                    type="text"
                    value={paperForm.exam_title}
                    onChange={(e) => setPaperForm({ ...paperForm, exam_title: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Marks *</label>
                  <input
                    type="number"
                    value={paperForm.max_marks}
                    onChange={(e) => setPaperForm({ ...paperForm, max_marks: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    value={paperForm.duration_minutes}
                    onChange={(e) => setPaperForm({ ...paperForm, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              {/* Sections & Questions Builder */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                    {isMotherTeacherClass ? "Worksheet Activity Sections" : "Question Paper Sections"}
                  </h4>
                  <button
                    type="button"
                    onClick={addSectionToPaper}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>

                {paperForm.sections.map((sec, secIdx) => (
                  <div key={secIdx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center gap-3">
                      <input
                        type="text"
                        value={sec.section_name}
                        onChange={(e) => {
                          const updated = [...paperForm.sections];
                          updated[secIdx].section_name = e.target.value;
                          setPaperForm({ ...paperForm, sections: updated });
                        }}
                        className="font-bold text-stone-900 bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs flex-1"
                      />
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openQuestionPicker(secIdx)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          + Pick from Bank
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomQuestionToSection(secIdx)}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-[11px]"
                        >
                          + Add Question
                        </button>
                      </div>
                    </div>

                    {/* Questions in Section */}
                    <div className="space-y-3">
                      {sec.questions.map((q, qIdx) => {
                        const isImageOpen = activeToolIndex.secIdx === secIdx && activeToolIndex.qIdx === qIdx && activeToolIndex.tool === "image";
                        const isLinesOpen = activeToolIndex.secIdx === secIdx && activeToolIndex.qIdx === qIdx && activeToolIndex.tool === "lines";

                        return (
                          <div key={qIdx} className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-stone-700 mt-1">Q{q.q_num}:</span>
                              <textarea
                                rows={2}
                                value={q.text}
                                onChange={(e) => {
                                  const updated = [...paperForm.sections];
                                  updated[secIdx].questions[qIdx].text = e.target.value;
                                  setPaperForm({ ...paperForm, sections: updated });
                                }}
                                placeholder="Enter question or activity instruction..."
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 font-medium text-stone-900 text-xs"
                              />
                              <input
                                type="number"
                                value={q.marks}
                                onChange={(e) => {
                                  const updated = [...paperForm.sections];
                                  updated[secIdx].questions[qIdx].marks = Number(e.target.value);
                                  setPaperForm({ ...paperForm, sections: updated });
                                }}
                                className="w-12 bg-stone-50 border border-stone-200 rounded-lg p-1 text-center font-mono font-bold text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeQuestionFromSection(secIdx, qIdx)}
                                className="text-red-500 hover:text-red-700 p-1 font-bold"
                              >
                                ✕
                              </button>
                            </div>

                            {/* TOOL TOGGLES (IMAGE & WRITING LINES) */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 text-[11px]">
                              
                              {/* 1. Image Tool Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isImageOpen) {
                                    setActiveToolIndex({ secIdx: -1, qIdx: -1, tool: null });
                                  } else {
                                    setActiveToolIndex({ secIdx, qIdx, tool: "image" });
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                                  q.image_url 
                                    ? "bg-purple-100 text-purple-900 border border-purple-300" 
                                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                }`}
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                                {q.image_url ? "🖼️ Image Attached" : "+ Add Image"}
                              </button>

                              {/* 2. Writing Lines Guide Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isLinesOpen) {
                                    setActiveToolIndex({ secIdx: -1, qIdx: -1, tool: null });
                                  } else {
                                    setActiveToolIndex({ secIdx, qIdx, tool: "lines" });
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                                  q.writing_guide_type && q.writing_guide_type !== "none"
                                    ? "bg-sky-100 text-sky-900 border border-sky-300" 
                                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                }`}
                              >
                                <AlignJustify className="w-3.5 h-3.5 text-sky-600" />
                                {q.writing_guide_type && q.writing_guide_type !== "none"
                                  ? `📝 ${q.writing_guide_type}`
                                  : "+ Add Writing Lines / Math Column"}
                              </button>
                            </div>

                            {/* INLINE IMAGE UPLOADER / SIZER */}
                            {isImageOpen && (
                              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                                <ImageUploader
                                  label="Question Diagram / Image"
                                  initialUrl={q.image_url}
                                  initialSize={q.image_size || "medium"}
                                  initialAlignment={q.image_alignment || "center"}
                                  onImageChanged={(imgData) => {
                                    const updated = [...paperForm.sections];
                                    updated[secIdx].questions[qIdx].image_url = imgData.imageUrl;
                                    updated[secIdx].questions[qIdx].image_size = imgData.imageSize;
                                    updated[secIdx].questions[qIdx].image_alignment = imgData.imageAlignment;
                                    setPaperForm({ ...paperForm, sections: updated });
                                  }}
                                  onImageRemoved={() => {
                                    const updated = [...paperForm.sections];
                                    updated[secIdx].questions[qIdx].image_url = "";
                                    setPaperForm({ ...paperForm, sections: updated });
                                  }}
                                />
                              </div>
                            )}

                            {/* INLINE WRITING GUIDE / MATH COLUMN PICKER */}
                            {isLinesOpen && (
                              <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="font-bold text-sky-950 block mb-1">Select Answer Space / Guide Type</label>
                                    <select
                                      value={q.writing_guide_type || "none"}
                                      onChange={(e) => {
                                        const updated = [...paperForm.sections];
                                        updated[secIdx].questions[qIdx].writing_guide_type = e.target.value as WritingGuideType;
                                        setPaperForm({ ...paperForm, sections: updated });
                                      }}
                                      className="w-full bg-white border border-sky-300 rounded-lg px-2.5 py-1.5 font-bold text-sky-950 text-xs"
                                    >
                                      <option value="none">None — Questions Only (No ruled lines)</option>
                                      <option value="english_4lines">🇬🇧 English 4-Lines (Red / Sky Blue / Red)</option>
                                      <option value="hindi_5lines">🇮🇳 Hindi 5-Lines (Primary Devanagari 5-Line)</option>
                                      <option value="math_grid">📐 Maths Square Boxes (Arithmetic Grid)</option>
                                      <option value="hindi_2lines">🇮🇳 Hindi 2-Lines (Shirorekha &amp; Baseline)</option>
                                      <option value="blank_drawing_box">🎨 Blank Drawing / Working Box</option>
                                      <option value="math_column">🧮 Math Place Value Column (H T O)</option>
                                    </select>
                                  </div>

                                  {q.writing_guide_type && q.writing_guide_type !== "none" && q.writing_guide_type !== "math_column" && (
                                    <div>
                                      <label className="font-bold text-sky-950 block mb-1">
                                        Number of Lines / Boxes (Decided by Faculty)
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min="1"
                                          max="20"
                                          value={q.writing_guide_rows || 2}
                                          onChange={(e) => {
                                            const val = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                                            const updated = [...paperForm.sections];
                                            updated[secIdx].questions[qIdx].writing_guide_rows = val;
                                            setPaperForm({ ...paperForm, sections: updated });
                                          }}
                                          className="w-16 bg-white border border-sky-300 rounded-lg px-2 py-1 font-mono font-bold text-sky-950 text-xs text-center"
                                        />
                                        <div className="flex gap-1 flex-wrap">
                                          {[1, 2, 3, 4, 5, 8, 10, 15].map((num) => (
                                            <button
                                              key={num}
                                              type="button"
                                              onClick={() => {
                                                const updated = [...paperForm.sections];
                                                updated[secIdx].questions[qIdx].writing_guide_rows = num;
                                                setPaperForm({ ...paperForm, sections: updated });
                                              }}
                                              className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                                                (q.writing_guide_rows || 2) === num
                                                  ? "bg-sky-600 text-white"
                                                  : "bg-white border border-sky-200 text-sky-800 hover:bg-sky-100"
                                              }`}
                                            >
                                              {num}L
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {q.writing_guide_type === "math_column" && (
                                    <div className="col-span-2 grid grid-cols-3 gap-2">
                                      <div>
                                        <label className="font-bold text-sky-950 block mb-0.5">Operation</label>
                                        <select
                                          value={q.math_column_op || "+"}
                                          onChange={(e) => {
                                            const updated = [...paperForm.sections];
                                            updated[secIdx].questions[qIdx].math_column_op = e.target.value as "+" | "-" | "×" | "÷";
                                            setPaperForm({ ...paperForm, sections: updated });
                                          }}
                                          className="w-full bg-white border border-sky-300 rounded-lg p-1.5 font-black text-center"
                                        >
                                          <option value="+">+ (Add)</option>
                                          <option value="-">- (Sub)</option>
                                          <option value="×">× (Mul)</option>
                                          <option value="÷">÷ (Div)</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="font-bold text-sky-950 block mb-0.5">Top Number</label>
                                        <input
                                          type="text"
                                          value={q.math_column_num1 || "458"}
                                          onChange={(e) => {
                                            const updated = [...paperForm.sections];
                                            updated[secIdx].questions[qIdx].math_column_num1 = e.target.value;
                                            setPaperForm({ ...paperForm, sections: updated });
                                          }}
                                          className="w-full bg-white border border-sky-300 rounded-lg p-1.5 font-mono font-bold text-center"
                                        />
                                      </div>

                                      <div>
                                        <label className="font-bold text-sky-950 block mb-0.5">Bottom Number</label>
                                        <input
                                          type="text"
                                          value={q.math_column_num2 || "273"}
                                          onChange={(e) => {
                                            const updated = [...paperForm.sections];
                                            updated[secIdx].questions[qIdx].math_column_num2 = e.target.value;
                                            setPaperForm({ ...paperForm, sections: updated });
                                          }}
                                          className="w-full bg-white border border-sky-300 rounded-lg p-1.5 font-mono font-bold text-center"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Live preview of the writing guide */}
                                {q.writing_guide_type && q.writing_guide_type !== "none" && (
                                  <div className="bg-white p-3 rounded-lg border border-sky-200">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Live Guide Preview:</span>
                                    <WritingGuideRenderer
                                      type={q.writing_guide_type}
                                      rows={q.writing_guide_rows || 2}
                                      mathOp={q.math_column_op || "+"}
                                      num1={q.math_column_num1 || "458"}
                                      num2={q.math_column_num2 || "273"}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setPaperModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition">
                  {isSaving ? "Saving..." : "Save Examination Sheet"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUESTION BANK DRAWER PICKER */}
      {/* ========================================================================= */}
      {pickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">
                Select Question / Activity from Bank
              </h3>
              <button onClick={() => setPickerModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              {questionBank.map((item) => (
                <div key={item.id} className="p-3 bg-stone-50 hover:bg-purple-50/60 rounded-xl border border-stone-200 flex justify-between items-center gap-3 transition">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-stone-200 px-1.5 py-0.5 rounded">
                        {item.question_type} • {item.marks}M
                      </span>
                      {item.image_url && <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">🖼️ Image</span>}
                      {item.writing_guide_type && item.writing_guide_type !== "none" && (
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">📝 {item.writing_guide_type}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-stone-900">{item.question_text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => insertQuestionFromBank(item)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shrink-0"
                  >
                    + Insert
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD/EDIT QUESTION BANK ITEM MODAL */}
      {/* ========================================================================= */}
      {qBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingQItem ? "Edit Question Item" : "Add Item to Question Bank"}
              </h3>
              <button onClick={() => setQBankModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveQuestionBankItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject *</label>
                  <select
                    value={qForm.subject_id}
                    onChange={(e) => setQForm({ ...qForm, subject_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Type *</label>
                  <select
                    value={qForm.question_type}
                    onChange={(e) => setQForm({ ...qForm, question_type: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="MCQ">MCQ (1 Mark)</option>
                    <option value="ShortAnswer">Short Answer / Worksheet Activity</option>
                    <option value="LongAnswer">Long Answer (5 Marks)</option>
                    <option value="CaseStudy">Case Study / Passage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Question / Activity Prompt *</label>
                <textarea
                  rows={3}
                  value={qForm.question_text}
                  onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })}
                  placeholder="Enter the question or activity instruction..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                  required
                />
              </div>

              {/* IMAGE UPLOADER & RESIZER */}
              <ImageUploader
                label="Question Image / Diagram (Optional)"
                helperText="Drag & drop diagram or paste image URL"
                initialUrl={qForm.image_url}
                initialSize={qForm.image_size}
                initialAlignment={qForm.image_alignment}
                onImageChanged={(imgData) => {
                  setQForm({
                    ...qForm,
                    image_url: imgData.imageUrl,
                    image_size: imgData.imageSize,
                    image_alignment: imgData.imageAlignment
                  });
                }}
                onImageRemoved={() => {
                  setQForm({ ...qForm, image_url: "" });
                }}
              />

              {/* WORKSHEET WRITING LINE GUIDES */}
              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2">
                <label className="font-bold text-sky-950 block">Worksheet Writing Lines / Answer Space Guide</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={qForm.writing_guide_type}
                    onChange={(e) => setQForm({ ...qForm, writing_guide_type: e.target.value as WritingGuideType })}
                    className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 font-bold text-sky-950 text-xs"
                  >
                    <option value="none">None — Questions Only (No ruled lines)</option>
                    <option value="english_4lines">🇬🇧 English 4-Lines (Red / Sky Blue / Red)</option>
                    <option value="hindi_5lines">🇮🇳 Hindi 5-Lines (Primary Devanagari 5-Line)</option>
                    <option value="math_grid">📐 Maths Square Boxes (Arithmetic Grid)</option>
                    <option value="hindi_2lines">🇮🇳 Hindi 2-Lines (Shirorekha &amp; Baseline)</option>
                    <option value="blank_drawing_box">🎨 Blank Drawing / Working Box</option>
                    <option value="math_column">🧮 Math Place Value Column (H T O)</option>
                  </select>

                  {qForm.writing_guide_type && qForm.writing_guide_type !== "none" && qForm.writing_guide_type !== "math_column" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-950 whitespace-nowrap">Lines:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={qForm.writing_guide_rows}
                        onChange={(e) => setQForm({ ...qForm, writing_guide_rows: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
                        className="w-16 bg-white border border-sky-300 rounded-lg px-2 py-1 font-mono font-bold text-sky-950 text-xs text-center"
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQForm({ ...qForm, writing_guide_rows: num })}
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              qForm.writing_guide_rows === num ? "bg-sky-600 text-white" : "bg-white border border-sky-200 text-sky-800"
                            }`}
                          >
                            {num}L
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {qForm.writing_guide_type && qForm.writing_guide_type !== "none" && (
                  <div className="pt-2 bg-white p-2.5 rounded-xl border border-sky-200">
                    <WritingGuideRenderer
                      type={qForm.writing_guide_type}
                      rows={qForm.writing_guide_rows}
                      mathOp={qForm.math_column_op}
                      num1={qForm.math_column_num1}
                      num2={qForm.math_column_num2}
                    />
                  </div>
                )}
              </div>

              {qForm.question_type === "MCQ" && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Option A" value={qForm.option_a} onChange={(e) => setQForm({ ...qForm, option_a: e.target.value })} className="bg-stone-50 border border-stone-200 rounded-xl p-2" />
                  <input type="text" placeholder="Option B" value={qForm.option_b} onChange={(e) => setQForm({ ...qForm, option_b: e.target.value })} className="bg-stone-50 border border-stone-200 rounded-xl p-2" />
                  <input type="text" placeholder="Option C" value={qForm.option_c} onChange={(e) => setQForm({ ...qForm, option_c: e.target.value })} className="bg-stone-50 border border-stone-200 rounded-xl p-2" />
                  <input type="text" placeholder="Option D" value={qForm.option_d} onChange={(e) => setQForm({ ...qForm, option_d: e.target.value })} className="bg-stone-50 border border-stone-200 rounded-xl p-2" />
                </div>
              )}

              <div>
                <label className="font-bold text-stone-700 block mb-1">Model Answer / Solution</label>
                <input
                  type="text"
                  value={qForm.correct_answer}
                  onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-medium text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setQBankModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition">
                  {isSaving ? "Saving..." : "Save to Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
