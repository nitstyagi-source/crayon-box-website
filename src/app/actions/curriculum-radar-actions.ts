"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new Pool({ connectionString });
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

// -------------------------------------------------------------
// INTERFACES & TYPES
// -------------------------------------------------------------
export interface CurriculumTerm {
  id: string;
  institutionCode: string;
  academicSession: string;
  termName: string;
  termCode: string;
  assessmentType: 'FORMATIVE' | 'SUMMATIVE';
  milestoneLabel: string;
  startDate: string;
  targetCompletionDate: string;
  weightagePercentage: number;
  status: string;
  isEnabled: boolean;
  isClassEnabled?: boolean;
  applicableClasses?: string[];
}

export interface CurriculumSubjectRadarItem {
  id: string;
  campusId: string;
  institutionCode: string;
  name: string;
  code: string;
  category: string;
  className: string;
  weeklyPeriods: number;
  totalPlannedPeriods: number;
  completedPeriods: number;
  teacherName: string;
  colorCode: string;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  pendingChapters: number;
  completionPercentage: number;
  pacingStatus: 'ON_SCHEDULE' | 'SLIGHTLY_BEHIND' | 'SIGNIFICANTLY_BEHIND';
  healthTag: '🟢' | '🟡' | '🔴';
  status: string;
  termBreakdown?: {
    term1Total: number;
    term1Completed: number;
    term2Total: number;
    term2Completed: number;
  };
}

export interface CurriculumRadarMetrics {
  totalSubjects: number;
  totalChapters: number;
  completedChapters: number;
  averageCompletionRate: number;
  onScheduleCount: number;
  slightlyBehindCount: number;
  significantlyBehindCount: number;
  totalDeliveredPeriods: number;
  totalPlannedPeriods: number;
  activeTermName?: string;
  activeTermCompletionRate?: number;
}

export interface TeacherLessonDiaryEntry {
  id: string;
  institutionCode: string;
  academicSession: string;
  lessonDate: string;
  className: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  termName: string;
  assessmentMilestone: string;
  periodNumber: number;
  teacherName: string;
  topicTitle: string;
  learningObjectives: string;
  teachingPedagogy: string;
  teachingAids: string;
  classworkSummary: string;
  homeworkAssigned: string;
  realWorldApplication: string;
  assignmentTitle?: string;
  assignmentDueDate?: string;
  assignmentSubmissionType?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: string;
  importantNotes?: string;
  remedialRequired?: boolean;
  remedialPlan?: string;
  assessmentMode?: string;
  studentEngagementLevel: string;
  coordinatorStatus: 'Pending' | 'Approved' | 'Review Requested';
  coordinatorRemarks?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// STANDARD CHAPTER TEMPLATES BY SUBJECT
// -------------------------------------------------------------
const STANDARD_CHAPTER_SETS: Record<string, string[]> = {
  'mathematics': [
    'Numbers & Place Value', 'Addition & Subtraction Mastery', 'Multiplication Tables & Properties',
    'Division & Fractions Intro', 'Geometry: Shapes & Angles', 'Measurement: Length & Mass',
    'Time, Money & Calendar', 'Data Handling & Bar Graphs', 'Patterns & Symmetry',
    'Fractions & Decimals', 'Perimeter & Area Calculations', 'Practical Problem Solving'
  ],
  'science': [
    'Living & Non-Living Things', 'Plant Kingdom & Photosynthesis', 'Animal Kingdom & Habitats',
    'Human Body: Organ Systems', 'Food, Nutrition & Healthy Diet', 'Air, Water & Weather Cycles',
    'Matter: Solids, Liquids & Gases', 'Light, Shadows & Reflections', 'Force, Motion & Simple Machines',
    'Our Solar System & Planets', 'Environmental Conservation & Waste', 'Scientific Inventions & Discoveries'
  ],
  'english': [
    'Phonics, Pronunciation & Vocabulary', 'Sentence Structure & Punctuation', 'Nouns, Pronouns & Articles',
    'Verbs, Tenses & Subject-Verb Agreement', 'Adjectives, Adverbs & Comparison', 'Reading Comprehension Strategies',
    'Story Writing & Creative Expression', 'Formal & Informal Letter Writing', 'Poetry Appreciation & Rhythm',
    'Dialogue & Role Play Communication', 'Idioms, Proverbs & Synonyms', 'Grammar Revision & Mock Assessment'
  ],
  'hindi': [
    'वर्णमाला एवं वर्तनी ज्ञान', 'शब्द विचार एवं शब्द भंडार', 'संज्ञा, सर्वनाम एवं विशेषण',
    'क्रिया, काल एवं वाक्य रचना', 'अपठित गद्यांश एवं पद्यांश', 'कहानी लेखन एवं संवाद लेखन',
    'निबंध लेखन एवं पत्र लेखन', 'पर्यायवाची, विलोम एवं मुहावरे', 'कविता पाठ एवं भावार्थ',
    'साहित्य पाठ एवं प्रश्नोत्तर', 'व्याकरण पुनरावृत्ति एवं अभ्यास'
  ],
  'social science': [
    'Understanding Our Globe & Maps', 'The Earth: Continents & Oceans', 'India: Physical Features & Climate',
    'Our Heritage, Culture & Festivals', 'Early Humans & Civilizations', 'Local Government & Panchayati Raj',
    'Our Rights, Duties & Constitution', 'Transport, Trade & Communication', 'Natural Resources & Agriculture',
    'Pollution & Sustainable Living', 'Great Leaders & Nation Builders'
  ],
  'computer': [
    'Introduction to Computers & Hardware', 'Operating Systems & File Management', 'Word Processing: Formatting Documents',
    'Spreadsheets: Tables & Basic Formulas', 'Digital Presentations & Slides', 'Internet Safety & Cyber Ethics',
    'Block Coding & Scratch Programming', 'Introduction to Artificial Intelligence', 'Robotics & Smart Gadgets Basics'
  ],
  'art': [
    'Color Theory & Primary Color Mixing', 'Freehand Drawing & Sketching', 'Origami & Paper Craft Creations',
    'Clay Modelling & 3D Sculpting', 'Folk Art & Cultural Patterns', 'Canvas Painting & Mixed Media'
  ],
  'pe': [
    'Physical Fitness & Warm-up Drills', 'Yoga Asanas & Breath Control', 'Track & Field Athletics Events',
    'Team Sports: Football & Cricket Basics', 'Indoor Games: Chess & Badminton', 'Health, Nutrition & First Aid Safety'
  ]
};

function getChaptersForSubject(subjectName: string): string[] {
  const nameLower = subjectName.toLowerCase();
  for (const [key, list] of Object.entries(STANDARD_CHAPTER_SETS)) {
    if (nameLower.includes(key)) {
      return list;
    }
  }
  return [
    'Unit 1: Fundamentals & Concepts',
    'Unit 2: Core Principles & Methodology',
    'Unit 3: Applied Practice & Problem Solving',
    'Unit 4: Advanced Topics & Integration',
    'Unit 5: Project Work & Real-World Application',
    'Unit 6: Assessment Review & Revision'
  ];
}

// -------------------------------------------------------------
// 1. GET & SAVE CURRICULUM TERMS (FA-1..4 & SA-1..2)
// -------------------------------------------------------------
export async function getCurriculumTermsAction(institutionCode = 'CBS', session = '2026-2027', className?: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM public.curriculum_terms
      WHERE (institution_code = $1 OR institution_code = 'ALL')
        AND academic_session = $2
      ORDER BY start_date ASC, created_at ASC;
    `, [institutionCode, session]);

    let classOverrides: Record<string, boolean> = {};
    if (className && className !== 'All') {
      const overRes = await client.query(`
        SELECT term_code, is_enabled FROM public.class_term_status
        WHERE (institution_code = $1 OR institution_code = 'ALL')
          AND academic_session = $2
          AND class_name = $3;
      `, [institutionCode, session, className]);
      overRes.rows.forEach((r: any) => {
        classOverrides[r.term_code] = r.is_enabled;
      });
    }

    return {
      success: true,
      terms: res.rows.map((r: any) => {
        const isGlobalEnabled = r.is_enabled !== false;
        const isClassEnabled = classOverrides[r.term_code] !== undefined ? classOverrides[r.term_code] : isGlobalEnabled;
        return {
          id: r.id,
          institutionCode: r.institution_code,
          academicSession: r.academic_session,
          termName: r.term_name,
          termCode: r.term_code,
          assessmentType: r.assessment_type,
          milestoneLabel: r.milestone_label,
          startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '',
          targetCompletionDate: r.target_completion_date ? new Date(r.target_completion_date).toISOString().split('T')[0] : '',
          weightagePercentage: parseFloat(r.weightage_percentage) || 0,
          status: r.status || 'Active',
          isEnabled: isGlobalEnabled,
          isClassEnabled: isClassEnabled,
          applicableClasses: r.applicable_classes || ['All']
        };
      })
    };
  } catch (error: any) {
    console.error('Error fetching curriculum terms:', error);
    return { success: false, error: error.message, terms: [] };
  } finally {
    client.release();
  }
}

export async function saveCurriculumTermAction(payload: {
  id?: string;
  institutionCode?: string;
  academicSession?: string;
  termName: string;
  termCode: string;
  assessmentType: 'FORMATIVE' | 'SUMMATIVE';
  milestoneLabel: string;
  startDate: string;
  targetCompletionDate: string;
  weightagePercentage: number;
  isEnabled?: boolean;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const {
      id,
      institutionCode = 'CBS',
      academicSession = '2026-2027',
      termName,
      termCode,
      assessmentType,
      milestoneLabel,
      startDate,
      targetCompletionDate,
      weightagePercentage,
      isEnabled = true
    } = payload;

    if (id) {
      await client.query(`
        UPDATE public.curriculum_terms
        SET 
          term_name = $1,
          term_code = $2,
          assessment_type = $3,
          milestone_label = $4,
          start_date = $5,
          target_completion_date = $6,
          weightage_percentage = $7,
          is_enabled = $8,
          status = CASE WHEN $8 THEN 'Active' ELSE 'Disabled' END,
          updated_at = NOW()
        WHERE id = $9;
      `, [termName, termCode, assessmentType, milestoneLabel, startDate, targetCompletionDate, weightagePercentage, isEnabled, id]);
    } else {
      await client.query(`
        INSERT INTO public.curriculum_terms (
          institution_code, academic_session, term_name, term_code,
          assessment_type, milestone_label, start_date, target_completion_date,
          weightage_percentage, status, is_enabled
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $10 THEN 'Active' ELSE 'Disabled' END, $10
        );
      `, [institutionCode, academicSession, termName, termCode, assessmentType, milestoneLabel, startDate, targetCompletionDate, weightagePercentage, isEnabled]);
    }

    safeRevalidate('/admin/curriculum');
    safeRevalidate('/admin/lesson-diary');

    return {
      success: true,
      message: `Assessment Milestone "${milestoneLabel}" successfully saved!`
    };
  } catch (error: any) {
    console.error('Error saving curriculum term:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 1B. TOGGLE CLASS-SPECIFIC OR GLOBAL TERM STATUS (ON / OFF)
// -------------------------------------------------------------
export async function toggleClassTermStatusAction(payload: {
  institutionCode?: string;
  session?: string;
  className: string; // 'All' or specific class e.g. 'Pre-Nursery', 'Grade 1'
  termCode: string;  // e.g. 'Term 1', 'Term 2', 'T1_FA1', 'T1_FA2', 'T1_SA1', 'T2_FA3', 'T2_FA4', 'T2_SA2'
  termName?: string;
  isEnabled: boolean;
  disabledReason?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const {
      institutionCode = 'CBS',
      session = '2026-2027',
      className,
      termCode,
      termName = termCode,
      isEnabled,
      disabledReason = 'Term deactivated by administrator'
    } = payload;

    if (className === 'All') {
      // Global toggle on curriculum_terms
      if (termCode.startsWith('Term ')) {
        await client.query(`
          UPDATE public.curriculum_terms
          SET 
            is_enabled = $1,
            status = CASE WHEN $1 THEN 'Active' ELSE 'Disabled' END,
            updated_at = NOW()
          WHERE (institution_code = $2 OR institution_code = 'ALL')
            AND academic_session = $3
            AND term_name = $4;
        `, [isEnabled, institutionCode, session, termCode]);
      } else {
        await client.query(`
          UPDATE public.curriculum_terms
          SET 
            is_enabled = $1,
            status = CASE WHEN $1 THEN 'Active' ELSE 'Disabled' END,
            updated_at = NOW()
          WHERE (institution_code = $2 OR institution_code = 'ALL')
            AND academic_session = $3
            AND term_code = $4;
        `, [isEnabled, institutionCode, session, termCode]);
      }
    } else {
      // Class-specific toggle in class_term_status
      await client.query(`
        INSERT INTO public.class_term_status (
          institution_code, academic_session, class_name, term_name, term_code, is_enabled, disabled_reason, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW()
        )
        ON CONFLICT (institution_code, academic_session, class_name, term_code)
        DO UPDATE SET
          is_enabled = EXCLUDED.is_enabled,
          disabled_reason = EXCLUDED.disabled_reason,
          updated_at = NOW();
      `, [institutionCode, session, className, termName, termCode, isEnabled, disabledReason]);
    }

    safeRevalidate('/admin/curriculum');
    safeRevalidate('/admin/lesson-diary');
    safeRevalidate('/admin/syllabus');

    const stateStr = isEnabled ? 'Activated (ON)' : 'Turned OFF (Deactivated)';
    return {
      success: true,
      message: `Academic Term "${termName}" is now ${stateStr} for ${className === 'All' ? 'All Classes' : className} (Session ${session})!`
    };
  } catch (error: any) {
    console.error('Error in toggleClassTermStatusAction:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 1C. GET CLASS TERM OVERRIDES MATRIX
// -------------------------------------------------------------
export async function getClassTermOverridesAction(institutionCode = 'CBS', session = '2026-2027', className?: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    let query = `
      SELECT * FROM public.class_term_status
      WHERE (institution_code = $1 OR institution_code = 'ALL')
        AND academic_session = $2
    `;
    const params: any[] = [institutionCode, session];

    if (className && className !== 'All') {
      params.push(className);
      query += ` AND class_name = $3`;
    }
    query += ` ORDER BY class_name ASC, term_code ASC;`;

    const res = await client.query(query, params);
    return {
      success: true,
      overrides: res.rows.map((r: any) => ({
        id: r.id,
        institutionCode: r.institution_code,
        academicSession: r.academic_session,
        className: r.class_name,
        termName: r.term_name,
        termCode: r.term_code,
        isEnabled: r.is_enabled,
        disabledReason: r.disabled_reason,
        updatedAt: r.updated_at
      }))
    };
  } catch (error: any) {
    console.error('Error in getClassTermOverridesAction:', error);
    return { success: false, error: error.message, overrides: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GET CURRICULUM RADAR DATA WITH TERM & ASSESSMENT FILTER
// -------------------------------------------------------------
export async function getCurriculumRadarAction(params?: {
  institutionCode?: string;
  session?: string;
  className?: string;
  subjectSearch?: string;
  pacingFilter?: string;
  termFilter?: string; // 'ALL' | 'Term 1' | 'Term 2'
  milestoneFilter?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const inst = params?.institutionCode || 'CBS';
    const session = params?.session || '2026-2027';
    const className = params?.className || 'All';
    const search = params?.subjectSearch?.trim() || '';
    const pacing = params?.pacingFilter || 'ALL';
    const term = params?.termFilter || 'ALL';
    const milestone = params?.milestoneFilter || 'ALL';

    let query = `
      SELECT 
        s.id, s.campus_id, s.name, s.code, s.category, s.class_name, 
        s.weekly_periods, s.total_planned_periods, s.teacher_name, 
        s.color_code, s.status,
        COUNT(sc.id) as total_chapters,
        COUNT(sc.id) FILTER (WHERE sc.status = 'Completed') as completed_chapters,
        COUNT(sc.id) FILTER (WHERE sc.status = 'In Progress') as in_progress_chapters,
        COUNT(sc.id) FILTER (WHERE sc.status = 'Pending' OR sc.status IS NULL) as pending_chapters,
        COUNT(sc.id) FILTER (WHERE sc.term_name = 'Term 1') as term1_total,
        COUNT(sc.id) FILTER (WHERE sc.term_name = 'Term 1' AND sc.status = 'Completed') as term1_completed,
        COUNT(sc.id) FILTER (WHERE sc.term_name = 'Term 2') as term2_total,
        COUNT(sc.id) FILTER (WHERE sc.term_name = 'Term 2' AND sc.status = 'Completed') as term2_completed,
        COALESCE(SUM(sc.estimated_periods), s.total_planned_periods, 80) as sum_estimated_periods,
        COALESCE(SUM(sc.completed_periods), 0) as sum_completed_periods
      FROM public.academic_subjects s
      LEFT JOIN public.syllabus_chapters sc ON sc.subject_id = s.id
      WHERE (s.status = 'Active' OR s.status = 'ACTIVE')
        AND (s.academic_session = $1 OR s.academic_session IS NULL)
    `;

    const queryParams: any[] = [session];

    if (className !== 'All') {
      queryParams.push(className);
      query += ` AND s.class_name = $${queryParams.length}`;
    }

    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (s.name ILIKE $${queryParams.length} OR s.code ILIKE $${queryParams.length} OR s.teacher_name ILIKE $${queryParams.length})`;
    }

    if (term !== 'ALL') {
      queryParams.push(term);
      query += ` AND sc.term_name = $${queryParams.length}`;
    }

    if (milestone !== 'ALL') {
      queryParams.push(`%${milestone}%`);
      query += ` AND sc.assessment_milestone ILIKE $${queryParams.length}`;
    }

    query += `
      GROUP BY s.id, s.campus_id, s.name, s.code, s.category, s.class_name, 
               s.weekly_periods, s.total_planned_periods, s.teacher_name, 
               s.color_code, s.status
      ORDER BY 
        CASE 
          WHEN s.class_name ILIKE 'Pre%' THEN 0
          WHEN s.class_name ILIKE 'Nur%' THEN 1
          WHEN s.class_name ILIKE 'LKG%' THEN 2
          WHEN s.class_name ILIKE 'UKG%' THEN 3
          WHEN s.class_name ~ '\\d+' THEN CAST(SUBSTRING(s.class_name FROM '\\d+') AS INTEGER) + 10
          ELSE 99
        END ASC,
        s.name ASC;
    `;

    const res = await client.query(query, queryParams);

    // Process metrics per subject
    const subjects: CurriculumSubjectRadarItem[] = res.rows.map((r: any) => {
      const totalCh = parseInt(r.total_chapters, 10) || 0;
      const compCh = parseInt(r.completed_chapters, 10) || 0;
      const inProgCh = parseInt(r.in_progress_chapters, 10) || 0;
      const pendCh = parseInt(r.pending_chapters, 10) || 0;

      const totalEst = parseInt(r.sum_estimated_periods, 10) || 80;
      const compPeriods = parseInt(r.sum_completed_periods, 10) || (compCh * 8 + inProgCh * 4);

      let completionPct = totalEst > 0 ? Math.min(100, Math.round((compPeriods / totalEst) * 100)) : 0;
      if (totalCh > 0 && completionPct === 0 && compCh > 0) {
        completionPct = Math.round((compCh / totalCh) * 100);
      }

      let pacingStatus: 'ON_SCHEDULE' | 'SLIGHTLY_BEHIND' | 'SIGNIFICANTLY_BEHIND' = 'ON_SCHEDULE';
      let healthTag: '🟢' | '🟡' | '🔴' = '🟢';

      if (completionPct < 45) {
        pacingStatus = 'SIGNIFICANTLY_BEHIND';
        healthTag = '🔴';
      } else if (completionPct < 70) {
        pacingStatus = 'SLIGHTLY_BEHIND';
        healthTag = '🟡';
      }

      return {
        id: r.id,
        campusId: r.campus_id,
        institutionCode: inst,
        name: r.name,
        code: r.code,
        category: r.category || 'Core Academics',
        className: r.class_name,
        weeklyPeriods: r.weekly_periods || 6,
        totalPlannedPeriods: totalEst,
        completedPeriods: compPeriods,
        teacherName: r.teacher_name || 'Staff Facilitator',
        colorCode: r.color_code || '#4F46E5',
        totalChapters: totalCh,
        completedChapters: compCh,
        inProgressChapters: inProgCh,
        pendingChapters: pendCh,
        completionPercentage: completionPct,
        pacingStatus,
        healthTag,
        status: r.status || 'Active',
        termBreakdown: {
          term1Total: parseInt(r.term1_total, 10) || 0,
          term1Completed: parseInt(r.term1_completed, 10) || 0,
          term2Total: parseInt(r.term2_total, 10) || 0,
          term2Completed: parseInt(r.term2_completed, 10) || 0
        }
      };
    });

    // Filter by pacing if specified
    const filteredSubjects = pacing === 'ALL' 
      ? subjects 
      : subjects.filter(s => s.pacingStatus === pacing);

    // Summary Telematics
    const totalSubjectsCount = subjects.length;
    const totalChaptersSum = subjects.reduce((sum, s) => sum + s.totalChapters, 0);
    const completedChaptersSum = subjects.reduce((sum, s) => sum + s.completedChapters, 0);
    const avgRate = totalSubjectsCount > 0 
      ? Math.round(subjects.reduce((sum, s) => sum + s.completionPercentage, 0) / totalSubjectsCount) 
      : 0;

    const onSchedule = subjects.filter(s => s.pacingStatus === 'ON_SCHEDULE').length;
    const slightlyBehind = subjects.filter(s => s.pacingStatus === 'SLIGHTLY_BEHIND').length;
    const significantlyBehind = subjects.filter(s => s.pacingStatus === 'SIGNIFICANTLY_BEHIND').length;

    const deliveredPeriodsSum = subjects.reduce((sum, s) => sum + s.completedPeriods, 0);
    const plannedPeriodsSum = subjects.reduce((sum, s) => sum + s.totalPlannedPeriods, 0);

    const metrics: CurriculumRadarMetrics = {
      totalSubjects: totalSubjectsCount,
      totalChapters: totalChaptersSum,
      completedChapters: completedChaptersSum,
      averageCompletionRate: avgRate,
      onScheduleCount: onSchedule,
      slightlyBehindCount: slightlyBehind,
      significantlyBehindCount: significantlyBehind,
      totalDeliveredPeriods: deliveredPeriodsSum,
      totalPlannedPeriods: plannedPeriodsSum,
      activeTermName: term === 'ALL' ? 'Term 1 (Active)' : term
    };

    return {
      success: true,
      data: filteredSubjects,
      allSubjects: subjects,
      metrics
    };
  } catch (error: any) {
    console.error('Error fetching curriculum radar data:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      allSubjects: [],
      metrics: {
        totalSubjects: 0,
        totalChapters: 0,
        completedChapters: 0,
        averageCompletionRate: 0,
        onScheduleCount: 0,
        slightlyBehindCount: 0,
        significantlyBehindCount: 0,
        totalDeliveredPeriods: 0,
        totalPlannedPeriods: 0
      }
    };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. GET SUBJECT CHAPTERS WITH TERM & ASSESSMENT BREAKDOWN
// -------------------------------------------------------------
export async function getSubjectChaptersAction(subjectId: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const subjRes = await client.query(`
      SELECT * FROM public.academic_subjects WHERE id = $1;
    `, [subjectId]);

    if (subjRes.rows.length === 0) {
      return { success: false, error: 'Subject not found', subject: null, chapters: [] };
    }

    const subject = subjRes.rows[0];

    const chapRes = await client.query(`
      SELECT * FROM public.syllabus_chapters
      WHERE subject_id = $1
      ORDER BY chapter_number ASC, order_index ASC;
    `, [subjectId]);

    return {
      success: true,
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        className: subject.class_name,
        teacherName: subject.teacher_name,
        totalPlannedPeriods: subject.total_planned_periods || 80
      },
      chapters: chapRes.rows.map((r: any) => ({
        id: r.id,
        chapterNumber: r.chapter_number,
        chapterName: r.chapter_name,
        termName: r.term_name || (r.chapter_number <= 6 ? 'Term 1' : 'Term 2'),
        assessmentMilestone: r.assessment_milestone || 'FA-1 (Periodic Test 1)',
        targetMonth: r.target_month || 'April - July',
        estimatedPeriods: r.estimated_periods || 8,
        completedPeriods: r.completed_periods || 0,
        status: r.status || 'Pending',
        plannedStartDate: r.planned_start_date ? new Date(r.planned_start_date).toISOString().split('T')[0] : null,
        plannedCompletionDate: r.planned_completion_date ? new Date(r.planned_completion_date).toISOString().split('T')[0] : null,
        actualCompletionDate: r.actual_completion_date ? new Date(r.actual_completion_date).toISOString().split('T')[0] : null,
        learningObjectives: r.learning_objectives || 'Master core competency concepts and solve exercises.',
        keyConcepts: r.key_concepts || 'Foundational theory, formula derivations, application exercises.'
      }))
    };
  } catch (error: any) {
    console.error('Error fetching subject chapters:', error);
    return { success: false, error: error.message, subject: null, chapters: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. UPDATE CHAPTER TERM & ASSESSMENT ALLOCATION
// -------------------------------------------------------------
export async function updateChapterTermAllocationAction(payload: {
  chapterId: string;
  termName: string;
  assessmentMilestone: string;
  targetMonth?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { chapterId, termName, assessmentMilestone, targetMonth } = payload;
    await client.query(`
      UPDATE public.syllabus_chapters
      SET 
        term_name = $1,
        assessment_milestone = $2,
        target_month = COALESCE($3, target_month)
      WHERE id = $4;
    `, [termName, assessmentMilestone, targetMonth, chapterId]);

    safeRevalidate('/admin/curriculum');
    safeRevalidate('/admin/lesson-diary');

    return {
      success: true,
      message: `Chapter successfully mapped to ${termName} (${assessmentMilestone})!`
    };
  } catch (error: any) {
    console.error('Error updating chapter term allocation:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4B. CREATE OR EDIT SYLLABUS CHAPTER
// -------------------------------------------------------------
export async function createOrUpdateChapterAction(payload: {
  id?: string;
  subjectId: string;
  chapterNumber: number;
  chapterName: string;
  estimatedPeriods: number;
  termName: string;
  assessmentMilestone: string;
  targetMonth?: string;
  learningObjectives?: string;
  keyConcepts?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const {
      id,
      subjectId,
      chapterNumber,
      chapterName,
      estimatedPeriods,
      termName,
      assessmentMilestone,
      targetMonth = 'April - July',
      learningObjectives = 'Master core concepts and complete practice sets.',
      keyConcepts = 'Foundational theory, formulas, and practical applications.'
    } = payload;

    const subjRes = await client.query(`SELECT campus_id FROM public.academic_subjects WHERE id = $1;`, [subjectId]);
    const campusId = subjRes.rows[0]?.campus_id || 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    if (id) {
      await client.query(`
        UPDATE public.syllabus_chapters
        SET 
          chapter_number = $1,
          chapter_name = $2,
          estimated_periods = $3,
          term_name = $4,
          assessment_milestone = $5,
          target_month = $6,
          learning_objectives = $7,
          key_concepts = $8
        WHERE id = $9;
      `, [chapterNumber, chapterName, estimatedPeriods, termName, assessmentMilestone, targetMonth, learningObjectives, keyConcepts, id]);
    } else {
      await client.query(`
        INSERT INTO public.syllabus_chapters (
          campus_id, subject_id, chapter_number, chapter_name,
          estimated_periods, completed_periods, status, order_index,
          term_name, assessment_milestone, target_month,
          learning_objectives, key_concepts, created_at
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4,
          $5, 0, 'Pending', $3,
          $6, $7, $8,
          $9, $10, NOW()
        );
      `, [campusId, subjectId, chapterNumber, chapterName, estimatedPeriods, termName, assessmentMilestone, targetMonth, learningObjectives, keyConcepts]);
    }

    safeRevalidate('/admin/curriculum');
    safeRevalidate('/admin/syllabus');
    safeRevalidate('/admin/lesson-diary');

    return {
      success: true,
      message: `Unit ${chapterNumber}: "${chapterName}" successfully saved to ${termName}!`
    };
  } catch (error: any) {
    console.error('Error in createOrUpdateChapterAction:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4.5 GET DISTINCT TEACHERS & FACULTY
// -------------------------------------------------------------
export async function getDistinctTeachersAction(institutionCode = 'CBS') {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT DISTINCT name as teacher_name, title, department 
      FROM public.faculty_members 
      WHERE name IS NOT NULL AND name != ''
      UNION
      SELECT DISTINCT teacher_name, 'Teacher' as title, 'Academics & Teaching' as department 
      FROM public.teacher_lesson_diary 
      WHERE teacher_name IS NOT NULL AND teacher_name != ''
      ORDER BY teacher_name ASC;
    `);

    const uniqueMap = new Map<string, { name: string; title: string; department: string }>();
    for (const r of res.rows) {
      if (!uniqueMap.has(r.teacher_name)) {
        uniqueMap.set(r.teacher_name, {
          name: r.teacher_name,
          title: r.title || 'Faculty Facilitator',
          department: r.department || 'Academics & Teaching'
        });
      }
    }

    return {
      success: true,
      teachers: Array.from(uniqueMap.values())
    };
  } catch (error: any) {
    console.error('Error fetching distinct teachers:', error);
    return { success: false, error: error.message, teachers: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. GET TEACHER LESSON DIARY ENTRIES
// -------------------------------------------------------------
export async function getTeacherLessonDiaryAction(params?: {
  institutionCode?: string;
  session?: string;
  className?: string;
  sectionName?: string;
  subjectId?: string;
  termName?: string;
  teacherName?: string;
  limit?: number;
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const inst = params?.institutionCode || 'CBS';
    const session = params?.session || '2026-2027';
    const limit = params?.limit || 50;

    let query = `
      SELECT * FROM public.teacher_lesson_diary
      WHERE (institution_code = $1 OR institution_code = 'ALL')
        AND academic_session = $2
    `;
    const queryParams: any[] = [inst, session];

    if (params?.className && params.className !== 'All') {
      queryParams.push(params.className);
      query += ` AND class_name = $${queryParams.length}`;
    }

    if (params?.sectionName && params.sectionName !== 'All') {
      queryParams.push(params.sectionName);
      query += ` AND section_name = $${queryParams.length}`;
    }

    if (params?.subjectId && params.subjectId !== 'All') {
      queryParams.push(params.subjectId);
      query += ` AND subject_id = $${queryParams.length}`;
    }

    if (params?.termName && params.termName !== 'ALL') {
      queryParams.push(params.termName);
      query += ` AND term_name = $${queryParams.length}`;
    }

    if (params?.teacherName && params.teacherName !== 'All') {
      queryParams.push(`%${params.teacherName}%`);
      query += ` AND teacher_name ILIKE $${queryParams.length}`;
    }

    query += ` ORDER BY lesson_date DESC, created_at DESC LIMIT $${queryParams.length + 1};`;
    queryParams.push(limit);

    const res = await client.query(query, queryParams);

    return {
      success: true,
      entries: res.rows.map((r: any) => ({
        id: r.id,
        institutionCode: r.institution_code,
        academicSession: r.academic_session,
        lessonDate: r.lesson_date ? new Date(r.lesson_date).toISOString().split('T')[0] : '',
        className: r.class_name,
        sectionName: r.section_name || 'A',
        subjectId: r.subject_id,
        subjectName: r.subject_name,
        chapterId: r.chapter_id,
        chapterName: r.chapter_name,
        termName: r.term_name || 'Term 1',
        assessmentMilestone: r.assessment_milestone || 'FA-1 (Periodic Test 1)',
        periodNumber: r.period_number || 1,
        teacherName: r.teacher_name,
        topicTitle: r.topic_title,
        learningObjectives: r.learning_objectives || '',
        teachingPedagogy: r.teaching_pedagogy || 'Smartboard & Concept Discussion',
        teachingAids: r.teaching_aids || '',
        classworkSummary: r.classwork_summary || '',
        homeworkAssigned: r.homework_assigned || '',
        realWorldApplication: r.real_world_application || '',
        assignmentTitle: r.assignment_title || '',
        assignmentDueDate: r.assignment_due_date ? new Date(r.assignment_due_date).toISOString().split('T')[0] : '',
        assignmentSubmissionType: r.assignment_submission_type || 'Physical Notebook',
        attachmentUrl: r.attachment_url || '',
        attachmentName: r.attachment_name || '',
        attachmentSize: r.attachment_size || '',
        importantNotes: r.important_notes || '',
        remedialRequired: Boolean(r.remedial_required),
        remedialPlan: r.remedial_plan || '',
        assessmentMode: r.assessment_mode || 'Classroom Worksheet',
        studentEngagementLevel: r.student_engagement_level || 'High',
        coordinatorStatus: r.coordinator_status || 'Approved',
        coordinatorRemarks: r.coordinator_remarks || '',
        createdAt: r.created_at
      }))
    };
  } catch (error: any) {
    console.error('Error fetching teacher lesson diary:', error);
    return { success: false, error: error.message, entries: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 6. SAVE TEACHER LESSON DIARY ENTRY & AUTO-SYNC RADAR
// -------------------------------------------------------------
export async function saveTeacherLessonDiaryEntryAction(payload: {
  institutionCode?: string;
  academicSession?: string;
  lessonDate: string;
  className: string;
  sectionName?: string;
  subjectId: string;
  subjectName?: string;
  chapterId: string;
  chapterName?: string;
  termName?: string;
  assessmentMilestone?: string;
  periodNumber?: number;
  teacherName?: string;
  topicTitle: string;
  learningObjectives?: string;
  teachingPedagogy?: string;
  teachingAids?: string;
  classworkSummary?: string;
  homeworkAssigned?: string;
  realWorldApplication?: string;
  assignmentTitle?: string;
  assignmentDueDate?: string;
  assignmentSubmissionType?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: string;
  importantNotes?: string;
  remedialRequired?: boolean;
  remedialPlan?: string;
  assessmentMode?: string;
  studentEngagementLevel?: string;
  periodsDelivered?: number; // Defaults to 1
}) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      institutionCode = 'CBS',
      academicSession = '2026-2027',
      lessonDate,
      className,
      sectionName = 'A',
      subjectId,
      chapterId,
      periodNumber = 1,
      teacherName = 'Dr. Sunita Sharma',
      topicTitle,
      learningObjectives,
      teachingPedagogy = 'Smartboard & Concept Discussion',
      teachingAids = 'Smartboard, Workbook, Manipulatives',
      classworkSummary = '',
      homeworkAssigned = '',
      realWorldApplication = '',
      assignmentTitle = '',
      assignmentDueDate = null,
      assignmentSubmissionType = 'Physical Notebook',
      attachmentUrl = '',
      attachmentName = '',
      attachmentSize = '',
      importantNotes = '',
      remedialRequired = false,
      remedialPlan = '',
      assessmentMode = 'Classroom Worksheet',
      studentEngagementLevel = 'High',
      periodsDelivered = 1
    } = payload;

    // 1. Fetch Subject & Chapter Metadata if missing
    let finalSubjName = payload.subjectName;
    let finalChapName = payload.chapterName;
    let finalTerm = payload.termName;
    let finalMilestone = payload.assessmentMilestone;
    let finalObjectives = learningObjectives;

    const chapRes = await client.query(`
      SELECT sc.*, s.name as subject_name, s.campus_id, s.teacher_name
      FROM public.syllabus_chapters sc
      JOIN public.academic_subjects s ON s.id = sc.subject_id
      WHERE sc.id = $1;
    `, [chapterId]);

    let campusId = 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    if (chapRes.rows.length > 0) {
      const c = chapRes.rows[0];
      finalSubjName = finalSubjName || c.subject_name;
      finalChapName = finalChapName || c.chapter_name;
      finalTerm = finalTerm || c.term_name || 'Term 1';
      finalMilestone = finalMilestone || c.assessment_milestone || 'FA-1 (Periodic Test 1)';
      finalObjectives = finalObjectives || c.learning_objectives;
      campusId = c.campus_id || campusId;
    }

    // 2. Insert into public.teacher_lesson_diary
    await client.query(`
      INSERT INTO public.teacher_lesson_diary (
        institution_code, campus_id, academic_session, lesson_date,
        class_name, section_name, subject_id, subject_name,
        chapter_id, chapter_name, term_name, assessment_milestone,
        period_number, teacher_name, topic_title, learning_objectives,
        teaching_pedagogy, teaching_aids, classwork_summary, homework_assigned,
        real_world_application, assignment_title, assignment_due_date,
        assignment_submission_type, attachment_url, attachment_name, attachment_size,
        important_notes, remedial_required, remedial_plan, assessment_mode,
        student_engagement_level, coordinator_status
      ) VALUES (
        $1, $2::uuid, $3, $4::date,
        $5, $6, $7::uuid, $8,
        $9::uuid, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23,
        $24, $25, $26, $27,
        $28, $29, $30, $31,
        $32, 'Approved'
      );
    `, [
      institutionCode, campusId, academicSession, lessonDate,
      className, sectionName, subjectId, finalSubjName || 'Mathematics',
      chapterId, finalChapName || 'Unit Topic', finalTerm || 'Term 1', finalMilestone || 'FA-1 (Periodic Test 1)',
      periodNumber, teacherName, topicTitle, finalObjectives || 'Concept mastery',
      teachingPedagogy, teachingAids, classworkSummary, homeworkAssigned,
      realWorldApplication, assignmentTitle, assignmentDueDate || null,
      assignmentSubmissionType, attachmentUrl, attachmentName, attachmentSize,
      importantNotes, Boolean(remedialRequired), remedialPlan, assessmentMode,
      studentEngagementLevel
    ]);

    // 3. AUTO-SYNC WITH CURRICULUM RADAR: Increment chapter completed_periods & update status
    if (chapterId) {
      const chapCheck = await client.query(`
        SELECT estimated_periods, completed_periods FROM public.syllabus_chapters WHERE id = $1;
      `, [chapterId]);

      if (chapCheck.rows.length > 0) {
        const est = chapCheck.rows[0].estimated_periods || 8;
        const cur = chapCheck.rows[0].completed_periods || 0;
        const newComp = cur + Number(periodsDelivered);
        const newStatus = newComp >= est ? 'Completed' : 'In Progress';

        await client.query(`
          UPDATE public.syllabus_chapters
          SET 
            completed_periods = $1::integer,
            status = $2::varchar,
            actual_completion_date = CASE WHEN $2::varchar = 'Completed' THEN CURRENT_DATE ELSE actual_completion_date END
          WHERE id = $3::uuid;
        `, [newComp, newStatus, chapterId]);
      }
    }

    await client.query('COMMIT');

    safeRevalidate('/admin/curriculum');
    safeRevalidate('/admin/lesson-diary');
    safeRevalidate('/admin/syllabus');

    return {
      success: true,
      message: `🎉 Lesson Diary entry logged & Curriculum Radar synced! (+${periodsDelivered} period logged for ${finalChapName}).`
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error saving teacher lesson diary entry:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 7. APPROVE OR REVIEW LESSON DIARY ENTRY (COORDINATOR)
// -------------------------------------------------------------
export async function updateDiaryCoordinatorStatusAction(diaryId: string, status: 'Approved' | 'Review Requested', remarks?: string) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE public.teacher_lesson_diary
      SET coordinator_status = $1, coordinator_remarks = $2, updated_at = NOW()
      WHERE id = $3;
    `, [status, remarks || '', diaryId]);

    safeRevalidate('/admin/lesson-diary');
    return { success: true, message: `Lesson entry marked as ${status}.` };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 8. GET DISTINCT SUBJECTS & CHAPTERS FOR A CLASS
// -------------------------------------------------------------
export async function getDistinctSubjectsAndChaptersAction(className: string, institutionCode = 'CBS') {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const subjRes = await client.query(`
      SELECT s.id as subject_id, s.name as subject_name, s.code, s.teacher_name,
             sc.id as chapter_id, sc.chapter_number, sc.chapter_name, sc.term_name, sc.assessment_milestone, sc.learning_objectives
      FROM public.academic_subjects s
      LEFT JOIN public.syllabus_chapters sc ON sc.subject_id = s.id
      WHERE (s.status = 'Active' OR s.status = 'ACTIVE')
        AND (s.class_name = $1 OR $1 = 'All')
      ORDER BY s.name ASC, sc.chapter_number ASC;
    `, [className]);

    const subjectsMap = new Map<string, any>();

    for (const r of subjRes.rows) {
      if (!subjectsMap.has(r.subject_id)) {
        subjectsMap.set(r.subject_id, {
          id: r.subject_id,
          name: r.subject_name,
          code: r.code,
          teacherName: r.teacher_name,
          chapters: []
        });
      }
      if (r.chapter_id) {
        subjectsMap.get(r.subject_id).chapters.push({
          id: r.chapter_id,
          chapterNumber: r.chapter_number,
          chapterName: r.chapter_name,
          termName: r.term_name || 'Term 1',
          assessmentMilestone: r.assessment_milestone || 'FA-1 (Periodic Test 1)',
          learningObjectives: r.learning_objectives || ''
        });
      }
    }

    return {
      success: true,
      subjects: Array.from(subjectsMap.values())
    };
  } catch (error: any) {
    console.error('Error fetching distinct subjects and chapters:', error);
    return { success: false, error: error.message, subjects: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 9. SEED COMPREHENSIVE CURRICULUM CHAPTERS FOR ALL SUBJECTS
// -------------------------------------------------------------
export async function seedComprehensiveCurriculumUnitsAction() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const subjRes = await client.query(`
      SELECT s.id, s.campus_id, s.name, s.code, s.class_name, COUNT(sc.id) as chapter_count
      FROM public.academic_subjects s
      LEFT JOIN public.syllabus_chapters sc ON sc.subject_id = s.id
      GROUP BY s.id, s.campus_id, s.name, s.code, s.class_name;
    `);

    const campusRes = await client.query(`SELECT id FROM public.campuses LIMIT 1;`);
    const defaultCampusId = campusRes.rows[0]?.id || 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    const values: any[] = [];
    const valuePlaceholders: string[] = [];
    let paramIndex = 1;
    let seededCount = 0;

    for (const subj of subjRes.rows) {
      if (parseInt(subj.chapter_count, 10) === 0) {
        const chapterNames = getChaptersForSubject(subj.name);
        const estPeriodsPerChapter = Math.round(80 / chapterNames.length);

        for (let i = 0; i < chapterNames.length; i++) {
          const chName = chapterNames[i];
          const chNum = i + 1;

          let chStatus: 'Completed' | 'In Progress' | 'Pending' = 'Pending';
          let compPeriods = 0;

          if (chNum <= 2) {
            chStatus = 'Completed';
            compPeriods = estPeriodsPerChapter;
          } else if (chNum === 3) {
            chStatus = 'In Progress';
            compPeriods = Math.round(estPeriodsPerChapter / 2);
          }

          const termName = chNum <= 6 ? 'Term 1' : 'Term 2';
          const milestone = chNum <= 2 ? 'Formative Assessment 1 (FA-1 / Periodic Test 1)'
            : chNum <= 4 ? 'Formative Assessment 2 (FA-2 / Periodic Test 2)'
            : chNum <= 6 ? 'Summative Assessment 1 (SA-1 / Half-Yearly Exam)'
            : chNum <= 8 ? 'Formative Assessment 3 (FA-3 / Periodic Test 3)'
            : chNum <= 10 ? 'Formative Assessment 4 (FA-4 / Periodic Test 4)'
            : 'Summative Assessment 2 (SA-2 / Annual Final Exam)';

          valuePlaceholders.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6}, $${paramIndex+7}, $${paramIndex+8}, $${paramIndex+9}, $${paramIndex+10}, $${paramIndex+11}, NOW())`);
          values.push(
            subj.campus_id || defaultCampusId,
            subj.id,
            chNum,
            chName,
            estPeriodsPerChapter,
            compPeriods,
            chStatus,
            chNum,
            `Understand core concepts of ${chName}, solve textbook problem sets, and participate in classroom projects.`,
            `Key foundational definitions, theorems/rules, practical real-world applications.`,
            termName,
            milestone
          );
          paramIndex += 12;
          seededCount++;
        }
      }
    }

    if (valuePlaceholders.length > 0) {
      const CHUNK_SIZE = 50;
      for (let i = 0; i < valuePlaceholders.length; i += CHUNK_SIZE) {
        const chunkPlaceholders = valuePlaceholders.slice(i, i + CHUNK_SIZE);
        const chunkValues = values.slice(i * 12, (i + CHUNK_SIZE) * 12);
        
        let cIdx = 1;
        const reindexedPlaceholders = chunkPlaceholders.map(() => {
          const p = `($${cIdx}, $${cIdx+1}, $${cIdx+2}, $${cIdx+3}, $${cIdx+4}, $${cIdx+5}, $${cIdx+6}, $${cIdx+7}, $${cIdx+8}, $${cIdx+9}, $${cIdx+10}, $${cIdx+11}, NOW())`;
          cIdx += 12;
          return p;
        });

        await client.query(`
          INSERT INTO public.syllabus_chapters (
            campus_id, subject_id, chapter_number, chapter_name,
            estimated_periods, completed_periods, status, order_index,
            learning_objectives, key_concepts, term_name, assessment_milestone, created_at
          ) VALUES ${reindexedPlaceholders.join(', ')};
        `, chunkValues);
      }
    }

    await client.query('COMMIT');

    safeRevalidate('/admin/curriculum');
    safeRevalidate('/admin/syllabus');
    safeRevalidate('/admin/lesson-diary');

    return {
      success: true,
      seededChapters: seededCount,
      message: `Successfully seeded ${seededCount} curriculum chapters across unmapped academic subjects!`
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error seeding curriculum chapters:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
