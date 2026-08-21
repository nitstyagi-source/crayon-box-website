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
// 1. GET BIRTHDAYS WITH ROLE-BASED PRIVACY RULES
// -------------------------------------------------------------
export async function getTodaysAndUpcomingBirthdays(payload?: {
  campusId?: string;
  role?: "Admin" | "Teacher" | "Parent" | "Student";
  userClass?: string; // e.g. "Grade 5"
  studentId?: string; // For parents checking their child
  targetMonth?: number; // 1-12
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload?.campusId);
    const role = payload?.role || "Admin";

    const today = new Date();
    const currentMonth = payload?.targetMonth || today.getMonth() + 1; // 1-indexed
    const currentDay = today.getDate();

    // 1. Fetch Birthday Settings
    const { data: settings } = await supabase
      .from("birthday_settings")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .maybeSingle();

    const config = settings || {
      enable_student_birthdays: true,
      enable_teacher_birthdays: true,
      show_on_dashboard: true,
      show_in_calendar: true,
      allow_birthday_wishes: true,
      allow_classmates_to_wish: false,
      allow_parents_to_wish: true,
      hide_dob_from_users: true,
      custom_student_message: "🎂 Happy Birthday, {NAME}! Wishing you a wonderful day filled with happiness and learning! From Crayon Box School family 🎉",
      custom_teacher_message: "🎉 Wishing our esteemed educator {NAME} a very Happy Birthday! Thank you for inspiring young minds every day. Best wishes from Crayon Box School!"
    };

    // 2. Fetch Students with DOB
    let studentBirthdays: any[] = [];
    if (config.enable_student_birthdays) {
      const { data: students, error: stuErr } = await supabase
        .from("students")
        .select(`
          id, first_name, last_name, dob, date_of_birth, photo_url,
          classes:class_id (
            id, grade, section
          )
        `)
        .eq("campus_id", resolvedCampusId);

      if (!stuErr && students) {
        studentBirthdays = students
          .map((s: any) => {
            const rawDob = s.dob || s.date_of_birth;
            if (!rawDob) return null;
            const dobDate = new Date(rawDob);
            const m = dobDate.getMonth() + 1;
            const d = dobDate.getDate();
            const cls = Array.isArray(s.classes) ? s.classes[0] : s.classes;
            const grade = cls?.grade || "Grade 5";
            const section = cls?.section || "A";

            const isToday = m === (today.getMonth() + 1) && d === currentDay;
            const isThisMonth = m === currentMonth;

            return {
              id: s.id,
              type: "Student",
              firstName: s.first_name || "",
              lastName: s.last_name || "",
              fullName: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
              photoUrl: s.photo_url || null,
              grade,
              section,
              classDisplay: `${grade}-${section}`,
              birthMonth: m,
              birthDay: d,
              isToday,
              isThisMonth,
              // Privacy rule: Never expose birth year or age to peers/parents
              dateFormatted: config.hide_dob_from_users ? (isToday ? "Today" : `${d} ${getMonthName(m)}`) : `${d} ${getMonthName(m)}`
            };
          })
          .filter(Boolean);
      }
    }

    // 3. Fetch Faculty / Staff with DOB
    let teacherBirthdays: any[] = [];
    if (config.enable_teacher_birthdays) {
      const { data: staff, error: staffErr } = await supabase
        .from("staff")
        .select("id, first_name, last_name, designation, department, dob, photo_url, phone_number")
        .eq("campus_id", resolvedCampusId);

      if (!staffErr && staff) {
        teacherBirthdays = staff
          .map((t: any) => {
            if (!t.dob) return null;
            const dobDate = new Date(t.dob);
            const m = dobDate.getMonth() + 1;
            const d = dobDate.getDate();

            const isToday = m === (today.getMonth() + 1) && d === currentDay;
            const isThisMonth = m === currentMonth;

            return {
              id: t.id,
              type: "Teacher",
              fullName: `${t.first_name || ""} ${t.last_name || ""}`.trim(),
              designation: t.designation || "Faculty",
              department: t.department || "Academics",
              photoUrl: t.photo_url || null,
              birthMonth: m,
              birthDay: d,
              isToday,
              isThisMonth,
              dateFormatted: isToday ? "Today" : `${d} ${getMonthName(m)}`
            };
          })
          .filter(Boolean);
      }
    }

    // 4. Apply Strict Privacy Filtering based on User Role:
    let filteredStudents = studentBirthdays;
    let filteredTeachers = teacherBirthdays;

    if (role === "Teacher") {
      // Teachers see students in their class + teacher colleagues
      if (payload?.userClass) {
        filteredStudents = studentBirthdays.filter(s => s.grade === payload.userClass);
      }
    } else if (role === "Parent" || role === "Student") {
      // Parents see ONLY their own child (or classmates if enabled)
      if (payload?.studentId) {
        if (config.allow_classmates_to_wish && payload?.userClass) {
          filteredStudents = studentBirthdays.filter(s => s.id === payload.studentId || s.grade === payload.userClass);
        } else {
          filteredStudents = studentBirthdays.filter(s => s.id === payload.studentId);
        }
      } else {
        filteredStudents = [];
      }
      // Parents don't see teacher birthdays unless school enables it
      filteredTeachers = [];
    }

    // Today's specific birthdays
    const todaysStudents = filteredStudents.filter(s => s.isToday);
    const todaysTeachers = filteredTeachers.filter(t => t.isToday);

    // This month's birthdays
    const thisMonthStudents = filteredStudents.filter(s => s.isThisMonth).sort((a, b) => a.birthDay - b.birthDay);
    const thisMonthTeachers = filteredTeachers.filter(t => t.isThisMonth).sort((a, b) => a.birthDay - b.birthDay);

    return {
      success: true,
      data: {
        settings: config,
        todaysBirthdays: {
          students: todaysStudents,
          teachers: todaysTeachers,
          total: todaysStudents.length + todaysTeachers.length
        },
        thisMonthBirthdays: {
          students: thisMonthStudents,
          teachers: thisMonthTeachers,
          total: thisMonthStudents.length + thisMonthTeachers.length
        }
      }
    };
  } catch (error: any) {
    console.error("Error in getTodaysAndUpcomingBirthdays:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. SEND 1-CLICK BIRTHDAY WISH & LOG
// -------------------------------------------------------------
export async function sendBirthdayWish(payload: {
  campusId?: string;
  recipientId: string;
  recipientType: "Student" | "Teacher";
  recipientName: string;
  recipientClass?: string;
  senderName?: string;
  senderRole?: string;
  message?: string;
  channel?: "App" | "WhatsApp" | "SMS";
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const defaultMsg = payload.recipientType === "Student"
      ? `🎂 Happy Birthday, ${payload.recipientName}! Wishing you a wonderful day filled with happiness and learning! From Crayon Box School family 🎉`
      : `🎉 Wishing our esteemed educator ${payload.recipientName} a very Happy Birthday! Thank you for inspiring young minds every day. Best wishes from Crayon Box School!`;

    const wishRecord = {
      campus_id: resolvedCampusId,
      recipient_type: payload.recipientType,
      recipient_id: payload.recipientId,
      recipient_name: payload.recipientName,
      recipient_class: payload.recipientClass || "",
      sender_name: payload.senderName || "School Administration",
      sender_role: payload.senderRole || "Management",
      wish_message: payload.message || defaultMsg,
      channel: payload.channel || "App",
      sent_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("birthday_wishes_log")
      .insert(wishRecord)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/calendar");
    revalidatePath("/admin/dashboard");
    return {
      success: true,
      message: `🎉 Birthday wish sent to ${payload.recipientName} successfully!`,
      data
    };
  } catch (error: any) {
    console.error("Error sending birthday wish:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. UPDATE BIRTHDAY SETTINGS
// -------------------------------------------------------------
export async function updateBirthdaySettings(payload: {
  campusId?: string;
  enableStudentBirthdays?: boolean;
  enableTeacherBirthdays?: boolean;
  showOnDashboard?: boolean;
  showInCalendar?: boolean;
  allowBirthdayWishes?: boolean;
  allowClassmatesToWish?: boolean;
  allowParentsToWish?: boolean;
  hideDobFromUsers?: boolean;
  customStudentMessage?: string;
  customTeacherMessage?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const { data, error } = await supabase
      .from("birthday_settings")
      .upsert(
        {
          campus_id: resolvedCampusId,
          enable_student_birthdays: payload.enableStudentBirthdays ?? true,
          enable_teacher_birthdays: payload.enableTeacherBirthdays ?? true,
          show_on_dashboard: payload.showOnDashboard ?? true,
          show_in_calendar: payload.showInCalendar ?? true,
          allow_birthday_wishes: payload.allowBirthdayWishes ?? true,
          allow_classmates_to_wish: payload.allowClassmatesToWish ?? false,
          allow_parents_to_wish: payload.allowParentsToWish ?? true,
          hide_dob_from_users: payload.hideDobFromUsers ?? true,
          custom_student_message: payload.customStudentMessage,
          custom_teacher_message: payload.customTeacherMessage,
          updated_at: new Date().toISOString()
        },
        { onConflict: "campus_id" }
      )
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/calendar");
    return { success: true, message: "Birthday privacy and wish settings updated!", data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function getMonthName(monthNum: number): string {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[monthNum - 1] || "";
}
