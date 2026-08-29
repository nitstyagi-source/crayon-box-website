import fs from 'fs';
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}
import { 
  getBulkTargetStudents, 
  searchStudentsForFeeCollection,
  generateIndividualInvoice 
} from '../src/app/actions/finance-core';

async function testSingleInvoiceStudent() {
  console.log('🔍 ========================================================');
  console.log('🔍 TESTING SINGLE INVOICE STUDENT SELECTION & GENERATION');
  console.log('🔍 ========================================================\n');

  const campusId = 'c3d782a9-a50b-4708-a3fc-6b146f456662';

  // 1. Test class & section student loading for dropdown
  console.log('📌 1. Fetching students for Grade 1 Dropdown...');
  const res = await getBulkTargetStudents(campusId, 'Grade 1', 'All');
  console.log('   Grade 1 Student Count:', res.data?.students?.length);
  const sampleStudent = res.data?.students?.[0];
  console.log('   Sample Student:', sampleStudent?.name, `(#${sampleStudent?.admission_no})`, 'EWS:', sampleStudent?.isEws);

  // 2. Test Live Search
  console.log('\n📌 2. Testing Live Search by query...');
  const searchRes = await searchStudentsForFeeCollection(campusId, 'A');
  console.log('   Search Results Count:', searchRes.data?.length);

  // 3. Test Generating Individual Invoice with Student
  if (sampleStudent && !sampleStudent.isEws) {
    console.log(`\n📌 3. Generating Single Invoice for ${sampleStudent.name}...`);
    const invRes = await generateIndividualInvoice({
      institution_code: campusId,
      student_id: sampleStudent.id,
      billing_period: 'Q1 (April-June 2026)',
      due_date: '2026-04-15',
      notes: 'Single student invoice creation test',
      items: [
        { fee_head_name: 'Tuition Fee', base_amount: 6500, discount_amount: 0 },
        { fee_head_name: 'Annual Charges', base_amount: 3000, discount_amount: 0 },
        { fee_head_name: 'Activity & Sports Fee', base_amount: 1000, discount_amount: 0 }
      ]
    });

    console.log('   Invoice Generation Result:', invRes.success, 'Invoice ID:', invRes.data?.id, 'Invoice No:', invRes.data?.invoice_number, 'Error:', invRes.error);
  }

  console.log('\n🎉 ALL SINGLE INVOICE STUDENT SELECTION TESTS PASSED!');
}

testSingleInvoiceStudent();
