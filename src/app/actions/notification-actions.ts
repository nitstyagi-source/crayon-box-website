"use server";

import pg from 'pg';

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'FINANCE' | 'ADMISSIONS' | 'ACADEMIC' | 'SAFETY' | 'GOVERNANCE' | 'GENERAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  timestamp: string;
  timeAgo: string;
  unread: boolean;
  link?: string;
  institutionCode?: string;
  metadata?: Record<string, any>;
}

function getPool() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
  return new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
}

// In-memory cache for dynamic notification state (read/unread and custom alerts)
let customNotifications: AppNotificationItem[] = [];
let readNotificationIds: Set<string> = new Set();

/**
 * Fetch live system notifications tailored to current role and campus scope
 */
export async function getLiveNotificationsAction(role = 'SUPER_ADMIN', institutionCode = 'ALL') {
  const pool = getPool();
  let client;

  const notifications: AppNotificationItem[] = [];
  const now = new Date();

  try {
    client = await pool.connect();

    // 1. Check Pending Admissions
    const appRes = await client.query(`
      SELECT COUNT(*) as count 
      FROM public.admissions_applications 
      WHERE status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW');
    `);
    const pendingApps = parseInt(appRes.rows[0]?.count || '0', 10);

    if (pendingApps > 0) {
      notifications.push({
        id: 'NOTIF-ADM-01',
        title: 'New Admission Applications Pending',
        message: `${pendingApps} new student application${pendingApps > 1 ? 's' : ''} submitted online and awaiting document verification and seat confirmation.`,
        category: 'ADMISSIONS',
        priority: 'HIGH',
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        timeAgo: '15 mins ago',
        unread: !readNotificationIds.has('NOTIF-ADM-01'),
        link: '/admin/admissions',
        institutionCode: institutionCode === 'ALL' ? 'CBS' : institutionCode
      });
    }

    // 2. Check Pending Fees / Dues
    const feeRes = await client.query(`
      SELECT COUNT(DISTINCT student_id) as count, SUM(debit - credit) as total_due
      FROM public.student_fee_ledgers 
      WHERE (debit - credit) > 0;
    `);
    const pendingDueStudents = parseInt(feeRes.rows[0]?.count || '0', 10);
    const totalDueAmount = parseFloat(feeRes.rows[0]?.total_due || '0');

    if (pendingDueStudents > 0) {
      notifications.push({
        id: 'NOTIF-FIN-01',
        title: 'Pending Fee Collection Dues Alert',
        message: `${pendingDueStudents} students have overdue fees totaling ₹${totalDueAmount.toLocaleString('en-IN')}. Fast-track POS collection available.`,
        category: 'FINANCE',
        priority: 'NORMAL',
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        timeAgo: '45 mins ago',
        unread: !readNotificationIds.has('NOTIF-FIN-01'),
        link: '/admin/finance/collections',
        institutionCode: institutionCode === 'ALL' ? 'CBS' : institutionCode
      });
    }

    // 3. Check Recent Academic Events / Calendar
    const evtRes = await client.query(`
      SELECT title, start_date, event_type
      FROM public.school_calendar_events
      ORDER BY created_at DESC
      LIMIT 1;
    `);
    if (evtRes.rows.length > 0) {
      const evt = evtRes.rows[0];
      notifications.push({
        id: 'NOTIF-ACAD-01',
        title: 'Academic Calendar Announcement',
        message: `Upcoming ${evt.event_type || 'Event'}: "${evt.title}" scheduled for ${evt.start_date ? String(evt.start_date).split('T')[0] : 'Upcoming Session'}.`,
        category: 'ACADEMIC',
        priority: 'NORMAL',
        timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
        timeAgo: '3 hours ago',
        unread: !readNotificationIds.has('NOTIF-ACAD-01'),
        link: '/admin/calendar',
        institutionCode: institutionCode === 'ALL' ? 'CBS' : institutionCode
      });
    }

  } catch (error: any) {
    console.error('Error querying live notification signals:', error.message);
  } finally {
    if (client) client.release();
  }

  // 4. Default Enterprise Infrastructure Notifications
  notifications.push({
    id: 'NOTIF-SAFE-01',
    title: 'Fleet Telematics & Bus Tracking Active',
    message: 'Morning GPS route telemetry active for Bus Route #04 and #08 with 100% on-time parent check-ins.',
    category: 'SAFETY',
    priority: 'LOW',
    timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
    timeAgo: '4 hours ago',
    unread: !readNotificationIds.has('NOTIF-SAFE-01'),
    link: '/admin/operations',
    institutionCode: 'CBS'
  });

  notifications.push({
    id: 'NOTIF-LIFE-01',
    title: 'Universal Multi-Period Registry Enabled',
    message: 'Multi-period student enrollment history & 1-click re-admission system is operational across all campuses.',
    category: 'GOVERNANCE',
    priority: 'NORMAL',
    timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(),
    timeAgo: '6 hours ago',
    unread: !readNotificationIds.has('NOTIF-LIFE-01'),
    link: '/admin/students',
    institutionCode: 'ALL'
  });

  // 5. Append Custom/Simulated Notifications dispatched dynamically
  customNotifications.forEach(notif => {
    notifications.unshift({
      ...notif,
      unread: !readNotificationIds.has(notif.id)
    });
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return {
    success: true,
    notifications,
    unreadCount
  };
}

/**
 * Mark a single notification as read or unread
 */
export async function toggleNotificationReadAction(notificationId: string, isRead: boolean) {
  if (isRead) {
    readNotificationIds.add(notificationId);
  } else {
    readNotificationIds.delete(notificationId);
  }
  return { success: true, notificationId, isRead };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsReadAction(allIds: string[]) {
  allIds.forEach(id => readNotificationIds.add(id));
  return { success: true, markedCount: allIds.length };
}

/**
 * Clear or dismiss all notifications
 */
export async function clearAllNotificationsAction() {
  customNotifications = [];
  return { success: true };
}

/**
 * Dispatch a live test/simulated notification
 */
export async function dispatchTestNotificationAction(input: {
  title: string;
  message: string;
  category?: 'FINANCE' | 'ADMISSIONS' | 'ACADEMIC' | 'SAFETY' | 'GOVERNANCE' | 'GENERAL';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  link?: string;
}) {
  const newNotif: AppNotificationItem = {
    id: `NOTIF-LIVE-${Date.now()}`,
    title: input.title || 'Simulated Push Alert',
    message: input.message || 'Real-time test notification delivered across the VET ERP ecosystem.',
    category: input.category || 'GENERAL',
    priority: input.priority || 'HIGH',
    timestamp: new Date().toISOString(),
    timeAgo: 'Just now',
    unread: true,
    link: input.link || '/admin'
  };

  customNotifications.unshift(newNotif);
  return { success: true, notification: newNotif };
}
