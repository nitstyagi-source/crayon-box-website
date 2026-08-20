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

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

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
      .select('*, student_academic_history(*), student_parents(*)')
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
      { data: ledgers },
      { data: siblingsData }
    ] = await Promise.all([
      supabase.from('student_academic_history').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_parents').select('*').eq('student_id', studentId),
      supabase.from('student_addresses').select('*').eq('student_id', studentId),
      supabase.from('student_medical').select('*').eq('student_id', studentId).maybeSingle(),
      supabase.from('student_documents').select('*').eq('student_id', studentId).order('uploaded_at', { ascending: false }),
      supabase.from('student_lifecycle').select('*').eq('student_id', studentId).order('action_date', { ascending: false }),
      supabase.from('student_invoices').select('*, student_invoice_items(*)').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_fee_ledgers').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_siblings').select(`
        id,
        relationship,
        sibling_student_id,
        sibling:students!student_siblings_sibling_student_id_fkey(
          id, admission_no, first_name, last_name, photo_url, status,
          student_academic_history(class_name, section_name, is_current_session)
        )
      `).eq('student_id', studentId)
    ]);

    // Auto-detect potential siblings matching parent phone numbers
    const parentMobiles = (parents || []).map((p: any) => p.mobile).filter((m: any) => m && String(m).trim().length >= 8);
    const existingSiblingIds = new Set((siblingsData || []).map((s: any) => s.sibling_student_id));
    let suggestedSiblings: any[] = [];

    if (parentMobiles.length > 0) {
      const { data: matchParents } = await supabase
        .from('student_parents')
        .select(`
          student_id,
          student:students(
            id, admission_no, first_name, last_name, photo_url, status,
            student_academic_history(class_name, section_name, is_current_session)
          )
        `)
        .in('mobile', parentMobiles)
        .neq('student_id', studentId);

      if (matchParents && matchParents.length > 0) {
        const uniqueMap = new Map();
        matchParents.forEach((mp: any) => {
          if (mp.student && !existingSiblingIds.has(mp.student.id) && !uniqueMap.has(mp.student.id)) {
            uniqueMap.set(mp.student.id, mp.student);
          }
        });
        suggestedSiblings = Array.from(uniqueMap.values());
      }
    }

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
        ledgers: ledgers || [],
        siblings: siblingsData || [],
        suggestedSiblings: suggestedSiblings || []
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Creates a student with separate records for Father, Mother, and Local Guardian.
 */
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
      .limit(1)
      .maybeSingle();
      
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
    const dob = payload.dob && String(payload.dob).trim() !== "" ? String(payload.dob).trim() : null;
    const aadhaar = payload.aadhaar_no && String(payload.aadhaar_no).trim() !== "" ? String(payload.aadhaar_no).trim() : null;
    const bloodGroup = payload.blood_group && String(payload.blood_group).trim() !== "" ? String(payload.blood_group).trim() : null;
    const penNo = payload.pen_no && String(payload.pen_no).trim() !== "" ? String(payload.pen_no).trim() : null;
    const photoUrl = payload.photo_url && String(payload.photo_url).trim() !== "" ? String(payload.photo_url).trim() : null;
    const transportMode = payload.transport_mode || 'Self';
    const transportRoute = payload.transport_route || null;
    const transportPickup = payload.transport_pickup_point || null;

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        campus_id: campusId,
        admission_no: payload.admission_no.trim(),
        first_name: payload.first_name.trim(),
        middle_name: payload.middle_name?.trim() || null,
        last_name: payload.last_name.trim(),
        dob: dob,
        gender: payload.gender || 'Male',
        category: payload.category || 'General',
        blood_group: bloodGroup,
        nationality: payload.nationality || 'Indian',
        aadhaar_no: aadhaar,
        pen_no: penNo,
        photo_url: photoUrl,
        transport_mode: transportMode,
        transport_route: transportRoute,
        transport_pickup_point: transportPickup,
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
        class_name: payload.class_name || 'Grade 1',
        section_name: payload.section_name || 'A',
        roll_no: payload.roll_no || null,
        is_current_session: true
      }]);
    }

    // 4. Insert Parents (Father, Mother, Guardian)
    const parentsToInsert = [];

    // Father
    if (payload.father_name || payload.parent_name) {
      parentsToInsert.push({
        student_id: student.id,
        parent_type: 'Father',
        name: payload.father_name || payload.parent_name,
        mobile: payload.father_mobile || payload.parent_mobile || '',
        email: payload.father_email || payload.parent_email || null,
        occupation: payload.father_occupation || payload.parent_occupation || null,
        annual_income: payload.father_income || null,
        education: payload.father_qualification || null,
        aadhaar_no: payload.father_aadhaar || null,
        photo_url: payload.father_photo_url || null,
        is_primary_contact: payload.primary_contact === 'Father' || !payload.primary_contact
      });
    }

    // Mother
    if (payload.mother_name) {
      parentsToInsert.push({
        student_id: student.id,
        parent_type: 'Mother',
        name: payload.mother_name,
        mobile: payload.mother_mobile || '',
        email: payload.mother_email || null,
        occupation: payload.mother_occupation || null,
        annual_income: payload.mother_income || null,
        education: payload.mother_qualification || null,
        aadhaar_no: payload.mother_aadhaar || null,
        photo_url: payload.mother_photo_url || null,
        is_primary_contact: payload.primary_contact === 'Mother'
      });
    }

    // Guardian
    if (payload.guardian_name) {
      parentsToInsert.push({
        student_id: student.id,
        parent_type: 'Guardian',
        name: payload.guardian_name,
        mobile: payload.guardian_mobile || '',
        email: payload.guardian_email || null,
        occupation: payload.guardian_occupation || null,
        annual_income: null,
        education: null,
        aadhaar_no: null,
        photo_url: payload.guardian_photo_url || null,
        is_primary_contact: payload.primary_contact === 'Guardian'
      });
    }

    if (parentsToInsert.length > 0) {
      const { error: pErr } = await supabase.from('student_parents').insert(parentsToInsert);
      if (pErr) console.error("Error inserting parents:", pErr);
    }

    // 5. Link Sibling if provided
    if (payload.sibling_id && String(payload.sibling_id).trim() !== "") {
      try {
        await linkStudentSibling(student.id, payload.sibling_id, payload.sibling_relationship || 'Sibling');
      } catch (e) {
        console.error("Error linking sibling during creation:", e);
      }
    }

    // Log Lifecycle Event
    await supabase.from('student_lifecycle').insert([{
      student_id: student.id,
      action_type: 'Admission',
      action_date: new Date().toISOString().split('T')[0],
      remarks: `Admitted into ${payload.class_name || 'Grade 1'} - Section ${payload.section_name || 'A'}`
    }]);

    revalidatePath('/admin/students');
    revalidatePath('/admin/dashboard');
    return { success: true, data: student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Permanently deletes a student and cascades all records completely.
 */
export async function deleteStudentPermanently(studentId: string) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Delete invoice items
    const { data: invoices } = await supabase
      .from('student_invoices')
      .select('id')
      .eq('student_id', studentId);

    if (invoices && invoices.length > 0) {
      const invIds = invoices.map(i => i.id);
      await supabase.from('student_invoice_items').delete().in('invoice_id', invIds);
    }

    // 2. Delete invoices, ledgers, and student sub-tables
    await Promise.all([
      supabase.from('student_invoices').delete().eq('student_id', studentId),
      supabase.from('student_fee_ledgers').delete().eq('student_id', studentId),
      supabase.from('student_academic_history').delete().eq('student_id', studentId),
      supabase.from('student_parents').delete().eq('student_id', studentId),
      supabase.from('student_addresses').delete().eq('student_id', studentId),
      supabase.from('student_medical').delete().eq('student_id', studentId),
      supabase.from('student_documents').delete().eq('student_id', studentId),
      supabase.from('student_lifecycle').delete().eq('student_id', studentId)
    ]);

    // 3. Delete student root row
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) throw error;

    revalidatePath('/admin/students');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/finance');
    return { success: true, message: "Student record permanently deleted." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Transfers a student directly to another Class / Section.
 */
export async function transferStudentClass(studentId: string, payload: {
  target_class: string;
  target_section: string;
  target_roll_no?: string;
  reason?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch current class
    const { data: currentAc } = await supabase
      .from('student_academic_history')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_current_session', true)
      .maybeSingle();

    const previousInfo = currentAc ? `${currentAc.class_name} ${currentAc.section_name || ''}` : 'Unassigned';

    // 2. Update active session
    if (currentAc) {
      await supabase
        .from('student_academic_history')
        .update({
          class_name: payload.target_class.trim(),
          section_name: payload.target_section.trim().toUpperCase() || 'A',
          roll_no: payload.target_roll_no || null
        })
        .eq('id', currentAc.id);
    } else {
      // Find academic year
      const { data: student } = await supabase.from('students').select('campus_id').eq('id', studentId).single();
      const campusId = student?.campus_id || (await resolveCampusId(supabase, ''));
      const { data: year } = await supabase.from('academic_years').select('id').eq('campus_id', campusId).limit(1).single();

      await supabase.from('student_academic_history').insert([{
        student_id: studentId,
        academic_year_id: year?.id || null,
        class_name: payload.target_class.trim(),
        section_name: payload.target_section.trim().toUpperCase() || 'A',
        roll_no: payload.target_roll_no || null,
        is_current_session: true
      }]);
    }

    // 3. Record lifecycle transfer event
    await supabase.from('student_lifecycle').insert([{
      student_id: studentId,
      action_type: 'Transfer',
      action_date: new Date().toISOString().split('T')[0],
      remarks: payload.reason || `Transferred from ${previousInfo} to ${payload.target_class} Section ${payload.target_section}`
    }]);

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/admin/students');
    revalidatePath('/admin/classes');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Promotes a student to the next class / academic session.
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

    const { data: student } = await supabase
      .from('students')
      .select('campus_id')
      .eq('id', studentId)
      .single();

    const campusId = student?.campus_id || (await resolveCampusId(supabase, ''));

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

    // 1. Mark existing current sessions as past
    await supabase
      .from('student_academic_history')
      .update({ is_current_session: false })
      .eq('student_id', studentId);

    // 2. Insert new promoted class record
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

    // 3. Ensure student status is Active
    await supabase
      .from('students')
      .update({ status: 'Active', updated_at: new Date().toISOString() })
      .eq('id', studentId);

    // 4. Record Lifecycle Event
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
 * Updates full student profile including demographics, class, and separate Father/Mother/Guardian records.
 */
export async function updateStudentProfile(studentId: string, payload: any) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Update students table
    const penNo = payload.pen_no !== undefined ? (payload.pen_no && String(payload.pen_no).trim() !== "" ? String(payload.pen_no).trim() : null) : undefined;
    const photoUrl = payload.photo_url !== undefined ? (payload.photo_url && String(payload.photo_url).trim() !== "" ? String(payload.photo_url).trim() : null) : undefined;
    const transportMode = payload.transport_mode !== undefined ? payload.transport_mode : undefined;
    const transportRoute = payload.transport_route !== undefined ? payload.transport_route : undefined;
    const transportPickup = payload.transport_pickup_point !== undefined ? payload.transport_pickup_point : undefined;
    
    const updateData: any = {
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
    };

    if (penNo !== undefined) updateData.pen_no = penNo;
    if (photoUrl !== undefined) updateData.photo_url = photoUrl;
    if (transportMode !== undefined) updateData.transport_mode = transportMode;
    if (transportRoute !== undefined) updateData.transport_route = transportRoute;
    if (transportPickup !== undefined) updateData.transport_pickup_point = transportPickup;

    const { error: studentErr } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId);

    if (studentErr) throw studentErr;

    // 2. Update current academic record
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
      }
    }

    // Synchronize primary contact flag if provided
    if (payload.primary_contact) {
      await supabase
        .from('student_parents')
        .update({ is_primary_contact: false })
        .eq('student_id', studentId);
    }

    // 3. Upsert Father Record
    if (payload.father_name) {
      const { data: existingFather } = await supabase
        .from('student_parents')
        .select('id')
        .eq('student_id', studentId)
        .eq('parent_type', 'Father')
        .maybeSingle();

      const fatherData: any = {
        name: payload.father_name,
        mobile: payload.father_mobile || '',
        email: payload.father_email || null,
        occupation: payload.father_occupation || null,
        annual_income: payload.father_income || null,
        education: payload.father_qualification || null,
        aadhaar_no: payload.father_aadhaar || null,
        is_primary_contact: payload.primary_contact === 'Father'
      };

      if (payload.father_photo_url !== undefined) {
        fatherData.photo_url = payload.father_photo_url || null;
      }

      if (existingFather) {
        await supabase.from('student_parents').update(fatherData).eq('id', existingFather.id);
      } else {
        await supabase.from('student_parents').insert([{ student_id: studentId, parent_type: 'Father', ...fatherData }]);
      }
    }

    // 4. Upsert Mother Record
    if (payload.mother_name) {
      const { data: existingMother } = await supabase
        .from('student_parents')
        .select('id')
        .eq('student_id', studentId)
        .eq('parent_type', 'Mother')
        .maybeSingle();

      const motherData: any = {
        name: payload.mother_name,
        mobile: payload.mother_mobile || '',
        email: payload.mother_email || null,
        occupation: payload.mother_occupation || null,
        annual_income: payload.mother_income || null,
        education: payload.mother_qualification || null,
        aadhaar_no: payload.mother_aadhaar || null,
        is_primary_contact: payload.primary_contact === 'Mother'
      };

      if (payload.mother_photo_url !== undefined) {
        motherData.photo_url = payload.mother_photo_url || null;
      }

      if (existingMother) {
        await supabase.from('student_parents').update(motherData).eq('id', existingMother.id);
      } else {
        await supabase.from('student_parents').insert([{ student_id: studentId, parent_type: 'Mother', ...motherData }]);
      }
    }

    // 5. Upsert Guardian Record
    if (payload.guardian_name) {
      const { data: existingGuardian } = await supabase
        .from('student_parents')
        .select('id')
        .eq('student_id', studentId)
        .eq('parent_type', 'Guardian')
        .maybeSingle();

      const guardianData: any = {
        name: payload.guardian_name,
        mobile: payload.guardian_mobile || '',
        email: payload.guardian_email || null,
        occupation: payload.guardian_occupation || null,
        is_primary_contact: payload.primary_contact === 'Guardian'
      };

      if (payload.guardian_photo_url !== undefined) {
        guardianData.photo_url = payload.guardian_photo_url || null;
      }

      if (existingGuardian) {
        await supabase.from('student_parents').update(guardianData).eq('id', existingGuardian.id);
      } else {
        await supabase.from('student_parents').insert([{ student_id: studentId, parent_type: 'Guardian', ...guardianData }]);
      }
    }

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Links two students as siblings bidirectionally.
 */
export async function linkStudentSibling(studentId: string, siblingStudentId: string, relationship = 'Sibling') {
  try {
    const supabase = getSupabaseAdmin();
    if (studentId === siblingStudentId) {
      return { success: false, error: "Cannot link a student as their own sibling." };
    }

    await Promise.all([
      supabase.from('student_siblings').upsert({
        student_id: studentId,
        sibling_student_id: siblingStudentId,
        relationship
      }, { onConflict: 'student_id, sibling_student_id' }),
      supabase.from('student_siblings').upsert({
        student_id: siblingStudentId,
        sibling_student_id: studentId,
        relationship
      }, { onConflict: 'student_id, sibling_student_id' })
    ]);

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath(`/admin/students/${siblingStudentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Unlinks sibling relationship bidirectionally.
 */
export async function unlinkStudentSibling(studentId: string, siblingStudentId: string) {
  try {
    const supabase = getSupabaseAdmin();
    await Promise.all([
      supabase.from('student_siblings').delete().eq('student_id', studentId).eq('sibling_student_id', siblingStudentId),
      supabase.from('student_siblings').delete().eq('student_id', siblingStudentId).eq('sibling_student_id', studentId)
    ]);

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath(`/admin/students/${siblingStudentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Search students to link as sibling.
 */
export async function searchPotentialSiblings(query: string, excludeStudentId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    let q = supabase
      .from('students')
      .select(`
        id, admission_no, first_name, last_name, photo_url, status,
        student_academic_history(class_name, section_name, is_current_session)
      `)
      .order('first_name', { ascending: true })
      .limit(15);

    if (excludeStudentId) {
      q = q.neq('id', excludeStudentId);
    }
    if (query && query.trim()) {
      const term = query.trim();
      q = q.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,admission_no.ilike.%${term}%`);
    }

    const { data, error } = await q;
    if (error) throw error;
    return { success: true, data: data || [] };
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

export async function saveStudentAddress(studentId: string, payload: {
  address_type?: string;
  street: string;
  city: string;
  state: string;
  pin_code: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_addresses')
      .insert([{
        student_id: studentId,
        address_type: payload.address_type || 'Residential',
        street: payload.street.trim(),
        city: payload.city.trim(),
        state: payload.state.trim(),
        pin_code: payload.pin_code.trim(),
        country: 'India'
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

export async function deleteStudentAddress(addressId: string, studentId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('student_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;

    revalidatePath(`/admin/students/${studentId}`);
    return { success: true };
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

export async function getDashboardMetrics(campusId: string) {
  try {
    if (!campusId) return { success: true, data: null };
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data: students } = await supabase
      .from('students')
      .select('id, first_name, last_name, admission_no, category, status, gender, created_at, student_academic_history(class_name, is_current_session)')
      .eq('campus_id', resolvedCampusId);

    const allStudents = students || [];
    const activeStudents = allStudents.filter(s => s.status === 'Active' || s.status === 'Promoted');
    const formerStudents = allStudents.filter(s => ['Withdrawn', 'TC Issued', 'Suspended', 'Alumni'].includes(s.status));
    const ewsStudents = activeStudents.filter(s => s.category === 'EWS');

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

    const { count: admissionsCount } = await supabase
      .from('admissions_applications')
      .select('*', { count: 'exact', head: true });

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

/**
 * Uploads a file (photo or document) to Supabase Storage and returns its public URL.
 */
export async function uploadFileToStorage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';
    if (!file) throw new Error("No file selected.");

    const supabase = getSupabaseAdmin();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'bin';
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${Date.now()}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(path);

    return { 
      success: true, 
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: file.size
    };
  } catch (error: any) {
    console.error("Storage upload error:", error);
    return { success: false, error: error.message };
  }
}
