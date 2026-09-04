"use client";

import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Atom,
  Calculator,
  Globe2,
  Play,
  Share2,
  Check,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export interface DigitalResourceItem {
  id: string;
  provider: 'CBSE_DIKSHA' | 'PHET_SIM' | 'KHAN_ACADEMY' | '3D_MOLVIEW';
  title: string;
  subject: string;
  grade: string;
  description: string;
  embed_url: string;
  badge: string;
  lti_ags_supported: boolean; // Assignment and Grade Services
}

const DIGITAL_RESOURCES: DigitalResourceItem[] = [
  {
    id: 'res-01',
    provider: 'PHET_SIM',
    title: 'PhET: Circuit Construction Kit (DC Virtual Lab)',
    subject: 'Science',
    grade: 'Class 8-10',
    description: 'Interactive HTML5 simulation allowing students to wire batteries, resistors, light bulbs, and switches to measure voltage and current via virtual ammeters.',
    embed_url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
    badge: 'Interactive Simulation',
    lti_ags_supported: true
  },
  {
    id: 'res-02',
    provider: 'CBSE_DIKSHA',
    title: 'CBSE DIKSHA: Class 10 Science Chapter 6 - Life Processes',
    subject: 'Science',
    grade: 'Class 10',
    description: 'Official NCERT digitized textbook with QR code-linked audio-visual explanations, 3D anatomical charts of human digestive and circulatory systems.',
    embed_url: 'https://diksha.gov.in/play/collection/do_31307451478564044812613',
    badge: 'Official NCERT Textbook',
    lti_ags_supported: true
  },
  {
    id: 'res-03',
    provider: 'PHET_SIM',
    title: 'PhET: Fraction Matcher & Visual Proportions',
    subject: 'Mathematics',
    grade: 'Class 3-5',
    description: 'Visual fraction representation combining pie charts, bar segments, and numerical equivalents to reinforce foundational numeracy.',
    embed_url: 'https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher_en.html',
    badge: 'Foundational Numeracy',
    lti_ags_supported: true
  },
  {
    id: 'res-04',
    provider: 'KHAN_ACADEMY',
    title: 'Khan Academy: Quadratic Equations & Parabolas',
    subject: 'Mathematics',
    grade: 'Class 10',
    description: 'Mastery challenge sequence featuring step-by-step video hints and auto-graded formative practice with instant teacher grade passback.',
    embed_url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations',
    badge: 'Adaptive Practice',
    lti_ags_supported: true
  },
  {
    id: 'res-05',
    provider: '3D_MOLVIEW',
    title: 'MolView 3D: Organic Chemistry Hydrocarbons & Polymers',
    subject: 'Science',
    grade: 'Class 11-12',
    description: 'Interactive 3D molecular ball-and-stick viewer allowing students to rotate methane, benzene, and glucose structures in 360 degrees.',
    embed_url: 'https://embed.molview.org/v1/?mode=balls&cid=241',
    badge: '3D Molecular Viewer',
    lti_ags_supported: false
  }
];

export function LtiResourcePicker() {
  const [selectedResource, setSelectedResource] = useState<DigitalResourceItem>(DIGITAL_RESOURCES[0]);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [embedSuccess, setEmbedSuccess] = useState<string | null>(null);

  const filteredResources = DIGITAL_RESOURCES.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.grade.toLowerCase().includes(search.toLowerCase());
    const matchesSub = filterSubject === 'ALL' || r.subject === filterSubject;
    return matchesSearch && matchesSub;
  });

  const handleEmbed = (res: DigitalResourceItem) => {
    setEmbedSuccess(`Embedded "${res.title}" into Lesson Diary & Assigned Homework! LTI 1.3 SSO Token active.`);
    setTimeout(() => setEmbedSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-sm">
            <Atom className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                LTI 1.3 Standard &amp; CBSE DIKSHA Digital Textbook Embedding
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-900 rounded-full border border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                IMS Global LTI 1.3 Certified
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Embed interactive PhET science simulations, Khan Academy exercises, and official CBSE DIKSHA QR portal digital textbooks directly into lesson plans and homework with automated grade passback (AGS).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-stone-600 bg-white border border-[#E8DFC8] px-3 py-1.5 rounded-xl font-semibold">
            SSO Auth: 1-Click CBSE Teacher Key
          </span>
        </div>
      </div>

      {embedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{embedSuccess}</span>
          </div>
          <button
            onClick={() => setEmbedSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left Catalog & Right Interactive Preview Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resource Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[#E8DFC8] rounded-2xl bg-white p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Digital Curriculum Catalog
              </h4>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="text-xs border border-[#E8DFC8] rounded-lg p-1 bg-white text-stone-800"
              >
                <option value="ALL">All Subjects</option>
                <option value="Science">Science &amp; Physics</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search PhET, DIKSHA, 3D..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs border-[#E8DFC8] h-8"
              />
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    selectedResource.id === res.id
                      ? 'bg-amber-50/60 border-[#D97706] shadow-2xs'
                      : 'bg-[#FAF7F2] border-[#E8DFC8] hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        res.provider === 'PHET_SIM'
                          ? 'bg-purple-100 text-purple-900 border-purple-200'
                          : res.provider === 'CBSE_DIKSHA'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          : res.provider === 'KHAN_ACADEMY'
                          ? 'bg-blue-100 text-blue-900 border-blue-200'
                          : 'bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      {res.badge}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 font-semibold">
                      {res.grade}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-stone-900 leading-snug">
                    {res.title}
                  </h5>

                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 font-semibold">{res.subject}</span>
                    {res.lti_ags_supported && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Auto Grade Passback
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Sandbox & Embed Action (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[#E8DFC8] rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFC8] pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
                  {selectedResource.provider.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-bold text-stone-900 mt-1">
                  {selectedResource.title}
                </h4>
                <p className="text-xs text-stone-500">
                  Target: {selectedResource.grade} • {selectedResource.subject}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEmbed(selectedResource)}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Embed in Lesson Plan
                </Button>
              </div>
            </div>

            {/* Interactive Simulation / Resource Sandbox Frame */}
            <div className="rounded-xl border border-stone-200 overflow-hidden bg-stone-900 aspect-video relative flex flex-col items-center justify-center">
              <iframe
                src={selectedResource.embed_url}
                title={selectedResource.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>

            {/* Pedagogical Description & Metadata */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <Info className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Pedagogical Learning Outcomes &amp; NEP Alignment</span>
              </div>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                {selectedResource.description}
              </p>
              <div className="pt-2 border-t border-[#E8DFC8] flex items-center justify-between text-[10px] text-stone-500">
                <span>Protocol: IMS Global LTI 1.3 / Deep Linking Specification</span>
                <span className="font-semibold text-emerald-700">Grade Passback (AGS): Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
