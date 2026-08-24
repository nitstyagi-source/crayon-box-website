"use server";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getStudent360Dossier(studentId: string) {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        *,
        classes (name),
        sections (name)
      `)
      .eq('id', studentId)
      .single();

    if (error || !student) {
      return {
        success: false,
        error: 'Student record not found in live database',
        data: null,
      };
    }

    return {
      success: true,
      data: {
        id: student.id,
        admissionNo: student.admission_no || 'N/A',
        fullName: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        firstName: student.first_name,
        lastName: student.last_name,
        gender: student.gender || 'Not Specified',
        dob: student.dob || 'Not Provided',
        bloodGroup: student.blood_group || 'N/A',
        status: student.status || 'ACTIVE',
        currentGrade: student.classes?.name || 'Unassigned',
        currentSection: student.sections?.name || 'A',
        rollNo: student.roll_no || 'N/A',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}
