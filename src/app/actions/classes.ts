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

export async function getClasses(campusId: string) {
  try {
    if (!campusId) return { success: true, data: [] };
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .eq('campus_id', resolvedCampusId)
      .order('grade', { ascending: true });

    if (error) throw error;

    // Also get student count for each class from student_academic_history
    const { data: history } = await supabase
      .from('student_academic_history')
      .select('class_name, section_name')
      .eq('is_current_session', true);

    const countMap: Record<string, number> = {};
    (history || []).forEach((h: any) => {
      const key = `${h.class_name}_${h.section_name || 'A'}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const enriched = (classes || []).map((c: any) => ({
      ...c,
      enrolledCount: countMap[`${c.grade}_${c.section}`] || 0
    }));

    return { success: true, data: enriched };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function createClass(campusId: string, payload: {
  grade: string;
  section: string;
  room_number?: string;
  capacity?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    // Get active academic year
    let { data: academicYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('campus_id', resolvedCampusId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    let yearId = academicYear?.id;
    if (!yearId) {
      const { data: newYear } = await supabase
        .from('academic_years')
        .insert([{ campus_id: resolvedCampusId, name: '2026-2027', start_date: '2026-04-01', end_date: '2027-03-31', is_active: true }])
        .select()
        .single();
      yearId = newYear?.id;
    }

    const { data, error } = await supabase
      .from('classes')
      .insert([{
        campus_id: resolvedCampusId,
        academic_year_id: yearId,
        grade: payload.grade.trim(),
        section: payload.section.trim().toUpperCase() || 'A',
        room_number: payload.room_number || null,
        capacity: Number(payload.capacity || 40)
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Class ${payload.grade} Section ${payload.section} already exists.`);
      }
      throw error;
    }

    revalidatePath('/admin/classes');
    revalidatePath('/admin/students');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteClass(classId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) throw error;

    revalidatePath('/admin/classes');
    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
