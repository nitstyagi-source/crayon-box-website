import { callGemini } from './gemini-client';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export interface QuestionPaperParams {
  className: string;
  subject: string;
  chapters: string;
  totalMarks?: number;
  examTerm?: string;
  difficulty?: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'BALANCED';
  createdByTeacher?: string;
  campusId?: string;
}

export interface LessonPlanParams {
  className: string;
  subject: string;
  topic: string;
  durationMinutes?: number;
  staffId?: string;
  sectionName?: string;
}

/**
 * Format question paper sections into clean Markdown for print and display
 */
export function formatQuestionPaperMarkdown(qp: any): string {
  let md = `# ${qp.title || 'CBSE Examination'}\n`;
  md += `**Grade/Class:** ${qp.className} | **Subject:** ${qp.subjectName} | **Term:** ${qp.examTerm}\n`;
  md += `**Max Marks:** ${qp.totalMarks} | **Time Allowed:** ${qp.durationMinutes} Minutes | **Chapters:** ${qp.chapters}\n\n`;
  md += `---\n\n### General Instructions:\n`;
  if (Array.isArray(qp.generalInstructions)) {
    qp.generalInstructions.forEach((inst: string, idx: number) => {
      md += `${idx + 1}. ${inst}\n`;
    });
  }
  md += `\n---\n\n`;

  if (Array.isArray(qp.sections)) {
    qp.sections.forEach((sec: any) => {
      md += `### ${sec.title || sec.sectionCode}\n\n`;
      if (Array.isArray(sec.questions)) {
        sec.questions.forEach((q: any) => {
          md += `**Q${q.qNum}.** ${q.question} *[${q.marks} Mark${q.marks > 1 ? 's' : ''}]*\n\n`;
          if (q.options && Array.isArray(q.options)) {
            q.options.forEach((opt: string) => {
              md += `   • ${opt}\n`;
            });
            md += `\n`;
          }
        });
      }
      md += `\n`;
    });
  }

  md += `---\n\n## 🔑 Detailed Solution Key & Marking Scheme\n\n`;
  if (Array.isArray(qp.sections)) {
    qp.sections.forEach((sec: any) => {
      md += `### ${sec.title || sec.sectionCode} - Solutions\n\n`;
      if (Array.isArray(sec.questions)) {
        sec.questions.forEach((q: any) => {
          md += `**Q${q.qNum} Solution:**\n• **Answer:** ${q.answer}\n• **Marking Breakdown:** ${q.markingScheme}\n\n`;
        });
      }
    });
  }

  return md;
}

/**
 * 1. Generate CBSE / NEP 2020 Question Paper with Complete Marking Scheme
 * Automatically inserts into public.question_papers
 */
export async function generateQuestionPaperWithKey(params: QuestionPaperParams) {
  const {
    className,
    subject,
    chapters,
    totalMarks = 50,
    examTerm = 'Periodic Assessment',
    difficulty = 'BALANCED',
    createdByTeacher = 'AI Pedagogical Copilot',
    campusId = 'default'
  } = params;

  const durationMinutes = totalMarks <= 25 ? 45 : totalMarks <= 50 ? 90 : 180;

  const prompt = `You are a Senior CBSE & NEP 2020 Academic Curriculum Specialist and Chief Paper Setter.
Create an authentic Question Paper with Step-by-Step Marking Scheme / Solution Key.

SPECIFICATIONS:
- Class/Grade: ${className}
- Subject: ${subject}
- Chapters: ${chapters}
- Total Marks: ${totalMarks}
- Duration: ${durationMinutes} minutes
- Examination Term: ${examTerm}
- Difficulty: ${difficulty} (CBSE Bloom's: 20% Knowledge, 40% Understanding, 30% Application, 10% HOTS)

BLUEPRINT STRUCTURE:
Distribute the ${totalMarks} marks logically across:
- Section A: Objective / MCQs (1 Mark each)
- Section B: Very Short Answer (2 Marks each)
- Section C: Short Answer (3 Marks each)
- Section D: Long Answer (5 Marks each)
(Ensure questions sum EXACTLY to ${totalMarks} marks).

CRITICAL: Return ONLY valid, parseable JSON matching this schema:
{
  "title": "${className} ${subject} ${examTerm} (Session 2026-2027)",
  "className": "${className}",
  "subjectName": "${subject}",
  "examTerm": "${examTerm}",
  "totalMarks": ${totalMarks},
  "durationMinutes": ${durationMinutes},
  "chapters": "${chapters}",
  "generalInstructions": [
    "All questions are compulsory.",
    "Section A contains objective questions of 1 mark each.",
    "Section B contains short answer questions of 2 marks each.",
    "Section C contains short answer questions of 3 marks each.",
    "Section D contains long answer questions of 5 marks each."
  ],
  "sections": [
    {
      "sectionCode": "Section A",
      "title": "Section A: Objective Type Questions (1 Mark Each)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "qNum": 1,
          "question": "Question text here with options if MCQ",
          "type": "MCQ",
          "marks": 1,
          "answer": "Correct answer",
          "markingScheme": "1 mark for correct answer"
        }
      ]
    }
  ]
}`;

  const systemInstruction = `You are VANI's Master CBSE Paper Setter. Generate pedagogically rigorous questions adhering to NCERT syllabus and NEP 2020. Return pure JSON only.`;

  const aiResult = await callGemini({
    prompt,
    systemInstruction,
    temperature: 0.2,
    maxOutputTokens: 8192,
    jsonMode: true,
    timeoutMs: 45000
  });

  let parsed: any;
  try {
    const raw = aiResult.text.trim();
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Failed to parse Gemini question paper JSON:', err, aiResult.text.substring(0, 300));
    throw new Error('AI failed to produce valid question paper JSON');
  }

  const printableMd = formatQuestionPaperMarkdown(parsed);
  parsed.printableMarkdown = printableMd;

  // Insert into public.question_papers table
  const p = getPool();
  const client = await p.connect();
  try {
    const title = parsed.title || `${className} ${subject} Examination`;
    const sectionsData = {
      sections: parsed.sections || [],
      generalInstructions: parsed.generalInstructions || [],
      printableMarkdown: printableMd
    };
    const solutionKeyData = (parsed.sections || []).map((sec: any) => ({
      section: sec.sectionCode || sec.title,
      solutions: (sec.questions || []).map((q: any) => ({
        qNum: q.qNum,
        answer: q.answer,
        markingScheme: q.markingScheme
      }))
    }));

    const insertQuery = `
      INSERT INTO public.question_papers (
        campus_id,
        title,
        class_name,
        subject_name,
        exam_term,
        total_marks,
        duration_minutes,
        chapters,
        sections_data,
        solution_key_data,
        created_by_teacher
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, created_at;
    `;

    const { rows } = await client.query(insertQuery, [
      campusId,
      title,
      className,
      subject,
      examTerm,
      totalMarks,
      durationMinutes,
      chapters,
      JSON.stringify(sectionsData),
      JSON.stringify(solutionKeyData),
      createdByTeacher
    ]);

    const paperId = rows[0]?.id;
    return {
      success: true,
      paperId,
      questionPaper: parsed,
      printableMarkdown: printableMd,
      modelUsed: aiResult.modelUsed
    };
  } finally {
    client.release();
  }
}

/**
 * 2. Generate NEP 2020 5E Experiential Lesson Plan
 * Automatically inserts into public.staff_lesson_plans
 */
export async function generate5ELessonPlan(params: LessonPlanParams) {
  const {
    className,
    subject,
    topic,
    durationMinutes = 45,
    staffId,
    sectionName = 'A'
  } = params;

  const prompt = `You are a National Education Policy (NEP 2020) Master Teacher Trainer.
Create an exemplary 5E Instructional Model Lesson Plan for:
- Grade / Class: ${className}
- Subject: ${subject}
- Topic: ${topic}
- Session Duration: ${durationMinutes} minutes

THE 5E MODEL MUST INCLUDE:
1. ENGAGE (5-7 mins): A captivating hook, real-world connection, prior-knowledge question.
2. EXPLORE (10-15 mins): Hands-on experiential inquiry, collaborative student activity.
3. EXPLAIN (12-15 mins): Teacher-facilitated conceptual clarity, scientific terminology, diagrams.
4. ELABORATE / EXTEND (8-10 mins): Higher Order Thinking Skills (HOTS), real-world application.
5. EVALUATE (5 mins): Formative exit ticket questions and criteria.

CRITICAL: Return ONLY valid JSON matching this schema:
{
  "className": "${className}",
  "sectionName": "${sectionName}",
  "subjectName": "${subject}",
  "chapterName": "${topic}",
  "topicName": "${topic}",
  "durationMinutes": ${durationMinutes},
  "learningObjectives": "Specific Bloom's Taxonomy outcomes",
  "fiveEModel": {
    "engage": "Detailed description of hook activity and questions",
    "explore": "Hands-on activity, student grouping, materials",
    "explain": "Key concepts clarified, diagrams, vocabulary",
    "elaborate": "Real-life application and challenge problem",
    "evaluate": "Formative exit ticket questions and criteria"
  },
  "teachingMethod": "Experiential & Inquiry-Based (5E Model)",
  "teachingResources": "Smart Panel, Activity Kit, Charts",
  "homework": "Differentiated homework (Support Tier, Core Tier, Challenge Tier)",
  "classwork": "In-class worksheet or notebook exercise",
  "activity": "Step-by-step description of hands-on activity",
  "assessmentCriteria": "Rubric: Concept mastery (40%), Participation (30%), Application (30%)"
}`;

  const systemInstruction = `You are VANI's Pedagogical Intelligence Engine. Deliver deep, actionable 5E lesson plans conforming to NEP 2020. Return pure JSON only.`;

  const aiResult = await callGemini({
    prompt,
    systemInstruction,
    temperature: 0.3,
    maxOutputTokens: 6144,
    jsonMode: true,
    timeoutMs: 40000
  });

  let parsed: any;
  try {
    const raw = aiResult.text.trim();
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Failed to parse Gemini lesson plan JSON:', err, aiResult.text.substring(0, 300));
    throw new Error('AI failed to produce valid lesson plan JSON');
  }

  const p = getPool();
  const client = await p.connect();
  let planId: string | null = null;
  try {
    let targetStaffId = staffId;
    if (!targetStaffId) {
      const { rows: staffRows } = await client.query(`SELECT id FROM public.staff LIMIT 1`);
      targetStaffId = staffRows[0]?.id || null;
    }

    if (targetStaffId) {
      const insertQuery = `
        INSERT INTO public.staff_lesson_plans (
          staff_id,
          class_name,
          section_name,
          subject_name,
          chapter_name,
          topic_name,
          learning_objectives,
          lesson_plan_content,
          teaching_method,
          teaching_resources,
          homework,
          classwork,
          activity,
          assessment_criteria,
          status,
          target_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Planned', CURRENT_DATE)
        RETURNING id;
      `;

      const formattedContent = `### 5E Model Breakdown\n\n` +
        `**1. Engage (Hook):** ${parsed.fiveEModel?.engage}\n\n` +
        `**2. Explore (Activity):** ${parsed.fiveEModel?.explore}\n\n` +
        `**3. Explain (Concepts):** ${parsed.fiveEModel?.explain}\n\n` +
        `**4. Elaborate (Application):** ${parsed.fiveEModel?.elaborate}\n\n` +
        `**5. Evaluate (Assessment):** ${parsed.fiveEModel?.evaluate}`;

      const { rows } = await client.query(insertQuery, [
        targetStaffId,
        className,
        sectionName,
        subject,
        parsed.chapterName || topic,
        parsed.topicName || topic,
        parsed.learningObjectives || '',
        formattedContent,
        parsed.teachingMethod || 'Experiential & Inquiry-Based (5E Model)',
        parsed.teachingResources || 'Smart Panel, Activity Kit',
        parsed.homework || '',
        parsed.classwork || '',
        parsed.activity || '',
        parsed.assessmentCriteria || ''
      ]);
      planId = rows[0]?.id;
    }

    return {
      success: true,
      planId,
      lessonPlan: parsed,
      modelUsed: aiResult.modelUsed
    };
  } finally {
    client.release();
  }
}
