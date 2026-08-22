import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get('grade') || 'Grade 4';

  const homeworkFeed = [
    {
      id: 'HW-101',
      subject: 'Mathematics',
      title: 'Fractions & Decimals Problem Set',
      assignedDate: '2026-08-22',
      dueDate: '2026-08-24',
      teacherName: 'Dr. Meenakshi Sundaram',
      targetClass: grade,
      instructions: 'Complete exercises 5.1 through 5.3 from textbook pages 88-92. Show all calculation steps.',
      hasAttachment: true,
      attachmentName: 'fractions_worksheet_aug26.pdf',
    },
    {
      id: 'HW-102',
      subject: 'Science & Robotics',
      title: 'Solar System Planetary Orbit Simulation',
      assignedDate: '2026-08-21',
      dueDate: '2026-08-25',
      teacherName: 'Mr. Arvind Gupta',
      targetClass: grade,
      instructions: 'Draw and color the relative distance chart of inner planets and explain Kepler’s third law.',
      hasAttachment: false,
    },
    {
      id: 'HW-103',
      subject: 'Social Studies',
      title: 'Indus Valley Civilization Artifact Chart',
      assignedDate: '2026-08-20',
      dueDate: '2026-08-26',
      teacherName: 'Mrs. Kavita Iyer',
      targetClass: grade,
      instructions: 'Paste 5 pictures of Mohenjo-daro architecture and summarize the Great Bath drainage system.',
      hasAttachment: true,
      attachmentName: 'harappan_civilization_reference.pdf',
    },
  ];

  return NextResponse.json({ success: true, count: homeworkFeed.length, data: homeworkFeed });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, title, dueDate, targetClass, instructions, teacherId } = body;

    const newAssignment = {
      id: `HW-${Date.now().toString().slice(-4)}`,
      subject,
      title,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate,
      teacherName: 'Faculty User',
      targetClass,
      instructions,
      hasAttachment: false,
      timestamp: new Date().toISOString(),
    };

    console.log(`[HOMEWORK CREATED & SYNCED] ${title} for ${targetClass} by ${teacherId}`);

    return NextResponse.json({
      success: true,
      message: 'Assignment published and pushed to student/parent digital diaries.',
      data: newAssignment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
