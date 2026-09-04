"use client";

import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Layers,
  BookOpen,
  HeartHandshake,
  Activity,
  Smile,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  getAssessmentRubricsAction,
  saveAssessmentRubricAction,
  deleteAssessmentRubricAction,
  RubricDefinition
} from '@/app/actions/hpc-actions';

export default function AssessmentRubricsPage() {
  const [rubrics, setRubrics] = useState<RubricDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<RubricDefinition | null>(null);
  const [formData, setFormData] = useState({
    name: 'NEP 2020 Holistic Standard',
    grade_level: 'Primary & Middle',
    domain: 'COGNITIVE',
    competency_name: '',
    descriptors: [
      { level: 1, title: 'Emerging', description: 'Requires continuous guidance and modeling.' },
      { level: 2, title: 'Developing', description: 'Applies concepts with occasional scaffolding.' },
      { level: 3, title: 'Proficient', description: 'Demonstrates independent mastery with high consistency.' },
      { level: 4, title: 'Exemplary', description: 'Synthesizes concepts creatively and mentors peers.' }
    ]
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadRubrics = async () => {
    setIsLoading(true);
    const res = await getAssessmentRubricsAction();
    if (res.success && res.rubrics) {
      setRubrics(res.rubrics);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRubrics();
  }, []);

  const handleOpenModal = (rubric?: RubricDefinition) => {
    if (rubric) {
      setEditingRubric(rubric);
      setFormData({
        name: rubric.name,
        grade_level: rubric.grade_level,
        domain: rubric.domain,
        competency_name: rubric.competency_name,
        descriptors: rubric.descriptors || [
          { level: 1, title: 'Emerging', description: '' },
          { level: 2, title: 'Developing', description: '' },
          { level: 3, title: 'Proficient', description: '' },
          { level: 4, title: 'Exemplary', description: '' }
        ]
      });
    } else {
      setEditingRubric(null);
      setFormData({
        name: 'NEP 2020 Holistic Standard',
        grade_level: 'Primary & Middle',
        domain: 'COGNITIVE',
        competency_name: '',
        descriptors: [
          { level: 1, title: 'Emerging', description: 'Requires continuous guidance and modeling.' },
          { level: 2, title: 'Developing', description: 'Applies concepts with occasional scaffolding.' },
          { level: 3, title: 'Proficient', description: 'Demonstrates independent mastery with high consistency.' },
          { level: 4, title: 'Exemplary', description: 'Synthesizes concepts creatively and mentors peers.' }
        ]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.competency_name) return;

    setIsSaving(true);
    const res = await saveAssessmentRubricAction({
      id: editingRubric?.id,
      name: formData.name,
      grade_level: formData.grade_level,
      domain: formData.domain,
      competency_name: formData.competency_name,
      descriptors: formData.descriptors
    });

    if (res.success) {
      setIsModalOpen(false);
      await loadRubrics();
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rubric?')) return;
    await deleteAssessmentRubricAction(id);
    await loadRubrics();
  };

  const filteredRubrics = rubrics.filter(r => {
    if (selectedDomainFilter === 'ALL') return true;
    return r.domain === selectedDomainFilter;
  });

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'COGNITIVE':
        return <BookOpen className="w-4 h-4 text-sky-600" />;
      case 'AFFECTIVE':
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case 'PSYCHOMOTOR':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      default:
        return <Smile className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <VastuModuleBanner
        badgeText="NEP 2020 PEDAGOGY"
        title="Competency-Based Assessment Rubrics"
        description="Design and calibrate 4-level descriptive assessment rubrics across Cognitive, Affective, Psychomotor, and Socio-Emotional domains."
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {(['ALL', 'COGNITIVE', 'AFFECTIVE', 'PSYCHOMOTOR', 'SOCIO_EMOTIONAL'] as const).map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomainFilter(dom)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedDomainFilter === dom
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {dom === 'ALL' ? 'All Domains' : dom}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenModal()}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Custom Rubric
          </Button>
          <Button
            variant="outline"
            onClick={loadRubrics}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Rubrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-12 text-center text-stone-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-400" />
            Loading assessment rubrics...
          </div>
        ) : filteredRubrics.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-stone-400">
            No rubrics defined for this domain.
          </div>
        ) : (
          filteredRubrics.map((r) => (
            <Card key={r.id} className="p-5 border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60">
                    {getDomainIcon(r.domain)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{r.competency_name}</h3>
                    <p className="text-[11px] text-stone-500">{r.domain} • {r.grade_level}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(r)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                    title="Edit Rubric"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Rubric"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4-Level Descriptor Preview */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                {r.descriptors?.map((d: any) => (
                  <div key={d.level} className="p-2 bg-stone-50 rounded-lg border border-stone-100 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 shrink-0">
                      L{d.level}
                    </span>
                    <div>
                      <strong className="text-stone-800 block text-[11px]">{d.title}</strong>
                      <p className="text-stone-500 text-[11px] leading-relaxed">{d.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Rubric Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                {editingRubric ? 'Edit Assessment Rubric' : 'Create Custom Competency Rubric'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-stone-800"
                  >
                    <option value="COGNITIVE">Cognitive & Inquiry</option>
                    <option value="AFFECTIVE">Affective & Empathy</option>
                    <option value="PSYCHOMOTOR">Psychomotor & Health</option>
                    <option value="SOCIO_EMOTIONAL">Socio-Emotional (SEL)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Applicable Grade Span</label>
                  <input
                    type="text"
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Competency Name / Skill Area</label>
                <input
                  type="text"
                  placeholder="e.g. Algorithmic Thinking & Pattern Recognition"
                  value={formData.competency_name}
                  onChange={(e) => setFormData({ ...formData, competency_name: e.target.value })}
                  required
                  className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              {/* Descriptors */}
              <div className="space-y-2">
                <label className="font-bold text-stone-700 block text-xs">4-Level Descriptors</label>
                {formData.descriptors.map((desc, idx) => (
                  <div key={desc.level} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">Level {desc.level}: {desc.title}</span>
                    </div>
                    <textarea
                      rows={2}
                      value={desc.description}
                      onChange={(e) => {
                        const next = [...formData.descriptors];
                        next[idx].description = e.target.value;
                        setFormData({ ...formData, descriptors: next });
                      }}
                      className="w-full p-2 bg-white rounded-lg border border-stone-200 text-xs"
                      placeholder={`Observable behaviors for Level ${desc.level}...`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save Rubric'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
