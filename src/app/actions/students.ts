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
      .order('created_at', { ascending: false });

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
      { data: lifecycle },
      { data: invoices },
      { data: ledgers }
    ] = await Promise.all([
      supabase.from('student_academic_history').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_parents').select('*').eq('student_id', studentId),
      supabase.from('student_addresses').select('*').eq('student_id', studentId),
      supabase.from('student_medical').select('*').eq('student_id', studentId).maybeSingle(),
      supabase.from('student_documents').select('*').eq('student_id', studentId).order('uploaded_at', { ascending: false }),
      supabase.from('student_lifecycle').select('*').eq('student_id', studentId).order('action_date', { ascending: false }),
      supabase.from('student_invoices').select('*, student_invoice_items(*)').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_fee_ledgers').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
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
        lifecycle: lifecycle || [],
        invoices: invoices || [],
        ledgers: ledgers || []
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createStudent(payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    const campusId = await resolveCampusId(supabase, payload.campus_id);

    // 1. Get active academic year
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
        blood_group: payload.blood_group || null,
        nationality: payload.nationality || 'Indian',
        aadhaar_no: payload.aadhaar_no || null,
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
        roll_no: payload.roll_no || null,
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
        email: payload.parent_email || null,
        occupation: payload.parent_occupation || null,
        is_primary_contact: true
      }]);
    }

    revalidatePath('/admin/students');
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Promotes a student to the next class / academic session.
 * Archives the previous class record and creates a new active academic history entry.
 */
export async function promoteStudent(studentId: string, payload: {
  next_class: string;
  next_section?: string;
  next_roll_no?: string;
  academic_session?: string;
  remarks?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch student to get campus_id
    const { data: student } = await supabase
      .from('students')
      .select('campus_id')
      .eq('id', studentId)
      .single();

    const campusId = student?.campus_id || (await resolveCampusId(supabase, ''));

    // 2. Fetch or create active academic year
    let { data: academicYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('campus_id', campusId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    let yearId = academicYear?.id;
    if (!yearId) {
      const { data: newYear } = await supabase
        .from('academic_years')
        .insert([{ campus_id: campusId, name: payload.academic_session || '2026-2027', start_date: '2026-04-01', end_date: '2027-03-31', is_active: true }])
        .select()
        .single();
      yearId = newYear?.id;
    }

    // 3. Mark existing current sessions as past
    await supabase
      .from('student_academic_history')
      .update({ is_current_session: false })
      .eq('student_id', studentId);

    // 4. Insert new promoted class record
    const { error: insertErr } = await supabase
      .from('student_academic_history')
      .insert([{
        student_id: studentId,
        academic_year_id: yearId,
        class_name: payload.next_class,
        section_name: payload.next_section || 'A',
        roll_no: payload.next_roll_no || null,
        is_current_session: true
      }]);

    if (insertErr) throw insertErr;

    // 5. Ensure student status is Active
    await supabase
      .from('students')
      .update({ status: 'Active', updated_at: new Date().toISOString() })
      .eq('id', studentId);

    // 6. Record Lifecycle Event
    await supabase
      .from('student_lifecycle')
      .insert([{
        student_id: studentId,
        action_type: 'Promotion',
        action_date: new Date().toISOString().split('T')[0],
        remarks: payload.remarks || `Promoted to ${payload.next_class} (${payload.academic_session || '2026-2027'})`
      }]);

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/admin/students');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Updates full student profile (demographics, current class/roll no, and primary parent).
 */
export async function updateStudentProfile(studentId: string, payload: any) {
  try {
    const supabase = getSupabaseAdmin();

    const { error: studentErr } = await supabase
      .from('students')
      .update({
        first_name: payload.first_name,
        middle_name: payload.middle_name || null,
        last_name: payload.last_name,
        dob: payload.dob || null,
        gender: payload.gender,
        category: payload.category || 'General',
        blood_group: payload.blood_group || null,
        nationality: payload.nationality || 'Indian',
        aadhaar_no: payload.aadhaar_no || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (studentErr) throw studentErr;

    if (payload.class_name) {
      const { data: currentAc } = await supabase
        .from('student_academic_history')
        .select('id')
        .eq('student_id', studentId)
        .eq('is_current_session', true)
        .maybeSingle();

      if (currentAc) {
        await supabase
          .from('student_academic_history')
          .update({
            class_name: payload.class_name,
            section_name: payload.section_name || '',
            roll_no: payload.roll_no || null
          })
          .eq('id', currentAc.id);
      } else {
        await supabase
          .from('student_academic_history')
          .insert([{
            student_id: studentId,
            class_name: payload.class_name,
            section_name: payload.section_name || '',
            roll_no: payload.roll_no || null,
            is_current_session: true
          }]);
      }
    }

    if (payload.parent_name) {
      const { data: currentParent } = await supabase
        .from('student_parents')
        .select('id')
        .eq('student_id', studentId)
        .eq('is_primary_contact', true)
        .maybeSingle();

      if (currentParent) {
        await supabase
          .from('student_parents')
          .update({
            name: payload.parent_name,
            mobile: payload.parent_mobile || '',
            email: payload.parent_email || null,
            occupation: payload.parent_occupation || null,
            parent_type: payload.parent_type || 'Father'
          })
          .eq('id', currentParent.id);
      } else {
        await supabase
          .from('student_parents')
          .insert([{
            student_id: studentId,
            name: payload.parent_name,
            mobile: payload.parent_mobile || '',
            email: payload.parent_email || null,
            occupation: payload.parent_occupation || null,
            parent_type: payload.parent_type || 'Father',
            is_primary_contact: true
          }]);
      }
    }

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadStudentDocument(studentId: string, payload: {
  document_type: string;
  document_no?: string;
  file_url: string;
  verification_status?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('student_documents')
      .insert([{
        student_id: studentId,
        document_type: payload.document_type,
        document_no: payload.document_no || null,
        file_url: payload.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        verification_status: payload.verification_status || 'Verified',
        uploaded_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/admin/students/${studentId}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStudentDocument(documentId: string, studentId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;

    revalidatePath(`/admin/students/${studentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStudentLifecycleStatus(studentId: string, actionType: string, reason?: string) {
  try {
    const supabase = getSupabaseAdmin();

    let status = 'Active';
    if (actionType === 'Withdrawal') status = 'Withdrawn';
    else if (actionType === 'TC_Issued') status = 'TC Issued';
    else if (actionType === 'Promotion') status = 'Promoted';
    else if (actionType === 'Suspension') status = 'Suspended';

    await supabase
      .from('students')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', studentId);

    await supabase
      .from('student_lifecycle')
      .insert([{
        student_id: studentId,
        action_type: actionType,
        action_date: new Date().toISOString().split('T')[0],
        remarks: reason || `Status changed to ${status}`,
      }]);

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/admin/students');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveStudentMedicalRecord(studentId: string, payload: any) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from('student_medical')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('student_medical')
        .update({
          blood_group: payload.blood_group,
          allergies: payload.allergies,
          medical_conditions: payload.medical_conditions,
          emergency_instructions: payload.emergency_instructions,
          doctor_contact: payload.doctor_contact,
        })
        .eq('student_id', studentId);
    } else {
      await supabase
        .from('student_medical')
        .insert([{
          student_id: studentId,
          blood_group: payload.blood_group,
          allergies: payload.allergies,
          medical_conditions: payload.medical_conditions,
          emergency_instructions: payload.emergency_instructions,
          doctor_contact: payload.doctor_contact,
        }]);
    }

    revalidatePath(`/admin/students/${studentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Real-time metrics for the Global Admin Command Center Dashboard.
 */
export async function getDashboardMetrics(campusId: string) {
  try {
    if (!campusId) return { success: true, data: null };
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    // 1. Fetch Students
    const { data: students } = await supabase
      .from('students')
      .select('id, first_name, last_name, admission_no, category, status, gender, created_at, student_academic_history(class_name, is_current_session)')
      .eq('campus_id', resolvedCampusId);

    const allStudents = students || [];
    const activeStudents = allStudents.filter(s => s.status === 'Active' || s.status === 'Promoted');
    const formerStudents = allStudents.filter(s => ['Withdrawn', 'TC Issued', 'Suspended', 'Alumni'].includes(s.status));
    const ewsStudents = activeStudents.filter(s => s.category === 'EWS');

    // Class distribution
    const classMap: Record<string, number> = {};
    activeStudents.forEach(s => {
      const currentAc = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
      const className = currentAc?.class_name || 'Unassigned';
      classMap[className] = (classMap[className] || 0) + 1;
    });

    const classDistribution = Object.entries(classMap).map(([name, count]) => ({
      name,
      count,
      pct: activeStudents.length > 0 ? Math.round((count / activeStudents.length) * 100) : 0
    }));

    // 2. Fetch Admissions Applications
    const { count: admissionsCount } = await supabase
      .from('admissions_applications')
      .select('*', { count: 'exact', head: true });

    // 3. Fetch Invoices & Collections
    const { data: invoices } = await supabase
      .from('student_invoices')
      .select('total_amount, amount_paid, status')
      .eq('campus_id', resolvedCampusId);

    let totalCollections = 0;
    let totalPending = 0;
    (invoices || []).forEach(inv => {
      totalCollections += Number(inv.amount_paid || 0);
      if (inv.status !== 'Paid') {
        totalPending += (Number(inv.total_amount || 0) - Number(inv.amount_paid || 0));
      }
    });

    return {
      success: true,
      data: {
        totalEnrollments: activeStudents.length,
        formerStudentsCount: formerStudents.length,
        ewsCount: ewsStudents.length,
        admissionsCount: admissionsCount || 0,
        totalCollections,
        totalPending,
        classDistribution,
        recentStudents: allStudents.slice(0, 5).map(s => {
          const ac = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
          return {
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            admissionNo: s.admission_no,
            className: ac?.class_name || 'N/A',
            category: s.category,
            status: s.status,
            createdAt: s.created_at
          };
        })
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
