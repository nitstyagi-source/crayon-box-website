"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new Pool({ connectionString });
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

function safeDateStr(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.split('T')[0];
  return String(d);
}

// -------------------------------------------------------------
// 1. SCAN AND APPLY SIBLING CONCESSION MATRIX ACROSS TRUST
// -------------------------------------------------------------
export async function scanAndApplySiblingConcessionsAction(params: {
  academicSession?: string;
  institutionCode?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const session = params.academicSession || '2026–2027';

    // 1. Find all active families with 2 or more active students
    const familiesRes = await client.query(`
      SELECT f.id as family_id, f.family_code, f.family_name, count(s.id) as child_count
      FROM public.families f
      JOIN public.students s ON s.family_id = f.id
      WHERE s.status = 'ACTIVE'
      GROUP BY f.id, f.family_code, f.family_name
      HAVING count(s.id) >= 2
      ORDER BY count(s.id) DESC
    `);

    const siblingFamilies = familiesRes.rows;
    let concessionsApplied = 0;
    const appliedList: any[] = [];

    for (const fam of siblingFamilies) {
      // Fetch all children in this family sorted by DOB (eldest first)
      const childrenRes = await client.query(`
        SELECT s.id, s.first_name, s.last_name, s.dob, s.universal_id,
               s.admission_no, COALESCE(c.grade, 'Class 1') as class_name
        FROM public.students s
        LEFT JOIN public.classes c ON c.id = s.class_id
        WHERE s.family_id = $1 AND s.status = 'ACTIVE'
        ORDER BY s.dob ASC NULLS LAST, s.admission_no ASC
      `, [fam.family_id]);

      const children = childrenRes.rows;

      // Rule: 1st Child = 0%, 2nd Child = 20% Tuition Discount, 3rd+ Child = 30% Tuition Discount
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (i === 0) continue; // 1st child pays standard full fee

        const discountPercent = i === 1 ? 20 : 30;
        const discountReason = `Family 360° Sibling Concession (Child #${i + 1} of ${children.length} — Household: ${fam.family_code || fam.family_name})`;

        await client.query(`
          INSERT INTO public.fee_concessions (
            student_id, student_name, class_name, concession_type,
            fee_head_name, discount_type, discount_value, reason,
            requested_by, approved_by, approval_status, valid_session, created_at
          ) VALUES (
            $1, $2, $3, 'SIBLING_DISCOUNT', 'Tuition Fee',
            'PERCENTAGE', $4, $5, 'System Automated Concession Engine',
            'Trust Accounts Board', 'APPROVED', $6, NOW()
          )
        `, [
          child.id,
          `${child.first_name} ${child.last_name}`,
          child.class_name || 'Class 1',
          discountPercent,
          discountReason,
          session
        ]);

        concessionsApplied++;
        appliedList.push({
          studentName: `${child.first_name} ${child.last_name}`,
          admissionNo: child.admission_no || child.universal_id,
          className: child.class_name,
          institutionCode: 'CBS',
          familyCode: fam.family_code || fam.family_name,
          siblingRank: i + 1,
          discountPercentage: discountPercent
        });
      }
    }

    safeRevalidate('/admin/finance');
    safeRevalidate('/admin/finance/structure');

    return {
      success: true,
      familiesScanned: siblingFamilies.length,
      concessionsApplied,
      appliedList,
      message: `✓ Sibling Concession Scan Complete! Applied ${concessionsApplied} sibling discounts across ${siblingFamilies.length} multi-child households.`
    };
  } catch (error: any) {
    console.error('Error in scanAndApplySiblingConcessionsAction:', error);
    return { success: false, error: error.message, concessionsApplied: 0, appliedList: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. GENERATE MULTI-HEAD QUARTERLY INVOICE DEMANDS
// -------------------------------------------------------------
export async function generateQuarterlyFeeDemandsAction(params: {
  academicSession?: string;
  quarter: number; // 1, 2, 3, or 4
  institutionCode?: string;
  dueDate?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const session = params.academicSession || '2026–2027';
    const quarter = params.quarter || 1;
    const dueDate = params.dueDate || '2026-09-15';

    // 1. Fetch Students to invoice
    const studentsRes = await client.query(`
      SELECT s.id, s.campus_id, s.first_name, s.last_name, s.universal_id, s.admission_no,
             s.transport_mode, s.family_id, COALESCE(c.grade, 'Class 1') as class_name
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.status = 'ACTIVE'
    `);
    const students = studentsRes.rows;

    const defaultCampusId = 'c3d782a9-a50b-4708-a3fc-6b146f456662';

    // 2. Fetch Fee Heads from DB
    const headsRes = await client.query(`SELECT id, name FROM public.fee_heads;`);
    const allHeads = headsRes.rows;
    const tuitionHead = allHeads.find((h: any) => h.name === 'Tuition Fee') || { id: '5b904689-4ac9-4fc8-8bf9-b2bddf53acf8' };
    const annualHead = allHeads.find((h: any) => h.name === 'Annual Charges') || { id: '76abbf0d-54e8-434a-8f19-12d8eb6c2566' };
    const computerHead = allHeads.find((h: any) => h.name === 'Computer & AI Fee') || { id: '204d4a1e-adbd-4614-9ccf-cc4765e3c000' };
    const transportHead = allHeads.find((h: any) => h.name === 'Transport Fee') || { id: '4e6007fb-1087-425f-aadd-22ae1c051854' };

    // 3. Fetch Active Concessions for this session
    const concessionsRes = await client.query(`
      SELECT * FROM public.fee_concessions
      WHERE valid_session = $1 AND approval_status = 'APPROVED'
    `, [session]);
    const concessions = concessionsRes.rows;

    let invoicesCreated = 0;
    let totalGrossDemand = 0;
    let totalConcessionsGiven = 0;
    let totalNetDemand = 0;

    for (let i = 0; i < students.length; i++) {
      const stu = students[i];
      const stuInst = 'CBS';
      const campusId = stu.campus_id || defaultCampusId;

      const baseTuition = 18000;
      const labFee = 2500;
      const annualCharge = 1500;
      const transportFee = stu.transport_mode === 'SCHOOL_BUS' ? 4500 : 0;

      // Check Sibling / Custom Concession on Tuition
      const stuConcession = concessions.find((c: any) => c.student_id === stu.id);
      let tuitionDiscount = 0;
      if (stuConcession) {
        const percent = Number(stuConcession.discount_value) || 20;
        tuitionDiscount = Math.round((baseTuition * percent) / 100);
      }

      const grossAmount = baseTuition + labFee + annualCharge + transportFee;
      const netAmount = grossAmount - tuitionDiscount;

      const invoiceNum = `INV-${stuInst}-26-Q${quarter}-${String(i + 1).padStart(4, '0')}`;
      const billingPeriod = `Quarter ${quarter} (${session})`;

      // Create Invoice with Idempotent Upsert
      const invRes = await client.query(`
        INSERT INTO public.student_invoices (
          campus_id, student_id, invoice_number, billing_period, total_amount,
          total_discount, total_late_fee, amount_paid, status,
          due_date, class_name, section_name, student_name, admission_no,
          notes, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 0, 0, 'UNPAID', $7, $8, 'A', $9, $10, $11, NOW()
        )
        ON CONFLICT (invoice_number) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_discount = EXCLUDED.total_discount,
          notes = EXCLUDED.notes
        RETURNING id
      `, [
        campusId,
        stu.id,
        invoiceNum,
        billingPeriod,
        grossAmount,
        tuitionDiscount,
        dueDate,
        stu.class_name || 'Class 1',
        `${stu.first_name} ${stu.last_name}`,
        stu.admission_no || stu.universal_id || 'CBS-2026-0001',
        `Quarterly demand generated via Multi-Head Fee Engine`
      ]);

      const invoiceId = invRes.rows[0].id;

      // Insert Line Items
      await client.query(`
        INSERT INTO public.student_invoice_items (
          invoice_id, fee_head_id, fee_head_name, base_amount, discount_amount, net_amount, due_date, created_at
        ) VALUES 
          ($1, $2, 'Tuition Fee', $3, $4, $5, $6, NOW()),
          ($1, $7, 'Computer & AI Fee', $8, 0, $8, $6, NOW()),
          ($1, $9, 'Annual Charges', $10, 0, $10, $6, NOW())
      `, [
        invoiceId,
        tuitionHead.id,
        baseTuition,
        tuitionDiscount,
        baseTuition - tuitionDiscount,
        dueDate,
        computerHead.id,
        labFee,
        annualHead.id,
        annualCharge
      ]);

      if (transportFee > 0) {
        await client.query(`
          INSERT INTO public.student_invoice_items (
            invoice_id, fee_head_id, fee_head_name, base_amount, discount_amount, net_amount, due_date, created_at
          ) VALUES ($1, $2, 'Transport Fee', $3, 0, $3, $4, NOW())
        `, [invoiceId, transportHead.id, transportFee, dueDate]);
      }

      // Record in Student Fee Ledger (Debit)
      await client.query(`
        INSERT INTO public.student_fee_ledgers (
          campus_id, student_id, transaction_type, amount, running_balance,
          particulars, fee_head_name, debit, credit, voucher_type,
          reference_no, transaction_date, academic_session, created_at
        ) VALUES (
          $1, $2, 'DEBIT', $3, $3, $4, 'Quarterly Consolidated Demand',
          $3, 0, 'FEE_DEMAND_INVOICE', $5, NOW(), $6, NOW()
        )
      `, [
        campusId,
        stu.id,
        netAmount,
        `Quarter ${quarter} Fee Invoice Demand (${stu.class_name})`,
        invoiceNum,
        session
      ]);

      invoicesCreated++;
      totalGrossDemand += grossAmount;
      totalConcessionsGiven += tuitionDiscount;
      totalNetDemand += netAmount;
    }

    safeRevalidate('/admin/finance');
    safeRevalidate('/admin/finance/collections');

    return {
      success: true,
      invoicesCreated,
      totalGrossDemand,
      totalConcessionsGiven,
      totalNetDemand,
      message: `✓ Successfully generated ${invoicesCreated} Fee Demand Invoices for Quarter ${quarter}! Total Demand: ₹${totalNetDemand.toLocaleString('en-IN')}`
    };
  } catch (error: any) {
    console.error('Error in generateQuarterlyFeeDemandsAction:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. GET FINANCE CONCESSIONS & INVOICE REVENUE SUMMARY
// -------------------------------------------------------------
export async function getFinanceConcessionsSummaryAction(params: {
  institutionCode?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Concessions List
    const concessionsRes = await client.query(`
      SELECT fc.*, s.universal_id, s.admission_no, s.family_id,
             f.family_code, f.family_name
      FROM public.fee_concessions fc
      JOIN public.students s ON s.id = fc.student_id
      LEFT JOIN public.families f ON f.id = s.family_id
      ORDER BY fc.created_at DESC
    `);

    // 2. Invoices List
    const invoicesRes = await client.query(`
      SELECT si.*, s.universal_id
      FROM public.student_invoices si
      JOIN public.students s ON s.id = si.student_id
      ORDER BY si.created_at DESC
      LIMIT 100
    `);

    const invoices = invoicesRes.rows.map((inv: any) => ({
      ...inv,
      created_at: safeDateStr(inv.created_at),
      due_date: safeDateStr(inv.due_date),
      net_amount: Number(inv.total_amount) - Number(inv.total_discount)
    }));

    const concessionsList = concessionsRes.rows.map((c: any) => ({
      ...c,
      created_at: safeDateStr(c.created_at)
    }));

    const totalInvoiced = invoices.reduce((acc: number, cur: any) => acc + (cur.net_amount || 0), 0);
    const totalConcessions = concessionsList.reduce((acc: number, cur: any) => acc + (Number(cur.discount_value) || 0), 0);

    return {
      success: true,
      concessions: concessionsList,
      invoices,
      metrics: {
        totalInvoices: invoices.length,
        totalInvoicedAmount: totalInvoiced,
        totalActiveConcessions: concessionsList.length,
        averageDiscountPercent: 20
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message, concessions: [], invoices: [], metrics: { totalInvoices: 0, totalInvoicedAmount: 0, totalActiveConcessions: 0, averageDiscountPercent: 0 } };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GET DEPARTED & ARCHIVED STUDENTS PENDING DUES LEDGER
// -------------------------------------------------------------
export async function getDepartedStudentsPendingDuesAction(params?: {
  institutionCode?: string;
  search?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let query = `
      SELECT 
        s.id as student_id,
        s.universal_id,
        s.first_name,
        s.last_name,
        COALESCE(s.status, se.enrollment_status, 'TRANSFERRED') as student_status,
        COALESCE(se.admission_number, s.admission_no, 'N/A') as admission_no,
        COALESCE(se.institution_code, 'CBS') as institution_code,
        COALESCE(se.class_name, 'Class 1') as class_name,
        COALESCE(se.section_name, 'A') as section_name,
        g.first_name as guardian_first,
        g.last_name as guardian_last,
        g.phone as guardian_phone,
        tc.tc_number,
        tc.issue_date as tc_issue_date,
        tc.reason_for_leaving as tc_reason,
        COALESCE(led.total_debit, 0) as total_debit,
        COALESCE(led.total_credit, 0) as total_credit,
        (COALESCE(led.total_debit, 0) - COALESCE(led.total_credit, 0)) as pending_balance,
        led.last_transaction_date
      FROM public.students s
      LEFT JOIN public.student_enrollments se ON se.student_id = s.id
      LEFT JOIN public.student_guardians sg ON sg.student_id = s.id AND sg.is_primary = true
      LEFT JOIN public.guardians g ON g.id = sg.guardian_id
      LEFT JOIN LATERAL (
        SELECT tc_number, issue_date, reason_for_leaving
        FROM public.transfer_certificates
        WHERE student_id = s.id
        ORDER BY created_at DESC
        LIMIT 1
      ) tc ON true
      LEFT JOIN LATERAL (
        SELECT 
          SUM(debit) as total_debit,
          SUM(credit) as total_credit,
          MAX(transaction_date) as last_transaction_date
        FROM public.student_fee_ledgers
        WHERE student_id = s.id
      ) led ON true
      WHERE (
        s.status IN ('TRANSFERRED', 'ARCHIVED', 'WITHDRAWN')
        OR se.enrollment_status IN ('TRANSFERRED', 'ARCHIVED', 'WITHDRAWN')
        OR tc.tc_number IS NOT NULL
      )
      AND (COALESCE(led.total_debit, 0) - COALESCE(led.total_credit, 0)) > 0
    `;

    const sqlParams: any[] = [];
    let pIndex = 1;

    if (params?.institutionCode && params.institutionCode !== 'ALL') {
      query += ` AND (se.institution_code = $${pIndex++} OR (se.institution_code IS NULL AND $${pIndex - 1} = 'CBS'))`;
      sqlParams.push(params.institutionCode);
    }

    if (params?.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`;
      query += ` AND (
        s.first_name ILIKE $${pIndex}
        OR s.last_name ILIKE $${pIndex}
        OR (s.first_name || ' ' || s.last_name) ILIKE $${pIndex}
        OR s.universal_id ILIKE $${pIndex}
        OR s.admission_no ILIKE $${pIndex}
        OR se.admission_number ILIKE $${pIndex}
        OR tc.tc_number ILIKE $${pIndex}
      )`;
      sqlParams.push(term);
      pIndex++;
    }

    query += ` ORDER BY (COALESCE(led.total_debit, 0) - COALESCE(led.total_credit, 0)) DESC;`;

    const res = await client.query(query, sqlParams);

    const records = res.rows.map((row: any) => {
      let subStatus = 'TRANSFERRED';
      if (row.tc_number || row.student_status === 'TRANSFERRED') {
        subStatus = 'TRANSFERRED';
      } else if (row.student_status === 'WITHDRAWN') {
        subStatus = 'WITHDRAWN';
      } else if (row.student_status === 'ARCHIVED') {
        subStatus = 'ARCHIVED';
      }

      return {
        studentId: row.student_id,
        universalId: row.universal_id,
        studentName: `${row.first_name} ${row.last_name}`.trim(),
        admissionNo: row.admission_no,
        institutionCode: row.institution_code,
        className: `${row.class_name} ${row.section_name}`.trim(),
        guardianName: `${row.guardian_first || ''} ${row.guardian_last || ''}`.trim() || 'Parent',
        guardianPhone: row.guardian_phone || 'N/A',
        subStatus,
        tcNumber: row.tc_number || null,
        tcIssueDate: row.tc_issue_date ? safeDateStr(row.tc_issue_date) : null,
        tcReason: row.tc_reason || null,
        totalDebit: Number(row.total_debit || 0),
        totalCredit: Number(row.total_credit || 0),
        pendingBalance: Number(row.pending_balance || 0),
        lastTransactionDate: row.last_transaction_date ? safeDateStr(row.last_transaction_date) : 'N/A'
      };
    });

    const totalArrears = records.reduce((acc: number, cur: any) => acc + cur.pendingBalance, 0);

    return {
      success: true,
      data: records,
      totalCount: records.length,
      totalArrears
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: [],
      totalCount: 0,
      totalArrears: 0
    };
  } finally {
    client.release();
  }
}

