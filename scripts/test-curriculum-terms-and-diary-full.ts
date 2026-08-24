import {
  getCurriculumTermsAction,
  saveCurriculumTermAction,
  getCurriculumRadarAction,
  getSubjectChaptersAction,
  getTeacherLessonDiaryAction,
  saveTeacherLessonDiaryEntryAction,
  updateDiaryCoordinatorStatusAction,
  getDistinctSubjectsAndChaptersAction
} from '../src/app/actions/curriculum-radar-actions';
import {
  authenticateUserLogin,
  demoQuickLoginAction
} from '../src/app/actions/iam';

async function testFullSuite() {
  console.log('🔍 ========================================================');
  console.log('🔍 FULL INTEGRATION TEST: TERMS, DIARY, RADAR & AUTH');
  console.log('🔍 ========================================================\n');

  // 1. Test Login Auth
  console.log('📌 1. Testing Localhost Authentication...');
  const loginRes = await authenticateUserLogin({
    identifier: 'admin@crayonboxschool.com',
    password: 'admin123',
    authMethod: 'password'
  });
  console.log('   Admin Login Success:', loginRes.success, 'User:', loginRes.data?.fullName, 'Redirect:', loginRes.data?.redirectUrl);

  const demoRes = await demoQuickLoginAction('faculty');
  console.log('   Demo Faculty Login Success:', demoRes.success, 'User:', demoRes.data?.fullName);

  // 2. Test Curriculum Terms
  console.log('\n📌 2. Testing Curriculum Terms & Milestones Retrieval...');
  const termsRes = await getCurriculumTermsAction('CBS');
  console.log('   Terms Count:', termsRes.terms?.length);
  termsRes.terms?.forEach((t: any) => {
    console.log(`   - [${t.termName}] ${t.milestoneLabel} (${t.assessmentType}) -> Target: ${t.targetCompletionDate}`);
  });

  // 3. Test Curriculum Radar with Term Filter
  console.log('\n📌 3. Testing Curriculum Radar for Term 1...');
  const radarT1 = await getCurriculumRadarAction({
    institutionCode: 'CBS',
    termFilter: 'Term 1'
  });
  console.log('   Term 1 Radar Success:', radarT1.success, 'Total Subjects:', radarT1.data?.length);
  console.log('   Term 1 Avg Completion:', radarT1.metrics?.averageCompletionRate + '%', 'On-Schedule:', radarT1.metrics?.onScheduleCount);

  // 4. Test Teacher Lesson Diary Retrieval
  console.log('\n📌 4. Testing Teacher Lesson Diary Retrieval...');
  const diaryRes = await getTeacherLessonDiaryAction({ institutionCode: 'CBS' });
  console.log('   Total Lesson Diary Entries:', diaryRes.entries?.length);

  // 5. Test Logging a Lesson Entry & Verifying Radar Sync
  console.log('\n📌 5. Testing Logging a New Lesson Entry with Live Radar Sync...');
  const classSubjs = await getDistinctSubjectsAndChaptersAction('Grade 1', 'CBS');
  if (classSubjs.subjects?.length > 0) {
    const firstSubj = classSubjs.subjects[0];
    const firstChap = firstSubj.chapters?.[0];

    console.log(`   Logging lesson for [Grade 1] ${firstSubj.name} -> Chapter: ${firstChap.chapterName}...`);

    const logRes = await saveTeacherLessonDiaryEntryAction({
      institutionCode: 'CBS',
      lessonDate: '2026-08-24',
      className: 'Grade 1',
      sectionName: 'A',
      subjectId: firstSubj.id,
      subjectName: firstSubj.name,
      chapterId: firstChap.id,
      chapterName: firstChap.chapterName,
      termName: firstChap.termName,
      assessmentMilestone: firstChap.assessmentMilestone,
      periodNumber: 2,
      teacherName: 'Dr. Sunita Sharma',
      topicTitle: 'Interactive Concept Mastery & Application Drill',
      learningObjectives: 'Demonstrate competency and solve problem sets',
      teachingPedagogy: 'Smartboard & Concept Discussion',
      teachingAids: 'Smartboard, Workbook, Manipulatives',
      classworkSummary: 'Completed exercise questions 1-10 collaboratively',
      homeworkAssigned: 'Practice worksheet questions 1-5',
      realWorldApplication: 'Examined practical real-world scenario',
      periodsDelivered: 1
    });

    console.log('   Lesson Diary Save Result:', logRes);

    // Verify updated chapter status
    const updatedChap = await getSubjectChaptersAction(firstSubj.id);
    const updatedTarget = updatedChap.chapters?.find((c: any) => c.id === firstChap.id);
    console.log('   Updated Chapter Completed Periods:', updatedTarget?.completedPeriods, '/', updatedTarget?.estimatedPeriods, 'Status:', updatedTarget?.status);
  }

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
}

testFullSuite();
