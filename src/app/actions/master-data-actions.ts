"use server";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface EnrollStudentInput {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  institutionCode: string; // 'CBS' | 'AVM' | 'AS' | 'CBPS'
  className: string;
  sectionName: string;
  rollNumber?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  relationship?: string;
  address?: string;
}

export async function enrollStudentAction(input: EnrollStudentInput) {
  try {
    const admissionNo = `${input.institutionCode}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Insert permanent student master
    const { data: student, error: stuErr } = await supabase
      .from('students')
      .insert({
        admission_no: admissionNo,
        first_name: input.firstName,
        last_name: input.lastName,
        dob: input.dob,
        gender: input.gender,
        blood_group: input.bloodGroup || 'O+',
        roll_no: input.rollNumber || '1',
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (stuErr || !student) {
      throw new Error(stuErr?.message || 'Failed to create student master record');
    }

    // 2. Insert contextual student enrollment
    const { error: enrErr } = await supabase
      .from('student_enrollments')
      .insert({
        student_id: student.id,
        institution_code: input.institutionCode,
        academic_session: '2026-2027',
        class_name: input.className,
        section_name: input.sectionName,
        admission_number: admissionNo,
        roll_number: input.rollNumber || '1',
        enrollment_status: 'ACTIVE',
      });

    if (enrErr) {
      console.error('Enrollment error:', enrErr);
    }

    // 3. Insert guardian & link
    if (input.parentName && input.parentPhone) {
      const names = input.parentName.trim().split(' ');
      const pFirst = names[0];
      const pLast = names.slice(1).join(' ') || 'Guardian';

      const { data: guardian } = await supabase
        .from('guardians')
        .insert({
          first_name: pFirst,
          last_name: pLast,
          phone: input.parentPhone,
          email: input.parentEmail || null,
          relationship: input.relationship || 'FATHER',
          address: input.address || null,
          is_primary_contact: true,
        })
        .select()
        .single();

      if (guardian) {
        await supabase
          .from('student_guardians')
          .insert({
            student_id: student.id,
            guardian_id: guardian.id,
            is_primary: true,
          });
      }
    }

    return {
      success: true,
      studentId: student.id,
      admissionNo: admissionNo,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteStudentAction(studentId: string) {
  try {
    // Find linked guardians
    const { data: links } = await supabase
      .from('student_guardians')
      .select('guardian_id')
      .eq('student_id', studentId);

    // Delete student (cascades to enrollments and student_guardians)
    await supabase.from('students').delete().eq('id', studentId);

    // Clean orphaned guardians
    if (links && links.length > 0) {
      for (const l of links) {
        const { count } = await supabase
          .from('student_guardians')
          .select('*', { count: 'exact', head: true })
          .eq('guardian_id', l.guardian_id);
        
        if (count === 0) {
          await supabase.from('guardians').delete().eq('id', l.guardian_id);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLiveStudentsMaster(institutionCode?: string) {
  try {
    let query = supabase
      .from('students')
      .select(`
        id,
        admission_no,
        first_name,
        last_name,
        dob,
        gender,
        blood_group,
        roll_no,
        status,
        created_at,
        student_enrollments (
          institution_code,
          class_name,
          section_name,
          admission_number,
          enrollment_status
        )
      `)
      .order('created_at', { ascending: false });

    const { data: students, error } = await query;
    if (error) throw error;

    let filtered = students || [];
    if (institutionCode && institutionCode !== 'ALL') {
      filtered = filtered.filter((s: any) =>
        s.student_enrollments?.some((e: any) => e.institution_code === institutionCode)
      );
    }

    return { success: true, data: filtered };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function registerFacultyAction(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institutionCode: string;
  designation: string;
  department: string;
  workloadPercentage?: number;
}) {
  try {
    // 1. Insert staff master
    const { data: staff, error: staffErr } = await supabase
      .from('staff')
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone_number: input.phone,
        designation: input.designation,
        department: input.department,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (staffErr || !staff) {
      throw new Error(staffErr?.message || 'Failed to register staff member');
    }

    // 2. Insert employee assignment
    await supabase
      .from('employee_assignments')
      .insert({
        staff_id: staff.id,
        institution_code: input.institutionCode,
        academic_session: '2026-2027',
        designation: input.designation,
        department: input.department,
        workload_percentage: input.workloadPercentage || 100.00,
        is_primary_assignment: true,
        status: 'ACTIVE',
      });

    return { success: true, staffId: staff.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFacultyAction(staffId: string) {
  try {
    await supabase.from('staff').delete().eq('id', staffId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
