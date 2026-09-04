/**
 * SEED REMAINING MODULES (Exams, Library, CRM Conversion, Hardware, EdTech)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedRemaining() {
  console.log('--- SEEDING REMAINING ERP MODULES ---');

  const testCampusId = '00000000-0000-0000-0000-000000000002';
  const testAyId = '00000000-0000-0000-0000-000000000003';

  // Fetch some students
  const { data: students } = await supabase.from('students').select('*').like('admission_no', 'TEST-ADM%');

  // 1. Communications / Circulars
  console.log('1. Seeding Communications...');
  await supabase.from('communications').upsert([
    {
      id: '00000000-0000-0000-0000-000000000901',
      campus_id: testCampusId,
      title: 'TEST - Mandatory CBSE Annual Health & Eye Screening Circular',
      message: 'All parents are requested to review the health screening schedule for Class 1 to 5 commencing next Monday.',
      recipient_type: 'All Parents',
      priority: 'High',
      status: 'Sent',
      created_at: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000902',
      campus_id: testCampusId,
      title: 'TEST - PTM & Term-1 Progress Review Meeting',
      message: 'Parent-Teacher Interaction slots are now open for booking via the mobile app.',
      recipient_type: 'All Parents',
      priority: 'Normal',
      status: 'Sent',
      created_at: new Date().toISOString()
    }
  ]);

  // 2. Turnstile Gate Devices & Access Logs
  console.log('2. Seeding Turnstile Gate Devices & Logs...');
  await supabase.from('turnstile_gate_devices').upsert([
    {
      id: '00000000-0000-0000-0000-000000000911',
      device_name: 'TEST - Main Academic Turnstile 01',
      gate_zone: 'Gate 1 - North Portal',
      ip_address: '192.168.10.41:8000',
      protocol: 'TCP_IP',
      hardware_status: 'ONLINE',
      lockdown_active: false,
      free_egress_mode: false
    },
    {
      id: '00000000-0000-0000-0000-000000000912',
      device_name: 'TEST - Junior Wing Flap Barrier 02',
      gate_zone: 'Gate 2 - Primary Wing',
      ip_address: '192.168.10.55:8883',
      protocol: 'MQTT',
      hardware_status: 'ONLINE',
      lockdown_active: false,
      free_egress_mode: false
    }
  ]);

  if (students && students.length > 0) {
    await supabase.from('turnstile_access_logs').upsert([
      {
        id: '00000000-0000-0000-0000-000000000921',
        device_id: '00000000-0000-0000-0000-000000000911',
        user_id: students[0].admission_no,
        user_name: `${students[0].first_name} ${students[0].last_name}`,
        user_type: 'STUDENT',
        auth_method: 'UHF_RFID_TAP',
        direction: 'IN',
        verification_latency_ms: 145,
        anti_passback_ok: true
      },
      {
        id: '00000000-0000-0000-0000-000000000922',
        device_id: '00000000-0000-0000-0000-000000000912',
        user_id: students[1].admission_no,
        user_name: `${students[1].first_name} ${students[1].last_name}`,
        user_type: 'STUDENT',
        auth_method: 'FACE_BIOMETRIC',
        direction: 'IN',
        verification_latency_ms: 182,
        anti_passback_ok: true
      }
    ]);
  }

  // 3. Admissions Conversion Test (Convert Enquiry -> Application -> Enrolled Student)
  console.log('3. Testing Enquiry Conversion to Application & Enrolled Student...');
  const { data: enqs } = await supabase.from('enquiries').select('*').like('enquiry_no', 'TEST-ENQ%').limit(2);
  if (enqs && enqs.length > 0) {
    const enqToConvert = enqs[0];

    // Check if application already exists for this enquiry
    const { data: existingApps } = await supabase.from('admissions_applications').select('*').eq('enquiry_id', enqToConvert.id);
    if (!existingApps || existingApps.length === 0) {
      const { data: appData, error: appErr } = await supabase.from('admissions_applications').insert({
        id: '00000000-0000-0000-0000-000000000931',
        enquiry_id: enqToConvert.id,
        tracking_token: `TEST-APP-${Date.now().toString().slice(-6)}`,
        campus_id: testCampusId,
        academic_year_id: testAyId,
        parent_id: students[0].parent_id,
        student_first_name: enqToConvert.child_first_name,
        student_last_name: enqToConvert.child_last_name,
        date_of_birth: '2020-03-12',
        grade_applied: enqToConvert.grade_interested,
        status: 'OFFERED'
      }).select();

      if (appErr) console.error('Application creation error:', appErr.message);
      else {
        console.log('Successfully converted enquiry to official application without duplicate records!');
        await supabase.from('enquiries').update({ status: 'APPLICATION_SUBMITTED' }).eq('id', enqToConvert.id);
      }
    }
  }

  // 4. EdTech School Store Bundles
  console.log('4. Seeding School Store Kits...');
  await supabase.from('school_store_kits').upsert([
    {
      id: '00000000-0000-0000-0000-000000000941',
      grade: 'Class 1',
      title: 'TEST - Class 1 Complete Academic Kit',
      description: 'NCERT Textbook Set, 8 Ruled Notebooks, Crayon Box Stationery Kit & Summer Uniform Pair',
      price: 4850.00,
      items_included: ['NCERT Marigold English', 'Math-Magic 1', 'Looking Around EVS', 'Uniform Set (Shirt+Trousers)', 'Art Portfolio'],
      in_stock: 75
    },
    {
      id: '00000000-0000-0000-0000-000000000942',
      grade: 'Class 5',
      title: 'TEST - Class 5 STEM Explorer Kit',
      description: 'Senior Primary NCERT Book Bundle, Robotics Starter Pack, Lab Coat & Sports House Tee',
      price: 6200.00,
      items_included: ['NCERT Class 5 Textbooks', 'STEM Arduino Starter Breadboard', 'School Blazer', 'House Polo Tee'],
      in_stock: 50
    }
  ]);

  console.log('--- REMAINING MODULES SEEDED SUCCESSFULLY ---');
}

seedRemaining().catch(err => {
  console.error('Error in seedRemaining:', err);
  process.exit(1);
});
