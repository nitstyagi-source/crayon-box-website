"use client";

import { useState, useEffect } from "react";
import { 
  FolderDown, Plus, Edit3, Trash2, FileText, Download, 
  CheckCircle2, Clock, ShieldCheck, History, Award, ExternalLink
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAcademicSubjects, getSyllabusDocuments, 
  saveSyllabusDocument, deleteSyllabusDocument,
  getSyllabusRevisions, saveSyllabusRevision
} from "@/app/actions/syllabus-core";
import PdfUploader from "@/components/ui/PdfUploader";

export default function SyllabusResourcesPage() {
  const { activeCampusId } = useCampusContext();
  const [activeTab, setActiveTab] = useState<"docs" | "revisions">("docs");
  const [selectedSubjectId, setSelectedSubjectId] = useState("All");
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Document Modal
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({
    subject_id: "",
    chapter_id: "",
    title: "",
    doc_type: "Worksheet",
    file_url: "https://example.com/curriculum-resource.pdf",
    version: "v1.0",
    uploaded_by: "Academic Coordinator",
    status: "Active"
  });

  // Revision Modal
  const [revModalOpen, setRevModalOpen] = useState(false);
  const [editingRev, setEditingRev] = useState<any>(null);
  const [revForm, setRevForm] = useState({
    subject_id: "",
    version_tag: "v2.0",
    previous_version: "v1.0",
    revised_by: "Academic Coordinator",
    revision_summary: "",
    approval_status: "Approved",
    approved_by: "Principal"
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, [activeCampusId, selectedClass, selectedSession]);

  useEffect(() => {
    loadDocuments();
    if (selectedSubjectId !== "All") {
      loadRevisions(selectedSubjectId);
    }
  }, [activeCampusId, selectedSubjectId, selectedClass]);

  async function loadSubjects() {
    try {
      const res = await getAcademicSubjects(activeCampusId, selectedSession, selectedClass);
      if (res.success && res.data) {
        setSubjects(res.data);
      }
    } catch (e) {
      console.error("Error loading subjects:", e);
    }
  }

  async function loadDocuments() {
    setIsLoading(true);
    try {
      const res = await getSyllabusDocuments(activeCampusId, selectedSubjectId);
      if (res.success && res.data) {
        setDocuments(res.data);
      }
    } catch (e) {
      console.error("Error loading documents:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadRevisions(subjectId: string) {
    try {
      const res = await getSyllabusRevisions(subjectId);
      if (res.success && res.data) {
        setRevisions(res.data);
      }
    } catch (e) {
      console.error("Error loading revisions:", e);
    }
  }

  function openAddDoc() {
    setEditingDoc(null);
    setDocForm({
      subject_id: subjects[0]?.id || "",
      chapter_id: "",
      title: "",
      doc_type: "Worksheet",
      file_url: "https://example.com/curriculum-resource.pdf",
      version: "v1.0",
      uploaded_by: "Academic Coordinator",
      status: "Active"
    });
    setDocModalOpen(true);
  }

  function openEditDoc(doc: any) {
    setEditingDoc(doc);
    setDocForm({
      subject_id: doc.subject_id,
      chapter_id: doc.chapter_id || "",
      title: doc.title,
      doc_type: doc.doc_type || "Worksheet",
      file_url: doc.file_url,
      version: doc.version || "v1.0",
      uploaded_by: doc.uploaded_by || "Academic Coordinator",
      status: doc.status || "Active"
    });
    setDocModalOpen(true);
  }

  async function handleSaveDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docForm.subject_id || !docForm.title || !docForm.file_url) {
      alert("Please fill in required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveSyllabusDocument({
        id: editingDoc?.id,
        campus_id: activeCampusId,
        ...docForm
      });
      if (res.success) {
        setDocModalOpen(false);
        loadDocuments();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteDoc(id: string) {
    if (!confirm("Delete this curriculum document entry?")) return;
    const res = await deleteSyllabusDocument(id);
    if (res.success) loadDocuments();
  }

  function openAddRevision() {
    setEditingRev(null);
    setRevForm({
      subject_id: subjects[0]?.id || "",
      version_tag: "v2.0",
      previous_version: "v1.0",
      revised_by: "Academic Coordinator",
      revision_summary: "",
      approval_status: "Approved",
      approved_by: "Principal"
    });
    setRevModalOpen(true);
  }

  async function handleSaveRevision(e: React.FormEvent) {
    e.preventDefault();
    if (!revForm.subject_id || !revForm.version_tag || !revForm.revision_summary) {
      alert("Please fill in required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveSyllabusRevision({
        id: editingRev?.id,
        campus_id: activeCampusId,
        ...revForm
      });
      if (res.success) {
        setRevModalOpen(false);
        if (selectedSubjectId !== "All") loadRevisions(selectedSubjectId);
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Resource Management
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Repository & Versioning</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <FolderDown className="w-8 h-8 text-blue-600" />
            Syllabus Resources & Revision History
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Central repository for worksheets, board curriculum PDFs, question banks, and revision approval tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={activeTab === "docs" ? openAddDoc : openAddRevision}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> 
            {activeTab === "docs" ? "Upload Resource Document" : "Log Curriculum Revision"}
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition ${
            activeTab === "docs" 
              ? "bg-white text-stone-900 shadow-xs border border-stone-200" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Curriculum & Worksheets Repository ({documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("revisions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition ${
            activeTab === "revisions" 
              ? "bg-white text-stone-900 shadow-xs border border-stone-200" 
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <History className="w-4 h-4 text-purple-600" />
          <span>Syllabus Version History & Approvals</span>
        </button>
      </div>

      {/* TAB 1: DOCUMENTS REPOSITORY */}
      {activeTab === "docs" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-stone-900">
              Academic Documents & Worksheets ({documents.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-stone-50/40 hover:bg-white transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                      {doc.doc_type}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-400 bg-white border border-stone-200 px-1.5 py-0.5 rounded">
                      {doc.version}
                    </span>
                  </div>

                  <h4 className="font-black text-stone-900 text-sm tracking-tight">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Subject: <strong>{doc.academic_subjects?.name} ({doc.academic_subjects?.class_name})</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditDoc(doc)} className="p-1 text-stone-400 hover:text-stone-800">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteDoc(doc.id)} className="p-1 text-stone-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REVISION HISTORY */}
      {activeTab === "revisions" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-stone-900">
              Syllabus Revision History & Coordinator Approvals
            </h3>
          </div>

          <div className="space-y-3">
            <div className="border border-stone-200 rounded-2xl p-5 space-y-2 bg-stone-50/50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded">
                    Mathematics Grade 5 — v2.0
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Approved by Principal
                  </span>
                </div>
                <span className="text-xs text-stone-400">Previous: v1.0</span>
              </div>
              <p className="text-xs text-stone-700 font-medium">
                "Added 2 extra periods to Fractions for hands-on visual activity; aligned Bloom taxonomy learning outcomes with NEP 2020 guidelines."
              </p>
              <div className="text-[11px] text-stone-400 pt-1">
                Revised By: <strong className="text-stone-700">Academic Coordinator</strong> • Date: 2026-07-01
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DOCUMENT */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingDoc ? "Edit Document Resource" : "Upload Document Resource"}
              </h3>
              <button onClick={() => setDocModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Subject *</label>
                <select
                  value={docForm.subject_id}
                  onChange={(e) => setDocForm({ ...docForm, subject_id: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3 Fractions Comprehensive Worksheet"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Document Type</label>
                  <select
                    value={docForm.doc_type}
                    onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Worksheet">Worksheet</option>
                    <option value="Annual Syllabus">Annual Syllabus</option>
                    <option value="Board Curriculum">Board Curriculum</option>
                    <option value="Chapter Notes">Chapter Notes</option>
                    <option value="Teacher Guide">Teacher Guide</option>
                    <option value="Question Bank">Question Bank</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Version Tag</label>
                  <input
                    type="text"
                    placeholder="v1.0"
                    value={docForm.version}
                    onChange={(e) => setDocForm({ ...docForm, version: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                  />
                </div>
              </div>

              {/* UNIVERSAL PDF UPLOADER */}
              <PdfUploader
                label="PDF Document File *"
                helperText="Upload Annual Syllabus, Curriculum, Worksheet or Question Bank (PDF)"
                initialUrl={docForm.file_url}
                onPdfUploaded={(data) => setDocForm({ ...docForm, file_url: data.fileUrl })}
                onPdfRemoved={() => setDocForm({ ...docForm, file_url: "" })}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setDocModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : editingDoc ? "Update Document" : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT REVISION */}
      {revModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                Log Curriculum Revision
              </h3>
              <button onClick={() => setRevModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveRevision} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Subject *</label>
                <select
                  value={revForm.subject_id}
                  onChange={(e) => setRevForm({ ...revForm, subject_id: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  required
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">New Version *</label>
                  <input
                    type="text"
                    placeholder="e.g. v2.1"
                    value={revForm.version_tag}
                    onChange={(e) => setRevForm({ ...revForm, version_tag: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Previous Version</label>
                  <input
                    type="text"
                    placeholder="e.g. v2.0"
                    value={revForm.previous_version}
                    onChange={(e) => setRevForm({ ...revForm, previous_version: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Revision Summary & Change Log *</label>
                <textarea
                  placeholder="Describe changes made to chapters, period distributions or learning outcomes"
                  value={revForm.revision_summary}
                  onChange={(e) => setRevForm({ ...revForm, revision_summary: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Approval Status</label>
                  <select
                    value={revForm.approval_status}
                    onChange={(e) => setRevForm({ ...revForm, approval_status: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Approved By</label>
                  <input
                    type="text"
                    placeholder="Principal"
                    value={revForm.approved_by}
                    onChange={(e) => setRevForm({ ...revForm, approved_by: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setRevModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs">
                  {isSaving ? "Saving..." : "Log Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
