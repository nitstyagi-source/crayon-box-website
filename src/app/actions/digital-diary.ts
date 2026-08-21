"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function resolveCampusId(supabase: any, campusId?: string): Promise<string> {
  if (campusId && campusId !== "all" && campusId !== "default") {
    return campusId;
  }
  const { data: firstCampus } = await supabase.from("campuses").select("id").limit(1).single();
  return firstCampus?.id || "c3d782a9-a50b-4708-a3fc-6b146f456662";
}

// -------------------------------------------------------------
// 1. GET TEACHER'S DAILY TIMETABLE SCHEDULE & DIARY ENTRIES
// -------------------------------------------------------------
export async function getTeacherDailyScheduleWithDiary(payload: {
  campusId?: string;
  date?: string;
  teacherId?: string;
  className?: string;
  sectionName?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);
    const dateStr = payload.date || new Date().toISOString().split("T")[0];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[new Date(dateStr).getDay()] || "Monday";

    // 1. Fetch scheduled periods from Timetable
    let ttQuery = supabase
      .from("school_timetable")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .eq("day_of_week", dayOfWeek)
      .eq("break_type", "None");

    if (payload.teacherId && payload.teacherId !== "All") {
      ttQuery = ttQuery.or(`teacher_id.eq.${payload.teacherId},substitution_teacher_id.eq.${payload.teacherId}`);
    }

    if (payload.className && payload.className !== "All") {
      ttQuery = ttQuery.eq("class_name", payload.className);
    }

    if (payload.sectionName && payload.sectionName !== "All") {
      ttQuery = ttQuery.eq("section_name", payload.sectionName);
    }

    const { data: timetableSlots, error: ttErr } = await ttQuery.order("period_number", { ascending: true });
    if (ttErr) throw ttErr;

    // 2. Fetch any already entered diary records for this date
    const { data: diaryRecords, error: diaryErr } = await supabase
      .from("digital_diary_entries")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .eq("date", dateStr);

    if (diaryErr) throw diaryErr;

    const diaryMap: Record<string, any> = {};
    (diaryRecords || []).forEach((entry: any) => {
      const key = `${entry.class_name}_${entry.section_name}_${entry.period_number}`;
      diaryMap[key] = entry;
    });

    // 3. Map timetable slots with live diary progress
    const combined = (timetableSlots || []).map((slot: any) => {
      const key = `${slot.class_name}_${slot.section_name}_${slot.period_number}`;
      const savedDiary = diaryMap[key] || null;

      let status: "Completed" | "Pending" | "Upcoming" = "Pending";
      if (savedDiary && savedDiary.status === "Completed") {
        status = "Completed";
      } else if (savedDiary && savedDiary.status === "Draft") {
        status = "Pending";
      }

      return {
        slotId: slot.id,
        periodNumber: slot.period_number,
        periodLabel: slot.period_label || `Period ${slot.period_number}`,
        startTime: slot.start_time || "08:15 AM",
        endTime: slot.end_time || "08:55 AM",
        className: slot.class_name,
        sectionName: slot.section_name,
        subjectName: slot.subject_name,
        roomNumber: slot.room_number || "Classroom",
        teacherId: slot.substitution_teacher_id || slot.teacher_id,
        teacherName: slot.substitution_teacher_name || slot.teacher_name || "Assigned Teacher",
        isSubstitution: !!slot.substitution_teacher_id,
        status,
        diary: savedDiary
      };
    });

    return {
      success: true,
      data: combined,
      totalPeriods: combined.length,
      completedCount: combined.filter((c: any) => c.status === "Completed").length,
      pendingCount: combined.filter((c: any) => c.status !== "Completed").length
    };
  } catch (error: any) {
    console.error("Error in getTeacherDailyScheduleWithDiary:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 2. GET OR INITIALIZE PERIOD WORKSPACE (ONE-SCREEN WORKFLOW)
// -------------------------------------------------------------
export async function getPeriodWorkspaceDetails(payload: {
  campusId?: string;
  date: string;
  className: string;
  sectionName: string;
  periodNumber: number;
  subjectName?: string;
  teacherId?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    // 1. Fetch Existing Diary Entry
    const { data: existingDiary } = await supabase
      .from("digital_diary_entries")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .eq("date", payload.date)
      .eq("class_name", payload.className)
      .eq("section_name", payload.sectionName)
      .eq("period_number", payload.periodNumber)
      .maybeSingle();

    // 2. Fetch Class Students for Quick Attendance & Homework Roster
    const { data: students, error: stuErr } = await supabase
      .from("students")
      .select(`
        id, admission_no, first_name, last_name, photo_url, roll_no,
        classes:class_id (
          id, grade, section
        )
      `)
      .eq("campus_id", resolvedCampusId);

    const classStudents = (students || [])
      .filter((s: any) => {
        const cls = Array.isArray(s.classes) ? s.classes[0] : s.classes;
        const gradeMatch = cls?.grade?.toLowerCase() === payload.className.toLowerCase();
        const secMatch = !payload.sectionName || cls?.section?.toLowerCase() === payload.sectionName.toLowerCase();
        return gradeMatch && secMatch;
      })
      .map((s: any) => ({
        id: s.id,
        admissionNo: s.admission_no,
        fullName: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
        photoUrl: s.photo_url || null,
        rollNo: s.roll_no || "—",
        attendanceStatus: "Present"
      }));

    // 3. Fetch Homework Submissions if diary exists
    let submissions: any[] = [];
    if (existingDiary?.id) {
      const { data: subData } = await supabase
        .from("homework_submissions")
        .select(`
          *,
          students:student_id (id, first_name, last_name, admission_no, photo_url)
        `)
        .eq("diary_entry_id", existingDiary.id);

      submissions = subData || [];
    }

    // 4. Fetch Syllabus Topic Suggestion (Integration with Syllabus Module)
    let suggestedTopic = null;
    const { data: syllabusTopic } = await supabase
      .from("syllabus_lesson_logs")
      .select("topic_title, learning_objective, teaching_method, classwork, homework")
      .ilike("topic_title", `%${payload.subjectName || ""}%`)
      .limit(1)
      .maybeSingle();

    if (syllabusTopic) {
      suggestedTopic = syllabusTopic;
    }

    return {
      success: true,
      data: {
        diary: existingDiary || null,
        students: classStudents,
        submissions,
        suggestedTopic
      }
    };
  } catch (error: any) {
    console.error("Error in getPeriodWorkspaceDetails:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. SAVE PERIOD DIGITAL DIARY ENTRY (UNIFIED SINGLE-SCREEN FLOW)
// -------------------------------------------------------------
export async function saveDailyDiaryPeriodEntry(payload: {
  campusId?: string;
  date: string;
  periodNumber: number;
  periodLabel?: string;
  startTime?: string;
  endTime?: string;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  topicTaught: string;
  chapterTitle?: string;
  learningObjective?: string;
  teachingMethod?: string;
  activityConducted?: string;
  classworkText?: string;
  classworkAttachments?: any[];
  homeworkTitle?: string;
  homeworkDescription?: string;
  homeworkDueDate?: string;
  homeworkPriority?: string;
  homeworkSubmissionRequired?: boolean;
  homeworkMaxMarks?: number;
  homeworkAttachments?: any[];
  studyMaterialAttachments?: any[];
  teacherRemarksInternal?: string;
  teacherRemarksParent?: string;
  attendanceSummary?: any;
  isLessonCompleted?: boolean;
  parentAcknowledgementRequired?: boolean;
  status?: "Draft" | "Completed" | "Published";
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[new Date(payload.date).getDay()] || "Monday";

    const diaryData = {
      campus_id: resolvedCampusId,
      academic_session: "2026-2027",
      date: payload.date,
      day_of_week: dayOfWeek,
      period_number: payload.periodNumber,
      period_label: payload.periodLabel || `Period ${payload.periodNumber}`,
      start_time: payload.startTime || "08:15 AM",
      end_time: payload.endTime || "08:55 AM",
      class_name: payload.className,
      section_name: payload.sectionName,
      subject_name: payload.subjectName,
      teacher_id: payload.teacherId || null,
      teacher_name: payload.teacherName || "Teaching Faculty",
      topic_taught: payload.topicTaught,
      chapter_title: payload.chapterTitle || "",
      learning_objective: payload.learningObjective || "",
      teaching_method: payload.teachingMethod || "Interactive Smart Board Lecture",
      activity_conducted: payload.activityConducted || "",
      classwork_text: payload.classworkText || "",
      classwork_attachments: payload.classworkAttachments || [],
      homework_title: payload.homeworkTitle || "",
      homework_description: payload.homeworkDescription || "",
      homework_due_date: payload.homeworkDueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      homework_priority: payload.homeworkPriority || "Medium",
      homework_submission_required: payload.homeworkSubmissionRequired ?? true,
      homework_max_marks: payload.homeworkMaxMarks || 10,
      homework_attachments: payload.homeworkAttachments || [],
      study_material_attachments: payload.studyMaterialAttachments || [],
      teacher_remarks_internal: payload.teacherRemarksInternal || "",
      teacher_remarks_parent: payload.teacherRemarksParent || "",
      attendance_summary: payload.attendanceSummary || { present: 0, absent: 0, total: 0 },
      is_lesson_completed: payload.isLessonCompleted ?? true,
      parent_acknowledgement_required: payload.parentAcknowledgementRequired ?? false,
      status: payload.status || "Completed",
      updated_at: new Date().toISOString()
    };

    const { data: savedEntry, error } = await supabase
      .from("digital_diary_entries")
      .upsert(diaryData, {
        onConflict: "campus_id,date,class_name,section_name,period_number"
      })
      .select()
      .single();

    if (error) throw error;

    // Optional: Log completion to Syllabus Progress
    if (payload.isLessonCompleted) {
      await supabase.from("syllabus_lesson_logs").insert({
        campus_id: resolvedCampusId,
        teacher_id: payload.teacherId || null,
        teacher_name: payload.teacherName || "Teaching Faculty",
        lesson_date: payload.date,
        period_number: payload.periodNumber,
        topic_title: `${payload.subjectName}: ${payload.topicTaught}`,
        learning_objective: payload.learningObjective || "",
        teaching_method: payload.teachingMethod || "",
        classwork: payload.classworkText || "",
        homework: payload.homeworkTitle || "",
        remarks: payload.teacherRemarksParent || "",
        is_completed: true
      });
    }

    revalidatePath("/admin/digital-diary");
    revalidatePath("/staff/academics");
    revalidatePath("/parent/academics");
    return {
      success: true,
      message: `Digital Diary for Period ${payload.periodNumber} (${payload.subjectName}) saved successfully!`,
      data: savedEntry
    };
  } catch (error: any) {
    console.error("Error in saveDailyDiaryPeriodEntry:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. GET PARENT APP STUDENT DIARY (INDIVIDUAL CHILD VIEW)
// -------------------------------------------------------------
export async function getParentChildDiary(payload: {
  studentId?: string;
  date?: string;
  campusId?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);
    const dateStr = payload.date || new Date().toISOString().split("T")[0];

    // 1. Fetch Student and Class details
    let studentQuery = supabase
      .from("students")
      .select(`
        id, admission_no, first_name, last_name, photo_url,
        classes:class_id (
          id, grade, section, room_number
        )
      `);

    if (payload.studentId) {
      studentQuery = studentQuery.eq("id", payload.studentId);
    }

    const { data: studentData, error: stuErr } = await studentQuery.limit(1).maybeSingle();
    if (stuErr || !studentData) throw new Error("Student profile not found.");

    const cls = Array.isArray(studentData.classes) ? studentData.classes[0] : studentData.classes;
    const grade = cls?.grade || "Grade 5";
    const section = cls?.section || "A";

    // 2. Fetch all Diary Entries for this class & date
    const { data: diaryEntries, error: diaryErr } = await supabase
      .from("digital_diary_entries")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .eq("date", dateStr)
      .eq("class_name", grade)
      .eq("section_name", section)
      .order("period_number", { ascending: true });

    if (diaryErr) throw diaryErr;

    // 3. Fetch Homework Submissions for this student
    const diaryIds = (diaryEntries || []).map((d: any) => d.id);
    const { data: submissions } = await supabase
      .from("homework_submissions")
      .select("*")
      .in("diary_entry_id", diaryIds.length > 0 ? diaryIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("student_id", studentData.id);

    const subMap: Record<string, any> = {};
    (submissions || []).forEach((sub: any) => {
      subMap[sub.diary_entry_id] = sub;
    });

    // 4. Fetch Parent Acknowledgement
    const { data: acks } = await supabase
      .from("diary_parent_acknowledgements")
      .select("diary_entry_id, acknowledged_at")
      .in("diary_entry_id", diaryIds.length > 0 ? diaryIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("student_id", studentData.id);

    const ackMap: Record<string, string> = {};
    (acks || []).forEach((a: any) => {
      ackMap[a.diary_entry_id] = a.acknowledged_at;
    });

    const enrichedEntries = (diaryEntries || []).map((d: any) => ({
      ...d,
      submission: subMap[d.id] || null,
      isAcknowledged: !!ackMap[d.id],
      acknowledgedAt: ackMap[d.id] || null
    }));

    return {
      success: true,
      data: {
        student: {
          id: studentData.id,
          fullName: `${studentData.first_name || ""} ${studentData.last_name || ""}`.trim(),
          admissionNo: studentData.admission_no,
          grade,
          section,
          photoUrl: studentData.photo_url
        },
        date: dateStr,
        diaryEntries: enrichedEntries
      }
    };
  } catch (error: any) {
    console.error("Error in getParentChildDiary:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. SUBMIT HOMEWORK (PARENT / STUDENT APP)
// -------------------------------------------------------------
export async function submitStudentHomework(payload: {
  diaryEntryId: string;
  studentId: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  studentNotes?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("homework_submissions")
      .upsert(
        {
          diary_entry_id: payload.diaryEntryId,
          student_id: payload.studentId,
          submission_date: new Date().toISOString(),
          attachment_url: payload.attachmentUrl || "https://example.com/homework_submission.pdf",
          attachment_name: payload.attachmentName || "Homework_Submission.pdf",
          attachment_type: payload.attachmentType || "PDF",
          student_notes: payload.studentNotes || "",
          status: "Submitted"
        },
        { onConflict: "diary_entry_id,student_id" }
      )
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/parent/academics");
    revalidatePath("/admin/digital-diary");
    return { success: true, message: "Homework submitted successfully!", data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. GRADE STUDENT HOMEWORK (TEACHER EVALUATION)
// -------------------------------------------------------------
export async function gradeStudentHomework(payload: {
  submissionId: string;
  marksObtained?: number;
  teacherFeedback?: string;
  status: "Graded" | "Needs Correction" | "Submitted";
  gradedBy?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("homework_submissions")
      .update({
        marks_obtained: payload.marksObtained,
        teacher_feedback: payload.teacherFeedback,
        status: payload.status,
        graded_at: new Date().toISOString(),
        graded_by: payload.gradedBy || "Teacher"
      })
      .eq("id", payload.submissionId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/digital-diary");
    revalidatePath("/parent/academics");
    return { success: true, message: `Submission updated to ${payload.status}!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 7. PARENT ACKNOWLEDGEMENT ("✓ I Have Read This")
// -------------------------------------------------------------
export async function acknowledgeDiaryNotice(payload: {
  diaryEntryId: string;
  studentId: string;
  parentName?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("diary_parent_acknowledgements")
      .upsert(
        {
          diary_entry_id: payload.diaryEntryId,
          student_id: payload.studentId,
          parent_name: payload.parentName || "Parent / Guardian",
          acknowledged_at: new Date().toISOString()
        },
        { onConflict: "diary_entry_id,student_id" }
      )
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/parent/academics");
    return { success: true, message: "Notice acknowledged successfully!", data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 8. PRINCIPAL & COORDINATOR MONITORING DASHBOARD STATS
// -------------------------------------------------------------
export async function getPrincipalDiaryMonitoringStats(payload: {
  campusId?: string;
  date?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);
    const dateStr = payload.date || new Date().toISOString().split("T")[0];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[new Date(dateStr).getDay()] || "Monday";

    // 1. Total scheduled periods today across all classes
    const { data: totalSlots, error: ttErr } = await supabase
      .from("school_timetable")
      .select("id, class_name, section_name, period_number, subject_name, teacher_name, teacher_id")
      .eq("campus_id", resolvedCampusId)
      .eq("day_of_week", dayOfWeek)
      .eq("break_type", "None");

    if (ttErr) throw ttErr;

    // 2. Total completed diary entries for today
    const { data: entries, error: diaryErr } = await supabase
      .from("digital_diary_entries")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .eq("date", dateStr);

    if (diaryErr) throw diaryErr;

    const completedEntries = (entries || []).filter((e: any) => e.status === "Completed");

    // 3. Class-wise Compliance Breakdown
    const classCompliance: Record<string, { total: number; completed: number; pending: any[] }> = {};

    (totalSlots || []).forEach((slot: any) => {
      const clsKey = `${slot.class_name} (${slot.section_name})`;
      if (!classCompliance[clsKey]) {
        classCompliance[clsKey] = { total: 0, completed: 0, pending: [] };
      }
      classCompliance[clsKey].total += 1;

      const isDone = (entries || []).some(
        (e: any) =>
          e.class_name === slot.class_name &&
          e.section_name === slot.section_name &&
          e.period_number === slot.period_number &&
          e.status === "Completed"
      );

      if (isDone) {
        classCompliance[clsKey].completed += 1;
      } else {
        classCompliance[clsKey].pending.push({
          periodNumber: slot.period_number,
          subjectName: slot.subject_name,
          teacherName: slot.teacher_name
        });
      }
    });

    const totalScheduled = totalSlots?.length || 1;
    const completedCount = completedEntries.length;
    const completionPercentage = Math.round((completedCount / totalScheduled) * 100) || 0;

    return {
      success: true,
      data: {
        date: dateStr,
        dayOfWeek,
        totalPeriods: totalScheduled,
        completedPeriods: completedCount,
        pendingPeriods: Math.max(0, totalScheduled - completedCount),
        completionPercentage,
        classCompliance,
        recentEntries: completedEntries.slice(0, 10)
      }
    };
  } catch (error: any) {
    console.error("Error in getPrincipalDiaryMonitoringStats:", error);
    return { success: false, error: error.message };
  }
}
