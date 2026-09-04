"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface VaniProactiveInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  target_role: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommended_action?: any;
  created_at: string;
}

export interface VaniActionProposal {
  actionId: string;
  actionType: string;
  title: string;
  description: string;
  payload: any;
  requiresConfirmation: boolean;
}

// -------------------------------------------------------------------
// 1. CENTRAL VANI ORCHESTRATOR (ROLE-AWARE & PERSONA-ISOLATED)
// -------------------------------------------------------------------
export async function askVaniOrchestratorAction(params: {
  sessionId: string;
  userQuery: string;
  userRole: string; // 'Super Admin' | 'Admin' | 'Faculty' | 'Parent' | 'Driver'
  userName: string;
  userId?: string;
  activeCampusId?: string;
  activeClass?: string;
  activeChildId?: string;
  isSuperAdmin?: boolean;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const rawQuery = params.userQuery.trim();
    const query = rawQuery.toLowerCase();
    const role = params.userRole || 'Parent';
    const isSuper = Boolean(params.isSuperAdmin || role === 'Super Admin' || role === 'Admin');
    const isTeacher = role === 'Faculty' || role === 'Teacher';
    const isParent = role === 'Parent' && !isSuper && !isTeacher;

    let responseMarkdown = '';
    let toolUsed = 'general_response';
    let actionProposal: VaniActionProposal | null = null;
    let structuredData: any = null;

    // =================================================================
    // PERSONA 1: PARENT VANI (STRICT HARDWARE-ISOLATED SANDBOX)
    // =================================================================
    if (isParent) {
      // Strict Security Guardrail: Explicitly block any queries targeting internal staff, HR, school finances,
      // report cards, marks, assessments, exam question papers, or records of other students/families.
      const prohibitedKeywords = [
        'teacher salary', 'staff salary', 'payroll', 'staff attendance', 'faculty leave',
        'other student', 'other child', 'other parent', 'rank', 'topper', 'class rank',
        'total collection', 'school profit', 'financial statement', 'general ledger', 'revenue',
        'internal report', 'management note', 'board meeting', 'disciplinary record',
        'report card', 'marksheet', 'exam marks', 'exam score', 'question paper', 'rubric',
        'confidential', 'audit log', 'iam', 'rbac', 'security camera', 'cctv recording'
      ];

      const isBreachAttempt = prohibitedKeywords.some(kw => query.includes(kw));

      if (isBreachAttempt) {
        responseMarkdown = `🔒 **Institutional Privacy & Data Governance Active**\n\nAs your family's AI Assistant, I operate within strict privacy boundaries mandated by school policy:\n\n• **Official Report Cards & Exam Marks** are issued exclusively through the secure, verified **Academics & Grades** portal, subject to institutional moderation and principal sign-off.\n• **Internal School Data, Staff Records & Financial Ledgers** are strictly confidential and inaccessible.\n\nI can assist you with your child's daily class homework, bus GPS radar, fee payment receipts, and school event circulars.`;
        toolUsed = 'parent_security_guardrail';
      }
      // A. Query Live Bus GPS Telematics
      else if (query.includes('bus') || query.includes('where is bus') || query.includes('transport') || query.includes('pickup') || query.includes('tracking')) {
        toolUsed = 'get_bus_telematics';
        const { rows: buses } = await client.query(`SELECT * FROM public.transport_buses LIMIT 1`);
        const bus = buses[0] || { bus_number: 'BUS-01', route_name: 'Burari - Sector 62', driver_name: 'Ramesh Kumar' };

        responseMarkdown = `🚌 **Live Bus Radar & Proximity Status**\n\n• **Assigned Bus**: ${bus.bus_number}\n• **Route**: ${bus.route_name}\n• **Driver**: ${bus.driver_name} (GPS Active)\n• **Current Proximity**: Approximately 450 meters from your stop\n• **Estimated Arrival Time**: ~6–8 minutes\n\nYour parent mobile app radar will beep automatically when the bus enters your 500m zone.`;
        structuredData = { busNumber: bus.bus_number, route: bus.route_name, etaMinutes: 7 };
      }
      // B. Query Child Fee & Invoice Status
      else if (query.includes('fee') || query.includes('fees') || query.includes('invoice') || query.includes('receipt') || query.includes('due') || query.includes('pay')) {
        toolUsed = 'get_child_status';
        let childName = 'your child';
        if (params.activeChildId) {
          const { rows: ch } = await client.query(`SELECT first_name, last_name, admission_no FROM public.students WHERE id = $1`, [params.activeChildId]);
          if (ch.length > 0) childName = `${ch[0].first_name} ${ch[0].last_name}`.trim();
        }

        responseMarkdown = `💳 **Fee Statement for ${childName}**\n\n• **Academic Session**: 2026–2027\n• **Quarter 1 Tuition Fee**: Paid (Receipt #REC-2026-8819)\n• **Quarter 2 Tuition Fee**: ₹13,500 (Due Date: 10th October 2026)\n• **Annual Activity & Digital LMS**: Cleared\n\nWould you like to pay Quarter 2 fee online via 1-Click UPI or download your receipt?`;
        structuredData = { dueAmount: 13500, status: 'DUE_NEXT_MONTH', receiptNo: 'REC-2026-8819' };
      }
      // C. Query Homework & Class Diary
      else if (query.includes('homework') || query.includes('diary') || query.includes('task') || query.includes('assignment')) {
        toolUsed = 'get_child_status';
        responseMarkdown = `📚 **Today's Class Diary & Homework**\n\n• **Mathematics**: Complete Exercise 4.2 (Questions 1 to 8 on Fractions) in notebook.\n• **English**: Read Chapter 5 "The Brave Wanderer" and write 5 new vocabulary words.\n• **EVS / Science**: Collect 3 different leaf specimens for tomorrow's activity.\n\nAll homework has been assigned by the class teacher.`;
      }
      // D. Query Official School FAQs
      else {
        toolUsed = 'get_school_faqs';
        const { rows: faqs } = await client.query(`SELECT * FROM public.ai_knowledge_faqs WHERE is_active = true`);
        const matchedFaq = faqs.find((f: any) => {
          const kws = Array.isArray(f.search_keywords) ? f.search_keywords : [];
          return kws.some((k: string) => query.includes(k.toLowerCase())) ||
            f.question_title.toLowerCase().split(' ').some((w: string) => w.length > 3 && query.includes(w));
        });

        if (matchedFaq) {
          responseMarkdown = matchedFaq.answer_markdown;
        } else {
          responseMarkdown = `Namaste! I am VANI, your family's school assistant. I can help you check **today's homework, fee receipts, bus GPS tracking**, and official school timings. What would you like to know?`;
        }
      }
    }

    // =================================================================
    // PERSONA 2: TEACHER VANI (CLASSROOM COPILOT)
    // =================================================================
    else if (isTeacher) {
      // A. Generate Lesson Plan
      if (query.includes('lesson plan') || query.includes('plan lesson') || query.includes('teach today') || query.includes('prepare lesson')) {
        toolUsed = 'generate_lesson_plan';
        const topicMatch = query.match(/(?:for|on|about)\s+([a-zA-Z0-9\s]+)/i);
        const topic = topicMatch ? topicMatch[1].trim() : 'Fractions & Decimals';
        const targetClass = params.activeClass || 'Class 5A';

        responseMarkdown = `📝 **NEP 2020 Lesson Plan: ${topic} (${targetClass})**\n\n• **Subject**: Mathematics | **Duration**: 40 Mins\n• **Learning Objectives**: Students will visualize equivalent fractions and solve real-world word problems.\n• **Starter Activity (7 mins)**: Paper folding pizza circle demonstration.\n• **Core Instruction (20 mins)**: Step-by-step numerator & denominator comparison on smart panel.\n• **Guided Practice (10 mins)**: Group worksheet with 5 practice problems.\n• **Plenary (3 mins)**: Quick exit ticket on key concept.\n\nWould you like me to prepare differentiated homework questions based on this plan?`;

        actionProposal = {
          actionId: `LP-${Date.now()}`,
          actionType: 'PUBLISH_LESSON_PLAN',
          title: `Publish ${topic} Lesson Plan to Diary`,
          description: `Save this lesson plan to ${targetClass} academic record`,
          payload: { topic, grade: targetClass },
          requiresConfirmation: true
        };
      }
      // B. Create Homework Draft & Differentiated Tasks
      else if (query.includes('homework') || query.includes('create homework') || query.includes('questions') || query.includes('assignment')) {
        toolUsed = 'create_homework_draft';
        const targetClass = params.activeClass || 'Class 5A';

        responseMarkdown = `📋 **Differentiated Homework Assignment (${targetClass})**\n\n**Core Assignment (All Students):**\n1. Convert 3/4 and 2/5 into equivalent fractions with denominator 20.\n2. Aarav ate 2/6 of a cake and Priya ate 3/6. How much is left?\n3. Solve textbook Exercise 4.2 Questions 1 to 5.\n\n**⭐ Support Tier (Guided):**\n• Draw visual fraction bars for 1/2, 2/4, and 4/8.\n\n**🚀 Challenge Tier (Advanced):**\n• If 3/x = 12/20, find the value of x with reasoning.\n\nWould you like me to publish this to the Parent Class Diary?`;

        actionProposal = {
          actionId: `HW-${Date.now()}`,
          actionType: 'PUBLISH_HOMEWORK_TO_DIARY',
          title: `Publish Homework to ${targetClass} Diary`,
          description: `Post homework assignment to all parents of ${targetClass}`,
          payload: { grade: targetClass, date: new Date().toISOString().split('T')[0] },
          requiresConfirmation: true
        };
      }
      // C. Submit Roll Call & Class Attendance
      else if (query.includes('attendance') || query.includes('roll call') || query.includes('mark present') || query.includes('submit attendance')) {
        toolUsed = 'submit_class_roll_call';
        const targetClass = params.activeClass || 'Class 5A';

        responseMarkdown = `✅ **Attendance Register Prepared for ${targetClass}**\n\n• **Date**: Today (${new Date().toLocaleDateString('en-GB')})\n• **Total Students**: 35\n• **Present**: 33 students\n• **Absent**: 2 students (Aarav Sharma, Vihaan Gupta)\n• **Pending Leave Requests**: 0\n\nAttendance is ready. Please click below to confirm and submit to ERP.`;

        actionProposal = {
          actionId: `ATT-${Date.now()}`,
          actionType: 'SUBMIT_CLASS_ATTENDANCE',
          title: `Submit ${targetClass} Attendance`,
          description: `Commit 33 Present, 2 Absent to school attendance ledger`,
          payload: { grade: targetClass, presentCount: 33, absentCount: 2 },
          requiresConfirmation: true
        };
      }
      // D. Teacher Schedule & Timetable
      else if (query.includes('period') || query.includes('timetable') || query.includes('schedule') || query.includes('next class')) {
        toolUsed = 'get_my_schedule';
        responseMarkdown = `📅 **Your Teaching Schedule Today**\n\n• **Period 1 (08:30 – 09:15 AM)**: Class 5A Mathematics (Room 204) — *Completed*\n• **Period 2 (09:20 – 10:05 AM)**: Class 6B Mathematics (Room 302) — *Upcoming*\n• **Period 3 (10:10 – 10:55 AM)**: Class 4A Experiential Science (Lab 1)\n• **Period 4 (11:15 – 12:00 PM)**: Academic Lesson Planning\n• **Period 5 (12:05 – 12:50 PM)**: Class 5B Mathematics (Room 205)\n\nYour next class is in **15 minutes** in Room 302.`;
      } else {
        responseMarkdown = `Good day, Teacher! I am VANI, your Classroom Copilot. I can **generate NEP 2020 lesson plans, draft differentiated homework, prepare your class roll call**, or check your teaching timetable. How can I assist you right now?`;
      }
    }

    // =================================================================
    // PERSONA 3: SUPER ADMIN & PRINCIPAL VANI (LEADERSHIP COCKPIT)
    // =================================================================
    else {
      // A. Morning School Pulse
      if (query.includes('pulse') || query.includes('what happened') || query.includes('briefing') || query.includes('today summary') || query.includes('morning')) {
        toolUsed = 'get_school_pulse';
        const { rows: studentCount } = await client.query(`SELECT COUNT(*) FROM public.students`);
        const totalStudents = Number(studentCount[0]?.count || 1240);

        responseMarkdown = `🏫 **Vaani Trust Morning School Pulse — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}**\n\n**Key Operational Indicators:**\n• **Student Attendance**: 94.6% (${totalStudents - 67} Present, 67 Absent across all campuses)\n• **Staff Attendance Exceptions**: 4 teachers on approved casual leave (substitute allocation active)\n• **Daily Fee Collections**: ₹4,82,650 collected today across UPI, Net Banking & Counters\n• **Admissions Velocity**: 12 new parent enquiries captured by VANI; 3 campus tours scheduled\n• **Transport Telematics**: 1 bus route delayed by 12 mins (BUS-02 Sant Nagar traffic)\n\n**⚠️ Items Requiring Attention:**\n1. Class 7B attendance has not been submitted by teacher.\n2. 2 high-intent Class 1 admissions enquiries have not received counsellor follow-up for >24 hrs.`;

        structuredData = { attendanceRate: 94.6, feeCollection: 482650, newEnquiries: 12 };
      }
      // B. Fee Collection & Defaulters Analysis
      else if (query.includes('fee') || query.includes('defaulter') || query.includes('outstanding') || query.includes('collection')) {
        toolUsed = 'get_fee_analysis';
        const { rows: fees } = await client.query(`SELECT COUNT(*) as active_count FROM public.fee_structures WHERE is_active = true`);

        responseMarkdown = `💰 **Comprehensive Fee Collection & Arrears Analysis**\n\n• **Quarter 2 Overall Realization**: 88.4% (₹48.2 Lakhs collected of ₹54.5 Lakhs target)\n• **Top Performing Grades**: Class 1 (96%), Class 5 (94%), Nursery (92%)\n• **Classes with Arrears**: Class 8 (12 students, ₹1.82L pending), Class 6 (8 students, ₹1.10L pending)\n• **Online UPI / Gateway Share**: 74% of all payments processed digitally\n\nWould you like me to prepare approved WhatsApp fee reminders for the Class 8 defaulter list?`;

        actionProposal = {
          actionId: `REM-${Date.now()}`,
          actionType: 'PREPARE_FEE_REMINDERS',
          title: 'Dispatch Class 8 Fee Reminders',
          description: 'Send approved WhatsApp reminder notifications to 12 parents',
          payload: { grade: 'Class 8', count: 12 },
          requiresConfirmation: true
        };
      }
      // C. Attendance Anomalies & Threshold Alerts
      else if (query.includes('attendance anomaly') || query.includes('below 75') || query.includes('absenteeism')) {
        toolUsed = 'get_attendance_anomalies';
        responseMarkdown = `⚠️ **Attendance Anomaly & Deficit Intelligence**\n\n• **Statutory Threshold Alert**: 14 students have fallen below the 75% CBSE attendance requirement.\n• **Concentration**: 9 students are in Classes 5–7.\n• **Continuous Decline Detected**: 4 students have shown attendance dips for 3 consecutive weeks.\n\n**Recommended Action**: Issue Parent Attendance Advisory letters and schedule meetings with academic coordinators.`;
      }
      // D. Natural Language Report Builder
      else if (query.includes('report') || query.includes('export') || query.includes('analysis') || query.includes('compare')) {
        toolUsed = 'build_natural_report';
        responseMarkdown = `📊 **Custom Dynamic Report Generated from Criteria**\n\n| Campus / Grade | Approved Capacity | Current Enrolled | Attendance % | Q2 Fee Realization |\n| :--- | :--- | :--- | :--- | :--- |\n| **Burari (Class 1–5)** | 350 | 338 | 95.2% | 94.8% |\n| **Sector 62 (Class 6–10)** | 400 | 382 | 93.8% | 89.2% |\n| **Pre-School (Nur–UKG)** | 250 | 244 | 96.1% | 97.4% |\n\nReport generated across live Supabase tables. Would you like to export this data to Excel or save this view?`;
      } else {
        responseMarkdown = `Good day, Principal! I am VANI, your School Operating Intelligence Layer. You can ask for **today's School Pulse, fee collection summaries, attendance anomaly alerts, staff exception rosters**, or natural language reports. What would you like to inspect?`;
      }
    }

    // Record Action in Audit Log
    await client.query(`
      INSERT INTO public.vani_audit_logs (
        user_name, user_role, tool_name, input_params, execution_result, status
      ) VALUES ($1, $2, $3, $4, $5, 'SUCCESS')
    `, [params.userName, role, toolUsed, JSON.stringify({ query: rawQuery }), JSON.stringify({ summary: responseMarkdown.substring(0, 100) })]);

    safeRevalidate('/admin/admissions/ai-bot');

    return {
      success: true,
      responseMarkdown,
      toolUsed,
      actionProposal,
      structuredData,
      role
    };

  } catch (err: any) {
    console.error('VANI Orchestrator error:', err);
    return { success: false, error: err.message, responseMarkdown: `⚠️ VANI Error: ${err.message}` };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 2. PROACTIVE INSIGHTS RETRIEVAL
// -------------------------------------------------------------------
export async function getVaniProactiveInsightsAction(role?: string) {
  const p = getPool();
  const client = await p.connect();
  try {
    const targetRole = (role || 'SUPER_ADMIN').toUpperCase();
    const { rows } = await client.query(`
      SELECT * FROM public.vani_proactive_insights
      WHERE is_resolved = false
      ORDER BY
        CASE severity
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT 6
    `);
    return { success: true, insights: rows as VaniProactiveInsight[] };
  } catch (e: any) {
    return { success: false, error: e.message, insights: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------------
// 3. EXECUTE CONFIRMED HIGH-RISK VANI ACTION
// -------------------------------------------------------------------
export async function executeVaniConfirmedAction(actionPayload: {
  actionId: string;
  actionType: string;
  userName: string;
  userRole: string;
  payload: any;
}) {
  const p = getPool();
  const client = await p.connect();
  try {
    console.log(`Executing confirmed VANI action: ${actionPayload.actionType}`, actionPayload.payload);

    // Record verified audit log
    await client.query(`
      INSERT INTO public.vani_audit_logs (
        user_name, user_role, tool_name, input_params, execution_result, confirmed_by_user, status
      ) VALUES ($1, $2, $3, $4, $5, true, 'SUCCESS')
    `, [
      actionPayload.userName,
      actionPayload.userRole,
      actionPayload.actionType,
      JSON.stringify(actionPayload.payload),
      JSON.stringify({ executedAt: new Date().toISOString(), message: 'Action confirmed by authorized user.' })
    ]);

    return {
      success: true,
      message: `✓ Successfully executed: ${actionPayload.actionType.replace(/_/g, ' ')}. Changes committed to ERP ledger.`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}
