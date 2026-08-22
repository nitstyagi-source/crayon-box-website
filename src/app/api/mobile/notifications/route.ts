import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const NOTIFICATIONS = [
    { id: "NOTIF-01", type: "fee", title: "Fee Payment Reminder", message: "Term 2 Tuition fee for Aarav is due by 31 Aug 2026.", time: "10 mins ago", unread: true, deepLink: "crayonbox://fees" },
    { id: "NOTIF-02", type: "attendance", title: "Attendance Marked", message: "Aarav Sharma marked Present for Period 2 Mathematics.", time: "1 hour ago", unread: true, deepLink: "crayonbox://attendance" },
    { id: "NOTIF-03", type: "transport", title: "Bus Approaching Stop", message: "School Bus No. 04 is 3 stops away from Shipra Sun City.", time: "2 hours ago", unread: false, deepLink: "crayonbox://transport" },
    { id: "NOTIF-04", type: "circular", title: "Independence Day Assembly", message: "Special morning assembly circular and dress code published.", time: "Yesterday", unread: false, deepLink: "crayonbox://circulars" },
    { id: "NOTIF-05", type: "approval", title: "Leave Request Approved", message: "Principal approved planned medical leave for 26 Aug.", time: "2 days ago", unread: false, deepLink: "crayonbox://approvals" },
  ];

  return NextResponse.json({
    success: true,
    totalUnread: NOTIFICATIONS.filter(n => n.unread).length,
    notifications: NOTIFICATIONS
  });
}
