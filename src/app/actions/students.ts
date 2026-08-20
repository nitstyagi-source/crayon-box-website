"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase keys:", { url: !!supabaseUrl, key: !!supabaseServiceKey });
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/** Validates that a string is a proper UUID */
function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/** Resolves a campus ID — if invalid, falls back to first real campus in DB */
async function resolveCampusId(supabase: any, campusId: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) return campusId;
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campuses found in database. Please seed the database first.");
  return data.id;
}

export async function getStudents(campusId: string) {
  try {
    if (!campusId) return { success: true, data: [] };
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data, error } = await supabase
      .from('students')
      .select('*, student_academic_history(*)')
      .eq('campus_id', resolvedCampusId)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function getStudentProfile(studentId: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    if (studentError) throw studentError;

    const [
      { data: academic },
      { data: parents },
      { data: addresses },
      { data: medical },
      { data: documents },
      { data: lifecycle }
    ] = await Promise.all([
      supabase.from('student_academic_history').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_parents').select('*').eq('student_id', studentId),
      supabase.from('student_addresses').select('*').eq('student_id', studentId),
      supabase.from('student_medical').select('*').eq('student_id', studentId).maybeSingle(),
      supabase.from('student_documents').select('*').eq('student_id', studentId),
      supabase.from('student_lifecycle').select('*').eq('student_id', studentId).order('action_date', { ascending: false })
    ]);

    return { 
      success: true, 
      data: {
        ...student,
        academic: academic || [],
        parents: parents || [],
        addresses: addresses || [],
        medical: medical || {},
        documents: documents || [],
        lifecycle: lifecycle || []
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createStudent(payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Always resolve to a real campus UUID
    const campusId = await resolveCampusId(supabase, payload.campus_id);

    // 1. Get or create the active academic year for this campus
    let { data: academicYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('campus_id', campusId)
      .eq('is_active', true)
      .single();
      
    let yearId = academicYear?.id;
    if (!yearId) {
      const { data: newYear } = await supabase
        .from('academic_years')
        .insert([{ campus_id: campusId, name: '2026-2027', start_date: '2026-04-01', end_date: '2027-03-31', is_active: true }])
        .select()
        .single();
      yearId = newYear?.id;
    }

    // 2. Insert Student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        campus_id: campusId,
        admission_no: payload.admission_no,
        first_name: payload.first_name,
        last_name: payload.last_name,
        dob: payload.dob || null,
        gender: payload.gender,
        category: payload.category || 'General',
        status: 'Active',
      }])
      .select()
      .single();

    if (studentError) throw studentError;

    // 3. Insert Academic History
    if (yearId) {
      await supabase.from('student_academic_history').insert([{
        student_id: student.id,
        academic_year_id: yearId,
        class_name: payload.class_name || '',
        section_name: payload.section_name || '',
        is_current_session: true
      }]);
    }

    // 4. Insert Parent
    if (payload.parent_name) {
      await supabase.from('student_parents').insert([{
        student_id: student.id,
        parent_type: 'Father',
        name: payload.parent_name,
        mobile: payload.parent_mobile || '',
        is_primary_contact: true
      }]);
    }

    revalidatePath('/admin/students');
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
