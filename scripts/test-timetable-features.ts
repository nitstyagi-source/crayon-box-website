import pg from 'pg';
import {
  getTimetableSettingsAction,
  saveTimetableSettingsAction,
  saveMotherTeacherAllocationAction,
  checkTimetableConflictAction,
  autoGenerateTimetableAction
} from '../src/app/actions/timetable-management-actions';
import { getDefaultPeriodTimings } from '../src/lib/timetable-utils';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspectTimetable() {
  console.log('🔍 ========================================================');
  console.log('🔍 INSPECTING TIMETABLE SCHEMA & SYSTEM STATE');
  console.log('🔍 ========================================================\n');

  const client = await pool.connect();
  try {
    // 1. Inspect school_timetable columns
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'school_timetable'
      ORDER BY ordinal_position;
    `);
    console.log('📌 1. Columns in public.school_timetable:');
    cols.rows.forEach((c: any) => {
      console.log(`   - ${c.column_name} (${c.data_type}) [Nullable: ${c.is_nullable}]`);
    });

    // 2. Count existing timetable records
    const countRes = await client.query(`SELECT count(*) as total, count(DISTINCT class_name) as distinct_classes FROM public.school_timetable;`);
    console.log(`\n📌 2. Timetable rows: ${countRes.rows[0].total}, Distinct Classes: ${countRes.rows[0].distinct_classes}`);

    // 4. Create timetable_settings table if not exists
    console.log('\n📌 4. Creating public.timetable_settings...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.timetable_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS',
        academic_session VARCHAR(20) NOT NULL DEFAULT '2026-2027',
        school_start_time VARCHAR(20) DEFAULT '08:00 AM',
        school_end_time VARCHAR(20) DEFAULT '02:30 PM',
        assembly_start_time VARCHAR(20) DEFAULT '08:00 AM',
        assembly_end_time VARCHAR(20) DEFAULT '08:30 AM',
        working_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
        periods_per_day INT DEFAULT 8,
        period_duration_minutes INT DEFAULT 40,
        period_timings JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT uq_institution_session UNIQUE (institution_code, academic_session)
      );
    `);
    console.log('   ✅ public.timetable_settings created / verified');

    // 5. Create class_mother_teachers table if not exists
    console.log('\n📌 5. Creating public.class_mother_teachers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.class_mother_teachers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS',
        academic_session VARCHAR(20) NOT NULL DEFAULT '2026-2027',
        class_name VARCHAR(50) NOT NULL,
        section_name VARCHAR(20) NOT NULL,
        mother_teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
        mother_teacher_name VARCHAR(255) NOT NULL,
        subjects_taught JSONB DEFAULT '["English", "Mathematics", "Environmental Studies (EVS)", "Hindi", "Art & Craft", "Rhymes & Storytelling"]'::jsonb,
        specialist_assignments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT uq_class_section_session UNIQUE (institution_code, academic_session, class_name, section_name)
      );
    `);
    // 6. Test getTimetableSettingsAction
    console.log('\n📌 6. Testing getTimetableSettingsAction for CBS...');
    const settingsRes = await getTimetableSettingsAction('CBS');
    console.log('   Settings success:', settingsRes.success, 'Working Days:', settingsRes.settings?.workingDays, 'Periods:', settingsRes.settings?.periodsPerDay);

    // 7. Test saveTimetableSettingsAction
    console.log('\n📌 7. Testing saveTimetableSettingsAction with 6-day week & custom period timings...');
    const saveSettingsRes = await saveTimetableSettingsAction({
      institutionCode: 'CBS',
      schoolStartTime: '08:00 AM',
      schoolEndTime: '02:45 PM',
      assemblyStartTime: '08:00 AM',
      assemblyEndTime: '08:25 AM',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      periodsPerDay: 8,
      periodDurationMinutes: 40,
      periodTimings: getDefaultPeriodTimings(8, 8, 25, 40)
    });
    console.log('   Save Settings result:', saveSettingsRes);

    // 8. Test Mother Teacher Allocation for Class 1 Section A
    console.log('\n📌 8. Testing saveMotherTeacherAllocationAction for Class 1 Section A...');
    const staffRes = await client.query(`SELECT id, first_name, last_name FROM public.staff WHERE status = 'Active' LIMIT 1;`);
    if (staffRes.rows.length > 0) {
      const mt = staffRes.rows[0];
      const mtName = `${mt.first_name} ${mt.last_name}`;
      const mtRes = await saveMotherTeacherAllocationAction({
        institutionCode: 'CBS',
        className: 'Class 1',
        sectionName: 'A',
        motherTeacherId: mt.id,
        motherTeacherName: mtName,
        subjectsTaught: ['English Phonics & Literacy', 'Mathematics & Numbers', 'Environmental Studies (EVS)', 'Hindi Language', 'Art & Creative Craft']
      });
      console.log('   Mother Teacher saved:', mtRes);
    }

    // 9. Test Auto Generation for Class 1 Section A
    console.log('\n📌 9. Testing autoGenerateTimetableAction for Class 1 Section A...');
    const genRes = await autoGenerateTimetableAction({
      institutionCode: 'CBS',
      scope: 'SINGLE_CLASS',
      className: 'Class 1',
      sectionName: 'A',
      periodsPerDay: 8
    });
    console.log('   Auto-Generator Result:', genRes);

    // 10. Test Conflict Protection
    console.log('\n📌 10. Testing checkTimetableConflictAction...');
    if (staffRes.rows.length > 0) {
      const teacher = staffRes.rows[0];
      // Intentionally check conflict on a period already booked
      const conflictRes = await checkTimetableConflictAction({
        className: 'Class 5',
        sectionName: 'A',
        dayOfWeek: 'Monday',
        periodNumber: 1,
        teacherId: teacher.id,
        teacherName: `${teacher.first_name} ${teacher.last_name}`
      });
      console.log('   Conflict Check Result (hasConflict):', conflictRes.hasConflict);
      if (conflictRes.hasConflict) {
        console.log('   Conflict Message:', conflictRes.conflicts[0]?.message);
      }
    }

  } catch (err: any) {
    console.error('Error in timetable test:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectTimetable();
