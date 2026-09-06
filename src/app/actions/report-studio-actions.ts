"use server";

import pg from 'pg';
import { getDefaultAcademicSession } from '@/lib/utils/academic-session';

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export interface ReportColumnDef {
  key: string;
  label: string;
  type: 'string' | 'number' | 'currency' | 'date' | 'badge';
}

export interface UniversalReportResult {
  success: boolean;
  error?: string;
  domain: string;
  totalRecords: number;
  columns: ReportColumnDef[];
  data: Record<string, any>[];
  summary: {
    totalAmount?: number;
    count?: number;
    generatedAt: string;
    session: string;
  };
}

export async function generateUniversalReportAction(params: {
  domain: 'STUDENTS' | 'ATTENDANCE' | 'FEES' | 'ADMISSIONS' | 'FACULTY' | 'TRANSPORT' | 'LIBRARY';
  institutionCode?: string;
  academicSession?: string;
  className?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<UniversalReportResult> {
  const p = getPool();
  const client = await p.connect();
  const session = params.academicSession || getDefaultAcademicSession();
  const limit = params.limit || 200;

  try {
    let query = '';
    let values: any[] = [];
    let columns: ReportColumnDef[] = [];

    switch (params.domain) {
      case 'STUDENTS': {
        columns = [
          { key: 'admission_no', label: 'Admission No', type: 'string' },
          { key: 'student_name', label: 'Student Name', type: 'string' },
          { key: 'class_name', label: 'Class', type: 'string' },
          { key: 'section_name', label: 'Section', type: 'string' },
          { key: 'gender', label: 'Gender', type: 'string' },
          { key: 'parent_phone', label: 'Parent Phone', type: 'string' },
          { key: 'status', label: 'Status', type: 'badge' },
        ];
        query = `
          SELECT s.admission_no, COALESCE(s.first_name || ' ' || COALESCE(s.last_name, ''), s.name) as student_name,
                 s.grade as class_name, s.section as section_name, s.gender,
                 s.parent_phone, COALESCE(s.status, 'Active') as status
          FROM public.students s
          WHERE 1=1
        `;
        if (params.className && params.className !== 'ALL') {
          values.push(params.className);
          query += ` AND s.grade = $${values.length}`;
        }
        if (params.status && params.status !== 'ALL') {
          values.push(params.status);
          query += ` AND s.status ILIKE $${values.length}`;
        }
        query += ` ORDER BY s.admission_no ASC LIMIT ${limit};`;
        break;
      }

      case 'FEES': {
        columns = [
          { key: 'invoice_number', label: 'Invoice No', type: 'string' },
          { key: 'student_name', label: 'Student Name', type: 'string' },
          { key: 'class_name', label: 'Class', type: 'string' },
          { key: 'billing_period', label: 'Term / Period', type: 'string' },
          { key: 'total_amount', label: 'Amount', type: 'currency' },
          { key: 'due_date', label: 'Due Date', type: 'date' },
          { key: 'status', label: 'Status', type: 'badge' },
        ];
        query = `
          SELECT i.invoice_number, i.student_name, i.grade as class_name,
                 i.billing_period, i.total_amount, i.due_date, i.status
          FROM public.student_invoices i
          WHERE 1=1
        `;
        if (params.status && params.status !== 'ALL') {
          values.push(params.status);
          query += ` AND i.status = $${values.length}`;
        }
        query += ` ORDER BY i.created_at DESC LIMIT ${limit};`;
        break;
      }

      case 'ADMISSIONS': {
        columns = [
          { key: 'enquiry_number', label: 'Enquiry No', type: 'string' },
          { key: 'child_name', label: 'Child Name', type: 'string' },
          { key: 'admission_class', label: 'Grade Interested', type: 'string' },
          { key: 'parent_name', label: 'Parent Name', type: 'string' },
          { key: 'parent_phone', label: 'Parent Mobile', type: 'string' },
          { key: 'source', label: 'Source', type: 'string' },
          { key: 'status', label: 'Status', type: 'badge' },
        ];
        query = `
          SELECT e.enquiry_number, COALESCE(e.child_first_name || ' ' || COALESCE(e.child_last_name, ''), e.child_name) as child_name,
                 e.admission_class, e.primary_guardian_name as parent_name,
                 e.primary_guardian_phone as parent_phone, e.enquiry_source as source, e.status
          FROM public.enquiries e
          WHERE 1=1
        `;
        if (params.status && params.status !== 'ALL') {
          values.push(params.status);
          query += ` AND e.status = $${values.length}`;
        }
        query += ` ORDER BY e.created_at DESC LIMIT ${limit};`;
        break;
      }

      case 'FACULTY': {
        columns = [
          { key: 'employee_id', label: 'Emp ID', type: 'string' },
          { key: 'name', label: 'Staff Name', type: 'string' },
          { key: 'designation', label: 'Designation', type: 'string' },
          { key: 'department', label: 'Department', type: 'string' },
          { key: 'email', label: 'Email', type: 'string' },
          { key: 'phone', label: 'Mobile', type: 'string' },
          { key: 'status', label: 'Status', type: 'badge' },
        ];
        query = `
          SELECT s.employee_id, COALESCE(s.first_name || ' ' || COALESCE(s.last_name, ''), s.name, s.full_name) as name,
                 s.designation, s.department, s.email, s.phone,
                 COALESCE(s.employment_status, s.status, 'Active') as status
          FROM public.staff s
          ORDER BY s.employee_id ASC LIMIT ${limit};
        `;
        break;
      }

      case 'ATTENDANCE': {
        columns = [
          { key: 'attendance_date', label: 'Date', type: 'date' },
          { key: 'admission_no', label: 'Admission No', type: 'string' },
          { key: 'student_name', label: 'Student Name', type: 'string' },
          { key: 'class_name', label: 'Class', type: 'string' },
          { key: 'status', label: 'Status', type: 'badge' },
        ];
        query = `
          SELECT a.date as attendance_date, s.admission_no,
                 COALESCE(s.first_name || ' ' || COALESCE(s.last_name, ''), s.name) as student_name,
                 s.grade as class_name, a.status
          FROM public.student_attendance_records a
          JOIN public.students s ON s.id = a.student_id
          ORDER BY a.date DESC LIMIT ${limit};
        `;
        break;
      }

      default: {
        columns = [
          { key: 'item', label: 'Item / Identifier', type: 'string' },
          { key: 'category', label: 'Category', type: 'string' },
          { key: 'status', label: 'Status', type: 'badge' }
        ];
        query = `SELECT id as item, 'General Record' as category, 'Active' as status FROM public.campuses LIMIT 20;`;
      }
    }

    const { rows } = await client.query(query, values);

    // Compute total sum for currency columns if available
    let totalAmount = 0;
    if (params.domain === 'FEES') {
      totalAmount = rows.reduce((acc: number, r: any) => acc + (Number(r.total_amount) || 0), 0);
    }

    return {
      success: true,
      domain: params.domain,
      totalRecords: rows.length,
      columns,
      data: rows,
      summary: {
        totalAmount,
        count: rows.length,
        generatedAt: new Date().toISOString(),
        session,
      },
    };
  } catch (err: any) {
    console.error('Error generating report:', err);
    return {
      success: false,
      error: err.message,
      domain: params.domain,
      totalRecords: 0,
      columns: [],
      data: [],
      summary: { count: 0, generatedAt: new Date().toISOString(), session },
    };
  } finally {
    client.release();
  }
}
