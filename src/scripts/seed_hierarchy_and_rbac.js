const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function seedHierarchyAndRbac() {
  await client.connect();
  console.log('🚀 Seeding Trust Hierarchy & RBAC Roles into live PostgreSQL...');

  // 1. Trust
  const trustRes = await client.query(`
    INSERT INTO public.trusts (code, name, registration_number, headquarters, contact_email, contact_phone, website)
    VALUES ('VET', 'Vani Educational Trust', 'VET/REG/2012/DEL-8891', 'Sector 62, Institutional Area, Noida, UP', 'governance@vanitrust.edu.in', '+91 120 4567890', 'https://vanitrust.edu.in')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `);
  const trustId = trustRes.rows[0].id;

  // 2. Legal Entity
  const legalRes = await client.query(`
    INSERT INTO public.legal_entities (trust_id, legal_name, cin_or_registration_no, pan_number, tan_number, gstin_number, registered_address)
    VALUES ($1, 'Vani Educational Trust Society', 'DEL-SOC-8891-2012', 'AAATV1234F', 'DELV12345A', '07AAATV1234F1Z5', 'Plot 4A, Sector 62, Institutional Area, Noida, UP')
    RETURNING id;
  `, [trustId]);
  const legalEntityId = legalRes.rows[0]?.id;

  // 3. Four Canonical Institutions
  const institutions = [
    {
      code: 'CBS',
      name: 'Crayon Box School',
      shortName: 'Crayon Box School',
      institutionType: 'K12_SCHOOL',
      academicFramework: 'CBSE',
      boardAffiliation: 'CBSE',
      affiliationNumber: 'AFF/2130894',
      status: 'ACTIVE',
      principalName: 'Dr. Ananya Roy',
      principalEmail: 'principal@crayonboxschool.com',
      logoUrl: '/logo.png',
      brandColor: '#2563eb',
      address: 'Shastri Park Extn., Delhi NCR',
      phone: '+91 11 2761 8899',
      website: 'https://crayonboxschool.edu.in'
    },
    {
      code: 'AVM',
      name: 'Avinya Vidya Mandir',
      shortName: 'Avinya Vidya Mandir',
      institutionType: 'K12_SCHOOL',
      academicFramework: 'CBSE',
      boardAffiliation: 'CBSE',
      affiliationNumber: 'AFF/2130992',
      principalName: 'Prof. Ramesh Chandra',
      principalEmail: 'principal@avinyavidyamandir.edu.in',
      brandColor: '#059669',
      address: 'Virender Nagar Burari, Delhi 110084',
    },
    {
      code: 'AS',
      name: 'Avinya School',
      shortName: 'Avinya School (Kindergarten)',
      institutionType: 'PRE_SCHOOL',
      academicFramework: 'MONTESSORI',
      boardAffiliation: 'MONTESSORI',
      principalName: 'Mrs. Pratibha Joshi',
      principalEmail: 'headmistress@avinyaschool.edu.in',
      brandColor: '#7c3aed',
      address: 'Virender Nagar Burari, Delhi 110084',
    },
    {
      code: 'CBPS',
      name: 'Crayon Box Pre School',
      shortName: 'Crayon Box Pre-School',
      institutionType: 'PRE_SCHOOL',
      academicFramework: 'MONTESSORI',
      boardAffiliation: 'MONTESSORI',
      principalName: 'Mrs. Shalini Mehta',
      principalEmail: 'headmistress@crayonboxpreschool.com',
      brandColor: '#ec4899',
      address: 'Shastri Park Extn., Delhi NCR',
    },
  ];

  for (const inst of institutions) {
    const instRes = await client.query(`
      INSERT INTO public.institutions (code, trust_id, legal_entity_id, name, short_name, institution_type, academic_framework, board_affiliation, affiliation_number, principal_name, principal_email, brand_color, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        institution_type = EXCLUDED.institution_type,
        academic_framework = EXCLUDED.academic_framework
      RETURNING id;
    `, [
      inst.code,
      trustId,
      legalEntityId,
      inst.name,
      inst.shortName,
      inst.institutionType,
      inst.academicFramework,
      inst.boardAffiliation,
      inst.affiliationNumber || null,
      inst.principalName,
      inst.principalEmail,
      inst.brandColor,
      inst.address,
    ]);

    const instId = instRes.rows[0].id;

    // Academic Session 2026-2027
    await client.query(`
      INSERT INTO public.academic_sessions (institution_id, name, start_date, end_date, calendar_model, is_current, status)
      VALUES ($1, '2026-2027', '2026-04-01', '2027-03-31', $2, true, 'ACTIVE')
      ON CONFLICT DO NOTHING;
    `, [instId, inst.academicFramework === 'CBSE' ? 'CBSE_ANNUAL' : 'MONTESSORI_CONTINUOUS']);
  }

  // 4. Roles
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Full cross-institution access and governance', level: 10, isSystem: true },
    { code: 'PRINCIPAL', name: 'School Principal', description: 'Institutional oversight, approvals and reports', level: 8, isSystem: true },
    { code: 'ACCOUNTS', name: 'Accounts Officer', description: 'Fee billing, reconciliation, expenses and invoices', level: 6, isSystem: true },
    { code: 'TEACHER', name: 'Classroom Teacher', description: 'Attendance, lesson diaries, marks and homework', level: 4, isSystem: true },
    { code: 'PARENT', name: 'Parent / Guardian', description: 'Child profile, fee payment, attendance and circulars', level: 1, isSystem: true },
  ];

  for (const r of roles) {
    await client.query(`
      INSERT INTO public.roles (code, name, description, hierarchy_level, is_system)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
    `, [r.code, r.name, r.description, r.level, r.isSystem]);
  }

  // 5. Default Role Module Permissions Matrix
  const modules = [
    'STUDENTS', 'CLASSES', 'ADMISSIONS', 'FINANCE', 'HR_PAYROLL',
    'TIMETABLE', 'CURRICULUM', 'INCIDENTS_POCSO', 'HEALTH_CLINIC', 'BROADCASTS'
  ];

  for (const mod of modules) {
    // Super Admin: All true
    await client.query(`
      INSERT INTO public.role_module_permissions (role_code, module_code, can_view, can_create, can_edit, can_delete, can_approve, can_export)
      VALUES ('SUPER_ADMIN', $1, true, true, true, true, true, true)
      ON CONFLICT (role_code, module_code) DO NOTHING;
    `, [mod]);

    // Teacher: view/create attendance, diary, timetable; no finance
    const isTeacherAllowed = ['STUDENTS', 'CLASSES', 'TIMETABLE', 'CURRICULUM', 'BROADCASTS'].includes(mod);
    await client.query(`
      INSERT INTO public.role_module_permissions (role_code, module_code, can_view, can_create, can_edit, can_delete, can_approve, can_export)
      VALUES ('TEACHER', $1, $2, $2, false, false, false, false)
      ON CONFLICT (role_code, module_code) DO NOTHING;
    `, [mod, isTeacherAllowed]);

    // Accounts: finance all true, student view
    const isAccountsAllowed = ['FINANCE', 'STUDENTS', 'ADMISSIONS'].includes(mod);
    await client.query(`
      INSERT INTO public.role_module_permissions (role_code, module_code, can_view, can_create, can_edit, can_delete, can_approve, can_export)
      VALUES ('ACCOUNTS', $1, $2, $2, $2, false, false, true)
      ON CONFLICT (role_code, module_code) DO NOTHING;
    `, [mod, isAccountsAllowed]);
  }

  console.log('✅ Trust Hierarchy, 4 Institutions, and RBAC Matrix seeded successfully in PostgreSQL!');
  await client.end();
}

seedHierarchyAndRbac().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
