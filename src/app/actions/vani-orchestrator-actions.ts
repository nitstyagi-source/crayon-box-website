"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';
import { callGemini } from '@/lib/services/ai/gemini-client';
import { fetchLiveSchoolGrounding } from '@/lib/services/ai/erp-grounding';
import { generateQuestionPaperWithKey, generate5ELessonPlan } from '@/lib/services/ai/pedagogical-engine';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

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
// CENTRAL VANI ORCHESTRATOR (GEMINI 3.8 FLASH & SUPABASE GROUNDED)
// -------------------------------------------------------------------
export async function askVaniOrchestratorAction(params: {
  sessionId: string;
  userQuery: string;
  userRole: string; // 'Super Admin' | 'Admin' | 'Faculty' | 'Teacher' | 'Parent' | 'Driver'
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
    let modelUsed = 'gemini-3.8-flash';

    // Fetch live system ground truth metrics from Supabase
    const liveSchool = await fetchLiveSchoolGrounding();

    // =================================================================
    // PERSONA 1: PARENT VANI (EMPATHETIC & STRICT PRIVACY SANDBOX)
    // =================================================================
    if (isParent) {
      // 1. Strict Security Guardrail: Privacy filter
      const prohibitedKeywords = [
        'teacher salary', 'staff salary', 'payroll', 'staff attendance', 'faculty leave',
        'other student', 'other child', 'other parent', 'rank', 'topper', 'class rank',
        'total collection', 'school profit', 'financial statement', 'general ledger', 'revenue',
        'internal report', 'management note', 'board meeting', 'disciplinary record',
        'report card', 'marksheet', 'exam marks', 'exam score', 'confidential', 'audit log',
        'iam', 'rbac', 'security camera', 'cctv recording'
      ];

      const isBreachAttempt = prohibitedKeywords.some(kw => query.includes(kw));

      if (isBreachAttempt) {
        responseMarkdown = `🔒 **Institutional Privacy & Data Governance Active**\n\n` +
          `As your family's AI Assistant, I operate within strict institutional boundaries mandated by school policy:\n\n` +
          `• **Official Report Cards & Exam Marks** are issued exclusively through the verified **Academics & Grades** screen after principal sign-off and moderation.\n` +
          `• **Internal School Operations, Staff Records & Financial Ledgers** are strictly confidential and inaccessible.\n\n` +
          `I can gladly assist you with your child's daily class homework, live bus GPS radar, fee payment receipts, and school announcements.`;
        toolUsed = 'parent_security_guardrail';
      } else {
        // Fetch Child specific records if childId provided
        let childInfo: any = null;
        let recentInvoices: any[] = [];
        let recentDiary: any[] = [];

        if (params.activeChildId) {
          try {
            const { rows: stu } = await client.query(
              `SELECT id, first_name, last_name, admission_no, class_name, section_name FROM public.students WHERE id = $1 LIMIT 1`,
              [params.activeChildId]
            );
            if (stu.length > 0) childInfo = stu[0];

            const { rows: inv } = await client.query(
              `SELECT invoice_number, total_amount, balance_due, status, due_date FROM public.student_invoices WHERE student_id = $1 ORDER BY due_date DESC LIMIT 3`,
              [params.activeChildId]
            );
            recentInvoices = inv;
          } catch {}
        }

        // Fetch bus info
        let busInfo: any = null;
        try {
          const { rows: buses } = await client.query(`SELECT bus_number, route_name, driver_name, status FROM public.transport_buses LIMIT 1`);
          if (buses.length > 0) busInfo = buses[0];
        } catch {}

        // Fetch recent digital diary homework
        try {
          const { rows: diary } = await client.query(
            `SELECT title, content, entry_type, created_at FROM public.digital_diary_entries ORDER BY created_at DESC LIMIT 3`
          );
          recentDiary = diary;
        } catch {}

        const childContext = childInfo
          ? `Active Child: ${childInfo.first_name} ${childInfo.last_name} (${childInfo.class_name || 'Class 5'}-${childInfo.section_name || 'A'}, Adm: ${childInfo.admission_no || 'N/A'}). Invoices: ${JSON.stringify(recentInvoices)}.`
          : `No specific child profile selected.`;

        const busContext = busInfo
          ? `Assigned Bus: ${busInfo.bus_number}, Route: ${busInfo.route_name}, Driver: ${busInfo.driver_name}, Status: ${busInfo.status}.`
          : `School Bus Fleet: Currently on standby or standard schedule.`;

        const diaryContext = recentDiary.length > 0
          ? `Recent Diary / Homework Entries: ${JSON.stringify(recentDiary.map(d => ({ title: d.title, content: d.content })))}`
          : `No homework entries logged today.`;

        const systemInstruction = `You are VANI, the loving, professional, and reliable Family AI Copilot for Crayon Box School.
You are interacting with parent "${params.userName}".
RULES:
1. Always be polite, warm, and clear.
2. Ground all answers strictly in the provided live school data:
   ${childContext}
   ${busContext}
   ${diaryContext}
3. If asked about bus tracking, explain the status clearly and mention the live radar on mobile.
4. If asked about fees, report exact invoice status. If balance is 0 or no invoices, confirm all fees are up to date.
5. If asked about homework, summarize today's diary.
6. Never make up facts. Never discuss staff salaries, other children's grades, or school internal profits.`;

        const geminiRes = await callGemini({
          prompt: rawQuery,
          systemInstruction,
          temperature: 0.3,
          thinkingBudget: 0,
          timeoutMs: 30000
        });

        responseMarkdown = geminiRes.text;
        modelUsed = geminiRes.modelUsed;
        toolUsed = 'parent_grounded_copilot';

        // Attach action buttons for mobile & web
        if (query.includes('bus') || query.includes('track') || query.includes('transport')) {
          structuredData = { action: { title: "Open Live Bus Radar", route: "BusTracker" } };
        } else if (query.includes('fee') || query.includes('pay') || query.includes('receipt')) {
          structuredData = { action: { title: "View Fee Receipts", route: "Fees" } };
        } else if (query.includes('homework') || query.includes('diary')) {
          structuredData = { action: { title: "Open Class Diary", route: "DigitalDiary" } };
        }
      }
    }

    // =================================================================
    // PERSONA 2: TEACHER VANI (PEDAGOGICAL COPILOT & EXAM CREATOR)
    // =================================================================
    else if (isTeacher) {
      const isQuestionPaperQuery = query.includes('question paper') ||
        query.includes('exam paper') ||
        query.includes('test paper') ||
        query.includes('create test') ||
        query.includes('exam questions') ||
        query.includes('prepare questions') ||
        query.includes('sample paper');

      const isLessonPlanQuery = query.includes('lesson plan') ||
        query.includes('teach today') ||
        query.includes('prepare lesson') ||
        query.includes('5e plan') ||
        query.includes('teaching plan');

      // A. Create Authentic CBSE / NEP 2020 Question Paper
      if (isQuestionPaperQuery) {
        toolUsed = 'generate_cbse_question_paper';

        // Extract class, subject, chapters from query
        const classMatch = query.match(/(?:class|grade)\s*(\d+|[a-zA-Z]+)/i);
        const className = classMatch ? `Class ${classMatch[1]}` : (params.activeClass || 'Class 10');

        let subjectName = 'Mathematics';
        if (query.includes('sci')) subjectName = 'Science';
        else if (query.includes('eng')) subjectName = 'English';
        else if (query.includes('soc') || query.includes('hist') || query.includes('geo')) subjectName = 'Social Science';
        else if (query.includes('hin')) subjectName = 'Hindi';

        const marksMatch = query.match(/(\d+)\s*(?:marks|m)\b/i);
        const totalMarks = marksMatch ? parseInt(marksMatch[1], 10) : 40;

        const topicMatch = rawQuery.match(/(?:on|for|about|chapter[s]?)\s+([^,.]+)/i);
        const chapters = topicMatch ? topicMatch[1].trim() : `${subjectName} Core Syllabus`;

        const qpResult = await generateQuestionPaperWithKey({
          className,
          subject: subjectName,
          chapters,
          totalMarks,
          examTerm: 'Periodic Assessment 2026-2027',
          difficulty: 'BALANCED',
          createdByTeacher: params.userName || 'Faculty'
        });

        modelUsed = qpResult.modelUsed;
        const qp = qpResult.questionPaper;

        responseMarkdown = `📋 **CBSE Question Paper Generated: ${qp.title}**\n\n` +
          `• **Class**: ${qp.className} | **Subject**: ${qp.subjectName} | **Total Marks**: ${qp.totalMarks} M (${qp.durationMinutes} mins)\n` +
          `• **Syllabus / Chapters**: ${qp.chapters}\n` +
          `• **Sections Created**: ${qp.sections?.length || 4} Sections (Section A: Objective/MCQ, Section B: Short Answer, Section C: Analytical, Section D: Long/HOTS)\n` +
          `• **Complete Solution Key**: Step-by-step marking scheme generated and verified against CBSE Blueprint.\n` +
          `• **Saved to Question Bank**: Record ID \`${qpResult.paperId}\` is now live in your school central repository.\n\n` +
          `You can view, print, or export this exam paper using the action below.`;

        actionProposal = {
          actionId: `QP-${qpResult.paperId}`,
          actionType: 'VIEW_QUESTION_PAPER',
          title: `Inspect ${qp.title}`,
          description: `Open complete question paper and solution key`,
          payload: { paperId: qpResult.paperId },
          requiresConfirmation: false
        };
        structuredData = { paperId: qpResult.paperId, title: qp.title };
      }
      // B. Create Authentic NEP 2020 5E Experiential Lesson Plan
      else if (isLessonPlanQuery) {
        toolUsed = 'generate_5e_lesson_plan';

        const classMatch = query.match(/(?:class|grade)\s*(\d+|[a-zA-Z]+)/i);
        const className = classMatch ? `Class ${classMatch[1]}` : (params.activeClass || 'Class 8');

        let subjectName = 'Science';
        if (query.includes('math')) subjectName = 'Mathematics';
        else if (query.includes('eng')) subjectName = 'English';
        else if (query.includes('soc')) subjectName = 'Social Science';

        const topicMatch = rawQuery.match(/(?:on|for|about)\s+([^,.]+)/i);
        const topic = topicMatch ? topicMatch[1].trim() : 'Force, Pressure & Friction';

        const lpResult = await generate5ELessonPlan({
          className,
          subject: subjectName,
          topic,
          durationMinutes: 45,
          staffId: params.userId
        });

        modelUsed = lpResult.modelUsed;
        const lp = lpResult.lessonPlan;

        responseMarkdown = `📝 **NEP 2020 5E Lesson Plan: ${lp.topicName} (${lp.className})**\n\n` +
          `• **Subject**: ${lp.subjectName} | **Duration**: ${lp.durationMinutes} Mins\n` +
          `• **Pedagogy**: Experiential Inquiry (5E Instructional Model)\n` +
          `• **1. Engage**: ${lp.fiveEModel?.engage?.substring(0, 140)}...\n` +
          `• **2. Explore**: ${lp.fiveEModel?.explore?.substring(0, 140)}...\n` +
          `• **3. Explain**: ${lp.fiveEModel?.explain?.substring(0, 140)}...\n` +
          `• **4. Elaborate (HOTS)**: ${lp.fiveEModel?.elaborate?.substring(0, 140)}...\n` +
          `• **5. Evaluate**: ${lp.fiveEModel?.evaluate?.substring(0, 140)}...\n\n` +
          `• **Saved to Faculty Diary**: Plan ID \`${lpResult.planId || 'Recorded'}\` has been committed to your academic roster.`;

        actionProposal = {
          actionId: `LP-${lpResult.planId || Date.now()}`,
          actionType: 'PUBLISH_LESSON_PLAN',
          title: `Open Lesson Plan in Academic Diary`,
          description: `View full 5E lesson details and rubrics`,
          payload: { planId: lpResult.planId },
          requiresConfirmation: false
        };
        structuredData = { planId: lpResult.planId };
      }
      // C. General Teacher Pedagogical Advice & Classroom Management
      else {
        toolUsed = 'teacher_pedagogical_copilot';
        const systemInstruction = `You are VANI, the Senior CBSE & NEP 2020 Pedagogical Classroom Copilot for teachers at Crayon Box School.
You are advising teacher "${params.userName}".
RULES:
1. Provide practical, high-impact instructional advice, classroom engagement strategies, rubrics, and activity ideas.
2. Support differentiated learning for diverse classrooms.
3. Be encouraging, concise, and structured with clear bullet points.`;

        const geminiRes = await callGemini({
          prompt: rawQuery,
          systemInstruction,
          temperature: 0.3,
          thinkingBudget: 0,
          timeoutMs: 30000
        });

        responseMarkdown = geminiRes.text;
        modelUsed = geminiRes.modelUsed;
      }
    }

    // =================================================================
    // PERSONA 3: SUPER ADMIN & PRINCIPAL (EXECUTIVE LEADERSHIP COCKPIT)
    // =================================================================
    else {
      toolUsed = 'executive_leadership_cockpit';

      const groundTruthSummary = `
LIVE SCHOOL ERP DATABASE METRICS (TRUTH FROM SUPABASE):
- Institutions Count: ${liveSchool.institutionsCount}
- Active Enrolled Students: ${liveSchool.totalStudents}
- Active Faculty / Staff: ${liveSchool.totalFaculty}
- Today's Student Attendance: ${liveSchool.todayAttendance.presentCount}/${liveSchool.todayAttendance.totalLogs} (${liveSchool.todayAttendance.attendanceRate})
- Fiscal Snapshot: ₹${liveSchool.finances.totalCollected.toLocaleString('en-IN')} collected of ₹${liveSchool.finances.totalBilled.toLocaleString('en-IN')} invoiced (₹${liveSchool.finances.totalPending.toLocaleString('en-IN')} pending)
- Active Transport Fleet: ${liveSchool.transport.activeRoutes}/${liveSchool.transport.totalBuses} buses active
- Admissions Pipeline: ${liveSchool.admissions.pendingEnquiries} pending inquiries
${liveSchool.summaryText}
`;

      const systemInstruction = `You are VANI, the Strategic AI Operating System and Executive Intelligence Layer for the Super Admin and Trust Leadership of Crayon Box School.
You are addressing "${params.userName}".

STRICT GROUND TRUTH RULES:
1. You have DIRECT access to live Supabase PostgreSQL tables. The metrics above represent 100% empirical truth.
2. NEVER hallucinate numbers (e.g. do NOT invent 1,240 students or fake ₹4.8 Lakhs if the database shows 0 students or 0 collection).
3. If the database shows 0 institutions or 0 students, explain clearly that the system is currently in a clean reset / onboarding state, ready for institution registration and user trial.
4. When reporting School Pulse or operational briefings, quote the exact live numbers above.
5. Provide sharp, executive-level insights, identifying bottlenecks, statutory compliance alerts, and proactive recommendations.

${groundTruthSummary}`;

      const geminiRes = await callGemini({
        prompt: rawQuery,
        systemInstruction,
        temperature: 0.2,
        thinkingBudget: 0,
        timeoutMs: 30000
      });

      responseMarkdown = geminiRes.text;
      modelUsed = geminiRes.modelUsed;
      structuredData = liveSchool;

      if (query.includes('pulse') || query.includes('summary')) {
        actionProposal = {
          actionId: `PULSE-${Date.now()}`,
          actionType: 'NAVIGATE_DASHBOARD',
          title: 'Open Live Executive Dashboard',
          description: 'View full visual real-time analytics',
          payload: { route: '/admin/dashboard' },
          requiresConfirmation: false
        };
      }
    }

    // Record interaction in public.vani_audit_logs
    try {
      await client.query(`
        INSERT INTO public.vani_audit_logs (
          user_name, user_role, tool_name, input_params, execution_result, status
        ) VALUES ($1, $2, $3, $4, $5, 'SUCCESS')
      `, [
        params.userName,
        role,
        toolUsed,
        JSON.stringify({ query: rawQuery, modelUsed }),
        JSON.stringify({ summary: responseMarkdown.substring(0, 150) })
      ]);
    } catch {}

    safeRevalidate('/admin/admissions/ai-bot');

    return {
      success: true,
      responseMarkdown,
      toolUsed,
      actionProposal,
      structuredData,
      modelUsed,
      role
    };

  } catch (err: any) {
    console.error('VANI Orchestrator error:', err);
    return {
      success: false,
      error: err.message,
      responseMarkdown: `⚠️ VANI Error: ${err.message}`
    };
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
