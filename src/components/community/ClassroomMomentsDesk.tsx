"use client";

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Heart,
  Share2,
  Sparkles,
  ShieldCheck,
  Plus,
  RefreshCw,
  Users,
  Tag,
  Eye,
  Lock,
  MessageCircle,
  Clock,
  CheckCircle2,
  Smile,
  PartyPopper,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  getClassroomMomentsAction,
  postClassroomMomentAction,
  reactToMomentAction,
  ClassroomMoment
} from '@/app/actions/classroom-moments-actions';

export function ClassroomMomentsDesk() {
  const [moments, setMoments] = useState<ClassroomMoment[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [privacyBlur, setPrivacyBlur] = useState(false);

  // New Moment Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [postClass, setPostClass] = useState('Class 1-A');
  const [author, setAuthor] = useState('Pooja Aggarwal (Class Teacher)');
  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80'
  );
  const [tagInput, setTagInput] = useState('Aarav Sharma, Ananya Verma');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadMoments = async () => {
    setIsLoading(true);
    const res = await getClassroomMomentsAction(selectedClass);
    if (res.success && res.moments) {
      setMoments(res.moments);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMoments();
  }, [selectedClass]);

  const handlePost = async () => {
    if (!caption.trim() || !mediaUrl.trim()) return;
    setIsSubmitting(true);
    try {
      const tags = tagInput.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await postClassroomMomentAction({
        classId: postClass,
        authorName: author,
        caption,
        mediaUrl,
        taggedStudents: tags
      });

      if (res.success && res.moment) {
        setMoments((prev) => [res.moment!, ...prev]);
        setSuccessToast('New classroom moment shared to verified cohort parents!');
        setShowPostModal(false);
        setCaption('');
      }
    } catch (e: any) {
      alert(`Error posting moment: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (momentId: string, type: 'heart' | 'clap' | 'celebrate') => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === momentId) {
          return {
            ...m,
            reactions_count: {
              ...m.reactions_count,
              [type]: (m.reactions_count[type] || 0) + 1
            }
          };
        }
        return m;
      })
    );
    await reactToMomentAction(momentId, type);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-sm">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Private Cohort "Daily Moments" Classroom Social Feed
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#D97706]" />
                Section-Restricted Feed
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Secure classroom timeline where teachers post daily learning activities, science experiments, and circle time highlights visible only to enrolled parents of that section.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrivacyBlur(!privacyBlur)}
            className={`border-[#E8DFC8] text-xs font-semibold ${
              privacyBlur ? 'bg-amber-100 text-[#D97706]' : 'bg-white text-stone-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {privacyBlur ? 'Face Blur ON' : 'Privacy Blur OFF'}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowPostModal(true)}
            className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-amber-100" />
            Share Classroom Moment
          </Button>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cohort Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'Class 1-A', 'Class 3-B', 'Class 5-A'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedClass === cls
                  ? 'bg-[#FAF7F2] text-[#D97706] border border-[#D97706] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-50 border border-transparent'
              }`}
            >
              {cls === 'ALL' ? 'All Cohorts Stream' : cls}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-500 font-medium hidden sm:inline">
          {moments.length} Activities Shared
        </span>
      </div>

      {/* Media Feed Stream (Cards Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moments.map((m) => (
          <div
            key={m.id}
            className="border border-[#E8DFC8] rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#E8DFC8] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-[#D97706] border border-amber-200 flex items-center justify-center font-bold text-xs">
                  {m.author_name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">
                    {m.author_name}
                  </h4>
                  <div className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-amber-800 bg-amber-100/70 px-1 rounded">
                      {m.class_id}
                    </span>
                    <span>•</span>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Verified
              </span>
            </div>

            {/* Media Image */}
            <div className="relative aspect-video bg-stone-900 overflow-hidden">
              <img
                src={m.media_url}
                alt={m.caption}
                className={`w-full h-full object-cover transition duration-300 ${
                  privacyBlur ? 'filter blur-md scale-105' : ''
                }`}
              />

              {/* Tagged Students Pill */}
              {m.tagged_students.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-300" />
                  <span>Tagged: {m.tagged_students.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Caption Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-stone-700 leading-relaxed">
                {m.caption}
              </p>

              {/* Reaction Buttons Bar */}
              <div className="pt-2 border-t border-[#E8DFC8] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleReaction(m.id, 'heart')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition border border-rose-200"
                  >
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span>{m.reactions_count.heart}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(m.id, 'clap')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-[#D97706] text-xs font-semibold transition border border-amber-200"
                  >
                    <span>👏</span>
                    <span>{m.reactions_count.clap}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(m.id, 'celebrate')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition border border-purple-200"
                  >
                    <PartyPopper className="w-3 h-3 text-purple-600" />
                    <span>{m.reactions_count.celebrate}</span>
                  </button>
                </div>

                <span className="text-[10px] text-stone-400 font-medium">
                  Parent Reactions
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Share Classroom Moment */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E8DFC8] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-stone-900 text-base">
                  Post Classroom Daily Moment
                </h3>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Target Cohort</label>
                  <select
                    value={postClass}
                    onChange={(e) => setPostClass(e.target.value)}
                    className="w-full text-xs border border-[#E8DFC8] rounded-lg p-2 bg-white text-stone-800"
                  >
                    <option value="Class 1-A">Class 1-A</option>
                    <option value="Class 3-B">Class 3-B</option>
                    <option value="Class 5-A">Class 5-A</option>
                    <option value="Class 8-A">Class 8-A</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Teacher Author</label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="text-xs border-[#E8DFC8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Pedagogical Caption & Activity Description</label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Science Experiment: Building magnetic levitation tracks..."
                  className="w-full text-xs border border-[#E8DFC8] rounded-lg p-2 bg-white text-stone-800 focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Classroom Photo / Video URL</label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="text-xs border-[#E8DFC8] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Tag Featured Students (Comma separated)</label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Aarav Sharma, Vihaan Tyagi"
                  className="text-xs border-[#E8DFC8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPostModal(false)}
                className="border-[#E8DFC8] text-stone-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handlePost}
                disabled={isSubmitting || !caption.trim()}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold"
              >
                {isSubmitting ? 'Posting...' : 'Publish to Parents'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
