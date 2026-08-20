"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createStudent } from '@/app/actions/students';

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

// -------------------------------------------------------------
// 1. FETCH ALL ENQUIRIES WITH TIMELINE & METRICS
// -------------------------------------------------------------
export async function getEnquiries(campusId?: string, filters?: { status?: string; priority?: string; search?: string }) {
  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority && filters.priority !== 'All') {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;
    if (error) throw error;

    let list = data || [];
    if (filters?.search && filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      list = list.filter((e: any) => {
        const fullChild = `${e.first_name || ''} ${e.last_name || ''} ${e.child_name || ''}`.toLowerCase();
        const parent = `${e.father_name || ''} ${e.mother_name || ''} ${e.parent_name || ''}`.toLowerCase();
        const phone = `${e.father_mobile || ''} ${e.mother_mobile || ''} ${e.parent_phone || ''}`;
        const enqNo = (e.enquiry_no || '').toLowerCase();
        return fullChild.includes(term) || parent.includes(term) || phone.includes(term) || enqNo.includes(term);
      });
    }

    return { success: true, data: list };
  } catch (error: any) {
    console.error("Error fetching enquiries:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 2. FETCH SINGLE ENQUIRY WITH FULL AUDIT TIMELINE
// -------------------------------------------------------------
export async function getEnquiryDetails(id: string) {
  try {
    if (!id) throw new Error("Enquiry ID is required.");
    const supabase = getSupabaseAdmin();

    const [enqRes, logsRes] = await Promise.all([
      supabase.from('enquiries').select('*').eq('id', id).single(),
      supabase.from('enquiry_timeline_logs').select('*').eq('enquiry_id', id).order('created_at', { ascending: true })
    ]);

    if (enqRes.error) throw enqRes.error;

    return {
      success: true,
      data: {
        ...enqRes.data,
        timeline: logsRes.data || []
      }
    };
  } catch (error: any) {
    console.error("Error fetching enquiry details:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. CREATE ADMISSION ENQUIRY (2-3 MIN RAPID INTAKE)
// -------------------------------------------------------------
export async function createAdmissionEnquiry(data: any) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Resolve Campus ID
    let targetCampusId = data.campus_id;
    if (!targetCampusId || !isValidUUID(targetCampusId)) {
      const { data: c } = await supabase.from('campuses').select('id').limit(1).single();
      targetCampusId = c?.id;
    }

    // 2. Auto-generate Enquiry No
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const enquiryNo = data.enquiry_no || `ENQ-2026-${randomSuffix}`;

    // 3. Calculate Age from DOB
    let currentAge = data.current_age || "";
    if (data.dob && !currentAge) {
      const birth = new Date(data.dob);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      currentAge = `${years} Yrs ${months} Mos`;
    }

    const childFullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.child_name || 'Prospective Student';
    const parentFullName = data.father_name || data.mother_name || data.parent_name || 'Parent/Guardian';
    const contactPhone = data.father_mobile || data.mother_mobile || data.parent_phone || '';

    const payload = {
      enquiry_no: enquiryNo,
      academic_session: data.academic_session || '2026-27',
      campus_id: targetCampusId,
      admission_type: data.admission_type || 'New',
      priority: data.priority || 'Warm',
      first_name: data.first_name || '',
      middle_name: data.middle_name || null,
      last_name: data.last_name || '',
      child_name: childFullName,
      dob: data.dob || null,
      gender: data.gender || 'Male',
      current_age: currentAge,
      current_class: data.current_class || null,
      grade_interested: data.grade_interested || data.class_applying_for || 'Nursery',
      previous_school: data.previous_school || null,
      previous_board: data.previous_board || null,
      nationality: data.nationality || 'Indian',
      sibling_studying: Boolean(data.sibling_studying),
      sibling_name: data.sibling_name || null,
      sibling_admission_no: data.sibling_admission_no || null,
      father_name: data.father_name || null,
      father_mobile: data.father_mobile || null,
      father_whatsapp: data.father_whatsapp || data.father_mobile || null,
      father_email: data.father_email || null,
      father_occupation: data.father_occupation || null,
      father_company: data.father_company || null,
      father_designation: data.father_designation || null,
      mother_name: data.mother_name || null,
      mother_mobile: data.mother_mobile || null,
      mother_whatsapp: data.mother_whatsapp || data.mother_mobile || null,
      mother_email: data.mother_email || null,
      mother_occupation: data.mother_occupation || null,
      mother_company: data.mother_company || null,
      mother_designation: data.mother_designation || null,
      parent_name: parentFullName,
      parent_phone: contactPhone,
      parent_email: data.father_email || data.mother_email || null,
      primary_contact: data.primary_contact || 'Father',
      preferred_contact_mode: data.preferred_contact_mode || 'Call',
      address: data.address || null,
      locality: data.locality || null,
      city: data.city || 'Delhi',
      state: data.state || 'Delhi',
      pin_code: data.pin_code || null,
      landmark: data.landmark || null,
      distance_km: data.distance_km || null,
      transport_required: Boolean(data.transport_required),
      preferred_transport_route: data.preferred_transport_route || null,
      source: data.source || 'Walk-in',
      campaign_name: data.campaign_name || null,
      referral_name: data.referral_name || null,
      referral_mobile: data.referral_mobile || null,
      fee_budget_range: data.fee_budget_range || null,
      school_timing_pref: data.school_timing_pref || null,
      reason_for_choosing: data.reason_for_choosing || null,
      parent_expectations: data.parent_expectations || null,
      student_interests: data.student_interests || null,
      special_requirements: data.special_requirements || null,
      remarks: data.remarks || null,
      counsellor_name: data.counsellor_name || 'Priya Sharma (Senior Counsellor)',
      counselling_date: data.counselling_date || new Date().toISOString().split('T')[0],
      counselling_mode: data.counselling_mode || 'Walk-in',
      questions_concerns: data.questions_concerns || null,
      fee_structure_shared: Boolean(data.fee_structure_shared),
      brochure_shared: Boolean(data.brochure_shared),
      school_tour_offered: Boolean(data.school_tour_offered),
      process_explained: Boolean(data.process_explained),
      visit_scheduled: Boolean(data.visit_scheduled),
      visit_date: data.visit_date || null,
      visit_time: data.visit_time || null,
      visitors_count: Number(data.visitors_count) || 2,
      student_accompanied: Boolean(data.student_accompanied),
      campus_tour_completed: Boolean(data.campus_tour_completed),
      principal_interaction: Boolean(data.principal_interaction),
      interest_level: data.interest_level || 'High',
      parent_feedback: data.parent_feedback || null,
      status: data.status || 'New',
      next_follow_up_date: data.next_follow_up_date || null,
      next_follow_up_time: data.next_follow_up_time || '11:00 AM',
      follow_up_type: data.follow_up_type || 'Phone Call',
      follow_up_notes: data.follow_up_notes || null,
      parent_response: data.parent_response || null,
      next_action: data.next_action || null
    };

    const { data: newEnquiry, error } = await supabase
      .from('enquiries')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Write initial timeline logs
    await supabase.from('enquiry_timeline_logs').insert([
      {
        enquiry_id: newEnquiry.id,
        stage: 'Enquiry Created',
        title: `Enquiry Logged (${newEnquiry.source})`,
        description: `Enquiry ${enquiryNo} registered for ${childFullName} (${newEnquiry.grade_interested}). Priority: ${newEnquiry.priority}.`,
        performed_by: newEnquiry.counsellor_name || 'Receptionist'
      }
    ]);

    if (newEnquiry.visit_scheduled && newEnquiry.visit_date) {
      await supabase.from('enquiry_timeline_logs').insert([
        {
          enquiry_id: newEnquiry.id,
          stage: 'School Visit',
          title: `Campus Tour Scheduled`,
          description: `Visit scheduled for ${newEnquiry.visit_date} at ${newEnquiry.visit_time || '10:30 AM'}.`,
          performed_by: newEnquiry.counsellor_name || 'Counsellor'
        }
      ]);
    }

    if (newEnquiry.next_follow_up_date) {
      await supabase.from('enquiry_timeline_logs').insert([
        {
          enquiry_id: newEnquiry.id,
          stage: 'Follow-up Scheduled',
          title: `Next Follow-up: ${newEnquiry.follow_up_type}`,
          description: `Due on ${newEnquiry.next_follow_up_date} at ${newEnquiry.next_follow_up_time}. Note: ${newEnquiry.follow_up_notes || 'Routine follow-up call.'}`,
          performed_by: newEnquiry.counsellor_name || 'Counsellor'
        }
      ]);
    }

    revalidatePath('/admin/enquiries');
    return { success: true, data: newEnquiry, enquiryNo };
  } catch (error: any) {
    console.error("Error creating admission enquiry:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. UPDATE ENQUIRY & LOG INTERACTION
// -------------------------------------------------------------
export async function updateAdmissionEnquiry(id: string, payload: any) {
  try {
    if (!id) throw new Error("Enquiry ID is required.");
    const supabase = getSupabaseAdmin();

    const { data: updated, error } = await supabase
      .from('enquiries')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log status or note changes
    if (payload.status) {
      await supabase.from('enquiry_timeline_logs').insert([{
        enquiry_id: id,
        stage: payload.status,
        title: `Status Changed to ${payload.status}`,
        description: payload.lost_reason ? `Marked Lost: ${payload.lost_reason}. Notes: ${payload.lost_notes || ''}` : (payload.follow_up_notes || `Pipeline stage updated to ${payload.status}.`),
        performed_by: updated.counsellor_name || 'Admissions Team'
      }]);
    }

    revalidatePath('/admin/enquiries');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating enquiry:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. ADD TIMELINE LOG ENTRY
// -------------------------------------------------------------
export async function addEnquiryTimelineLog(enquiryId: string, payload: { stage: string; title: string; description: string; performedBy?: string }) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('enquiry_timeline_logs')
      .insert([{
        enquiry_id: enquiryId,
        stage: payload.stage,
        title: payload.title,
        description: payload.description,
        performed_by: payload.performedBy || 'Admissions Counsellor'
      }])
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/enquiries');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. 1-CLICK CONVERSION: ENQUIRY → STUDENT MASTER
// -------------------------------------------------------------
export async function convertEnquiryToStudent(enquiryId: string, customOptions?: { class_name?: string; section_name?: string; admission_no?: string }) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: enq, error } = await supabase.from('enquiries').select('*').eq('id', enquiryId).single();
    if (error || !enq) throw new Error("Enquiry not found.");

    const childNames = (enq.child_name || `${enq.first_name || 'Student'} ${enq.last_name || ''}`).trim().split(' ');
    const firstName = enq.first_name || childNames[0] || "Student";
    const lastName = enq.last_name || childNames.slice(1).join(' ') || "";
    const admNo = customOptions?.admission_no || `CBS-${Math.floor(1000 + Math.random() * 9000)}`;
    const className = customOptions?.class_name || enq.grade_interested || "Grade 1";
    const sectionName = customOptions?.section_name || "A";

    // 1. Create Student Master Entry
    const stuRes = await createStudent({
      campus_id: enq.campus_id,
      admission_no: admNo,
      first_name: firstName,
      middle_name: enq.middle_name || null,
      last_name: lastName,
      dob: enq.dob || "2020-01-01",
      gender: enq.gender || "Male",
      nationality: enq.nationality || "Indian",
      category: "General",
      blood_group: "O+",
      class_name: className,
      section_name: sectionName,
      father_name: enq.father_name || enq.parent_name || "Father",
      father_mobile: enq.father_mobile || enq.parent_phone || "",
      father_email: enq.father_email || "",
      father_occupation: enq.father_occupation || "",
      mother_name: enq.mother_name || "",
      mother_mobile: enq.mother_mobile || "",
      primary_contact: enq.primary_contact || "Father",
      address_line1: enq.address || enq.locality || "Delhi",
      city: enq.city || "Delhi",
      pin_code: enq.pin_code || "110084",
      transport_route: enq.preferred_transport_route || (enq.transport_required ? "Route #04" : "")
    });

    if (!stuRes.success) throw new Error(stuRes.error);

    const newStudentId = stuRes.data.id;

    // 2. Mark Enquiry as Admitted with converted student reference
    await supabase.from('enquiries').update({
      status: 'Admitted',
      admission_decision: 'Approved',
      converted_student_id: newStudentId
    }).eq('id', enquiryId);

    // 3. Log Timeline entry
    await supabase.from('enquiry_timeline_logs').insert([{
      enquiry_id: enquiryId,
      stage: 'Admission Confirmed',
      title: `Converted to Enrolled Student (Adm: ${admNo})`,
      description: `Student Master profile created automatically. Enrolled in ${className}-${sectionName}.`,
      performed_by: 'Admissions Desk'
    }]);

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/students');
    return {
      success: true,
      message: `Enquiry converted successfully! Student Admission No: ${admNo}`,
      studentId: newStudentId,
      admissionNo: admNo
    };
  } catch (error: any) {
    console.error("Error converting enquiry to student:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 7. PUBLIC WEBSITE CONTACT FORM HANDLER
// -------------------------------------------------------------
export async function submitPublicEnquiry(formData: FormData) {
  try {
    const parentName = formData.get("parentName")?.toString();
    const phone = formData.get("phone")?.toString();
    const childName = formData.get("childName")?.toString();
    const grade = formData.get("grade")?.toString();

    if (!parentName || !phone || !childName || !grade) {
      return { success: false, error: "Please fill out all required fields." };
    }

    return await createAdmissionEnquiry({
      parent_name: parentName,
      father_name: parentName,
      father_mobile: phone,
      child_name: childName,
      first_name: childName.split(' ')[0],
      last_name: childName.split(' ').slice(1).join(' '),
      grade_interested: grade,
      source: 'Website',
      priority: 'Hot',
      status: 'New'
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
