const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function seedFullSchoolTimetable() {
  await client.connect();

  const campusRes = await client.query('SELECT id FROM public.campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const ayRes = await client.query('SELECT id FROM public.academic_years LIMIT 1');
  const ayId = ayRes.rows[0]?.id;

  console.log('Seeding Timetable for Nursery/LKG/UKG (9am-1pm) & Classes 1 to 12 (8am-2:30pm) for campus:', campusId);

  // 1. Ensure all Classes from Nursery to Grade 12 exist in public.classes
  const ALL_CLASSES_DEFINITIONS = [
    // Early Years (9:00 AM - 1:00 PM)
    { grade: "Nursery", section: "Earth", wing: "Early Years" },
    { grade: "Nursery", section: "Mars", wing: "Early Years" },
    { grade: "LKG", section: "Sun", wing: "Early Years" },
    { grade: "LKG", section: "Moon", wing: "Early Years" },
    { grade: "UKG", section: "Jupiter", wing: "Early Years" },
    { grade: "UKG", section: "Neptune", wing: "Early Years" },
    { grade: "UKG", section: "Uranus", wing: "Early Years" },
    // Primary (8:00 AM - 2:30 PM)
    { grade: "Grade 1", section: "A", wing: "Lower Primary (1-2)" },
    { grade: "Grade 1", section: "B", wing: "Lower Primary (1-2)" },
    { grade: "Grade 2", section: "A", wing: "Lower Primary (1-2)" },
    { grade: "Grade 3", section: "A", wing: "Upper Primary (3-5)" },
    { grade: "Grade 4", section: "A", wing: "Upper Primary (3-5)" },
    { grade: "Grade 5", section: "A", wing: "Upper Primary (3-5)" },
    // Middle School (Classes 6 to 8)
    { grade: "Grade 6", section: "A", wing: "Middle School (6-8)" },
    { grade: "Grade 7", section: "A", wing: "Middle School (6-8)" },
    { grade: "Grade 8", section: "A", wing: "Middle School (6-8)" },
    // Secondary & Senior Secondary (Classes 9 to 12)
    { grade: "Grade 9", section: "A", wing: "Secondary (9-10)" },
    { grade: "Grade 10", section: "A", wing: "Secondary (9-10)" },
    { grade: "Grade 11", section: "A", wing: "Senior Secondary (11-12)" },
    { grade: "Grade 12", section: "A", wing: "Senior Secondary (11-12)" }
  ];

  for (const c of ALL_CLASSES_DEFINITIONS) {
    const existing = await client.query('SELECT id FROM public.classes WHERE campus_id = $1 AND grade = $2 AND section = $3', [campusId, c.grade, c.section]);
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO public.classes (campus_id, academic_year_id, grade, section, capacity)
        VALUES ($1, $2, $3, $4, 40)
      `, [campusId, ayId, c.grade, c.section]);
    }
  }

  // Fetch all staff members to assign
  const staffRes = await client.query('SELECT id, first_name, last_name, designation, subjects_taught, department FROM public.staff WHERE campus_id = $1', [campusId]);
  const teachers = staffRes.rows.filter(s => s.first_name);
  console.log(`Found ${teachers.length} teachers to allocate across periods.`);

  // Clear existing timetable
  await client.query('DELETE FROM public.school_timetable WHERE campus_id = $1', [campusId]);

  // 1. Primary & Senior Period Templates (Classes 1 to 12): 8:00 AM - 2:30 PM
  const SENIOR_PERIODS = [
    { num: 0, label: "Morning Assembly & Mindfulness", start: "08:00 AM", end: "08:15 AM", dur: 15, break_type: "Assembly" },
    { num: 1, label: "Period 1", start: "08:15 AM", end: "08:55 AM", dur: 40, break_type: "None" },
    { num: 2, label: "Period 2", start: "08:55 AM", end: "09:35 AM", dur: 40, break_type: "None" },
    { num: 3, label: "Period 3", start: "09:35 AM", end: "10:15 AM", dur: 40, break_type: "None" },
    { num: 4, label: "Period 4", start: "10:15 AM", end: "10:55 AM", dur: 40, break_type: "None" },
    { num: 5, label: "Short Break / Tiffin", start: "10:55 AM", end: "11:25 AM", dur: 30, break_type: "Short Break" },
    { num: 6, label: "Period 5", start: "11:25 AM", end: "12:05 PM", dur: 40, break_type: "None" },
    { num: 7, label: "Period 6", start: "12:05 PM", end: "12:45 PM", dur: 40, break_type: "None" },
    { num: 8, label: "Period 7", start: "12:45 PM", end: "01:25 PM", dur: 40, break_type: "None" },
    { num: 9, label: "Sports & Co-Curricular Activity (50 Min)", start: "01:25 PM", end: "02:15 PM", dur: 50, break_type: "None" },
    { num: 10, label: "Dispersal / Diary / Closing", start: "02:15 PM", end: "02:30 PM", dur: 15, break_type: "Dispersal" }
  ];

  // 2. Early Childhood Period Templates (Nursery / LKG / UKG): 9:00 AM - 1:00 PM
  const EARLY_YEARS_PERIODS = [
    { num: 0, label: "Morning Circle Time & Welcome Prayer", start: "09:00 AM", end: "09:20 AM", dur: 20, break_type: "Assembly" },
    { num: 1, label: "Block 1: Phonics, Rhymes & Language Fun", start: "09:20 AM", end: "09:50 AM", dur: 30, break_type: "None" },
    { num: 2, label: "Block 2: Number Magic & Pre-Math Concepts", start: "09:50 AM", end: "10:20 AM", dur: 30, break_type: "None" },
    { num: 3, label: "Healthy Fruit & Snack Break (Tiffin)", start: "10:20 AM", end: "10:50 AM", dur: 30, break_type: "Short Break" },
    { num: 4, label: "Block 3: Sensory Play, EVS & Nature Walk", start: "10:50 AM", end: "11:20 AM", dur: 30, break_type: "None" },
    { num: 5, label: "Block 4: Creative Arts, Clay Moulding & Craft", start: "11:20 AM", end: "11:50 AM", dur: 30, break_type: "None" },
    { num: 6, label: "Block 5: Music, Movement & Rhythmic Dance", start: "11:50 AM", end: "12:20 PM", dur: 30, break_type: "None" },
    { num: 7, label: "Block 6: Gross Motor, Outdoor Play & Games", start: "12:20 PM", end: "12:45 PM", dur: 25, break_type: "None" },
    { num: 8, label: "Storytelling, Diary & Warm Dispersal", start: "12:45 PM", end: "01:00 PM", dur: 15, break_type: "Dispersal" }
  ];

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const SUBJECT_ROTATION = {
    "Early Years": ["Phonics & Rhymes", "Number Fun & Math", "Storytelling & EVS", "Fine Motor Play", "Music & Movement", "Art & Craft", "Free Play"],
    "Lower Primary (1-2)": ["English Grammar", "Mathematics", "Hindi", "Environmental Studies (EVS)", "Computer & Coding", "Vedic Math", "Visual Arts"],
    "Upper Primary (3-5)": ["Mathematics", "Science & Discovery", "English Literature", "Social Studies / EVS", "Hindi Vyakaran", "Robotics & Computer", "Mental Math & Logic"],
    "Middle School (6-8)": ["Advanced Mathematics", "General Science (Physics/Chem/Bio)", "Social Science (Hist/Civics/Geo)", "English Language & Lit", "Hindi / Sanskrit", "Artificial Intelligence & Coding", "Reasoning & Aptitude"],
    "Secondary (9-10)": ["Mathematics Standard", "Physics & Chemistry", "Biology & Life Sciences", "History, Civics & Geography", "English Communicative", "Information Technology", "Economics & Commercial Studies"],
    "Senior Secondary (11-12)": ["Physics / Accountancy", "Chemistry / Business Studies", "Mathematics / Applied Math", "Biology / Economics", "Computer Science / IP", "English Core", "General Studies & Aptitude"]
  };

  const DAILY_ACTIVITIES = {
    "Monday": { subject: "Athletics, Football & Fitness (Sports)", room: "Sports Ground" },
    "Tuesday": { subject: "STEM Lab, Robotics & Tinkering", room: "STEM Lab" },
    "Wednesday": { subject: "Visual Arts, Pottery & Origami", room: "Art Studio" },
    "Thursday": { subject: "Music, Classical Dance & Theatre", room: "Music & Dance Studio" },
    "Friday": { subject: "Yoga, Martial Arts & Chess", room: "Sports Complex" }
  };

  let count = 0;

  for (const cls of ALL_CLASSES_DEFINITIONS) {
    const isEarlyYears = cls.wing === "Early Years";
    const periodsTemplate = isEarlyYears ? EARLY_YEARS_PERIODS : SENIOR_PERIODS;
    const subList = SUBJECT_ROTATION[cls.wing] || SUBJECT_ROTATION["Upper Primary (3-5)"];

    for (const day of DAYS) {
      for (const p of periodsTemplate) {
        let subject = p.label;
        let assignedTeacher = null;
        let room = `Room 10${cls.grade.includes('Nursery') ? '1' : cls.grade.includes('LKG') ? '2' : cls.grade.includes('UKG') ? '3' : '4'}`;

        if (!isEarlyYears && p.num === 9) {
          // Dedicated 50-Min Sports & Activity Block for Classes 1 to 12
          const act = DAILY_ACTIVITIES[day] || { subject: "Sports & Activities", room: "Sports Ground" };
          subject = act.subject;
          room = act.room;
          assignedTeacher = teachers.find(t => 
            (t.designation && t.designation.toLowerCase().includes("sport")) || 
            (t.subjects_taught && t.subjects_taught.toLowerCase().includes("sport")) ||
            (t.department && t.department.toLowerCase().includes("sport"))
          ) || teachers[0];
        } else if (p.break_type === 'None') {
          const subIdx = (p.num + DAYS.indexOf(day)) % subList.length;
          subject = subList[subIdx];

          if (teachers.length > 0) {
            assignedTeacher = teachers.find(t => 
              (t.subjects_taught && t.subjects_taught.toLowerCase().includes(subject.split(' ')[0].toLowerCase())) ||
              (t.department && t.department.toLowerCase().includes(subject.split(' ')[0].toLowerCase()))
            ) || teachers[(p.num + cls.grade.length + DAYS.indexOf(day)) % teachers.length];
          }

          if (subject.includes("Computer") || subject.includes("Robotics") || subject.includes("Artificial Intelligence")) room = "STEM Lab";
          else if (subject.includes("Physics") || subject.includes("Chemistry") || subject.includes("Biology") || subject.includes("Science")) room = "Science Composite Lab";
          else if (subject.includes("Art")) room = "Art Studio";
          else if (subject.includes("Music")) room = "Music & Dance Studio";
        }

        const teacherName = assignedTeacher ? `${assignedTeacher.first_name} ${assignedTeacher.last_name || ''}`.trim() : (p.break_type === 'None' ? 'Assigned Teacher' : 'All Staff');

        await client.query(`
          INSERT INTO public.school_timetable (
            campus_id, academic_session, wing, day_of_week, period_number, period_label,
            start_time, end_time, duration_minutes, break_type, class_name, section_name,
            subject_name, teacher_id, teacher_name, room_number, status
          ) VALUES (
            $1, '2026-2027', $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15, 'Active'
          );
        `, [
          campusId, cls.wing, day, p.num, p.label,
          p.start, p.end, p.dur, p.break_type, cls.grade, cls.section,
          subject, assignedTeacher?.id || null, teacherName, room
        ]);

        count++;
      }
    }
  }

  console.log(`🎉 Successfully provisioned ${count} standard timetable slots with Nursery/LKG/UKG (9am-1pm) & Classes 1-12 (8am-2:30pm)!`);
  await client.end();
}

seedFullSchoolTimetable();
