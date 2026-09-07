"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export interface TeacherCpdRecord {
  id: string;
  teacher_id: string;
  teacher_name: string;
  employee_code: string;
  department: string;
  designation: string;
  academic_year: string;
  total_hours: number;
  cbse_external_hours: number;
  internal_school_hours: number;
  compliance_percentage: number;
  status: 'COMPLIANT' | 'IN_PROGRESS' | 'ACTION_REQUIRED';
  workshops: Array<{
    id: string;
    title: string;
    agency: string;
    hours: number;
    completion_date: string;
    certificate_url?: string;
  }>;
}

export async function getTeacherCpdOverviewAction(academicYear?: string) {
  const currentAcademicYear = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  try {
    const supabase = getSupabaseAdmin();

    // Query real faculty records
    const { data: facultyList, error: fErr } = await supabase
      .from('faculty')
      .select('id, first_name, last_name, employee_code, department, designation')
      .order('first_name', { ascending: true })
      .limit(100);

    if (fErr) {
      console.error("Error querying faculty for CPD:", fErr);
      return { success: false, error: fErr.message, teachers: [] };
    }

    if (!facultyList || facultyList.length === 0) {
      return { success: true, teachers: [] };
    }

    // Query teacher_cpd_records
    const { data: cpdData } = await supabase
      .from('teacher_cpd_records')
      .select('*')
      .eq('academic_year', currentAcademicYear);

    // Query staff_trainings for additional logged records
    const { data: staffTrainings } = await supabase
      .from('staff_trainings')
      .select('*');

    const cpdRecords = cpdData || [];
    const trainings = staffTrainings || [];

    const mapped: TeacherCpdRecord[] = facultyList.map((f, idx) => {
      const teacherCpd = cpdRecords.filter((r) => r.teacher_id === f.id);
      const teacherTrainings = trainings.filter((t) => t.staff_id === f.id);

      const workshopsList: Array<{
        id: string;
        title: string;
        agency: string;
        hours: number;
        completion_date: string;
        certificate_url?: string;
      }> = [];

      teacherCpd.forEach((w) => {
        workshopsList.push({
          id: w.id,
          title: w.workshop_title || 'Professional Workshop',
          agency: w.conducting_agency || 'EXTERNAL',
          hours: Number(w.hours_credited) || 0,
          completion_date: w.completion_date || '',
          certificate_url: w.certificate_url || undefined
        });
      });

      teacherTrainings.forEach((t) => {
        workshopsList.push({
          id: t.id,
          title: t.training_name || 'Staff Training',
          agency: t.provider || 'INTERNAL',
          hours: Number(t.duration_hours) || 0,
          completion_date: t.training_date || '',
          certificate_url: t.certificate_url || undefined
        });
      });

      const externalHours = workshopsList
        .filter((w) => w.agency.toUpperCase() !== 'INTERNAL')
        .reduce((sum, w) => sum + w.hours, 0);

      const internalHours = workshopsList
        .filter((w) => w.agency.toUpperCase() === 'INTERNAL')
        .reduce((sum, w) => sum + w.hours, 0);

      const totalHours = externalHours + internalHours;
      const compPct = Math.min(100, Math.round((totalHours / 50) * 100));

      return {
        id: f.id,
        teacher_id: f.id,
        teacher_name: `${f.first_name || ''} ${f.last_name || ''}`.trim() || 'Teacher',
        employee_code: f.employee_code || `FAC-${100 + idx}`,
        department: f.department || 'Academics',
        designation: f.designation || 'Teacher',
        academic_year: currentAcademicYear,
        total_hours: totalHours,
        cbse_external_hours: externalHours,
        internal_school_hours: internalHours,
        compliance_percentage: compPct,
        status: compPct >= 100 ? 'COMPLIANT' : compPct >= 50 ? 'IN_PROGRESS' : 'ACTION_REQUIRED',
        workshops: workshopsList
      };
    });

    return { success: true, teachers: mapped };
  } catch (err: any) {
    console.error('getTeacherCpdOverviewAction error:', err);
    return { success: false, error: err.message, teachers: [] };
  }
}

export async function logTeacherCpdWorkshopAction(payload: {
  teacher_id: string;
  workshop_title: string;
  conducting_agency: string;
  hours_credited: number;
  completion_date: string;
  academic_year?: string;
  certificate_url?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const curYear = new Date().getFullYear();
    const record = {
      teacher_id: payload.teacher_id,
      academic_year: payload.academic_year || `${curYear}-${curYear + 1}`,
      workshop_title: payload.workshop_title,
      conducting_agency: payload.conducting_agency,
      hours_credited: payload.hours_credited,
      completion_date: payload.completion_date,
      certificate_url: payload.certificate_url || null,
      approval_status: 'APPROVED'
    };

    await supabase.from('teacher_cpd_records').insert([record]);

    // Also record into staff_trainings for HR audit compliance
    try {
      await supabase.from('staff_trainings').insert([{
        staff_id: payload.teacher_id,
        training_name: payload.workshop_title,
        training_type: payload.conducting_agency.toUpperCase() === 'INTERNAL' ? 'Internal' : 'External',
        provider: payload.conducting_agency,
        training_date: payload.completion_date,
        duration_hours: Math.round(payload.hours_credited),
        certificate_url: payload.certificate_url || null
      }]);
    } catch (_) {}

    try {
      revalidatePath('/admin/faculty');
    } catch (_) {}

    return {
      success: true,
      message: `Credited ${payload.hours_credited} hours of Continuous Professional Development for "${payload.workshop_title}".`
    };
  } catch (err: any) {
    console.error('logTeacherCpdWorkshopAction error:', err);
    return { success: false, error: err.message };
  }
}
