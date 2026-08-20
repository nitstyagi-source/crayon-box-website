"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

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

async function resolveCampusId(supabase: any, campusId?: string): Promise<string> {
  if (campusId && isValidUUID(campusId)) {
    const { data: existing } = await supabase.from('campuses').select('id').eq('id', campusId).maybeSingle();
    if (existing?.id) return existing.id;
  }
  const { data } = await supabase.from('campuses').select('id').limit(1).single();
  if (!data?.id) throw new Error("No campus found in database.");
  return data.id;
}

// -------------------------------------------------------------
// 1. FETCH TIMETABLE SLOTS WITH FILTERS
// -------------------------------------------------------------
export async function getTimetable(
  campusId?: string, 
  filters?: { class_name?: string; section_name?: string; day_of_week?: string; teacher_id?: string; wing?: string }
) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from('school_timetable')
      .select('*')
      .eq('campus_id', resolvedCampusId);

    if (filters?.class_name && filters.class_name !== 'All') {
      query = query.eq('class_name', filters.class_name);
    }

    if (filters?.section_name && filters.section_name !== 'All') {
      query = query.eq('section_name', filters.section_name);
    }

    if (filters?.day_of_week && filters.day_of_week !== 'All') {
      query = query.eq('day_of_week', filters.day_of_week);
    }

    if (filters?.teacher_id && filters.teacher_id !== 'All') {
      query = query.eq('teacher_id', filters.teacher_id);
    }

    query = query.order('period_number', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching timetable:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 2. SAVE OR UPDATE TIMETABLE SLOT
// -------------------------------------------------------------
export async function saveTimetableSlot(payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campus_id);

    const slotData = {
      campus_id: resolvedCampusId,
      academic_session: payload.academic_session || '2026-2027',
      wing: payload.wing || 'Primary (3-5)',
      day_of_week: payload.day_of_week || 'Monday',
      period_number: Number(payload.period_number) || 1,
      period_label: payload.period_label || `Period ${payload.period_number || 1}`,
      start_time: payload.start_time || '08:15 AM',
      end_time: payload.end_time || '08:55 AM',
      duration_minutes: Number(payload.duration_minutes) || 40,
      break_type: payload.break_type || 'None',
      class_name: payload.class_name,
      section_name: payload.section_name,
      subject_name: payload.subject_name,
      teacher_id: payload.teacher_id || null,
      teacher_name: payload.teacher_name || 'Staff Facilitator',
      room_number: payload.room_number || 'Room 101',
      substitution_teacher_id: payload.substitution_teacher_id || null,
      substitution_teacher_name: payload.substitution_teacher_name || null,
      status: payload.status || 'Active'
    };

    let res;
    if (payload.id && isValidUUID(payload.id)) {
      res = await supabase
        .from('school_timetable')
        .update(slotData)
        .eq('id', payload.id)
        .select()
        .single();
    } else {
      res = await supabase
        .from('school_timetable')
        .insert([slotData])
        .select()
        .single();
    }

    if (res.error) throw res.error;

    revalidatePath('/admin/timetable');
    revalidatePath('/admin/faculty/substitutions');
    return { success: true, data: res.data };
  } catch (error: any) {
    console.error("Error saving timetable slot:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. ASSIGN SMART SUBSTITUTION
// -------------------------------------------------------------
export async function assignSubstitutionToSlot(slotId: string, substituteTeacherId: string, substituteName: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('school_timetable')
      .update({
        substitution_teacher_id: substituteTeacherId,
        substitution_teacher_name: substituteName,
        status: 'Substitution Active'
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/timetable');
    revalidatePath('/admin/faculty/substitutions');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clearSubstitutionFromSlot(slotId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('school_timetable')
      .update({
        substitution_teacher_id: null,
        substitution_teacher_name: null,
        status: 'Active'
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/timetable');
    revalidatePath('/admin/faculty/substitutions');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. DELETE TIMETABLE SLOT
// -------------------------------------------------------------
export async function deleteTimetableSlot(slotId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('school_timetable').delete().eq('id', slotId);
    if (error) throw error;
    revalidatePath('/admin/timetable');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. BULK PROVISION COMPLETE STANDARD 8:00 AM - 2:20 PM TIMETABLE
// -------------------------------------------------------------
export async function bulkGenerateStandardTimetable(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    // 1. Fetch all teachers from staff table
    const { data: staffList } = await supabase.from('staff').select('id, first_name, last_name, designation, subjects_taught, department').eq('campus_id', resolvedCampusId);
    const teachers = (staffList || []).filter((s: any) => s.first_name);

    // 1. Primary & Senior Period Templates (Classes 1 to 12): 8:00 AM - 2:30 PM
    const SENIOR_PERIODS = [
      { num: 0, label: "Morning Assembly & Mindfulness", start: "08:00 AM", end: "08:15 AM", dur: 15, break_type: "Assembly" },
      { num: 1, label: "Period 1", start: "08:15 AM", end: "08:55 AM", dur: 40, break_type: "None" },
      { num: 2, label: "Period 2", start: "08:55 AM", end: "09:35 AM", dur: 40, break_type: "None" },
      { num: 3, label: "Period 3", start: "09:35 AM", end: "10:15 AM", dur: 40, break_type: "None" },
      { num: 4, label: "Period 4", start: "10:15 AM", end: "10:55 AM", dur: 40, break_type: "None" },
      { num: 5, label: "Short Break / Tiffin", start: "10:55 AM", end: "11:25 AM", dur: 30, break_type: "Short Break" },
      { num: 6, label: "Period 5", start: "11:25 AM", end: "12:05 PM", dur: 40, break_type: "None" },
      { num: 7, label: "Period 6", start: "12:05 PM", end: "12:45 PM", dur: 40, break_type: "None" },
      { num: 8, label: "Period 7", start: "12:45 PM", end: "01:25 PM", dur: 40, break_type: "None" },
      { num: 9, label: "Sports & Co-Curricular Activity (50 Min)", start: "01:25 PM", end: "02:15 PM", dur: 50, break_type: "None" },
      { num: 10, label: "Dispersal / Diary / Closing", start: "02:15 PM", end: "02:30 PM", dur: 15, break_type: "Dispersal" }
    ];

    // 2. Early Childhood Period Templates (Nursery / LKG / UKG): 9:00 AM - 1:00 PM (25-30 Min Blocks)
    const EARLY_YEARS_PERIODS = [
      { num: 0, label: "Morning Circle Time & Welcome Prayer", start: "09:00 AM", end: "09:20 AM", dur: 20, break_type: "Assembly" },
      { num: 1, label: "Block 1: Phonics, Rhymes & Language Fun", start: "09:20 AM", end: "09:50 AM", dur: 30, break_type: "None" },
      { num: 2, label: "Block 2: Number Magic & Pre-Math Concepts", start: "09:50 AM", end: "10:20 AM", dur: 30, break_type: "None" },
      { num: 3, label: "Healthy Fruit & Snack Break (Tiffin)", start: "10:20 AM", end: "10:50 AM", dur: 30, break_type: "Short Break" },
      { num: 4, label: "Block 3: Sensory Play, EVS & Nature Walk", start: "10:50 AM", end: "11:20 AM", dur: 30, break_type: "None" },
      { num: 5, label: "Block 4: Creative Arts, Clay Moulding & Craft", start: "11:20 AM", end: "11:50 AM", dur: 30, break_type: "None" },
      { num: 6, label: "Block 5: Music, Movement & Rhythmic Dance", start: "11:50 AM", end: "12:20 PM", dur: 30, break_type: "None" },
      { num: 7, label: "Block 6: Gross Motor, Outdoor Play & Games", start: "12:20 PM", end: "12:45 PM", dur: 25, break_type: "None" },
      { num: 8, label: "Storytelling, Diary & Warm Dispersal", start: "12:45 PM", end: "01:00 PM", dur: 15, break_type: "Dispersal" }
    ];

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const CLASSES = [
      // Early Years (9:00 AM - 1:00 PM)
      { grade: "Nursery", section: "Earth", wing: "Early Years" },
      { grade: "Nursery", section: "Mars", wing: "Early Years" },
      { grade: "LKG", section: "Sun", wing: "Early Years" },
      { grade: "LKG", section: "Moon", wing: "Early Years" },
      { grade: "UKG", section: "Jupiter", wing: "Early Years" },
      { grade: "UKG", section: "Neptune", wing: "Early Years" },
      { grade: "UKG", section: "Uranus", wing: "Early Years" },
      // Primary (Classes 1 - 5: 8:00 AM - 2:30 PM)
      { grade: "Grade 1", section: "A", wing: "Lower Primary (1-2)" },
      { grade: "Grade 1", section: "B", wing: "Lower Primary (1-2)" },
      { grade: "Grade 2", section: "A", wing: "Lower Primary (1-2)" },
      { grade: "Grade 3", section: "A", wing: "Upper Primary (3-5)" },
      { grade: "Grade 4", section: "A", wing: "Upper Primary (3-5)" },
      { grade: "Grade 5", section: "A", wing: "Upper Primary (3-5)" },
      // Middle School (Classes 6 - 8)
      { grade: "Grade 6", section: "A", wing: "Middle School (6-8)" },
      { grade: "Grade 7", section: "A", wing: "Middle School (6-8)" },
      { grade: "Grade 8", section: "A", wing: "Middle School (6-8)" },
      // Secondary & Senior Secondary (Classes 9 - 12)
      { grade: "Grade 9", section: "A", wing: "Secondary (9-10)" },
      { grade: "Grade 10", section: "A", wing: "Secondary (9-10)" },
      { grade: "Grade 11", section: "A", wing: "Senior Secondary (11-12)" },
      { grade: "Grade 12", section: "A", wing: "Senior Secondary (11-12)" }
    ];

    const SUBJECT_ROTATION: Record<string, string[]> = {
      "Early Years": ["Phonics & Rhymes", "Number Fun & Math", "Storytelling & EVS", "Fine Motor Play", "Music & Movement", "Art & Craft", "Free Play"],
      "Lower Primary (1-2)": ["English Grammar", "Mathematics", "Hindi", "Environmental Studies (EVS)", "Computer & Coding", "Vedic Math", "Visual Arts"],
      "Upper Primary (3-5)": ["Mathematics", "Science & Discovery", "English Literature", "Social Studies / EVS", "Hindi Vyakaran", "Robotics & Computer", "Mental Math & Logic"],
      "Middle School (6-8)": ["Advanced Mathematics", "General Science (Physics/Chem/Bio)", "Social Science (Hist/Civics/Geo)", "English Language & Lit", "Hindi / Sanskrit", "Artificial Intelligence & Coding", "Reasoning & Aptitude"],
      "Secondary (9-10)": ["Mathematics Standard", "Physics & Chemistry", "Biology & Life Sciences", "History, Civics & Geography", "English Communicative", "Information Technology", "Economics & Commercial Studies"],
      "Senior Secondary (11-12)": ["Physics / Accountancy", "Chemistry / Business Studies", "Mathematics / Applied Math", "Biology / Economics", "Computer Science / IP", "English Core", "General Studies & Aptitude"]
    };

    const DAILY_ACTIVITIES: Record<string, { subject: string; room: string }> = {
      "Monday": { subject: "Athletics, Football & Fitness (Sports)", room: "Sports Ground" },
      "Tuesday": { subject: "STEM Lab, Robotics & Tinkering", room: "STEM Lab" },
      "Wednesday": { subject: "Visual Arts, Pottery & Origami", room: "Art Studio" },
      "Thursday": { subject: "Music, Classical Dance & Theatre", room: "Music & Dance Studio" },
      "Friday": { subject: "Yoga, Martial Arts & Chess", room: "Sports Complex" }
    };

    // Clean existing timetable
    await supabase.from('school_timetable').delete().eq('campus_id', resolvedCampusId);

    const slotsToInsert = [];

    for (const cls of CLASSES) {
      const isEarlyYears = cls.wing === "Early Years";
      const periodsTemplate = isEarlyYears ? EARLY_YEARS_PERIODS : SENIOR_PERIODS;
      const subList = SUBJECT_ROTATION[cls.wing] || SUBJECT_ROTATION["Upper Primary (3-5)"];

      for (const day of DAYS) {
        for (const p of periodsTemplate) {
          let subject = p.label;
          let assignedTeacher: any = null;
          let room = `Room 10${cls.grade.includes('Nursery') ? '1' : cls.grade.includes('LKG') ? '2' : cls.grade.includes('UKG') ? '3' : '4'}`;

          if (!isEarlyYears && p.num === 9) {
            // Dedicated 50-Min Sports & Activity Block for Classes 1 to 12
            const act = DAILY_ACTIVITIES[day] || { subject: "Sports & Activities", room: "Sports Ground" };
            subject = act.subject;
            room = act.room;
            assignedTeacher = teachers.find((t: any) => 
              t.designation?.toLowerCase().includes("sport") || 
              t.subjects_taught?.toLowerCase().includes("sport") ||
              t.department?.toLowerCase().includes("sport")
            ) || teachers[0];
          } else if (p.break_type === 'None') {
            const subIdx = (p.num + DAYS.indexOf(day)) % subList.length;
            subject = subList[subIdx];

            if (teachers.length > 0) {
              assignedTeacher = teachers.find((t: any) => 
                (t.subjects_taught && t.subjects_taught.toLowerCase().includes(subject.split(' ')[0].toLowerCase())) ||
                (t.department && t.department.toLowerCase().includes(subject.split(' ')[0].toLowerCase()))
              ) || teachers[(p.num + cls.grade.length) % teachers.length];
            }

            if (subject.includes("Computer") || subject.includes("Robotics") || subject.includes("Artificial Intelligence")) room = "STEM Lab";
            else if (subject.includes("Physics") || subject.includes("Chemistry") || subject.includes("Biology")) room = "Science Composite Lab";
            else if (subject.includes("Art")) room = "Art Studio";
            else if (subject.includes("Music")) room = "Music & Dance Studio";
          }

          slotsToInsert.push({
            campus_id: resolvedCampusId,
            academic_session: '2026-2027',
            wing: cls.wing,
            day_of_week: day,
            period_number: p.num,
            period_label: p.label,
            start_time: p.start,
            end_time: p.end,
            duration_minutes: p.dur,
            break_type: p.break_type,
            class_name: cls.grade,
            section_name: cls.section,
            subject_name: subject,
            teacher_id: assignedTeacher?.id || null,
            teacher_name: assignedTeacher ? `${assignedTeacher.first_name} ${assignedTeacher.last_name || ''}`.trim() : (p.break_type === 'None' ? 'Assigned Teacher' : 'All Staff'),
            room_number: room,
            status: 'Active'
          });
        }
      }
    }

    // Insert in batches
    for (let i = 0; i < slotsToInsert.length; i += 100) {
      const batch = slotsToInsert.slice(i, i + 100);
      const { error } = await supabase.from('school_timetable').insert(batch);
      if (error) throw error;
    }

    revalidatePath('/admin/timetable');
    return { 
      success: true, 
      message: `Successfully provisioned ${slotsToInsert.length} period slots across all 11 classes according to the 8:00 AM - 2:05 PM standard!` 
    };
  } catch (error: any) {
    console.error("Error bulk generating timetable:", error);
    return { success: false, error: error.message };
  }
}
