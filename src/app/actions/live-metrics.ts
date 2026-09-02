"use server";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getLiveDashboardMetrics(institutionCode?: string) {
  try {
    const isAll = !institutionCode || institutionCode === 'ALL';

    // 1. Live student count (filtered by institution if specified)
    let studentCount = 0;
    if (isAll) {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .or('status.ilike.active,status.is.null');
      studentCount = count || 0;
    } else {
      const { count } = await supabase
        .from('student_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('institution_code', institutionCode)
        .or('enrollment_status.ilike.active,enrollment_status.is.null');
      studentCount = count || 0;
    }

    // 2. Live staff count (filtered by assignment if specified)
    let staffCount = 0;
    if (isAll) {
      const { count } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .or('status.ilike.active,status.is.null,is_active.eq.true');
      staffCount = count || 0;
    } else {
      const { count } = await supabase
        .from('employee_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('institution_code', institutionCode)
        .or('status.ilike.active,status.is.null');
      staffCount = count || 0;
    }

    // 3. Live fee collections from student_invoices
    const { data: invoices } = await supabase
      .from('student_invoices')
      .select('amount_paid, total_amount, status');

    let totalCollected = 0;
    let totalBilled = 0;
    if (invoices && invoices.length > 0) {
      totalCollected = invoices.reduce((acc, inv) => acc + (Number(inv.amount_paid) || 0), 0);
      totalBilled = invoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
    }

    // 4. Live attendance calculation from attendance_records
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttendance } = await supabase
      .from('student_attendance_records')
      .select('status')
      .eq('date', today);

    let attendancePercent = 'N/A';
    if (todayAttendance && todayAttendance.length > 0) {
      const present = todayAttendance.filter((a) => a.status === 'PRESENT').length;
      attendancePercent = `${Math.round((present / todayAttendance.length) * 100)}%`;
    }

    // Format currency
    const formatCurrency = (val: number) => {
      if (val === 0) return '₹0';
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    return {
      success: true,
      data: {
        totalStudents: studentCount,
        totalStaff: staffCount,
        totalCollectedFormatted: formatCurrency(totalCollected),
        totalBilledFormatted: formatCurrency(totalBilled),
        collectionYield: totalBilled > 0 ? `${Math.round((totalCollected / totalBilled) * 100)}%` : '0%',
        todayAttendance: attendancePercent === 'N/A' ? '0% (Not Marked)' : attendancePercent,
        hasAttendanceMarked: Boolean(todayAttendance && todayAttendance.length > 0),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: {
        totalStudents: 0,
        totalStaff: 0,
        totalCollectedFormatted: '₹0',
        totalBilledFormatted: '₹0',
        collectionYield: '0%',
        todayAttendance: '0% (Not Marked)',
        hasAttendanceMarked: false,
      },
    };
  }
}
