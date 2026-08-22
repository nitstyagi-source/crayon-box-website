import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'USR-2026-ADM01';
  const role = searchParams.get('role') || 'Parent';
  const childId = searchParams.get('childId') || 'STU-2026-004';

  const syncPayload = {
    serverTimestamp: new Date().toISOString(),
    status: 'synchronized',
    userContext: {
      userId,
      role,
      activeChildId: childId,
    },
    syncModules: {
      kpiOverview: {
        totalRevenueCollected: '₹34,80,000',
        feeCollectionRate: '92.4%',
        studentAttendanceToday: '96.2%',
        staffAttendanceToday: '98.5%',
        activeBusesCount: 8,
        activeCamerasCount: 16,
        pendingApprovalsCount: 3,
        admissionsPipelineCount: 42,
      },
      liveCameras: [
        { id: 'cam-01', name: 'Nursery Wing', room: 'Nursery A', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/nursery_cam/' },
        { id: 'cam-02', name: 'Grade 1 Classroom', room: '1-A', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/grade1_cam/' },
        { id: 'cam-03', name: 'Grade 4 Classroom', room: '4-B', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/grade4_cam/' },
        { id: 'cam-04', name: 'Science Laboratory', room: 'Lab 1', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/science_lab/' },
        { id: 'cam-05', name: 'Computer & AI Lab', room: 'Tech Hub', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/computer_lab/' },
        { id: 'cam-06', name: 'Primary Activity Hall', room: 'Hall A', status: 'Online', isStreaming: true, streamUrl: 'https://think-planned-leads-family.trycloudflare.com/activity_hall/' },
      ],
      busTelemetry: {
        busNumber: 'Bus 04 (Route 12 - Green Park)',
        driverName: 'Rajesh Kumar',
        driverPhone: '+91 98110 44321',
        speedKmH: 34,
        status: 'In Transit',
        currentLocation: 'Sector 62 Crossing, Noida',
        nextStop: 'Apex Tower Gate 2',
        etaMinutes: 8,
        latitude: 28.6295,
        longitude: 77.3725,
        stops: [
          { name: 'School Campus Main Gate', time: '02:30 PM', completed: true },
          { name: 'Sector 62 Metro Station', time: '02:45 PM', completed: true },
          { name: 'Apex Tower Gate 2 (Your Stop)', time: '03:00 PM', completed: false, isChildStop: true },
          { name: 'Green Park Market', time: '03:15 PM', completed: false },
          { name: 'Indirapuram Hub', time: '03:30 PM', completed: false },
        ],
      },
      fees: {
        studentId: childId,
        studentName: childId === 'STU-2026-004' ? 'Aarav Sharma' : 'Anaya Sharma',
        totalDues: childId === 'STU-2026-004' ? 0 : 18500,
        currency: 'INR',
        invoices: [
          {
            invoiceNo: 'INV-2026-Q1-094',
            term: 'Term 1 (Apr - Jul 2026)',
            amount: 45000,
            status: 'PAID',
            dueDate: '2026-04-10',
            paidOn: '2026-04-05',
            breakdown: { tuition: 32000, transport: 8000, lab: 3000, sports: 2000 },
          },
          {
            invoiceNo: 'INV-2026-Q2-188',
            term: 'Term 2 (Aug - Nov 2026)',
            amount: 45000,
            status: childId === 'STU-2026-004' ? 'PAID' : 'PENDING',
            dueDate: '2026-08-30',
            paidOn: childId === 'STU-2026-004' ? '2026-08-12' : null,
            breakdown: { tuition: 32000, transport: 8000, lab: 3000, sports: 2000 },
          },
        ],
      },
      digitalDiary: [
        {
          id: 'hw-01',
          subject: 'Mathematics',
          title: 'Algebraic Expressions - Exercise 4.2',
          dueDate: 'Tomorrow, 9:00 AM',
          teacher: 'Dr. Meenakshi Sundaram',
          status: 'Pending',
          description: 'Solve questions 1 through 15 on Chapter 4. Ensure step-by-step solutions are documented in the notebook.',
        },
        {
          id: 'hw-02',
          subject: 'Science',
          title: 'Plant Photosynthesis Lab Report',
          dueDate: '25 Aug 2026',
          teacher: 'Mr. Arvind Gupta',
          status: 'Submitted',
          description: 'Complete the observations table from the chloroplast light exposure experiment.',
        },
        {
          id: 'hw-03',
          subject: 'English Literature',
          title: 'Character Analysis: Oliver Twist',
          dueDate: '28 Aug 2026',
          teacher: 'Ms. Sarah Jenkins',
          status: 'Pending',
          description: 'Write a 300-word essay analyzing the contrasting character traits of Oliver and Artful Dodger.',
        },
      ],
      attendanceSummary: {
        percentage: 96.4,
        totalDays: 84,
        presentDays: 81,
        absentDays: 2,
        lateDays: 1,
        streak: 14,
      },
      approvals: [
        {
          id: 'APP-01',
          type: 'Leave Application',
          requester: 'Pooja Verma (Grade 2 Faculty)',
          details: 'Medical leave for 2 days (24-25 Aug)',
          amount: null,
          status: 'PENDING',
          date: '2026-08-22',
        },
        {
          id: 'APP-02',
          type: 'Fee Concession',
          requester: 'Rohan Gupta (Parent of Vihaan Gupta, Grade 6)',
          details: 'Sibling 15% discount for academic year 2026-27',
          amount: '₹12,000',
          status: 'PENDING',
          date: '2026-08-21',
        },
        {
          id: 'APP-03',
          type: 'Robotics Lab Equipment Expense',
          requester: 'Physics Dept (Mr. Arvind Gupta)',
          details: 'Arduino sensor kits & micro-controllers purchase',
          amount: '₹24,500',
          status: 'PENDING',
          date: '2026-08-20',
        },
      ],
    },
  };

  return NextResponse.json({ success: true, data: syncPayload });
}
