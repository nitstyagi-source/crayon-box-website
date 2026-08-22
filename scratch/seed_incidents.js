const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function initIncidents() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS school_incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
      incident_code VARCHAR(50) UNIQUE NOT NULL,
      incident_type VARCHAR(50) NOT NULL,
      incident_date DATE NOT NULL,
      incident_time VARCHAR(20) NOT NULL,
      location VARCHAR(150) NOT NULL,
      person_type VARCHAR(50) DEFAULT 'Student',
      student_id UUID REFERENCES students(id) ON DELETE SET NULL,
      person_name VARCHAR(150) NOT NULL,
      admission_no VARCHAR(50),
      class_name VARCHAR(100),
      section_name VARCHAR(50),
      reported_by VARCHAR(150) NOT NULL,
      reported_by_role VARCHAR(100) DEFAULT 'Class Teacher',
      category VARCHAR(100) NOT NULL,
      severity VARCHAR(50) NOT NULL DEFAULT 'Low',
      description TEXT NOT NULL,
      immediate_action TEXT NOT NULL,
      witnesses TEXT,
      other_persons_involved TEXT,
      counselling_required BOOLEAN DEFAULT false,
      follow_up_required BOOLEAN DEFAULT false,
      follow_up_date DATE,
      final_resolution TEXT,

      medical_symptoms TEXT,
      injury_location VARCHAR(150),
      first_aid_given TEXT,
      medicine_given TEXT,
      nurse_name VARCHAR(150),
      doctor_referral BOOLEAN DEFAULT false,
      ambulance_required BOOLEAN DEFAULT false,
      student_disposition VARCHAR(100) DEFAULT 'Returned to Class',

      parent_informed BOOLEAN DEFAULT false,
      parent_notification_channel VARCHAR(50) DEFAULT 'Not Required',
      parent_contacted_by VARCHAR(150),
      parent_contacted_at TIMESTAMPTZ,
      parent_response TEXT,
      pickup_required BOOLEAN DEFAULT false,
      pickup_person VARCHAR(150),
      pickup_handover_time VARCHAR(50),

      attachments JSONB DEFAULT '[]'::jsonb,
      status VARCHAR(50) DEFAULT 'Open',
      closed_by VARCHAR(150),
      closed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_incidents_date ON school_incidents(incident_date);
    CREATE INDEX IF NOT EXISTS idx_incidents_type ON school_incidents(incident_type);
    CREATE INDEX IF NOT EXISTS idx_incidents_status ON school_incidents(status);
    CREATE INDEX IF NOT EXISTS idx_incidents_sev ON school_incidents(severity);
  `);

  console.log('✅ Created school_incidents table successfully!');

  const campusRes = await client.query('SELECT id FROM campuses LIMIT 1');
  const campusId = campusRes.rows[0]?.id;

  const todayStr = new Date().toISOString().split('T')[0];

  const sampleIncidents = [
    {
      code: 'CBS-INC-2026-0041',
      type: 'Medical',
      date: todayStr,
      time: '10:45 AM',
      location: 'Primary Playground (Swing Area)',
      personName: 'Aarav Sharma',
      admNo: 'CBS-2026-0129',
      className: 'Grade 5',
      sectionName: 'A',
      reportedBy: 'Rahul Sharma (Math Teacher on Duty)',
      reportedByRole: 'Duty Teacher',
      category: 'Playground Fall & Minor Abrasion',
      severity: 'Low',
      description: 'Student tripped while running near the slide area during recess, causing a superficial scrape on right knee.',
      immediateAction: 'Escorted to School Health Clinic immediately. Antiseptic wash, Neosporin ointment, and sterile adhesive bandage applied.',
      witnesses: 'Vivaan Roy & Kabir Saxena',
      otherPersons: 'None',
      counselling: false,
      followUp: false,
      followUpDate: null,
      finalResolution: 'Bandage applied. Student felt comfortable and returned to classroom at 11:15 AM.',
      medicalSymptoms: 'Mild pain and superficial bleeding on right knee.',
      injuryLocation: 'Right Knee',
      firstAid: 'Cleaned with Savlon antiseptic, applied soframycin, covered with sterile gauze.',
      medicineGiven: 'None',
      nurseName: 'Sister Anjali (School Nurse)',
      doctorReferral: false,
      ambulance: false,
      disposition: 'Returned to Class',
      parentInformed: true,
      parentChannel: 'App Notification',
      parentContactedBy: 'Clinic Sister Anjali',
      parentContactedAt: new Date().toISOString(),
      parentResponse: 'Parent acknowledged notification in App and thanked clinic staff.',
      pickupRequired: false,
      pickupPerson: null,
      pickupTime: null,
      status: 'Closed',
      closedBy: 'Sister Anjali',
      closedAt: new Date().toISOString()
    },
    {
      code: 'CBS-INC-2026-0042',
      type: 'Medical',
      date: todayStr,
      time: '01:15 PM',
      location: 'Classroom 4B',
      personName: 'Ananya Gupta',
      admNo: 'CBS-2026-0188',
      className: 'Grade 4',
      sectionName: 'B',
      reportedBy: 'Neha Verma (Class Teacher)',
      reportedByRole: 'Class Teacher',
      category: 'Sudden High Fever & Shivering',
      severity: 'Medium',
      description: 'Student reported feeling severe chills and headache post-lunch. Temperature recorded at 101.8°F in infirmary.',
      immediateAction: 'Resting in AC infirmary with cold compress on forehead. Oral hydration provided.',
      witnesses: 'Classmates in 4B',
      otherPersons: 'None',
      counselling: false,
      followUp: true,
      followUpDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
      finalResolution: 'Mother arrived for early pickup. Paracetamol given per parent telephonic consent.',
      medicalSymptoms: 'Fever 101.8°F, shivering, frontal headache.',
      injuryLocation: 'Systemic / Head',
      firstAid: 'Cold sponging, oral electrolytes.',
      medicineGiven: 'Paracetamol 250mg syrup (Parent consent verified)',
      nurseName: 'Sister Anjali',
      doctorReferral: true,
      ambulance: false,
      disposition: 'Picked up by Parent',
      parentInformed: true,
      parentChannel: 'Phone Call',
      parentContactedBy: 'Neha Verma (Class Teacher)',
      parentContactedAt: new Date().toISOString(),
      parentResponse: 'Mother (Mrs. Rekha Gupta) confirmed she is en route for immediate pickup.',
      pickupRequired: true,
      pickupPerson: 'Mrs. Rekha Gupta (Mother)',
      pickupTime: '01:50 PM',
      status: 'Action Taken',
      closedBy: null,
      closedAt: null
    },
    {
      code: 'CBS-INC-2026-0043',
      type: 'General',
      date: todayStr,
      time: '11:20 AM',
      location: 'Junior Cafeteria Corridor',
      personName: 'Kabir Saxena',
      admNo: 'CBS-2026-0195',
      className: 'Grade 5',
      sectionName: 'A',
      reportedBy: 'Bhawna Tyagi (Floor Supervisor)',
      reportedByRole: 'Floor Supervisor',
      category: 'Student conflict & Spilled Lunch',
      severity: 'Medium',
      description: 'Verbal disagreement over cafeteria queue leading to mutual pushing and food container spillage.',
      immediateAction: 'Separated both students, cleared spilled food. Conducted mutual mediation in Coordinator office.',
      witnesses: 'Cafeteria Staff (Sunil)',
      otherPersons: 'Rohan Mehra (Grade 5A)',
      counselling: true,
      followUp: true,
      followUpDate: new Date(Date.now() + 48*60*60*1000).toISOString().split('T')[0],
      finalResolution: 'Both students shook hands and apologized. Replacement lunch arranged from school canteen.',
      medicalSymptoms: null,
      injuryLocation: null,
      firstAid: null,
      medicineGiven: null,
      nurseName: null,
      doctorReferral: false,
      ambulance: false,
      disposition: 'Returned to Class',
      parentInformed: true,
      parentChannel: 'Phone Call',
      parentContactedBy: 'Academic Coordinator',
      parentContactedAt: new Date().toISOString(),
      parentResponse: 'Both sets of parents appraised. Agreed to follow-up counseling session.',
      pickupRequired: false,
      pickupPerson: null,
      pickupTime: null,
      status: 'Follow-up Pending',
      closedBy: null,
      closedAt: null
    },
    {
      code: 'CBS-INC-2026-0044',
      type: 'General',
      date: todayStr,
      time: '02:30 PM',
      location: 'Science Discovery Lab',
      personName: 'Advik Nair',
      admNo: 'CBS-2026-0210',
      className: 'Grade 5',
      sectionName: 'A',
      reportedBy: 'Pooja Bhatt (Science Teacher)',
      reportedByRole: 'Subject Teacher',
      category: 'Accidental Property Damage (Glassware)',
      severity: 'Low',
      description: 'Accidentally dropped a glass measuring cylinder during optics demonstration. No bodily injury occurred.',
      immediateAction: 'Students moved back safely. Broken glass swept and disposed in hazardous waste container.',
      witnesses: 'Grade 5 Science Batch',
      otherPersons: 'None',
      counselling: false,
      followUp: false,
      followUpDate: null,
      finalResolution: 'Lab safety protocols reiterated. Replacement indented from inventory.',
      medicalSymptoms: null,
      injuryLocation: null,
      firstAid: null,
      medicineGiven: null,
      nurseName: null,
      doctorReferral: false,
      ambulance: false,
      disposition: 'Returned to Class',
      parentInformed: false,
      parentChannel: 'Not Required',
      parentContactedBy: null,
      parentContactedAt: null,
      parentResponse: null,
      pickupRequired: false,
      pickupPerson: null,
      pickupTime: null,
      status: 'Closed',
      closedBy: 'Pooja Bhatt',
      closedAt: new Date().toISOString()
    }
  ];

  for (const inc of sampleIncidents) {
    await client.query(`
      INSERT INTO school_incidents (
        campus_id, incident_code, incident_type, incident_date, incident_time,
        location, person_name, admission_no, class_name, section_name,
        reported_by, reported_by_role, category, severity, description,
        immediate_action, witnesses, other_persons_involved, counselling_required,
        follow_up_required, follow_up_date, final_resolution, medical_symptoms,
        injury_location, first_aid_given, medicine_given, nurse_name, doctor_referral,
        ambulance_required, student_disposition, parent_informed,
        parent_notification_channel, parent_contacted_by, parent_contacted_at,
        parent_response, pickup_required, pickup_person, pickup_handover_time,
        status, closed_by, closed_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
      )
      ON CONFLICT (incident_code) DO NOTHING;
    `, [
      campusId, inc.code, inc.type, inc.date, inc.time, inc.location,
      inc.personName, inc.admNo, inc.className, inc.sectionName, inc.reportedBy,
      inc.reportedByRole, inc.category, inc.severity, inc.description,
      inc.immediateAction, inc.witnesses, inc.otherPersons, inc.counselling,
      inc.followUp, inc.followUpDate, inc.finalResolution, inc.medicalSymptoms,
      inc.injuryLocation, inc.firstAid, inc.medicineGiven, inc.nurseName,
      inc.doctorReferral, inc.ambulance, inc.disposition, inc.parentInformed,
      inc.parentChannel, inc.parentContactedBy, inc.parentContactedAt,
      inc.parentResponse, inc.pickupRequired, inc.pickupPerson, inc.pickupTime,
      inc.status, inc.closedBy, inc.closedAt
    ]);
  }

  console.log('✅ Seeded sample general and medical incidents successfully!');
  await client.end();
}

initIncidents().catch(console.error);
