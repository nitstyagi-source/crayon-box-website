"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";

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
// 1. GET FACULTY LIST WITH ID CARD STATUSES
// -------------------------------------------------------------
export async function getFacultyForIdCardGeneration(
  campusId?: string,
  filters?: {
    session?: string;
    department?: string;
    designation?: string;
    category?: string;
    status?: string;
    search?: string;
  }
) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, campusId);

    let query = supabase
      .from("staff")
      .select(`
        id, campus_id, employee_id, employee_code,
        first_name, middle_name, last_name, gender, dob, blood_group,
        email, official_email, phone_number, personal_mobile, emergency_contact,
        photo_url, designation, department, wing, employee_category, employment_type,
        role, is_leadership, status, is_active, joining_date, subjects_taught,
        id_cards (
          id, card_number, card_type, qr_token, template_type,
          academic_session, issue_date, expiry_date, status,
          reprint_count, printed_at, printed_by, generated_by,
          previous_card_number, blocked_reason, blocked_at, created_at
        )
      `)
      .eq("campus_id", resolvedCampusId);

    // Search query filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,employee_id.ilike.%${q}%,employee_code.ilike.%${q}%,designation.ilike.%${q}%,department.ilike.%${q}%`
      );
    }

    const { data: staffList, error } = await query.order("first_name", { ascending: true });
    if (error) throw error;

    // Filter in-memory for flexible multi-dimensional filtering
    let processed = (staffList || []).map((staff: any) => {
      // Find active faculty ID card
      const facultyCards = (staff.id_cards || []).filter((c: any) => c.card_type === "Faculty");
      const activeCard = facultyCards.find((c: any) => c.status === "Active") || facultyCards[0] || null;

      const fullName = [staff.first_name, staff.middle_name, staff.last_name].filter(Boolean).join(" ");
      const empCode = staff.employee_code || staff.employee_id || `CBS-${staff.id.substring(0, 4).toUpperCase()}`;

      // Live Card Status Logic
      let computedCardStatus: "Active" | "Pending" | "Blocked" | "Expired" | "Replaced" | "Resigned" = "Pending";
      if (staff.status === "Resigned" || !staff.is_active) {
        computedCardStatus = "Resigned";
      } else if (activeCard) {
        if (activeCard.status === "Blocked") computedCardStatus = "Blocked";
        else if (activeCard.status === "Replaced") computedCardStatus = "Replaced";
        else if (activeCard.expiry_date && new Date(activeCard.expiry_date) < new Date()) computedCardStatus = "Expired";
        else computedCardStatus = "Active";
      }

      return {
        id: staff.id,
        campusId: staff.campus_id,
        employeeId: staff.employee_id || empCode,
        employeeCode: empCode,
        fullName,
        firstName: staff.first_name,
        lastName: staff.last_name || "",
        gender: staff.gender || "Not Specified",
        dob: staff.dob,
        bloodGroup: staff.blood_group || "B+",
        email: staff.official_email || staff.email || "staff@crayonboxschool.com",
        phone: staff.personal_mobile || staff.phone_number || "+91 98111 02008",
        emergencyContact: staff.emergency_contact || "+91 98111 02008",
        photoUrl: staff.photo_url || null,
        designation: staff.designation || "Teaching Faculty",
        department: staff.department || "Academics",
        wing: staff.wing || "Primary Wing",
        employeeCategory: staff.employee_category || (staff.is_leadership ? "Leadership" : "Teaching"),
        employmentType: staff.employment_type || "Permanent",
        role: staff.role || "Teacher",
        isLeadership: staff.is_leadership || false,
        employmentStatus: staff.status || "Active",
        joiningDate: staff.joining_date || "2020-04-01",
        academicSession: activeCard?.academic_session || filters?.session || "2026–27",
        subjectsTaught: staff.subjects_taught || "Primary Curriculum",
        
        // Card Specific fields
        card: activeCard ? {
          id: activeCard.id,
          cardNumber: activeCard.card_number,
          qrToken: activeCard.qr_token,
          templateType: activeCard.template_type || "Standard Faculty",
          academicSession: activeCard.academic_session,
          issueDate: activeCard.issue_date,
          expiryDate: activeCard.expiry_date,
          status: activeCard.status,
          reprintCount: activeCard.reprint_count || 0,
          printedAt: activeCard.printed_at,
          printedBy: activeCard.printed_by,
          generatedBy: activeCard.generated_by,
          previousCardNumber: activeCard.previous_card_number,
          blockedReason: activeCard.blocked_reason
        } : null,
        computedCardStatus
      };
    });

    // 1. Department Filter
    if (filters?.department && filters.department !== "All") {
      processed = processed.filter(
        (s: any) => s.department?.toLowerCase() === filters.department?.toLowerCase()
      );
    }

    // 2. Designation Filter
    if (filters?.designation && filters.designation !== "All") {
      processed = processed.filter(
        (s: any) => s.designation?.toLowerCase().includes(filters.designation?.toLowerCase())
      );
    }

    // 3. Category Filter (Teaching vs Non-Teaching vs Leadership)
    if (filters?.category && filters.category !== "All") {
      if (filters.category === "Teaching") {
        processed = processed.filter((s: any) => !s.isLeadership && s.employeeCategory !== "Support" && s.employeeCategory !== "Admin");
      } else if (filters.category === "Non-Teaching") {
        processed = processed.filter((s: any) => s.employeeCategory === "Support" || s.employeeCategory === "Admin" || s.department === "Administration");
      } else if (filters.category === "Leadership") {
        processed = processed.filter((s: any) => s.isLeadership || s.designation?.toLowerCase().includes("principal") || s.designation?.toLowerCase().includes("director"));
      }
    }

    // 4. Status Filter (Active, Pending Card, Blocked, Resigned)
    if (filters?.status && filters.status !== "All") {
      if (filters.status === "Active") {
        processed = processed.filter((s: any) => s.computedCardStatus === "Active");
      } else if (filters.status === "Pending") {
        processed = processed.filter((s: any) => s.computedCardStatus === "Pending");
      } else if (filters.status === "Blocked") {
        processed = processed.filter((s: any) => s.computedCardStatus === "Blocked");
      } else if (filters.status === "Resigned") {
        processed = processed.filter((s: any) => s.computedCardStatus === "Resigned");
      }
    }

    return { success: true, data: processed };
  } catch (error: any) {
    console.error("Error in getFacultyForIdCardGeneration:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. BULK GENERATE FACULTY ID CARDS
// -------------------------------------------------------------
export async function generateFacultyIdCards(payload: {
  staffIds: string[];
  academicSession?: string;
  templateType?: string;
  generatedBy?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const session = payload.academicSession || "2026–27";
    const template = payload.templateType || "Standard Teacher";
    const generatedBy = payload.generatedBy || "School Administrator";

    const { data: staffMembers, error: fetchErr } = await supabase
      .from("staff")
      .select("*")
      .in("id", payload.staffIds);

    if (fetchErr) throw fetchErr;

    const generatedCards: any[] = [];

    for (const staff of staffMembers || []) {
      const empCode = staff.employee_code || staff.employee_id || `CBS-${staff.id.substring(0, 4).toUpperCase()}`;
      const cardNum = `CBS-FAC-${session.replace(/[^0-9]/g, "").substring(0, 4)}-${empCode}`;
      const qrToken = `CBS-FAC-VERIFY-${empCode}-${staff.id.substring(0, 8).toUpperCase()}`;

      const { data: card, error: upsertErr } = await supabase
        .from("id_cards")
        .upsert(
          {
            campus_id: staff.campus_id,
            staff_id: staff.id,
            card_type: "Faculty",
            card_number: cardNum,
            qr_token: qrToken,
            template_type: template,
            academic_session: session,
            issue_date: new Date().toISOString().split("T")[0],
            expiry_date: "2027-03-31",
            status: "Active",
            generated_by: generatedBy,
            designation_snapshot: staff.designation || "Faculty",
            department_snapshot: staff.department || "Academics",
            blood_group_snapshot: staff.blood_group || "B+",
            emergency_contact_snapshot: staff.emergency_contact || "+91 98111 02008"
          },
          { onConflict: "card_number" }
        )
        .select()
        .single();

      if (upsertErr) {
        console.error(`Error generating card for ${staff.first_name}:`, upsertErr);
      } else {
        generatedCards.push(card);
      }
    }

    revalidatePath("/admin/id-cards");
    revalidatePath("/admin/id-cards/faculty");
    return {
      success: true,
      message: `Successfully generated ${generatedCards.length} Faculty ID Cards for session ${session}!`,
      count: generatedCards.length
    };
  } catch (error: any) {
    console.error("Error in generateFacultyIdCards:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. GENERATE SINGLE FACULTY ID CARD
// -------------------------------------------------------------
export async function generateSingleFacultyIdCard(
  staffId: string,
  academicSession?: string,
  templateType?: string
) {
  return generateFacultyIdCards({
    staffIds: [staffId],
    academicSession,
    templateType
  });
}

// -------------------------------------------------------------
// 4. GENERATE TEMPORARY / GUEST FACULTY ID CARD
// -------------------------------------------------------------
export async function generateTemporaryFacultyCard(payload: {
  fullName: string;
  organization?: string;
  designation: string;
  department?: string;
  validFrom: string;
  validUntil: string;
  photoUrl?: string;
  authorizedBy: string;
  emergencyContact?: string;
  campusId?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const resolvedCampusId = await resolveCampusId(supabase, payload.campusId);

    const tempCode = `GUEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const cardNum = `CBS-TEMP-${new Date().getFullYear()}-${tempCode}`;
    const qrToken = `CBS-TEMP-VERIFY-${tempCode}-${Date.now().toString().slice(-6)}`;

    const { data: card, error } = await supabase
      .from("id_cards")
      .insert({
        campus_id: resolvedCampusId,
        card_number: cardNum,
        card_type: "Faculty",
        is_temporary: true,
        template_type: "Guest / Temporary Faculty",
        qr_token: qrToken,
        academic_session: "2026–27",
        issue_date: payload.validFrom,
        valid_from: payload.validFrom,
        valid_until: payload.validUntil,
        expiry_date: payload.validUntil,
        status: "Active",
        authorized_by: payload.authorizedBy,
        generated_by: payload.authorizedBy,
        designation_snapshot: payload.designation,
        department_snapshot: payload.department || payload.organization || "Visiting Faculty",
        emergency_contact_snapshot: payload.emergencyContact || "+91 98111 02008"
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/id-cards");
    revalidatePath("/admin/id-cards/faculty");
    return {
      success: true,
      message: `Issued Temporary Faculty ID ${cardNum} for ${payload.fullName} (Valid until ${payload.validUntil})`,
      data: card
    };
  } catch (error: any) {
    console.error("Error in generateTemporaryFacultyCard:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. REPORT LOST & ISSUE REPLACEMENT CARD
// -------------------------------------------------------------
export async function markCardLostAndIssueReplacement(
  staffId: string,
  oldCardId: string,
  reason?: string
) {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch old card and staff details
    const { data: oldCard } = await supabase.from("id_cards").select("*").eq("id", oldCardId).single();
    const { data: staff } = await supabase.from("staff").select("*").eq("id", staffId).single();

    if (!staff) throw new Error("Staff member record not found.");

    // 2. Mark Old Card as Replaced / Blocked
    await supabase
      .from("id_cards")
      .update({
        status: "Replaced",
        blocked_reason: reason || "Reported Lost by Employee",
        blocked_at: new Date().toISOString()
      })
      .eq("id", oldCardId);

    // 3. Issue Replacement Card with new QR and incremented reprint count
    const nextReprint = (oldCard?.reprint_count || 0) + 1;
    const empCode = staff.employee_code || staff.employee_id || `CBS-${staff.id.substring(0, 4).toUpperCase()}`;
    const newCardNum = `CBS-FAC-2026-${empCode}-R${nextReprint}`;
    const newQrToken = `CBS-FAC-VERIFY-${empCode}-R${nextReprint}-${Date.now().toString().slice(-6)}`;

    const { data: newCard, error: newCardErr } = await supabase
      .from("id_cards")
      .insert({
        campus_id: staff.campus_id,
        staff_id: staff.id,
        card_type: "Faculty",
        card_number: newCardNum,
        previous_card_number: oldCard?.card_number || "Initial Issue",
        qr_token: newQrToken,
        template_type: oldCard?.template_type || "Standard Teacher",
        academic_session: oldCard?.academic_session || "2026–27",
        issue_date: new Date().toISOString().split("T")[0],
        expiry_date: "2027-03-31",
        status: "Active",
        reprint_count: nextReprint,
        generated_by: "Admin Replacement",
        designation_snapshot: staff.designation,
        department_snapshot: staff.department,
        blood_group_snapshot: staff.blood_group,
        emergency_contact_snapshot: staff.emergency_contact
      })
      .select()
      .single();

    if (newCardErr) throw newCardErr;

    revalidatePath("/admin/id-cards");
    revalidatePath("/admin/id-cards/faculty");
    return {
      success: true,
      message: `Old Card (${oldCard?.card_number}) blocked. Replacement Card (${newCardNum}) issued successfully!`,
      data: newCard
    };
  } catch (error: any) {
    console.error("Error in markCardLostAndIssueReplacement:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. UPDATE CARD STATUS (ACTIVE / BLOCKED / EXPIRED)
// -------------------------------------------------------------
export async function updateFacultyCardStatus(
  cardId: string,
  status: "Active" | "Blocked" | "Expired" | "Replaced",
  reason?: string
) {
  try {
    const supabase = getSupabaseAdmin();
    const updateData: any = {
      status,
      blocked_reason: status === "Blocked" ? (reason || "Manually blocked by Administrator") : null,
      blocked_at: status === "Blocked" ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from("id_cards")
      .update(updateData)
      .eq("id", cardId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/id-cards");
    revalidatePath("/admin/id-cards/faculty");
    return { success: true, message: `Card status updated to ${status}!`, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 7. MARK CARDS AS PRINTED (AUDIT LOGGING)
// -------------------------------------------------------------
export async function markFacultyCardsPrinted(cardIds: string[], printedBy?: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("id_cards")
      .update({
        printed_at: new Date().toISOString(),
        printed_by: printedBy || "Admin Print Manager"
      })
      .in("id", cardIds);

    if (error) throw error;
    revalidatePath("/admin/id-cards/faculty");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 8. GENERATE QR CODE DATA URL FOR CARD RENDERING
// -------------------------------------------------------------
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 256,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });
    return url;
  } catch (err) {
    console.error("Error generating QR:", err);
    return "";
  }
}

// -------------------------------------------------------------
// 9. VERIFY FACULTY QR TOKEN (FOR GEOFENCE / SCAN GATEWAY)
// -------------------------------------------------------------
export async function verifyFacultyQrToken(qrToken: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: card, error } = await supabase
      .from("id_cards")
      .select(`
        *,
        staff:staff_id (
          id, employee_id, employee_code, first_name, last_name,
          designation, department, wing, photo_url, status, joining_date,
          official_email, personal_mobile, emergency_contact, blood_group
        )
      `)
      .eq("qr_token", qrToken)
      .single();

    if (error || !card) {
      return {
        success: false,
        verified: false,
        message: "Invalid or Unrecognized QR Code. Not issued by Crayon Box School."
      };
    }

    const staff = card.staff || {};
    const isStaffActive = staff.status === "Active" || staff.status === "Confirmed";
    const isCardActive = card.status === "Active";
    const isExpired = card.expiry_date && new Date(card.expiry_date) < new Date();

    const isVerified = isStaffActive && isCardActive && !isExpired;

    return {
      success: true,
      verified: isVerified,
      cardStatus: card.status,
      staffStatus: staff.status || "Unknown",
      isExpired,
      facultyProfile: {
        fullName: `${staff.first_name || ""} ${staff.last_name || ""}`.trim(),
        employeeId: staff.employee_id || staff.employee_code || card.card_number,
        designation: staff.designation || card.designation_snapshot,
        department: staff.department || card.department_snapshot,
        photoUrl: staff.photo_url,
        bloodGroup: staff.blood_group || card.blood_group_snapshot,
        session: card.academic_session,
        validUntil: card.expiry_date,
        branch: "Main Campus (Burari, Delhi)",
        schoolName: "Crayon Box School",
        schoolContact: "9811102008",
        schoolEmail: "crayonboxdelhi@gmail.com",
        udise: "07124100151"
      }
    };
  } catch (error: any) {
    return { success: false, verified: false, error: error.message };
  }
}
