"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveCampusId(supabase: any, campusId: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) return campusId;
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campuses found in database.");
  return data.id;
}

// -------------------------------------------------------------
// 1. EXECUTIVE DASHBOARD & OVERVIEW
// -------------------------------------------------------------
export async function getSyllabusDashboard(campusId: string, session = '2026-2027', className?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let subjectQuery = supabase
      .from('academic_subjects')
      .select(`
        id, name, code, category, class_name, weekly_periods, teacher_name, 
        total_planned_periods, color_code, status,
        syllabus_chapters (
          id, chapter_number, chapter_name, estimated_periods, completed_periods, status
        )
      `)
      .eq('campus_id', resolvedCampusId)
      .eq('academic_session', session)
      .eq('status', 'Active');

    if (className && className !== 'All') {
      subjectQuery = subjectQuery.eq('class_name', className);
    }

    const { data: subjects, error: subError } = await subjectQuery.order('class_name').order('name');
    if (subError) throw subError;

    // Calculate metrics per subject
    const subjectMetrics = (subjects || []).map((sub: any) => {
      const chapters = sub.syllabus_chapters || [];
      const totalChapters = chapters.length;
      const completedChapters = chapters.filter((c: any) => c.status === 'Completed').length;
      const inProgressChapters = chapters.filter((c: any) => c.status === 'In Progress').length;
      
      const totalEstimatedPeriods = chapters.reduce((s: number, c: any) => s + (c.estimated_periods || 0), 0) || sub.total_planned_periods || 100;
      const totalCompletedPeriods = chapters.reduce((s: number, c: any) => s + (c.completed_periods || 0), 0);
      
      const completionPercentage = totalEstimatedPeriods > 0 
        ? Math.min(100, Math.round((totalCompletedPeriods / totalEstimatedPeriods) * 100))
        : 0;

      // Status indicator: 🟢 >= 70% (On Schedule), 🟡 50-69% (Moderate/Review), 🔴 < 50% (Behind)
      let pacingStatus: 'On Schedule' | 'Slightly Behind' | 'Significantly Behind' = 'On Schedule';
      let healthTag = '🟢';
      if (completionPercentage < 50) {
        pacingStatus = 'Significantly Behind';
        healthTag = '🔴';
      } else if (completionPercentage < 70) {
        pacingStatus = 'Slightly Behind';
        healthTag = '🟡';
      }

      return {
        ...sub,
        totalChapters,
        completedChapters,
        inProgressChapters,
        totalEstimatedPeriods,
        totalCompletedPeriods,
        completionPercentage,
        pacingStatus,
        healthTag
      };
    });

    // Fetch active catchup plans
    const { data: catchupPlans } = await supabase
      .from('syllabus_catchup_plans')
      .select('*, academic_subjects(name, class_name), syllabus_chapters(chapter_name)')
      .eq('campus_id', resolvedCampusId)
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    // Fetch recent lesson logs
    const { data: recentLogs } = await supabase
      .from('syllabus_lesson_logs')
      .select('*, academic_subjects(name, class_name), syllabus_chapters(chapter_name)')
      .eq('campus_id', resolvedCampusId)
      .order('lesson_date', { ascending: false })
      .limit(10);

    // Summary statistics
    const totalSubjectsCount = subjectMetrics.length;
    const avgCompletion = totalSubjectsCount > 0
      ? Math.round(subjectMetrics.reduce((s: number, sm: any) => s + sm.completionPercentage, 0) / totalSubjectsCount)
      : 0;
    
    const onScheduleCount = subjectMetrics.filter((s: any) => s.pacingStatus === 'On Schedule').length;
    const delayedCount = subjectMetrics.filter((s: any) => s.pacingStatus !== 'On Schedule').length;

    return {
      success: true,
      data: {
        subjects: subjectMetrics,
        stats: {
          totalSubjects: totalSubjectsCount,
          avgCompletion,
          onScheduleCount,
          delayedCount,
          activeRemedialPlans: catchupPlans?.length || 0
        },
        catchupPlans: catchupPlans || [],
        recentLessonLogs: recentLogs || []
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. SUBJECTS CRUD
// -------------------------------------------------------------
export async function getAcademicSubjects(campusId: string, session = '2026-2027', className?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('academic_subjects')
      .select(`
        *,
        syllabus_units (id),
        syllabus_chapters (id, status, estimated_periods, completed_periods)
      `)
      .eq('campus_id', resolvedCampusId)
      .eq('academic_session', session);

    if (className && className !== 'All') {
      query = query.eq('class_name', className);
    }

    const { data, error } = await query.order('class_name').order('name');
    if (error) throw error;

    const formatted = (data || []).map((sub: any) => {
      const unitsCount = (sub.syllabus_units || []).length;
      const chapters = sub.syllabus_chapters || [];
      const chaptersCount = chapters.length;
      const totalEstimatedPeriods = chapters.reduce((s: number, c: any) => s + (c.estimated_periods || 0), 0) || sub.total_planned_periods;
      const totalCompletedPeriods = chapters.reduce((s: number, c: any) => s + (c.completed_periods || 0), 0);
      const completionPercentage = totalEstimatedPeriods > 0 
        ? Math.min(100, Math.round((totalCompletedPeriods / totalEstimatedPeriods) * 100))
        : 0;

      return {
        ...sub,
        unitsCount,
        chaptersCount,
        completionPercentage
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function saveAcademicSubject(payload: {
  id?: string;
  campus_id: string;
  academic_session?: string;
  class_name: string;
  name: string;
  code?: string;
  category?: string;
  weekly_periods?: number;
  teacher_name?: string;
  co_teacher_name?: string;
  total_planned_periods?: number;
  color_code?: string;
  status?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      academic_session: payload.academic_session || '2026-2027',
      class_name: payload.class_name,
      name: payload.name,
      code: payload.code || `${payload.class_name.replace(/\s+/g, '')}-${payload.name.substring(0, 4).toUpperCase()}`,
      category: payload.category || 'Core',
      weekly_periods: Number(payload.weekly_periods || 6),
      teacher_name: payload.teacher_name || '',
      co_teacher_name: payload.co_teacher_name || '',
      total_planned_periods: Number(payload.total_planned_periods || 160),
      color_code: payload.color_code || '#3B82F6',
      status: payload.status || 'Active'
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('academic_subjects')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('academic_subjects')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus');
    revalidatePath('/admin/syllabus/curriculum');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAcademicSubject(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('academic_subjects').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus');
    revalidatePath('/admin/syllabus/curriculum');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. FULL SYLLABUS HIERARCHY TREE (Subject -> Units -> Chapters -> Topics)
// -------------------------------------------------------------
export async function getSubjectFullSyllabus(subjectId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: subject, error: subErr } = await supabase
      .from('academic_subjects')
      .select('*')
      .eq('id', subjectId)
      .single();
    if (subErr) throw subErr;

    // Fetch Units
    const { data: units, error: unitErr } = await supabase
      .from('syllabus_units')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index');
    if (unitErr) throw unitErr;

    // Fetch Chapters
    const { data: chapters, error: chErr } = await supabase
      .from('syllabus_chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index');
    if (chErr) throw chErr;

    // Fetch Topics
    const chapterIds = (chapters || []).map((c: any) => c.id);
    let topics: any[] = [];
    if (chapterIds.length > 0) {
      const { data: topData, error: topErr } = await supabase
        .from('syllabus_topics')
        .select('*')
        .in('chapter_id', chapterIds)
        .order('order_index');
      if (topErr) throw topErr;
      topics = topData || [];
    }

    // Build hierarchy
    const chaptersMap = new Map();
    chapters?.forEach((ch: any) => {
      chaptersMap.set(ch.id, {
        ...ch,
        topics: topics.filter((t: any) => t.chapter_id === ch.id)
      });
    });

    const unitsWithChapters = (units || []).map((u: any) => ({
      ...u,
      chapters: chapters?.filter((ch: any) => ch.unit_id === u.id).map((ch: any) => chaptersMap.get(ch.id)) || []
    }));

    // Chapters not bound to a unit
    const unassignedChapters = chapters
      ?.filter((ch: any) => !ch.unit_id)
      .map((ch: any) => chaptersMap.get(ch.id)) || [];

    return {
      success: true,
      data: {
        subject,
        units: unitsWithChapters,
        unassignedChapters
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. UNITS CRUD
// -------------------------------------------------------------
export async function saveSyllabusUnit(payload: {
  id?: string;
  campus_id: string;
  subject_id: string;
  unit_number: number;
  unit_title: string;
  description?: string;
  order_index?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      subject_id: payload.subject_id,
      unit_number: Number(payload.unit_number),
      unit_title: payload.unit_title,
      description: payload.description || '',
      order_index: Number(payload.order_index || payload.unit_number)
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_units')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_units')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus/curriculum');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSyllabusUnit(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_units').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/curriculum');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. CHAPTERS CRUD
// -------------------------------------------------------------
export async function saveSyllabusChapter(payload: {
  id?: string;
  campus_id: string;
  unit_id?: string | null;
  subject_id: string;
  chapter_number: number;
  chapter_name: string;
  estimated_periods?: number;
  completed_periods?: number;
  planned_start_date?: string;
  planned_completion_date?: string;
  actual_completion_date?: string;
  learning_objectives?: string;
  key_concepts?: string;
  skills?: string;
  activities?: string;
  teaching_resources?: string;
  reference_material?: string;
  status?: string;
  order_index?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      unit_id: payload.unit_id || null,
      subject_id: payload.subject_id,
      chapter_number: Number(payload.chapter_number),
      chapter_name: payload.chapter_name,
      estimated_periods: Number(payload.estimated_periods || 8),
      completed_periods: Number(payload.completed_periods || 0),
      planned_start_date: payload.planned_start_date || null,
      planned_completion_date: payload.planned_completion_date || null,
      actual_completion_date: payload.actual_completion_date || null,
      learning_objectives: payload.learning_objectives || '',
      key_concepts: payload.key_concepts || '',
      skills: payload.skills || '',
      activities: payload.activities || '',
      teaching_resources: payload.teaching_resources || '',
      reference_material: payload.reference_material || '',
      status: payload.status || 'Not Started',
      order_index: Number(payload.order_index || payload.chapter_number)
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_chapters')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_chapters')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus/curriculum');
    revalidatePath('/admin/syllabus/teaching');
    revalidatePath('/admin/syllabus');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSyllabusChapter(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_chapters').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/curriculum');
    revalidatePath('/admin/syllabus');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. TOPICS CRUD (Bloom's Taxonomy Learning Outcomes)
// -------------------------------------------------------------
export async function saveSyllabusTopic(payload: {
  id?: string;
  campus_id: string;
  chapter_id: string;
  topic_number?: number;
  topic_name: string;
  subtopics?: string;
  learning_outcomes?: {
    understand?: string;
    explain?: string;
    apply?: string;
    analyse?: string;
    create?: string;
  };
  planned_periods?: number;
  completed_periods?: number;
  status?: string;
  order_index?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      chapter_id: payload.chapter_id,
      topic_number: Number(payload.topic_number || 1),
      topic_name: payload.topic_name,
      subtopics: payload.subtopics || '',
      learning_outcomes: payload.learning_outcomes || {},
      planned_periods: Number(payload.planned_periods || 2),
      completed_periods: Number(payload.completed_periods || 0),
      status: payload.status || 'Pending',
      order_index: Number(payload.order_index || payload.topic_number || 1)
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_topics')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_topics')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus/curriculum');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSyllabusTopic(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_topics').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/curriculum');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 7. ANNUAL & MONTHLY PLANNER
// -------------------------------------------------------------
export async function getAnnualMonthlyPlanner(campusId: string, subjectId?: string, session = '2026-2027') {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('syllabus_planners')
      .select('*, academic_subjects(id, name, class_name, color_code), syllabus_chapters(id, chapter_number, chapter_name, estimated_periods, completed_periods, status)')
      .eq('campus_id', resolvedCampusId)
      .eq('academic_session', session);

    if (subjectId && subjectId !== 'All') {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function saveMonthlyPlannerEntry(payload: {
  id?: string;
  campus_id: string;
  subject_id: string;
  chapter_id: string;
  academic_session?: string;
  month_name: string;
  week_number?: number;
  planned_periods: number;
  actual_periods?: number;
  status?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      subject_id: payload.subject_id,
      chapter_id: payload.chapter_id,
      academic_session: payload.academic_session || '2026-2027',
      month_name: payload.month_name,
      week_number: Number(payload.week_number || 1),
      planned_periods: Number(payload.planned_periods || 4),
      actual_periods: Number(payload.actual_periods || 0),
      status: payload.status || 'Planned'
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_planners')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_planners')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus/planner');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMonthlyPlannerEntry(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_planners').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/planner');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 8. TEACHER LESSON DIARY & PERIOD LOGGING
// -------------------------------------------------------------
export async function logTeachingPeriod(payload: {
  campus_id: string;
  subject_id: string;
  chapter_id: string;
  topic_id?: string | null;
  teacher_name: string;
  lesson_date?: string;
  period_number?: number;
  topic_title: string;
  learning_objective?: string;
  teaching_method?: string;
  teaching_aid?: string;
  classwork?: string;
  homework?: string;
  assessment_type?: string;
  remarks?: string;
  is_completed?: boolean;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      subject_id: payload.subject_id,
      chapter_id: payload.chapter_id,
      topic_id: payload.topic_id || null,
      teacher_name: payload.teacher_name,
      lesson_date: payload.lesson_date || new Date().toISOString().split('T')[0],
      period_number: Number(payload.period_number || 1),
      topic_title: payload.topic_title,
      learning_objective: payload.learning_objective || '',
      teaching_method: payload.teaching_method || 'Interactive Lecture',
      teaching_aid: payload.teaching_aid || 'Smartboard & Textbooks',
      classwork: payload.classwork || '',
      homework: payload.homework || '',
      assessment_type: payload.assessment_type || 'Worksheet',
      remarks: payload.remarks || '',
      is_completed: payload.is_completed ?? true
    };

    const { data: logData, error: logErr } = await supabase
      .from('syllabus_lesson_logs')
      .insert([record])
      .select()
      .single();
    if (logErr) throw logErr;

    // Increment completed periods in the Chapter
    const { data: ch } = await supabase
      .from('syllabus_chapters')
      .select('id, estimated_periods, completed_periods')
      .eq('id', payload.chapter_id)
      .single();

    if (ch) {
      const newCompleted = (ch.completed_periods || 0) + 1;
      const newStatus = newCompleted >= ch.estimated_periods ? 'Completed' : 'In Progress';
      await supabase
        .from('syllabus_chapters')
        .update({
          completed_periods: newCompleted,
          status: newStatus,
          actual_completion_date: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', payload.chapter_id);
    }

    revalidatePath('/admin/syllabus');
    revalidatePath('/admin/syllabus/teaching');
    revalidatePath('/admin/syllabus/curriculum');
    return { success: true, data: logData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTeachingDiaryLogs(campusId: string, subjectId?: string, limit = 50) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('syllabus_lesson_logs')
      .select('*, academic_subjects(id, name, class_name, teacher_name), syllabus_chapters(id, chapter_number, chapter_name, estimated_periods, completed_periods)')
      .eq('campus_id', resolvedCampusId);

    if (subjectId && subjectId !== 'All') {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query.order('lesson_date', { ascending: false }).limit(limit);
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function deleteTeachingLog(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_lesson_logs').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/teaching');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 9. CATCH-UP / REMEDIAL PLANS CRUD
// -------------------------------------------------------------
export async function getCatchUpRemedialPlans(campusId: string, session = '2026-2027', className?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('syllabus_catchup_plans')
      .select('*, academic_subjects(id, name, class_name, teacher_name), syllabus_chapters(id, chapter_number, chapter_name, estimated_periods, completed_periods, status)')
      .eq('campus_id', resolvedCampusId);

    if (className && className !== 'All') {
      query = query.eq('class_name', className);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function saveCatchUpPlan(payload: {
  id?: string;
  campus_id: string;
  subject_id: string;
  chapter_id: string;
  class_name: string;
  delay_percentage?: number;
  reason_for_delay: string;
  remedial_action_plan: string;
  additional_periods_allocated: number;
  target_completion_date?: string;
  assigned_teacher?: string;
  status?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      subject_id: payload.subject_id,
      chapter_id: payload.chapter_id,
      class_name: payload.class_name,
      delay_percentage: Number(payload.delay_percentage || 10.0),
      reason_for_delay: payload.reason_for_delay,
      remedial_action_plan: payload.remedial_action_plan,
      additional_periods_allocated: Number(payload.additional_periods_allocated || 4),
      target_completion_date: payload.target_completion_date || null,
      assigned_teacher: payload.assigned_teacher || '',
      status: payload.status || 'Active'
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_catchup_plans')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_catchup_plans')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus');
    revalidatePath('/admin/syllabus/remedial');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCatchUpPlan(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_catchup_plans').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/remedial');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 10. EXAM SYLLABUS & BLUEPRINTS CRUD
// -------------------------------------------------------------
export async function getExamBlueprints(campusId: string, session = '2026-2027', className?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('syllabus_exam_blueprints')
      .select('*, academic_subjects(id, name, class_name, code)')
      .eq('campus_id', resolvedCampusId)
      .eq('academic_session', session);

    if (className && className !== 'All') {
      query = query.eq('class_name', className);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function saveExamBlueprint(payload: {
  id?: string;
  campus_id: string;
  exam_name: string;
  academic_session?: string;
  class_name: string;
  subject_id: string;
  selected_chapter_ids?: string[];
  weightage_breakdown?: Array<{ chapter: string; marks: number; percentage: number }>;
  blueprint_notes?: string;
  total_marks?: number;
  duration_minutes?: number;
  status?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      exam_name: payload.exam_name,
      academic_session: payload.academic_session || '2026-2027',
      class_name: payload.class_name,
      subject_id: payload.subject_id,
      selected_chapter_ids: payload.selected_chapter_ids || [],
      weightage_breakdown: payload.weightage_breakdown || [],
      blueprint_notes: payload.blueprint_notes || '',
      total_marks: Number(payload.total_marks || 80),
      duration_minutes: Number(payload.duration_minutes || 180),
      status: payload.status || 'Published'
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_exam_blueprints')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_exam_blueprints')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus/exams');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExamBlueprint(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_exam_blueprints').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/exams');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 11. SYLLABUS DOCUMENTS & QUESTION BANKS CRUD
// -------------------------------------------------------------
export async function getSyllabusDocuments(campusId: string, subjectId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('syllabus_documents')
      .select('*, academic_subjects(id, name, class_name), syllabus_chapters(id, chapter_name)')
      .eq('campus_id', resolvedCampusId);

    if (subjectId && subjectId !== 'All') {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function saveSyllabusDocument(payload: {
  id?: string;
  campus_id: string;
  subject_id: string;
  chapter_id?: string | null;
  title: string;
  doc_type?: string;
  file_url: string;
  version?: string;
  uploaded_by?: string;
  status?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      subject_id: payload.subject_id,
      chapter_id: payload.chapter_id || null,
      title: payload.title,
      doc_type: payload.doc_type || 'Worksheet',
      file_url: payload.file_url,
      version: payload.version || 'v1.0',
      uploaded_by: payload.uploaded_by || 'Academic Coordinator',
      status: payload.status || 'Active'
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_documents')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_documents')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus/resources');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSyllabusDocument(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('syllabus_documents').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/syllabus/resources');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 12. SYLLABUS REVISIONS & APPROVALS CRUD
// -------------------------------------------------------------
export async function getSyllabusRevisions(subjectId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('syllabus_revisions')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function saveSyllabusRevision(payload: {
  id?: string;
  campus_id: string;
  subject_id: string;
  version_tag: string;
  previous_version?: string;
  revised_by: string;
  revision_summary: string;
  approval_status?: string;
  approved_by?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const record = {
      campus_id: resolvedCampusId,
      subject_id: payload.subject_id,
      version_tag: payload.version_tag,
      previous_version: payload.previous_version || 'v1.0',
      revised_by: payload.revised_by,
      revision_summary: payload.revision_summary,
      approval_status: payload.approval_status || 'Approved',
      approved_by: payload.approved_by || 'Principal',
      approved_at: new Date().toISOString()
    };

    let result;
    if (payload.id) {
      const { data, error } = await supabase
        .from('syllabus_revisions')
        .update(record)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('syllabus_revisions')
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath('/admin/syllabus/resources');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
