"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  BookOpen, Plus, Edit3, Trash2, ChevronDown, ChevronRight, 
  CheckCircle2, Clock, Sparkles, Layers, ListOrdered, 
  FileText, Award, Lightbulb, Compass, Save, RefreshCw
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAcademicSubjects, getSubjectFullSyllabus, 
  saveAcademicSubject, deleteAcademicSubject,
  saveSyllabusUnit, deleteSyllabusUnit,
  saveSyllabusChapter, deleteSyllabusChapter,
  saveSyllabusTopic, deleteSyllabusTopic
} from "@/app/actions/syllabus-core";
import PdfUploader from "@/components/ui/PdfUploader";

function CurriculumMasterContent() {
  const { activeCampusId } = useCampusContext();
  const searchParams = useSearchParams();
  const querySubjectId = searchParams.get("subjectId");

  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("");
  const [fullSyllabus, setFullSyllabus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Modals state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    category: "Core",
    weekly_periods: 6,
    teacher_name: "",
    total_planned_periods: 160,
    color_code: "#3B82F6"
  });

  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [unitForm, setUnitForm] = useState({
    unit_number: 1,
    unit_title: "",
    description: ""
  });

  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [targetUnitIdForChapter, setTargetUnitIdForChapter] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState({
    chapter_number: 1,
    chapter_name: "",
    estimated_periods: 8,
    completed_periods: 0,
    planned_start_date: "",
    planned_completion_date: "",
    learning_objectives: "",
    key_concepts: "",
    skills: "",
    activities: "",
    teaching_resources: "",
    reference_material: "",
    status: "Not Started"
  });

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [targetChapterIdForTopic, setTargetChapterIdForTopic] = useState<string>("");
  const [topicForm, setTopicForm] = useState({
    topic_number: 1,
    topic_name: "",
    subtopics: "",
    planned_periods: 2,
    completed_periods: 0,
    status: "Pending",
    understand: "",
    explain: "",
    apply: "",
    analyse: "",
    create: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, [activeCampusId, selectedClass, selectedSession]);

  useEffect(() => {
    if (activeSubjectId) {
      loadFullSyllabus(activeSubjectId);
    }
  }, [activeSubjectId]);

  async function loadSubjects() {
    setIsLoading(true);
    try {
      const res = await getAcademicSubjects(activeCampusId, selectedSession, selectedClass);
      if (res.success && res.data) {
        setSubjects(res.data);
        if (querySubjectId && res.data.some((s: any) => s.id === querySubjectId)) {
          setActiveSubjectId(querySubjectId);
        } else if (res.data.length > 0 && !activeSubjectId) {
          setActiveSubjectId(res.data[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading subjects:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadFullSyllabus(subjectId: string) {
    try {
      const res = await getSubjectFullSyllabus(subjectId);
      if (res.success && res.data) {
        setFullSyllabus(res.data);
        // Expand all units and chapters by default for good visibility
        const uMap: Record<string, boolean> = {};
        const chMap: Record<string, boolean> = {};
        res.data.units?.forEach((u: any) => {
          uMap[u.id] = true;
          u.chapters?.forEach((ch: any) => {
            chMap[ch.id] = true;
          });
        });
        setExpandedUnits(uMap);
        setExpandedChapters(chMap);
      }
    } catch (e) {
      console.error("Error loading syllabus tree:", e);
    }
  }

  // --- Handlers ---
  function openAddSubject() {
    setEditingSubject(null);
    setSubjectForm({
      name: "",
      code: "",
      category: "Core",
      weekly_periods: 6,
      teacher_name: "",
      total_planned_periods: 160,
      color_code: "#3B82F6"
    });
    setSubjectModalOpen(true);
  }

  function openEditSubject(sub: any) {
    setEditingSubject(sub);
    setSubjectForm({
      name: sub.name,
      code: sub.code,
      category: sub.category || "Core",
      weekly_periods: sub.weekly_periods || 6,
      teacher_name: sub.teacher_name || "",
      total_planned_periods: sub.total_planned_periods || 160,
      color_code: sub.color_code || "#3B82F6"
    });
    setSubjectModalOpen(true);
  }

  async function handleSaveSubject(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveAcademicSubject({
        id: editingSubject?.id,
        campus_id: activeCampusId,
        academic_session: selectedSession,
        class_name: selectedClass,
        ...subjectForm
      });
      if (res.success) {
        setSubjectModalOpen(false);
        await loadSubjects();
        if (res.data?.id) setActiveSubjectId(res.data.id);
      } else {
        alert("Error saving subject: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSubject(id: string) {
    if (!confirm("Are you sure you want to delete this subject and all its units/chapters?")) return;
    const res = await deleteAcademicSubject(id);
    if (res.success) {
      setActiveSubjectId("");
      loadSubjects();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Units
  function openAddUnit() {
    setEditingUnit(null);
    const nextNum = (fullSyllabus?.units?.length || 0) + 1;
    setUnitForm({ unit_number: nextNum, unit_title: "", description: "" });
    setUnitModalOpen(true);
  }

  function openEditUnit(u: any) {
    setEditingUnit(u);
    setUnitForm({ unit_number: u.unit_number, unit_title: u.unit_title, description: u.description || "" });
    setUnitModalOpen(true);
  }

  async function handleSaveUnit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveSyllabusUnit({
        id: editingUnit?.id,
        campus_id: activeCampusId,
        subject_id: activeSubjectId,
        ...unitForm
      });
      if (res.success) {
        setUnitModalOpen(false);
        loadFullSyllabus(activeSubjectId);
      } else {
        alert("Error saving unit: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteUnit(id: string) {
    if (!confirm("Delete this Unit? Associated chapters will remain under unassigned.")) return;
    const res = await deleteSyllabusUnit(id);
    if (res.success) loadFullSyllabus(activeSubjectId);
  }

  // Chapters
  function openAddChapter(unitId?: string) {
    setEditingChapter(null);
    setTargetUnitIdForChapter(unitId || null);
    setChapterForm({
      chapter_number: (fullSyllabus?.units?.reduce((sum: number, u: any) => sum + (u.chapters?.length || 0), 0) || 0) + 1,
      chapter_name: "",
      estimated_periods: 8,
      completed_periods: 0,
      planned_start_date: "",
      planned_completion_date: "",
      learning_objectives: "",
      key_concepts: "",
      skills: "",
      activities: "",
      teaching_resources: "",
      reference_material: "",
      status: "Not Started"
    });
    setChapterModalOpen(true);
  }

  function openEditChapter(ch: any) {
    setEditingChapter(ch);
    setTargetUnitIdForChapter(ch.unit_id);
    setChapterForm({
      chapter_number: ch.chapter_number,
      chapter_name: ch.chapter_name,
      estimated_periods: ch.estimated_periods || 8,
      completed_periods: ch.completed_periods || 0,
      planned_start_date: ch.planned_start_date || "",
      planned_completion_date: ch.planned_completion_date || "",
      learning_objectives: ch.learning_objectives || "",
      key_concepts: ch.key_concepts || "",
      skills: ch.skills || "",
      activities: ch.activities || "",
      teaching_resources: ch.teaching_resources || "",
      reference_material: ch.reference_material || "",
      status: ch.status || "Not Started"
    });
    setChapterModalOpen(true);
  }

  async function handleSaveChapter(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveSyllabusChapter({
        id: editingChapter?.id,
        campus_id: activeCampusId,
        subject_id: activeSubjectId,
        unit_id: targetUnitIdForChapter,
        ...chapterForm
      });
      if (res.success) {
        setChapterModalOpen(false);
        loadFullSyllabus(activeSubjectId);
      } else {
        alert("Error saving chapter: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteChapter(id: string) {
    if (!confirm("Delete this chapter and its topics?")) return;
    const res = await deleteSyllabusChapter(id);
    if (res.success) loadFullSyllabus(activeSubjectId);
  }

  // Topics
  function openAddTopic(chapterId: string) {
    setEditingTopic(null);
    setTargetChapterIdForTopic(chapterId);
    setTopicForm({
      topic_number: 1,
      topic_name: "",
      subtopics: "",
      planned_periods: 2,
      completed_periods: 0,
      status: "Pending",
      understand: "",
      explain: "",
      apply: "",
      analyse: "",
      create: ""
    });
    setTopicModalOpen(true);
  }

  function openEditTopic(t: any) {
    setEditingTopic(t);
    setTargetChapterIdForTopic(t.chapter_id);
    const outcomes = t.learning_outcomes || {};
    setTopicForm({
      topic_number: t.topic_number,
      topic_name: t.topic_name,
      subtopics: t.subtopics || "",
      planned_periods: t.planned_periods || 2,
      completed_periods: t.completed_periods || 0,
      status: t.status || "Pending",
      understand: outcomes.understand || "",
      explain: outcomes.explain || "",
      apply: outcomes.apply || "",
      analyse: outcomes.analyse || "",
      create: outcomes.create || ""
    });
    setTopicModalOpen(true);
  }

  async function handleSaveTopic(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveSyllabusTopic({
        id: editingTopic?.id,
        campus_id: activeCampusId,
        chapter_id: targetChapterIdForTopic,
        topic_number: topicForm.topic_number,
        topic_name: topicForm.topic_name,
        subtopics: topicForm.subtopics,
        planned_periods: topicForm.planned_periods,
        completed_periods: topicForm.completed_periods,
        status: topicForm.status,
        learning_outcomes: {
          understand: topicForm.understand,
          explain: topicForm.explain,
          apply: topicForm.apply,
          analyse: topicForm.analyse,
          create: topicForm.create
        }
      });
      if (res.success) {
        setTopicModalOpen(false);
        loadFullSyllabus(activeSubjectId);
      } else {
        alert("Error saving topic: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTopic(id: string) {
    if (!confirm("Delete this topic?")) return;
    const res = await deleteSyllabusTopic(id);
    if (res.success) loadFullSyllabus(activeSubjectId);
  }

  const classList = [
    "Nursery", "LKG", "UKG", 
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
  ];

  const currentSubject = subjects.find((s) => s.id === activeSubjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Curriculum Architecture
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">5-Tier Relational Tree</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-purple-600" />
            Curriculum & Syllabus Master
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Define units, chapters, topics, estimated periods, and Bloom's taxonomy learning outcomes.
          </p>
        </div>

        {/* Grade Selector & Add Subject */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2">
            <span className="text-xs text-stone-400 font-bold">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setActiveSubjectId("");
              }}
              className="bg-transparent text-xs font-black text-stone-800 focus:outline-none"
            >
              {classList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openAddSubject}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Subject to {selectedClass}
          </button>
        </div>
      </div>

      {/* Horizontal Subject Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {subjects.map((sub) => {
          const isActive = sub.id === activeSubjectId;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubjectId(sub.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition shrink-0 ${
                isActive 
                  ? "bg-white text-stone-900 shadow-xs border border-stone-300 ring-2 ring-blue-500/20" 
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: sub.color_code || '#3B82F6' }}
              />
              <span>{sub.name}</span>
              <span className="bg-stone-200/80 text-stone-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {sub.chaptersCount || 0} Ch
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Hierarchy Workspace */}
      {currentSubject ? (
        <div className="space-y-6">
          
          {/* Subject Meta Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900">{currentSubject.name}</h2>
                <span className="bg-blue-50 text-blue-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {currentSubject.code}
                </span>
                <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded">
                  {currentSubject.category}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Faculty: <strong className="text-stone-800">{currentSubject.teacher_name || 'Unassigned'}</strong> • 
                Weekly Periods: <strong className="text-stone-800">{currentSubject.weekly_periods}</strong> • 
                Total Planned Periods: <strong className="text-stone-800">{currentSubject.total_planned_periods}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={openAddUnit}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Unit
              </button>
              <button
                type="button"
                onClick={() => openAddChapter()}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Chapter
              </button>
              <button
                type="button"
                onClick={() => openEditSubject(currentSubject)}
                className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
                title="Edit Subject"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSubject(currentSubject.id)}
                className="p-2 bg-stone-100 hover:bg-red-100 text-red-600 rounded-xl transition"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Units Tree Accordion */}
          <div className="space-y-4">
            {(fullSyllabus?.units || []).map((unit: any) => {
              const isUnitOpen = expandedUnits[unit.id] ?? true;

              return (
                <div key={unit.id} className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
                  
                  {/* Unit Header Bar */}
                  <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                      onClick={() => setExpandedUnits({ ...expandedUnits, [unit.id]: !isUnitOpen })}
                    >
                      <button type="button" className="text-stone-400 hover:text-stone-800">
                        {isUnitOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                            Unit {unit.unit_number}
                          </span>
                          <h3 className="font-black text-stone-900 text-sm sm:text-base">
                            {unit.unit_title}
                          </h3>
                        </div>
                        {unit.description && (
                          <p className="text-xs text-stone-500 mt-0.5">{unit.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openAddChapter(unit.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold rounded-xl text-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Chapter
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditUnit(unit)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chapters List inside Unit */}
                  {isUnitOpen && (
                    <div className="p-6 space-y-4">
                      {(!unit.chapters || unit.chapters.length === 0) ? (
                        <p className="text-xs text-stone-400 italic py-2">
                          No chapters created for this unit yet. Click "+ Chapter" to add one.
                        </p>
                      ) : (
                        unit.chapters.map((ch: any) => {
                          const isChOpen = expandedChapters[ch.id] ?? true;

                          return (
                            <div key={ch.id} className="border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-stone-50/40">
                              
                              {/* Chapter Header */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200/60 pb-3">
                                <div 
                                  className="flex items-center gap-2 cursor-pointer select-none"
                                  onClick={() => setExpandedChapters({ ...expandedChapters, [ch.id]: !isChOpen })}
                                >
                                  {isChOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                                  <div>
                                    <span className="font-mono text-xs font-bold text-stone-400 mr-2">
                                      Chapter {ch.chapter_number}:
                                    </span>
                                    <strong className="text-sm font-black text-stone-900">
                                      {ch.chapter_name}
                                    </strong>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    ch.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                    ch.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                                  }`}>
                                    {ch.status}
                                  </span>

                                  <span className="text-xs font-mono font-bold text-stone-700 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                                    {ch.completed_periods} / {ch.estimated_periods} Periods
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => openAddTopic(ch.id)}
                                    className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                                  >
                                    + Topic
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditChapter(ch)}
                                    className="p-1 text-stone-400 hover:text-stone-800"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteChapter(ch.id)}
                                    className="p-1 text-stone-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Chapter Details & Topics */}
                              {isChOpen && (
                                <div className="space-y-3.5 pt-1 text-xs">
                                  
                                  {/* Learning Objectives & Key Concepts Box */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-stone-200/80 text-[11.5px]">
                                    <div>
                                      <span className="font-bold text-stone-700 block mb-0.5 flex items-center gap-1">
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Learning Objectives:
                                      </span>
                                      <p className="text-stone-600">{ch.learning_objectives || 'No specific objective recorded.'}</p>
                                    </div>
                                    <div>
                                      <span className="font-bold text-stone-700 block mb-0.5 flex items-center gap-1">
                                        <Compass className="w-3.5 h-3.5 text-blue-500" /> Key Concepts & Skills:
                                      </span>
                                      <p className="text-stone-600">{ch.key_concepts || ch.skills || 'Conceptual mastery & problem-solving.'}</p>
                                    </div>
                                  </div>

                                  {/* Topics Table */}
                                  <div className="space-y-2">
                                    <span className="font-bold text-stone-700 block text-xs">
                                      Topics & Competency Outcomes ({ch.topics?.length || 0}):
                                    </span>

                                    {(!ch.topics || ch.topics.length === 0) ? (
                                      <p className="text-stone-400 italic text-[11px]">No topics defined yet. Click "+ Topic" to add.</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {ch.topics.map((t: any) => {
                                          const lo = t.learning_outcomes || {};
                                          return (
                                            <div key={t.id} className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                                              <div className="flex justify-between items-center">
                                                <div>
                                                  <strong className="text-stone-900 text-xs">
                                                    {t.topic_number}. {t.topic_name}
                                                  </strong>
                                                  {t.subtopics && (
                                                    <span className="text-stone-500 block text-[11px] mt-0.5">
                                                      Sub-topics: {t.subtopics}
                                                    </span>
                                                  )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                  <span className="text-[10px] font-mono font-bold text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                                                    {t.planned_periods} Periods
                                                  </span>
                                                  <button onClick={() => openEditTopic(t)} className="p-1 text-stone-400 hover:text-stone-800">
                                                    <Edit3 className="w-3 h-3" />
                                                  </button>
                                                  <button onClick={() => handleDeleteTopic(t.id)} className="p-1 text-stone-400 hover:text-red-600">
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Bloom's Taxonomy Badges */}
                                              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                                                {lo.understand && (
                                                  <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-100">
                                                    🧠 <strong>Understand:</strong> {lo.understand}
                                                  </span>
                                                )}
                                                {lo.explain && (
                                                  <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-100">
                                                    🗣️ <strong>Explain:</strong> {lo.explain}
                                                  </span>
                                                )}
                                                {lo.apply && (
                                                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">
                                                    🧩 <strong>Apply:</strong> {lo.apply}
                                                  </span>
                                                )}
                                                {lo.analyse && (
                                                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-100">
                                                    🔬 <strong>Analyse:</strong> {lo.analyse}
                                                  </span>
                                                )}
                                                {lo.create && (
                                                  <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded border border-rose-100">
                                                    🎨 <strong>Create:</strong> {lo.create}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                </div>
                              )}

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-black text-stone-900">No Subjects Selected</h3>
          <p className="text-xs text-stone-500">Please select or create a subject to view and build its curriculum hierarchy.</p>
        </div>
      )}

      {/* --- MODAL 1: SUBJECT MODAL --- */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingSubject ? "Edit Academic Subject" : `Add Subject to ${selectedClass}`}
              </h3>
              <button onClick={() => setSubjectModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science, AI & Robotics"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MATH, SCI"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={subjectForm.category}
                    onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Core">Core</option>
                    <option value="Language">Language</option>
                    <option value="Activity">Activity</option>
                    <option value="Co-Curricular">Co-Curricular</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Weekly Periods</label>
                  <input
                    type="number"
                    value={subjectForm.weekly_periods}
                    onChange={(e) => setSubjectForm({ ...subjectForm, weekly_periods: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Total Planned Periods</label>
                  <input
                    type="number"
                    value={subjectForm.total_planned_periods}
                    onChange={(e) => setSubjectForm({ ...subjectForm, total_planned_periods: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="10"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Assigned Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sunita Sharma"
                  value={subjectForm.teacher_name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, teacher_name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setSubjectModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-stone-900 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingSubject ? "Update Subject" : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: UNIT MODAL --- */}
      {unitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingUnit ? "Edit Unit" : "Add New Unit"}
              </h3>
              <button onClick={() => setUnitModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-3 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">Unit #</label>
                  <input
                    type="number"
                    value={unitForm.unit_number}
                    onChange={(e) => setUnitForm({ ...unitForm, unit_number: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="font-bold text-stone-700 block mb-1">Unit Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Number Sense & Operations"
                    value={unitForm.unit_title}
                    onChange={(e) => setUnitForm({ ...unitForm, unit_title: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Unit Description / Scope</label>
                <textarea
                  placeholder="Summary of core curriculum concepts covered in this unit"
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setUnitModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingUnit ? "Update Unit" : "Create Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CHAPTER MODAL --- */}
      {chapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingChapter ? "Edit Chapter Master" : "Add Chapter Master"}
              </h3>
              <button onClick={() => setChapterModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">Ch #</label>
                  <input
                    type="number"
                    value={chapterForm.chapter_number}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="font-bold text-stone-700 block mb-1">Chapter Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Fractions: Types, Conversion & Operations"
                    value={chapterForm.chapter_name}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapter_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Estimated Periods</label>
                  <input
                    type="number"
                    value={chapterForm.estimated_periods}
                    onChange={(e) => setChapterForm({ ...chapterForm, estimated_periods: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Completed Periods</label>
                  <input
                    type="number"
                    value={chapterForm.completed_periods}
                    onChange={(e) => setChapterForm({ ...chapterForm, completed_periods: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Status</label>
                  <select
                    value={chapterForm.status}
                    onChange={(e) => setChapterForm({ ...chapterForm, status: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Partially Completed">Partially Completed</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Planned Start Date</label>
                  <input
                    type="date"
                    value={chapterForm.planned_start_date}
                    onChange={(e) => setChapterForm({ ...chapterForm, planned_start_date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Planned Completion Date</label>
                  <input
                    type="date"
                    value={chapterForm.planned_completion_date}
                    onChange={(e) => setChapterForm({ ...chapterForm, planned_completion_date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Learning Objectives</label>
                <textarea
                  placeholder="e.g. Read, write and convert proper, improper and mixed fractions"
                  value={chapterForm.learning_objectives}
                  onChange={(e) => setChapterForm({ ...chapterForm, learning_objectives: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Key Concepts & Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. Numerator, Denominator, LCM method"
                    value={chapterForm.key_concepts}
                    onChange={(e) => setChapterForm({ ...chapterForm, key_concepts: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Teaching Aids & Resources</label>
                  <input
                    type="text"
                    placeholder="e.g. Smartboard, Fraction strips kit"
                    value={chapterForm.teaching_resources}
                    onChange={(e) => setChapterForm({ ...chapterForm, teaching_resources: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>
              </div>

              {/* UNIVERSAL PDF UPLOADER FOR CHAPTER E-BOOK / WORKSHEETS */}
              <PdfUploader
                label="Attach Chapter Notes / Practice Worksheet (PDF)"
                helperText="Upload PDF resource for this chapter"
                initialUrl={chapterForm.reference_material}
                onPdfUploaded={(data) => setChapterForm({ ...chapterForm, reference_material: data.fileUrl })}
                onPdfRemoved={() => setChapterForm({ ...chapterForm, reference_material: "" })}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setChapterModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingChapter ? "Update Chapter" : "Create Chapter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: TOPIC & BLOOM'S OUTCOMES MODAL --- */}
      {topicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                  Topic & Bloom's Taxonomy
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-0.5">
                  {editingTopic ? "Edit Topic & Outcomes" : "Add Topic Master"}
                </h3>
              </div>
              <button onClick={() => setTopicModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="font-bold text-stone-700 block mb-1">Topic #</label>
                  <input
                    type="number"
                    value={topicForm.topic_number}
                    onChange={(e) => setTopicForm({ ...topicForm, topic_number: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="font-bold text-stone-700 block mb-1">Topic Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Indian vs International Number System"
                    value={topicForm.topic_name}
                    onChange={(e) => setTopicForm({ ...topicForm, topic_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Sub-topics List</label>
                <input
                  type="text"
                  placeholder="e.g. Periods, Lakhs vs Millions, Separator Commas"
                  value={topicForm.subtopics}
                  onChange={(e) => setTopicForm({ ...topicForm, subtopics: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                />
              </div>

              {/* Bloom's Taxonomy Competency Outcomes Header */}
              <div className="pt-2 border-t border-stone-100 space-y-2.5">
                <span className="font-black text-stone-900 block text-xs flex items-center gap-1.5 text-purple-900">
                  <Award className="w-4 h-4 text-purple-600" />
                  Bloom's Taxonomy Learning Outcomes ("Students will be able to:")
                </span>

                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-blue-800 block mb-0.5">🧠 1. Understand</label>
                    <input
                      type="text"
                      placeholder="e.g. Differentiate between Crores and Millions system"
                      value={topicForm.understand}
                      onChange={(e) => setTopicForm({ ...topicForm, understand: e.target.value })}
                      className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-1.5 font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-purple-800 block mb-0.5">🗣️ 2. Explain</label>
                    <input
                      type="text"
                      placeholder="e.g. Read out 8-digit numbers fluently with correct periods"
                      value={topicForm.explain}
                      onChange={(e) => setTopicForm({ ...topicForm, explain: e.target.value })}
                      className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-1.5 font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-800 block mb-0.5">🧩 3. Apply / Solve</label>
                    <input
                      type="text"
                      placeholder="e.g. Convert population numbers from International to Indian notation"
                      value={topicForm.apply}
                      onChange={(e) => setTopicForm({ ...topicForm, apply: e.target.value })}
                      className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-3 py-1.5 font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-amber-800 block mb-0.5">🔬 4. Analyse</label>
                    <input
                      type="text"
                      placeholder="e.g. Compare place values of digits in different numerical positions"
                      value={topicForm.analyse}
                      onChange={(e) => setTopicForm({ ...topicForm, analyse: e.target.value })}
                      className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-1.5 font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-rose-800 block mb-0.5">🎨 5. Create</label>
                    <input
                      type="text"
                      placeholder="e.g. Construct place value chart poster for Indian & International system"
                      value={topicForm.create}
                      onChange={(e) => setTopicForm({ ...topicForm, create: e.target.value })}
                      className="w-full bg-rose-50/50 border border-rose-200 rounded-xl px-3 py-1.5 font-semibold text-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setTopicModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingTopic ? "Update Topic" : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CurriculumMasterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-stone-400">Loading Curriculum Master...</div>}>
      <CurriculumMasterContent />
    </Suspense>
  );
}
