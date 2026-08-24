import { 
  seedComprehensiveCurriculumUnitsAction, 
  getCurriculumRadarAction, 
  getSubjectChaptersAction 
} from '../src/app/actions/curriculum-radar-actions';

async function testCurriculum() {
  console.log('🔍 ========================================================');
  console.log('🔍 TESTING CURRICULUM DELIVERY & SYLLABUS COMPLETION RADAR');
  console.log('🔍 ========================================================\n');

  // 1. Seed curriculum chapters
  console.log('📌 1. Seeding comprehensive curriculum chapters for unmapped subjects...');
  const seedRes = await seedComprehensiveCurriculumUnitsAction();
  console.log('   Seed Result:', seedRes);

  // 2. Fetch Curriculum Radar
  console.log('\n📌 2. Fetching Curriculum Radar Telematics for CBS...');
  const radarRes = await getCurriculumRadarAction({ institutionCode: 'CBS' });
  console.log('   Success:', radarRes.success, 'Total Subjects:', radarRes.data?.length);
  console.log('   Metrics:', radarRes.metrics);

  if (radarRes.data && radarRes.data.length > 0) {
    const firstSubj = radarRes.data[0];
    console.log(`\n📌 3. Inspecting Chapter Details for [${firstSubj.className}] ${firstSubj.name}...`);
    const chapRes = await getSubjectChaptersAction(firstSubj.id);
    console.log(`   Chapters (${chapRes.chapters?.length}):`, chapRes.chapters?.slice(0, 3));
  }
}

testCurriculum();
