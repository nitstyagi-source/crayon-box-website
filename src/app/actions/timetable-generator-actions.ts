"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';
import { TimetableGeneticEngine, TimetableClassConfig, TimetableTeacherConfig } from '@/lib/algorithms/timetable-genetic-engine';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return pool;
}

function safeRevalidate(path: string) {
  try { revalidatePath(path); } catch {}
}

export async function runGeneticTimetableGeneratorAction() {
  const p = getPool();
  const client = await p.connect();
  try {
    // 1. Fetch live classes and teachers
    const [classRows, staffRows] = await Promise.all([
      client.query(`SELECT id, grade, section FROM public.classes LIMIT 6`),
      client.query(`SELECT id, first_name, last_name, designation, subjects_taught FROM public.staff WHERE is_active = true LIMIT 10`)
    ]);

    const classes: TimetableClassConfig[] = classRows.rows.length > 0
      ? classRows.rows.map((c: any) => ({
          className: c.grade || 'Class 4',
          section: c.section || 'A',
          requiredPeriods: {
            'Mathematics': 6,
            'English': 5,
            'Science': 5,
            'Social Studies': 4,
            'Hindi': 4,
            'Computer Science': 2,
            'Physical Education': 2
          }
        }))
      : [
          { className: 'Class 3', section: 'A', requiredPeriods: { 'Mathematics': 6, 'English': 5, 'Science': 5, 'Hindi': 4, 'Art': 2 } },
          { className: 'Class 4', section: 'A', requiredPeriods: { 'Mathematics': 6, 'English': 5, 'Science': 5, 'Hindi': 4, 'Computer Science': 2 } },
          { className: 'Class 5', section: 'A', requiredPeriods: { 'Mathematics': 6, 'English': 5, 'Science': 5, 'Social Studies': 4, 'Physical Education': 2 } }
        ];

    const teachers: TimetableTeacherConfig[] = staffRows.rows.length > 0
      ? staffRows.rows.map((s: any) => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name || ''}`.trim(),
          subjects: Array.isArray(s.subjects_taught) ? s.subjects_taught : ['Mathematics', 'English', 'Science'],
          maxPeriodsPerDay: 5
        }))
      : [
          { id: 'T1', name: 'Dr. Anita Sharma', subjects: ['Mathematics', 'Science'], maxPeriodsPerDay: 5 },
          { id: 'T2', name: 'Mr. Rajesh Verma', subjects: ['English', 'Social Studies'], maxPeriodsPerDay: 5 },
          { id: 'T3', name: 'Ms. Pooja Nair', subjects: ['Hindi', 'Art'], maxPeriodsPerDay: 5 },
          { id: 'T4', name: 'Mr. Vikram Singh', subjects: ['Physical Education', 'Computer Science'], maxPeriodsPerDay: 5 }
        ];

    // 2. Run Genetic Algorithm
    const engine = new TimetableGeneticEngine({
      classes,
      teachers,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      periodsPerDay: 7,
      populationSize: 30,
      maxGenerations: 60
    });

    const result = engine.generate();

    // 3. Clear old generated timetable and write new conflict-free slots
    await client.query(`DELETE FROM public.school_timetable WHERE academic_session = '2026-2027';`);

    const periodTimings = [
      { p: 1, start: '08:00:00', end: '08:45:00' },
      { p: 2, start: '08:45:00', end: '09:30:00' },
      { p: 3, start: '09:30:00', end: '10:15:00' },
      { p: 4, start: '10:30:00', end: '11:15:00' },
      { p: 5, start: '11:15:00', end: '12:00:00' },
      { p: 6, start: '12:30:00', end: '01:15:00' },
      { p: 7, start: '01:15:00', end: '02:00:00' }
    ];

    for (const slot of result.slots.slice(0, 70)) {
      const timing = periodTimings.find(t => t.p === slot.periodNumber) || periodTimings[0];
      await client.query(`
        INSERT INTO public.school_timetable (
          academic_session, day_of_week, period_number, period_label,
          start_time, end_time, duration_minutes, class_name, section_name,
          subject_name, teacher_id, teacher_name, room_number, status
        ) VALUES (
          '2026-2027', $1, $2, $3,
          $4, $5, 45, $6, $7,
          $8, $9, $10, $11, 'PUBLISHED'
        )
      `, [
        slot.day,
        slot.periodNumber,
        `Period ${slot.periodNumber}`,
        timing.start,
        timing.end,
        slot.className,
        slot.section,
        slot.subjectName,
        slot.teacherId.startsWith('T-') ? null : slot.teacherId,
        slot.teacherName,
        slot.roomNumber
      ]);
    }

    safeRevalidate('/admin/academics');

    return {
      success: true,
      clashCount: result.clashCount,
      fitnessScore: result.fitnessScore,
      generationsRun: result.generationsRun,
      durationMs: result.durationMs,
      totalSlotsGenerated: result.slots.length,
      sampleSlots: result.slots.slice(0, 10)
    };
  } catch (err: any) {
    console.error('Timetable generation error:', err);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}
