import { NextResponse } from 'next/server';
import { submitStudentLeaveRequest } from '@/app/actions/leave-actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, leaveType, startDate, endDate, reason, institutionCode } = body;

    if (!studentId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const res = await submitStudentLeaveRequest(
      institutionCode || 'CBS',
      studentId,
      leaveType || 'Casual',
      startDate,
      endDate,
      reason || ''
    );

    if (res.success) {
      return NextResponse.json({ success: true, message: 'Leave request submitted successfully.' });
    } else {
      return NextResponse.json({ success: false, error: res.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error submitting leave:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
