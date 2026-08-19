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
    
    // 1. We need an active academic year for the campus
    const { data: academicYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('campus_id', payload.campus_id)
      .eq('is_active', true)
      .single();
      
    // If no active year, just use a dummy UUID or fail. Let's create one if it doesn't exist for demo purposes.
    let yearId = academicYear?.id;
    if (!yearId) {
       const { data: newYear } = await supabase.from('academic_years').insert([{ campus_id: payload.campus_id, name: '2026-27', is_active: true }]).select().single();
       yearId = newYear?.id;
    }

    // 2. Insert Student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        campus_id: payload.campus_id,
        admission_no: payload.admission_no,
        first_name: payload.first_name,
        last_name: payload.last_name,
        dob: payload.dob,
        gender: payload.gender,
        category: payload.category || 'General',
      }])
      .select()
      .single();

    if (studentError) throw studentError;

    // 3. Insert Academic History
    await supabase.from('student_academic_history').insert([{
      student_id: student.id,
      academic_year_id: yearId,
      class_name: payload.class_name,
      section_name: payload.section_name,
      is_current_session: true
    }]);

    // 4. Insert Parent
    if (payload.parent_name) {
      await supabase.from('student_parents').insert([{
        student_id: student.id,
        parent_type: 'Parent',
        name: payload.parent_name,
        mobile: payload.parent_mobile,
        is_primary_contact: true
      }]);
    }

    revalidatePath('/admin/students');
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
