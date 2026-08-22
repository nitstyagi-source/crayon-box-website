import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grade, section, date, period, attendanceList, teacherId } = body;

    // In production, inserts/updates batch records in Supabase/PostgreSQL attendance table
    console.log(`[ATTENDANCE REGISTER SYNC] Grade ${grade}-${section}, Period ${period}, by ${teacherId}, count: ${attendanceList?.length}`);

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${attendanceList?.length || 0} student attendance records with central ERP.`,
      timestamp: new Date().toISOString(),
      summary: {
        total: attendanceList?.length || 0,
        present: attendanceList?.filter((s: any) => s.status === 'Present').length || 0,
        absent: attendanceList?.filter((s: any) => s.status === 'Absent').length || 0,
        late: attendanceList?.filter((s: any) => s.status === 'Late').length || 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
