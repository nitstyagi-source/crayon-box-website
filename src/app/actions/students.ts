"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function getStudents(campusId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('students')
      .select('*, student_academic_history!inner(*)')
      .eq('campus_id', campusId)
      .eq('student_academic_history.is_current_session', true)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentProfile(studentId: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Fetch core student data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    if (studentError) throw studentError;

    // Fetch parallel entities
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
      supabase.from('student_medical').select('*').eq('student_id', studentId).single(),
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
