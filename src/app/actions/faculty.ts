"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase keys for faculty actions:", { url: !!supabaseUrl, key: !!supabaseServiceKey });
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function resolveCampusId(supabase: any, campusId?: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) return campusId;
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campus found in database.");
  return data.id;
}

export interface FacultyFilterOptions {
  search?: string;
  department?: string;
  wing?: string;
  status?: string;
  role?: string;
}

/**
 * Fetch faculty and staff members for a specific campus with optional filtering
 */
export async function getFacultyList(campusId?: string, filters?: FacultyFilterOptions) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('staff')
      .select('*')
      .eq('campus_id', resolvedCampusId);

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }

    if (filters?.department && filters.department !== 'All') {
      query = query.eq('department', filters.department);
    }

    if (filters?.wing && filters.wing !== 'All') {
      query = query.eq('wing', filters.wing);
    }

    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`first_name.ilike.${term},last_name.ilike.${term},employee_id.ilike.${term},subjects_taught.ilike.${term},designation.ilike.${term}`);
    }

    query = query.order('order_index', { ascending: true }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching faculty list:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Fetch a single faculty member by ID
 */
export async function getFacultyMember(id: string) {
  try {
    if (!id) throw new Error("Faculty ID required.");
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching faculty member:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new faculty/staff member
 */
export async function createFacultyMember(data: any) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, data.campus_id);

    // Auto-generate employee ID if not provided
    let empId = data.employee_id?.trim();
    if (!empId) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      empId = `CB-FAC-${randomNum}`;
    }

    const payload = {
      campus_id: resolvedCampusId,
      employee_id: empId,
      first_name: data.first_name?.trim() || "Staff",
      middle_name: data.middle_name?.trim() || null,
      last_name: data.last_name?.trim() || "Member",
      gender: data.gender || "Female",
      dob: data.dob || null,
      blood_group: data.blood_group || null,
      email: data.email?.trim() || null,
      phone_number: data.phone_number?.trim() || null,
      emergency_contact: data.emergency_contact?.trim() || null,
      photo_url: data.photo_url || null,
      designation: data.designation || data.role || "Teacher",
      role: data.role || "Teacher",
      department: data.department || "General Academics",
      wing: data.wing || "Primary (1-5)",
      qualification: data.qualification || null,
      experience_years: data.experience_years || null,
      joining_date: data.joining_date || new Date().toISOString().split('T')[0],
      employment_type: data.employment_type || "Full-Time",
      status: data.status || "Active",
      subjects_taught: data.subjects_taught || null,
      is_class_teacher: Boolean(data.is_class_teacher),
      class_teacher_for: data.is_class_teacher ? data.class_teacher_for : null,
      bio: data.bio || null,
      is_leadership: Boolean(data.is_leadership),
      order_index: Number(data.order_index) || 0,
      aadhaar_no: data.aadhaar_no || null,
      pan_no: data.pan_no || null,
      resume_url: data.resume_url || null,
      police_verification_status: data.police_verification_status || "Verified",
      is_active: data.status === 'Active'
    };

    const { data: newMember, error } = await supabase
      .from('staff')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/faculty');
    revalidatePath('/faculty');

    return { success: true, data: newMember };
  } catch (error: any) {
    console.error("Error creating faculty member:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing faculty/staff member
 */
export async function updateFacultyMember(id: string, data: any) {
  try {
    if (!id) throw new Error("Faculty ID is required.");
    const supabase = getSupabaseAdmin();

    const payload: any = {
      first_name: data.first_name?.trim(),
      middle_name: data.middle_name?.trim() || null,
      last_name: data.last_name?.trim(),
      gender: data.gender,
      dob: data.dob || null,
      blood_group: data.blood_group || null,
      email: data.email?.trim() || null,
      phone_number: data.phone_number?.trim() || null,
      emergency_contact: data.emergency_contact?.trim() || null,
      photo_url: data.photo_url || null,
      designation: data.designation,
      role: data.role || data.designation,
      department: data.department,
      wing: data.wing,
      qualification: data.qualification,
      experience_years: data.experience_years,
      joining_date: data.joining_date || null,
      employment_type: data.employment_type,
      status: data.status,
      subjects_taught: data.subjects_taught,
      is_class_teacher: Boolean(data.is_class_teacher),
      class_teacher_for: data.is_class_teacher ? data.class_teacher_for : null,
      bio: data.bio || null,
      is_leadership: Boolean(data.is_leadership),
      order_index: Number(data.order_index) || 0,
      aadhaar_no: data.aadhaar_no || null,
      pan_no: data.pan_no || null,
      resume_url: data.resume_url || null,
      police_verification_status: data.police_verification_status,
      is_active: data.status === 'Active'
    };

    if (data.employee_id) {
      payload.employee_id = data.employee_id.trim();
    }

    const { data: updatedMember, error } = await supabase
      .from('staff')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/faculty');
    revalidatePath('/faculty');

    return { success: true, data: updatedMember };
  } catch (error: any) {
    console.error("Error updating faculty member:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a faculty member permanently
 */
export async function deleteFacultyMember(id: string) {
  try {
    if (!id) throw new Error("Faculty ID is required.");
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/faculty');
    revalidatePath('/faculty');

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting faculty member:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Public faculty list for website /faculty page
 */
export async function getPublicFacultyMembers() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('status', 'Active')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching public faculty members:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Aggregated statistics for the Faculty dashboard
 */
export async function getFacultyStats(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data: allStaff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('campus_id', resolvedCampusId);

    if (error) throw error;

    const staffList = allStaff || [];
    const activeStaff = staffList.filter(s => s.status === 'Active');
    const leadershipCount = staffList.filter(s => s.is_leadership).length;
    const classTeachersCount = staffList.filter(s => s.is_class_teacher && s.status === 'Active').length;

    // Distinct departments count
    const departmentsSet = new Set(staffList.map(s => s.department).filter(Boolean));

    // Calculate student count for ratio
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('campus_id', resolvedCampusId)
      .eq('status', 'Active');

    const totalStudents = studentCount || 0;
    const teacherCount = activeStaff.length || 1;
    const studentTeacherRatio = Math.round(totalStudents / teacherCount) || 1;

    return {
      success: true,
      data: {
        totalStaff: staffList.length,
        activeStaffCount: activeStaff.length,
        onLeaveCount: staffList.filter(s => s.status === 'On Leave').length,
        leadershipCount,
        classTeachersCount,
        totalDepartments: departmentsSet.size,
        studentTeacherRatio: `1:${studentTeacherRatio}`
      }
    };
  } catch (error: any) {
    console.error("Error fetching faculty stats:", error);
    return { success: false, error: error.message };
  }
}
