"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * 1. Batch Promote Students to Next Academic Session
 */
export async function promoteStudentsBatchAction(params: {
  institutionCode: string;
  currentSession: string;
  nextSession: string;
  currentClass: string;
  nextClass: string;
  studentIds: string[];
  actionBy: string;
}) {
  try {
    const supabase = await createClient();

    // Insert historical snapshot in student_lifecycle_history for each student
    const historyEntries = params.studentIds.map(sId => ({
      student_id: sId,
      universal_id: 'STU-' + sId.slice(0, 8).toUpperCase(),
      institution_code: params.institutionCode,
      from_state: 'ACTIVE',
      to_state: 'PROMOTED',
      academic_session: params.currentSession,
      class_name: params.currentClass,
      action_by: params.actionBy || 'Admin',
      remarks: `Promoted from ${params.currentClass} (${params.currentSession}) to ${params.nextClass} (${params.nextSession})`,
    }));

    await supabase.from('student_lifecycle_history').insert(historyEntries);

    // Update active student class/grade in students master
    await supabase
      .from('students')
      .update({
        class_name: params.nextClass,
        academic_session: params.nextSession,
        updated_at: new Date().toISOString(),
      })
      .in('id', params.studentIds);

    revalidatePath('/admin/students');
    return {
      success: true,
      message: `Successfully promoted ${params.studentIds.length} students to ${params.nextClass} (${params.nextSession}).`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to promote students.',
    };
  }
}

/**
 * 2. Withdraw a Student with Full Historical Retention (No Deletion)
 */
export async function withdrawStudentAction(params: {
  studentId: string;
  universalId: string;
  institutionCode: string;
  reason: string;
  effectiveDate: string;
  actionBy: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Log in lifecycle history
    await supabase.from('student_lifecycle_history').insert({
      student_id: params.studentId,
      universal_id: params.universalId,
      institution_code: params.institutionCode,
      from_state: 'ACTIVE',
      to_state: 'WITHDRAWN',
      academic_session: '2026-2027',
      action_by: params.actionBy || 'Admin',
      remarks: params.reason || 'Parent requested withdrawal',
    });

    // 2. Set status in students master
    await supabase
      .from('students')
      .update({
        status: 'WITHDRAWN',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.studentId);

    revalidatePath('/admin/students');
    return {
      success: true,
      message: `Student marked as WITHDRAWN. Universal ID ${params.universalId} and all historical records preserved.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to withdraw student.',
    };
  }
}

/**
 * 3. Re-Admit Returning Student Under Original Universal ID (Zero Duplication)
 */
export async function readmitStudentAction(params: {
  studentId: string;
  universalId: string;
  institutionCode: string;
  targetSession: string;
  targetClass: string;
  targetSection: string;
  actionBy: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Log in lifecycle history
    await supabase.from('student_lifecycle_history').insert({
      student_id: params.studentId,
      universal_id: params.universalId,
      institution_code: params.institutionCode,
      from_state: 'WITHDRAWN',
      to_state: 'READMITTED',
      academic_session: params.targetSession,
      class_name: params.targetClass,
      section_name: params.targetSection,
      action_by: params.actionBy || 'Admin',
      remarks: `Re-admitted to ${params.targetClass} - ${params.targetSection} (${params.targetSession}) under original Universal ID ${params.universalId}`,
    });

    // 2. Reactivate in master
    await supabase
      .from('students')
      .update({
        status: 'ACTIVE',
        class_name: params.targetClass,
        section_name: params.targetSection,
        academic_session: params.targetSession,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.studentId);

    revalidatePath('/admin/students');
    return {
      success: true,
      message: `Student successfully re-admitted under permanent Universal ID ${params.universalId}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to re-admit student.',
    };
  }
}

/**
 * 4. Transfer Student to Another Sister Institution within Vaani Trust
 */
export async function transferInstitutionAction(params: {
  studentId: string;
  universalId: string;
  fromInstitution: string;
  toInstitution: string;
  targetClass: string;
  actionBy: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Log in lifecycle history
    await supabase.from('student_lifecycle_history').insert({
      student_id: params.studentId,
      universal_id: params.universalId,
      institution_code: params.toInstitution,
      from_state: `ACTIVE_${params.fromInstitution}`,
      to_state: `TRANSFERRED_${params.toInstitution}`,
      academic_session: '2026-2027',
      class_name: params.targetClass,
      action_by: params.actionBy || 'Admin',
      remarks: `Inter-institutional transfer from ${params.fromInstitution} to ${params.toInstitution}`,
    });

    // 2. Update institution_code in students master
    await supabase
      .from('students')
      .update({
        institution_code: params.toInstitution,
        class_name: params.targetClass,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.studentId);

    revalidatePath('/admin/students');
    return {
      success: true,
      message: `Student successfully transferred from ${params.fromInstitution} to ${params.toInstitution}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to transfer student.',
    };
  }
}
