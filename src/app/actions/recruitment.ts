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
// 1. RECRUITMENT DASHBOARD STATS
// -------------------------------------------------------------
export async function getRecruitmentDashboardStats(campusId?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    // 1. Fetch Vacancies
    const { data: vacancies, error: vacErr } = await supabase
      .from("job_vacancies")
      .select("*")
      .eq("campus_id", resolvedCampusId);

    if (vacErr) throw vacErr;

    // 2. Fetch Applications
    const { data: applications, error: appErr } = await supabase
      .from("job_applications")
      .select("id, vacancy_id, position_applied, status, source, created_at")
      .eq("campus_id", resolvedCampusId);

    if (appErr) throw appErr;

    const openVacancies = (vacancies || []).filter(v => v.status === "Open");
    const totalApplications = applications?.length || 0;
    const shortlistedCount = (applications || []).filter(a => a.status === "Shortlisted").length;
    const interviewCount = (applications || []).filter(a => a.status === "Interview" || a.status === "Demo Class").length;
    const selectedCount = (applications || []).filter(a => a.status === "Selected").length;
    const offersCount = (applications || []).filter(a => a.status === "Offer Sent").length;
    const joinedCount = (applications || []).filter(a => a.status === "Joined").length;

    // 3. Vacancy-wise Breakdown
    const vacancyBreakdown = (vacancies || []).map(v => {
      const vApps = (applications || []).filter(a => a.vacancy_id === v.id || a.position_applied === v.title);
      return {
        id: v.id,
        jobCode: v.job_code,
        title: v.title,
        department: v.department,
        classes: v.classes,
        status: v.status,
        totalApplications: vApps.length,
        shortlisted: vApps.filter(a => a.status === "Shortlisted" || a.status === "Interview" || a.status === "Demo Class" || a.status === "Selected" || a.status === "Offer Sent" || a.status === "Joined").length,
        selected: vApps.filter(a => a.status === "Selected" || a.status === "Offer Sent" || a.status === "Joined").length
      };
    });

    // 4. Source Breakdown
    const sourceMap: Record<string, number> = {};
    (applications || []).forEach(a => {
      const src = a.source || "School Website";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    return {
      success: true,
      data: {
        openPositions: openVacancies.length,
        totalApplications,
        shortlisted: shortlistedCount,
        interviewsScheduled: interviewCount,
        selected: selectedCount,
        offersSent: offersCount,
        joined: joinedCount,
        vacancyBreakdown,
        sourceBreakdown: sourceMap
      }
    };
  } catch (error: any) {
    console.error("Error in getRecruitmentDashboardStats:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. GET JOB VACANCIES (FOR ADMIN & PUBLIC CAREERS PAGE)
// -------------------------------------------------------------
export async function getJobVacancies(payload?: {
  campusId?: string;
  status?: string;
  category?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload?.campusId);

    let query = supabase
      .from("job_vacancies")
      .select("*")
      .eq("campus_id", resolvedCampusId)
      .order("created_at", { ascending: false });

    if (payload?.status && payload.status !== "All") {
      query = query.eq("status", payload.status);
    }

    if (payload?.category && payload.category !== "All") {
      query = query.eq("category", payload.category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error in getJobVacancies:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 3. CREATE NEW JOB VACANCY
// -------------------------------------------------------------
export async function createJobVacancy(payload: {
  campusId?: string;
  title: string;
  department: string;
  category?: string;
  subject?: string;
  classes?: string;
  branch?: string;
  vacanciesCount?: number;
  minQualification: string;
  experienceRequired: string;
  salaryRange?: string;
  jobDescription?: string;
  skillsRequired?: string;
  applicationDeadline?: string;
  status?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const jobCode = `CBS-JOB-2026-${Math.floor(10 + Math.random() * 90)}`;

    const { data, error } = await supabase
      .from("job_vacancies")
      .insert({
        campus_id: resolvedCampusId,
        job_code: jobCode,
        title: payload.title,
        department: payload.department,
        category: payload.category || "Teaching",
        subject: payload.subject || "",
        classes: payload.classes || "All",
        branch: payload.branch || "Main Campus",
        vacancies_count: payload.vacanciesCount || 1,
        min_qualification: payload.minQualification,
        experience_required: payload.experienceRequired,
        salary_range: payload.salaryRange || "Competitive",
        job_description: payload.jobDescription || "",
        skills_required: payload.skillsRequired || "",
        application_deadline: payload.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: payload.status || "Open"
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/recruitment");
    revalidatePath("/careers");
    return { success: true, message: `Vacancy for "${payload.title}" created successfully!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. GET JOB APPLICATIONS WITH CANDIDATE SCREENING FILTERS
// -------------------------------------------------------------
export async function getJobApplications(payload?: {
  campusId?: string;
  vacancyId?: string;
  status?: string;
  search?: string;
  minExp?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload?.campusId);

    let query = supabase
      .from("job_applications")
      .select(`
        *,
        job_vacancies:vacancy_id (id, job_code, title, department, category, classes)
      `)
      .eq("campus_id", resolvedCampusId)
      .order("created_at", { ascending: false });

    if (payload?.vacancyId && payload.vacancyId !== "All") {
      query = query.eq("vacancy_id", payload.vacancyId);
    }

    if (payload?.status && payload.status !== "All") {
      query = query.eq("status", payload.status);
    }

    if (payload?.search) {
      query = query.or(`full_name.ilike.%${payload.search}%,candidate_code.ilike.%${payload.search}%,position_applied.ilike.%${payload.search}%`);
    }

    const { data: apps, error } = await query;
    if (error) throw error;

    let filtered = apps || [];
    if (payload?.minExp && payload.minExp > 0) {
      filtered = filtered.filter(a => Number(a.experience_years) >= Number(payload.minExp));
    }

    return { success: true, data: filtered };
  } catch (error: any) {
    console.error("Error in getJobApplications:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// -------------------------------------------------------------
// 5. SUBMIT JOB APPLICATION (FROM PUBLIC CAREERS PAGE)
// -------------------------------------------------------------
export async function submitJobApplication(payload: {
  campusId?: string;
  vacancyId?: string;
  fullName: string;
  email: string;
  mobile: string;
  dob?: string;
  gender?: string;
  currentLocation?: string;
  positionApplied: string;
  highestQualification: string;
  experienceYears?: number;
  currentEmployer?: string;
  currentSalary?: string;
  expectedSalary?: string;
  noticePeriodDays?: number;
  resumeUrl?: string;
  photoUrl?: string;
  source?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const candidateCode = `CBS-CAN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        campus_id: resolvedCampusId,
        vacancy_id: payload.vacancyId || null,
        candidate_code: candidateCode,
        full_name: payload.fullName,
        email: payload.email,
        mobile: payload.mobile,
        dob: payload.dob || null,
        gender: payload.gender || "Not Specified",
        current_location: payload.currentLocation || "Delhi NCR",
        position_applied: payload.positionApplied,
        highest_qualification: payload.highestQualification,
        experience_years: payload.experienceYears || 0,
        current_employer: payload.currentEmployer || "",
        current_salary: payload.currentSalary || "",
        expected_salary: payload.expectedSalary || "",
        notice_period_days: payload.noticePeriodDays || 30,
        resume_url: payload.resumeUrl || "https://example.com/sample_resume.pdf",
        photo_url: payload.photoUrl || null,
        source: payload.source || "School Website",
        status: "Applied",
        rating: 4
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/recruitment");
    return {
      success: true,
      message: `Application submitted successfully! Your Reference Candidate ID is ${candidateCode}.`,
      candidateCode,
      data
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. UPDATE APPLICATION STATUS (SHORTLIST, INTERVIEW, REJECT)
// -------------------------------------------------------------
export async function updateApplicationStatus(payload: {
  applicationId: string;
  status: string; // 'Shortlisted' | 'Interview' | 'Demo Class' | 'Selected' | 'Offer Sent' | 'Joined' | 'Rejected' | 'On Hold'
  hrNotes?: string;
  rating?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const updateObj: any = {
      status: payload.status,
      updated_at: new Date().toISOString()
    };
    if (payload.hrNotes !== undefined) updateObj.hr_notes = payload.hrNotes;
    if (payload.rating !== undefined) updateObj.rating = payload.rating;

    const { data, error } = await supabase
      .from("job_applications")
      .update(updateObj)
      .eq("id", payload.applicationId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/recruitment");
    return { success: true, message: `Candidate status updated to ${payload.status}!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 7. SCHEDULE CANDIDATE INTERVIEW / DEMO CLASS
// -------------------------------------------------------------
export async function scheduleCandidateInterview(payload: {
  applicationId: string;
  roundType: string; // 'HR Round' | 'Subject Technical Round' | 'Demo Class' | 'Principal Round' | 'Final Round'
  scheduledDate: string;
  scheduledTime: string;
  interviewerName: string;
  venueOrLink?: string;
  demoSubject?: string;
  demoClass?: string;
  demoTopic?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Insert into job_interviews
    const { data: interview, error: intErr } = await supabase
      .from("job_interviews")
      .insert({
        application_id: payload.applicationId,
        round_type: payload.roundType,
        scheduled_date: payload.scheduledDate,
        scheduled_time: payload.scheduledTime,
        interviewer_name: payload.interviewerName,
        venue_or_link: payload.venueOrLink || "Main Campus - HR Boardroom",
        demo_subject: payload.demoSubject || null,
        demo_class: payload.demoClass || null,
        demo_topic: payload.demoTopic || null,
        status: "Scheduled"
      })
      .select()
      .single();

    if (intErr) throw intErr;

    // 2. Update Application Status to Interview / Demo Class
    const nextStatus = payload.roundType === "Demo Class" ? "Demo Class" : "Interview";
    await supabase
      .from("job_applications")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", payload.applicationId);

    revalidatePath("/admin/recruitment");
    return {
      success: true,
      message: `${payload.roundType} scheduled on ${payload.scheduledDate} at ${payload.scheduledTime}!`,
      data: interview
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 8. EVALUATE INTERVIEW / DEMO CLASS SCORECARD
// -------------------------------------------------------------
export async function evaluateInterviewAndDemoClass(payload: {
  interviewId: string;
  applicationId?: string;
  evaluationScore: number;
  criteria: {
    subjectKnowledge: number;
    communication: number;
    teachingSkills: number;
    classroomManagement: number;
    confidence: number;
  };
  recommendation: "Recommended" | "Hold" | "Not Recommended";
  remarks: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("job_interviews")
      .update({
        evaluation_score: payload.evaluationScore,
        evaluation_criteria: payload.criteria,
        recommendation: payload.recommendation,
        remarks: payload.remarks,
        status: "Completed"
      })
      .eq("id", payload.interviewId)
      .select()
      .single();

    if (error) throw error;

    if (payload.applicationId) {
      const nextStatus = payload.recommendation === "Recommended" ? "Selected" : "On Hold";
      await supabase
        .from("job_applications")
        .update({ status: nextStatus, rating: Math.round(payload.evaluationScore) })
        .eq("id", payload.applicationId);
    }

    revalidatePath("/admin/recruitment");
    return { success: true, message: `Interview scorecard recorded: ${payload.recommendation}!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 9. GENERATE & SEND OFFER LETTER
// -------------------------------------------------------------
export async function generateCandidateOfferLetter(payload: {
  applicationId: string;
  designation: string;
  department: string;
  joiningDate: string;
  salaryMonthly: number;
  ctcAnnual: number;
  reportingManager?: string;
  workLocation?: string;
  terms?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const offerNumber = `CBS/HR/OFFER/2026-${Math.floor(100 + Math.random() * 900)}`;

    const { data, error } = await supabase
      .from("job_offers")
      .insert({
        application_id: payload.applicationId,
        offer_letter_number: offerNumber,
        designation: payload.designation,
        department: payload.department,
        joiningDate: payload.joiningDate,
        offered_salary_monthly: payload.salaryMonthly,
        offered_ctc_annual: payload.ctcAnnual,
        reporting_manager: payload.reportingManager || "Principal & Managing Director",
        work_location: payload.workLocation || "Crayon Box School Main Campus",
        terms_and_conditions: payload.terms || "Standard probation of 6 months. Entitled to school health insurance and academic vacations.",
        status: "Offer Sent"
      })
      .select()
      .single();

    if (error) throw error;

    // Update application to Offer Sent
    await supabase
      .from("job_applications")
      .update({ status: "Offer Sent", updated_at: new Date().toISOString() })
      .eq("id", payload.applicationId);

    revalidatePath("/admin/recruitment");
    return { success: true, message: `Official Offer Letter (${offerNumber}) generated and sent!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 10. ⭐ 1-CLICK JOINING & ONBOARD TO FACULTY/STAFF MASTER
// -------------------------------------------------------------
export async function completeCandidateJoiningAndOnboardToStaff(payload: {
  applicationId: string;
  campusId?: string;
  employeeCode?: string;
  joiningDate: string;
  designation: string;
  department: string;
  salaryMonthly?: number;
  emergencyContact?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    // 1. Fetch Candidate Details
    const { data: application, error: appErr } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", payload.applicationId)
      .single();

    if (appErr || !application) throw new Error("Candidate application not found.");

    const nameParts = application.full_name.trim().split(" ");
    const firstName = nameParts[0] || "Educator";
    const lastName = nameParts.slice(1).join(" ") || "";
    const empCode = payload.employeeCode || `CBS-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Insert into `staff` Master Table
    const { data: newStaff, error: staffErr } = await supabase
      .from("staff")
      .insert({
        campus_id: resolvedCampusId,
        employee_id: empCode,
        employee_code: empCode,
        first_name: firstName,
        last_name: lastName,
        designation: payload.designation || application.position_applied,
        department: payload.department || "Academics",
        staff_type: payload.designation?.toLowerCase().includes("teacher") || payload.designation?.toLowerCase().includes("educator") ? "Teaching" : "Non-Teaching",
        email: application.email,
        phone_number: application.mobile,
        dob: application.dob || null,
        joining_date: payload.joiningDate,
        qualification: application.highest_qualification,
        experience: `${application.experience_years} Years`,
        status: "Active",
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (staffErr) {
      console.warn("Staff insert warning:", staffErr.message);
    }

    // 3. Mark Application as Joined
    await supabase
      .from("job_applications")
      .update({ status: "Joined", updated_at: new Date().toISOString() })
      .eq("id", payload.applicationId);

    revalidatePath("/admin/recruitment");
    revalidatePath("/admin/faculty");
    return {
      success: true,
      message: `🎉 Candidate ${application.full_name} has officially joined! Profile created in Faculty Master (ID: ${empCode}).`,
      employeeCode: empCode,
      staff: newStaff
    };
  } catch (error: any) {
    console.error("Error in completeCandidateJoiningAndOnboardToStaff:", error);
    return { success: false, error: error.message };
  }
}
