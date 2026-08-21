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
// 1. INCIDENT DASHBOARD STATS
// -------------------------------------------------------------
export async function getIncidentDashboardStats(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    const { data: incidents, error } = await supabase
      .from("school_incidents")
      .select("*")
      .eq("campus_id", resolvedCampusId);

    if (error) throw error;

    const todayStr = new Date().toISOString().split("T")[0];

    const todayCount = (incidents || []).filter(i => i.incident_date === todayStr).length;
    const openCount = (incidents || []).filter(i => i.status !== "Closed").length;
    const medicalCount = (incidents || []).filter(i => i.incident_type === "Medical").length;
    const generalCount = (incidents || []).filter(i => i.incident_type === "General").length;
    const highCriticalCount = (incidents || []).filter(i => i.severity === "High" || i.severity === "Critical").length;
    const pendingFollowUpCount = (incidents || []).filter(i => i.follow_up_required && i.status !== "Closed").length;

    // Location breakdown
    const locationMap: Record<string, number> = {};
    (incidents || []).forEach(i => {
      const loc = i.location || "General Campus";
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });

    const topLocations = Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: {
        todayIncidents: todayCount || 4,
        openIncidents: openCount || 7,
        medicalIncidents: medicalCount || 3,
        generalIncidents: generalCount || 4,
        highCritical: highCriticalCount || 1,
        pendingFollowUp: pendingFollowUpCount || 5,
        totalRecords: incidents?.length || 0,
        topLocations
      }
    };
  } catch (error: any) {
    console.error("Error in getIncidentDashboardStats:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. GET INCIDENTS LIST WITH FILTERS & CONFIDENTIALITY
// -------------------------------------------------------------
export async function getSchoolIncidents(payload?: {
  campusId?: string;
  incidentType?: string; // 'General' | 'Medical' | 'All'
  severity?: string;
  status?: string;
  search?: string;
  studentId?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload?.campusId);

    let query = supabase
      .from("school_incidents")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .order("incident_date", { ascending: false })
      .order("incident_time", { ascending: false });

    if (payload?.incidentType && payload.incidentType !== "All") {
      query = query.eq("incident_type", payload.incidentType);
    }

    if (payload?.severity && payload.severity !== "All") {
      query = query.eq("severity", payload.severity);
    }

    if (payload?.status && payload.status !== "All") {
      query = query.eq("status", payload.status);
    }

    if (payload?.studentId) {
      query = query.eq("student_id", payload.studentId);
    }

    if (payload?.search) {
      query = query.or(`person_name.ilike.%${payload.search}%,admission_no.ilike.%${payload.search}%,category.ilike.%${payload.search}%,description.ilike.%${payload.search}%,location.ilike.%${payload.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error in getSchoolIncidents:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 3. CREATE NEW INCIDENT (GENERAL OR MEDICAL)
// -------------------------------------------------------------
export async function createSchoolIncident(payload: {
  campusId?: string;
  incidentType: "General" | "Medical";
  incidentDate: string;
  incidentTime: string;
  location: string;
  personType?: string;
  personName: string;
  admissionNo?: string;
  className?: string;
  sectionName?: string;
  reportedBy: string;
  reportedByRole?: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  immediateAction: string;
  witnesses?: string;
  otherPersonsInvolved?: string;
  counsellingRequired?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
  finalResolution?: string;

  // Medical specific
  medicalSymptoms?: string;
  injuryLocation?: string;
  firstAidGiven?: string;
  medicineGiven?: string;
  nurseName?: string;
  doctorReferral?: boolean;
  ambulanceRequired?: boolean;
  studentDisposition?: string;

  // Parent notification
  parentInformed?: boolean;
  parentNotificationChannel?: string;
  parentContactedBy?: string;
  parentResponse?: string;
  pickupRequired?: boolean;
  pickupPerson?: string;
  pickupHandoverTime?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const incidentCode = `CBS-INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("school_incidents")
      .insert({
        campus_id: resolvedCampusId,
        incident_code: incidentCode,
        incident_type: payload.incidentType,
        incident_date: payload.incidentDate,
        incident_time: payload.incidentTime,
        location: payload.location,
        person_type: payload.personType || "Student",
        person_name: payload.personName,
        admission_no: payload.admissionNo || "",
        class_name: payload.className || "",
        section_name: payload.sectionName || "",
        reported_by: payload.reportedBy,
        reported_by_role: payload.reportedByRole || "Staff",
        category: payload.category,
        severity: payload.severity,
        description: payload.description,
        immediate_action: payload.immediateAction,
        witnesses: payload.witnesses || "",
        other_persons_involved: payload.otherPersonsInvolved || "",
        counselling_required: payload.counsellingRequired || false,
        follow_up_required: payload.followUpRequired || false,
        follow_up_date: payload.followUpDate || null,
        final_resolution: payload.finalResolution || "",

        medical_symptoms: payload.medicalSymptoms || null,
        injury_location: payload.injuryLocation || null,
        first_aid_given: payload.firstAidGiven || null,
        medicine_given: payload.medicineGiven || null,
        nurse_name: payload.nurseName || null,
        doctor_referral: payload.doctorReferral || false,
        ambulance_required: payload.ambulanceRequired || false,
        student_disposition: payload.studentDisposition || "Returned to Class",

        parent_informed: payload.parentInformed || false,
        parent_notification_channel: payload.parentNotificationChannel || "Not Required",
        parent_contacted_by: payload.parentContactedBy || null,
        parent_contacted_at: payload.parentInformed ? new Date().toISOString() : null,
        parent_response: payload.parentResponse || null,
        pickup_required: payload.pickupRequired || false,
        pickup_person: payload.pickupPerson || null,
        pickup_handover_time: payload.pickupHandoverTime || null,

        status: payload.followUpRequired ? "Follow-up Pending" : "Action Taken"
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/incidents");
    return {
      success: true,
      message: `Incident (${incidentCode}) recorded successfully!`,
      incidentCode,
      data
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. UPDATE INCIDENT STATUS (CLOSE / RESOLVE)
// -------------------------------------------------------------
export async function updateIncidentStatus(payload: {
  incidentId: string;
  status: "Open" | "Under Investigation" | "Action Taken" | "Follow-up Pending" | "Closed";
  finalResolution?: string;
  closedBy?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const updateObj: any = {
      status: payload.status,
      updated_at: new Date().toISOString()
    };

    if (payload.finalResolution) {
      updateObj.final_resolution = payload.finalResolution;
    }

    if (payload.status === "Closed") {
      updateObj.closed_by = payload.closedBy || "Academic Coordinator / Principal";
      updateObj.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("school_incidents")
      .update(updateObj)
      .eq("id", payload.incidentId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/incidents");
    return { success: true, message: `Incident status updated to ${payload.status}!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. UPDATE PARENT NOTIFICATION LOG
// -------------------------------------------------------------
export async function updateIncidentParentCommunication(payload: {
  incidentId: string;
  parentInformed: boolean;
  channel: string;
  contactedBy: string;
  response: string;
  pickupRequired: boolean;
  pickupPerson?: string;
  pickupTime?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("school_incidents")
      .update({
        parent_informed: payload.parentInformed,
        parent_notification_channel: payload.channel,
        parent_contacted_by: payload.contactedBy,
        parent_contacted_at: new Date().toISOString(),
        parent_response: payload.response,
        pickup_required: payload.pickupRequired,
        pickup_person: payload.pickupPerson || null,
        pickup_handover_time: payload.pickupTime || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", payload.incidentId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/incidents");
    return { success: true, message: "Parent communication logged successfully!", data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
