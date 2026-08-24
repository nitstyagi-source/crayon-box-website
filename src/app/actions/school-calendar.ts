"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

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
// 1. GET ALL CALENDAR EVENTS WITH MULTI-FILTER
// -------------------------------------------------------------
export async function getSchoolCalendarEvents(payload?: {
  campusId?: string;
  year?: number;
  month?: number;
  eventType?: string;
  audience?: string;
  className?: string;
  search?: string;
  isHolidayOnly?: boolean;
  isExamOnly?: boolean;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload?.campusId);

    let query = supabase
      .from("school_calendar_events")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .eq("status", "Active")
      .order("start_date", { ascending: true });

    if (payload?.eventType && payload.eventType !== "All") {
      query = query.eq("event_type", payload.eventType);
    }

    if (payload?.audience && payload.audience !== "All") {
      query = query.or(`target_audience.eq.All,target_audience.eq.${payload.audience}`);
    }

    if (payload?.isHolidayOnly) {
      query = query.eq("is_holiday", true);
    }

    if (payload?.isExamOnly) {
      query = query.eq("is_exam", true);
    }

    if (payload?.search) {
      query = query.ilike("title", `%${payload.search}%`);
    }

    const { data: events, error } = await query;
    if (error) throw error;

    // Filter by class if specified
    let filtered = events || [];
    if (payload?.className && payload.className !== "All") {
      filtered = filtered.filter((ev: any) => {
        const classes = Array.isArray(ev.applicable_classes) ? ev.applicable_classes : [];
        return classes.includes("All") || classes.includes(payload.className);
      });
    }

    // Filter by month/year if specified
    if (payload?.year && payload?.month) {
      const targetPrefix = `${payload.year}-${String(payload.month).padStart(2, "0")}`;
      filtered = filtered.filter((ev: any) => ev.start_date?.startsWith(targetPrefix));
    }

    return { success: true, data: filtered };
  } catch (error: any) {
    console.error("Error in getSchoolCalendarEvents:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 2. CREATE NEW CALENDAR EVENT (BROADCAST ENGINE)
// -------------------------------------------------------------
export async function createCalendarEvent(payload: {
  campusId?: string;
  academicSession?: string;
  title: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  targetAudience?: "All" | "Class" | "Teachers" | "Parents" | "Students";
  applicableClasses?: string[];
  venue?: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isHoliday?: boolean;
  isExam?: boolean;
  holidayType?: string;
  reminderDaysBefore?: number[];
  notificationChannels?: string[];
  createdBy?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const eventRecord = {
      campus_id: resolvedCampusId,
      academic_session: payload.academicSession || "2026-2027",
      title: payload.title,
      event_type: payload.eventType,
      start_date: payload.startDate,
      end_date: payload.endDate || payload.startDate,
      start_time: payload.startTime || "09:00 AM",
      end_time: payload.endTime || "01:00 PM",
      target_audience: payload.targetAudience || "All",
      applicable_classes: payload.applicableClasses || ["All"],
      venue: payload.venue || "School Campus",
      description: payload.description || "",
      attachment_url: payload.attachmentUrl || null,
      attachment_name: payload.attachmentName || null,
      is_holiday: payload.isHoliday || payload.eventType.includes("Holiday"),
      is_exam: payload.isExam || payload.eventType.includes("Exam") || payload.eventType.includes("Assessment"),
      holiday_type: payload.holidayType || "Full Day",
      reminder_days_before: payload.reminderDaysBefore || [7, 3, 1, 0],
      notification_channels: payload.notificationChannels || ["App", "WhatsApp"],
      created_by: payload.createdBy || "School Administrator",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("school_calendar_events")
      .insert(eventRecord)
      .select()
      .single();

    if (error) throw error;

    safeRevalidate("/admin/calendar");
    safeRevalidate("/parent/academics");
    return {
      success: true,
      message: `Event "${payload.title}" broadcasted to ${payload.targetAudience || 'All'} calendar!`,
      data
    };
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2B. UPDATE EXISTING CALENDAR EVENT
// -------------------------------------------------------------
export async function updateCalendarEvent(payload: {
  id: string;
  campusId?: string;
  academicSession?: string;
  title: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  targetAudience?: "All" | "Class" | "Teachers" | "Parents" | "Students";
  applicableClasses?: string[];
  venue?: string;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isHoliday?: boolean;
  isExam?: boolean;
  holidayType?: string;
  reminderDaysBefore?: number[];
  notificationChannels?: string[];
  updatedBy?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const updateRecord = {
      title: payload.title,
      event_type: payload.eventType,
      start_date: payload.startDate,
      end_date: payload.endDate || payload.startDate,
      start_time: payload.startTime || "09:00 AM",
      end_time: payload.endTime || "01:00 PM",
      target_audience: payload.targetAudience || "All",
      applicable_classes: payload.applicableClasses || ["All"],
      venue: payload.venue || "School Campus",
      description: payload.description || "",
      attachment_url: payload.attachmentUrl || null,
      attachment_name: payload.attachmentName || null,
      is_holiday: payload.isHoliday ?? (payload.eventType.includes("Holiday") || payload.eventType.includes("🏖")),
      is_exam: payload.isExam ?? (payload.eventType.includes("Exam") || payload.eventType.includes("Assessment") || payload.eventType.includes("📚")),
      holiday_type: payload.holidayType || "Full Day",
      reminder_days_before: payload.reminderDaysBefore || [7, 3, 1, 0],
      notification_channels: payload.notificationChannels || ["App", "WhatsApp"],
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("school_calendar_events")
      .update(updateRecord)
      .eq("id", payload.id)
      .select()
      .single();

    if (error) throw error;

    safeRevalidate("/admin/calendar");
    safeRevalidate("/parent/academics");
    return {
      success: true,
      message: `Event "${payload.title}" successfully updated!`,
      data
    };
  } catch (error: any) {
    console.error("Error updating calendar event:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. DELETE CALENDAR EVENT
// -------------------------------------------------------------
export async function deleteCalendarEvent(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("school_calendar_events").delete().eq("id", id);
    if (error) throw error;

    safeRevalidate("/admin/calendar");
    safeRevalidate("/parent/academics");
    return { success: true, message: "Event removed successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. GET PARENT APP SPECIFIC EVENTS
// -------------------------------------------------------------
export async function getParentChildCalendarEvents(payload: {
  campusId?: string;
  studentGrade?: string;
  year?: number;
  month?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);
    const grade = payload.studentGrade || "Grade 5";

    const { data: events, error } = await supabase
      .from("school_calendar_events")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .eq("status", "Active")
      .or("target_audience.eq.All,target_audience.eq.Parents,target_audience.eq.Class")
      .order("start_date", { ascending: true });

    if (error) throw error;

    // Filter relevant only to child's grade or school-wide
    const relevant = (events || []).filter((ev: any) => {
      const classes = Array.isArray(ev.applicable_classes) ? ev.applicable_classes : [];
      return classes.includes("All") || classes.includes(grade);
    });

    return { success: true, data: relevant };
  } catch (error: any) {
    console.error("Error in getParentChildCalendarEvents:", error);
    return { success: false, error: error.message, data: [] };
  }
}
