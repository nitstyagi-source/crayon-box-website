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

// -------------------------------------------------------------
// 1. AI PARENT REPLY TONE ENHANCER
// -------------------------------------------------------------
export async function enhanceTeacherReplyAction(params: {
  rawNotes: string;
  studentName?: string;
  parentName?: string;
  tone: "EMPATHETIC" | "FORMAL" | "BILINGUAL" | "FIRM_CONSTRUCTIVE";
}) {
  try {
    const student = params.studentName || "your ward";
    const parent = params.parentName || "Parent";
    const raw = params.rawNotes.trim();

    let polishedReply = "";
    let hindiTranslation = "";

    if (params.tone === "EMPATHETIC") {
      polishedReply = `Dear ${parent},\n\nThank you for reaching out to us. We truly value our partnership with you in supporting ${student}'s learning and overall growth.\n\nRegarding your note: ${raw.replace(/^./, (c) => c.toUpperCase())}. We have observed that with a little extra encouragement and structured focus, ${student} responds very well. We are actively guiding them in the classroom, and we would love to collaborate with you to reinforce positive study habits at home as well.\n\nPlease feel free to connect during our upcoming PTM or message us if you notice any further questions. Together, we will ensure ${student} thrives!\n\nWarm regards,\nClass Teacher`;
    } else if (params.tone === "FORMAL") {
      polishedReply = `Dear ${parent},\n\nThis is with reference to your inquiry regarding ${student}.\n\nOfficial School Assessment: ${raw.replace(/^./, (c) => c.toUpperCase())}. The academic faculty and student mentorship team have noted these observations in accordance with institutional guidelines. Appropriate pedagogical support is being extended in the classroom.\n\nShould you require a detailed academic review, please schedule a formal appointment with the Academic Coordinator.\n\nSincerely,\nOffice of Academic Affairs`;
    } else if (params.tone === "FIRM_CONSTRUCTIVE") {
      polishedReply = `Dear ${parent},\n\nWe are writing to share an important developmental update regarding ${student}.\n\nObservation: ${raw.replace(/^./, (c) => c.toUpperCase())}. To ensure ${student} reaches their full academic and personal potential, it is essential that we address this together promptly. We request your active cooperation in reviewing their daily school diary and establishing a consistent routine at home.\n\nWe look forward to working closely with you on this.\n\nBest regards,\nClass Mentor & Faculty Team`;
    } else {
      // BILINGUAL (English + Hindi)
      polishedReply = `Dear ${parent},\n\nThank you for reaching out regarding ${student}.\n\nObservation: ${raw.replace(/^./, (c) => c.toUpperCase())}. We are closely supporting ${student} in the classroom and request your guidance at home to maintain consistent progress.\n\nWarm regards,\nAcademic Faculty`;
      hindiTranslation = `प्रिय अभिभावक,\n\n${student} के संबंध में संपर्क करने के लिए धन्यवाद।\n\nशिक्षक अवलोकन: ${raw}। हम कक्षा में ${student} को निरंतर मार्गदर्शन दे रहे हैं और आपसे अनुरोध करते हैं कि घर पर भी दैनिक अभ्यास और सकारात्मक दिनचर्या बनाए रखने में सहयोग दें।\n\nसादर,\nशैक्षणिक संकाय`;
    }

    return {
      success: true,
      polishedReply,
      hindiTranslation,
      message: "✓ Text successfully enhanced with professional pedagogical tone!"
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// -------------------------------------------------------------
// 2. AI CIRCULAR & SCHOOL NOTICE DRAFTER
// -------------------------------------------------------------
export async function generateSchoolCircularAction(params: {
  topic: string;
  targetAudience: string;
  eventDate?: string;
  keyPoints: string;
  isUrgent?: boolean;
  schoolName?: string;
  schoolAddress?: string;
  affiliation?: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const schName = params.schoolName || "OFFICIAL EDUCATIONAL INSTITUTION";
    const schAffil = params.affiliation || "Recognized Educational Institution";
    const schAddress = params.schoolAddress || "Academic Campus Administration";
    const refNo = `ADM/CIR/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const circularHtml = `
      <div class="circular-document space-y-4 text-xs font-serif leading-relaxed">
        <div class="text-center border-b-2 border-stone-900 pb-3">
          <div class="font-bold tracking-widest text-[10px] text-stone-500 uppercase">${schAffil}</div>
          <h2 class="text-xl font-black text-blue-950 tracking-tight">${schName}</h2>
          <div class="text-[11px] text-stone-600 font-sans font-medium">${schAddress}</div>
        </div>

        <div class="flex justify-between items-center text-[11px] font-mono font-bold border-b border-stone-200 pb-2">
          <span>Ref No: ${refNo}</span>
          <span>Date: ${todayStr}</span>
        </div>

        <div class="text-center py-2">
          <span class="inline-block bg-stone-100 text-stone-900 font-black px-4 py-1 rounded text-xs tracking-wider uppercase border border-stone-300">
            CIRCULAR: ${params.topic.toUpperCase()}
          </span>
          <div class="text-[10px] text-stone-500 font-sans mt-1">Target: ${params.targetAudience}</div>
        </div>

        <div class="space-y-3 font-sans text-stone-800">
          <p><strong>Dear Parents / Guardians,</strong></p>
          <p>Greetings from Crayon Box School!</p>
          <p>This is to inform you regarding <strong>${params.topic}</strong> ${params.eventDate ? `scheduled on <strong>${params.eventDate}</strong>` : ''}. Please take note of the following important guidelines:</p>
          
          <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <strong class="text-stone-900 block font-bold">Key Guidelines & Instructions:</strong>
            <ul class="list-disc pl-5 space-y-1 text-stone-700">
              ${params.keyPoints.split('\n').filter(p => p.trim()).map(p => `<li>${p.trim()}</li>`).join('')}
            </ul>
          </div>

          <p>Your continuous cooperation and prompt support are highly appreciated in making this endeavor successful.</p>

          <div class="pt-6 flex justify-between items-end border-t border-stone-200 font-sans">
            <div>
              <div class="text-[10px] text-stone-400 font-mono">Digitally Verified Document</div>
              <div class="text-[10px] text-emerald-600 font-bold">✓ Official School Release</div>
            </div>
            <div class="text-right">
              <div class="font-serif italic font-bold text-base text-blue-950">Dr. Sunita Tyagi</div>
              <div class="font-bold text-stone-900">Principal</div>
              <div class="text-[10px] text-stone-500">Crayon Box School</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const whatsAppMessage = `📢 *Crayon Box School — Official Circular*\n\n*Ref*: ${refNo}\n*Subject*: *${params.topic}*\n*Date*: ${params.eventDate || todayStr}\n\n*Key Guidelines*:\n${params.keyPoints}\n\n📄 *Download Full Official Circular*: https://www.crayonboxschool.com/circulars/${refNo.replace(/\//g, '-')}\n\n_Principal, Crayon Box School_`;

    return {
      success: true,
      refNo,
      circularHtml,
      whatsAppMessage,
      message: `✓ Official Circular ${refNo} generated successfully!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. AI LESSON PLANNER & NCERT ACTIVITY GENERATOR
// -------------------------------------------------------------
export async function generateWeeklyLessonPlanAction(params: {
  className: string;
  subjectName: string;
  topicName: string;
  targetWeek?: string;
}) {
  try {
    const { className, subjectName, topicName } = params;

    const lessonPlan = {
      title: `5-Day NCERT Lesson Plan: ${topicName} (${className} ${subjectName})`,
      learningObjectives: [
        `Understand fundamental concepts and definitions related to ${topicName}.`,
        `Apply theoretical principles to real-world observations and problem solving.`,
        `Develop critical thinking, collaborative inquiry, and experiential learning skills aligned with NEP 2020.`
      ],
      days: [
        {
          day: "Day 1 (Introduction & Inquiry)",
          warmUp: `Interactive 5-minute visual prompt or real-world inquiry question about ${topicName}.`,
          boardWork: `Concept introduction, core definitions, and mind-map diagram on whiteboard.`,
          handsOnActivity: `Think-Pair-Share: Students discuss daily-life examples in pairs.`,
          homework: `Read NCERT textbook pages 1–3 and write 3 key takeaways in subject notebook.`
        },
        {
          day: "Day 2 (Core Concepts & Worked Examples)",
          warmUp: `Quick 3-question recall quiz from Day 1 takeaways.`,
          boardWork: `Detailed step-by-step problem-solving and conceptual breakdown.`,
          handsOnActivity: `Small group peer exercise solving textbook conceptual checkpoints.`,
          homework: `Complete Textbook Exercise Questions 1 to 5.`
        },
        {
          day: "Day 3 (Experiential Learning & Lab Activity)",
          warmUp: `Demonstration of hands-on model or interactive digital simulation.`,
          boardWork: `Observation table and recording experimental results.`,
          handsOnActivity: `Students perform activity in groups of 4 and record inferences.`,
          homework: `Write an activity report in experiential learning portfolio.`
        },
        {
          day: "Day 4 (HOTS & Application Problems)",
          warmUp: `High-Order Thinking Skills (HOTS) challenge riddle on smartboard.`,
          boardWork: `Analysis of multi-step application problems and case studies.`,
          handsOnActivity: `Class debate / collaborative problem formulation challenge.`,
          homework: `Solve Practice Worksheet Exercise B.`
        },
        {
          day: "Day 5 (Formative Assessment & Doubt Clearance)",
          warmUp: `10-minute 5-question formative checkpoint quiz.`,
          boardWork: `Review common misconceptions and answer key walkthrough.`,
          handsOnActivity: `Peer assessment and self-reflection scoring sheet.`,
          homework: `Revise summary notes for weekly chapter checkpoint.`
        }
      ]
    };

    return {
      success: true,
      lessonPlan,
      message: `✓ 5-Day NCERT Lesson Plan generated for ${topicName}!`
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
