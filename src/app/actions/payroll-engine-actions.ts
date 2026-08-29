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

// Convert Number to Indian Currency Words
function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  let amount = Math.floor(num);
  let words = '';

  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;

  if (crore > 0) words += inWords(crore) + ' Crore ';
  if (lakh > 0) words += inWords(lakh) + ' Lakh ';
  if (thousand > 0) words += inWords(thousand) + ' Thousand ';
  if (amount > 0) words += inWords(amount) + ' ';

  return words.trim() + ' Rupees Only';
}

// -------------------------------------------------------------
// 1. GET MONTHLY PAYROLL SUMMARY & STAFF ROSTER
// -------------------------------------------------------------
export async function getMonthlyPayrollSummaryAction(params: {
  month?: string;
  institutionCode?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const month = params.month || 'August 2026';

    const instCode = params.institutionCode && params.institutionCode !== 'ALL' ? params.institutionCode : 'CBS';
    
    // 1. Fetch Active Staff
    const staffRes = await client.query(`
      SELECT s.*, s.institution_code
      FROM public.staff s
      WHERE s.status = 'ACTIVE' 
        AND (s.institution_code = $1 OR $1 = 'ALL')
      ORDER BY s.first_name ASC, s.last_name ASC
    `, [params.institutionCode === 'ALL' ? 'ALL' : instCode]);
    const staff = staffRes.rows;

    // 2. Fetch Processed Payslips for this month
    const payslipsRes = await client.query(`
      SELECT * FROM public.staff_monthly_payslips
      WHERE payroll_month = $1
    `, [month]);
    const payslips = payslipsRes.rows;

    let totalGrossBill = 0;
    let totalDeductions = 0;
    let totalNetDisbursed = 0;
    let totalEpfSum = 0;
    let totalEsicSum = 0;
    let totalPtSum = 0;
    let totalTdsSum = 0;

    const roster = staff.map((st: any) => {
      const ps = payslips.find((p: any) => p.staff_id === st.id);

      const baseSalary = Number(st.basic_salary || 35000);
      const hra = Number(st.hra || 14000);
      const special = Number(st.special_allowance || 8000);
      const gross = baseSalary + hra + special;

      // Statutory Indian Deductions
      const epf = Math.min(1800, Math.round(baseSalary * 0.12));
      const esic = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
      const pt = 200;
      const tds = Number(st.tds_deduction || 1500);
      const deductions = epf + esic + pt + tds;
      const net = gross - deductions;

      const currentGross = ps ? Number(ps.gross_earnings) : gross;
      const currentDeductions = ps ? Number(ps.total_deductions) : deductions;
      const currentNet = ps ? Number(ps.net_payable) : net;

      totalGrossBill += currentGross;
      totalDeductions += currentDeductions;
      totalNetDisbursed += currentNet;
      totalEpfSum += ps ? Number(ps.epf_deduction) : epf;
      totalEsicSum += ps ? Number(ps.esic_deduction) : esic;
      totalPtSum += ps ? Number(ps.prof_tax_deduction) : pt;
      totalTdsSum += ps ? Number(ps.tds_deduction) : tds;

      return {
        staffId: st.id,
        name: `${st.first_name} ${st.last_name}`,
        designation: st.designation || 'Faculty Member',
        department: st.department || 'Academics',
        institutionCode: st.institution_code || 'CBS',
        panNumber: st.pan_number || 'ABCDE1234F',
        uanNumber: st.uan_number || '100928374619',
        bankName: st.bank_name || 'HDFC Bank',
        bankAccountNo: st.bank_account_no || '50100482910481',
        bankIfsc: st.bank_ifsc || 'HDFC0001008',
        basicSalary: baseSalary,
        hra: hra,
        specialAllowance: special,
        grossEarnings: currentGross,
        lwpDays: ps ? Number(ps.lwp_days) : 0,
        epfDeduction: ps ? Number(ps.epf_deduction) : epf,
        esicDeduction: ps ? Number(ps.esic_deduction) : esic,
        ptDeduction: ps ? Number(ps.prof_tax_deduction) : pt,
        tdsDeduction: ps ? Number(ps.tds_deduction) : tds,
        totalDeductions: currentDeductions,
        netPayable: currentNet,
        isProcessed: !!ps,
        paymentStatus: ps ? ps.payment_status : 'PENDING'
      };
    });

    const isBatchProcessed = payslips.length > 0;

    return {
      success: true,
      month,
      isBatchProcessed,
      counts: {
        totalStaff: staff.length,
        processedCount: payslips.length,
        pendingCount: Math.max(0, staff.length - payslips.length),
        totalGrossBill,
        totalDeductions,
        totalNetDisbursed,
        totalEpfSum,
        totalEsicSum,
        totalPtSum,
        totalTdsSum
      },
      roster
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      month: params.month || 'August 2026',
      isBatchProcessed: false,
      counts: { totalStaff: 0, processedCount: 0, pendingCount: 0, totalGrossBill: 0, totalDeductions: 0, totalNetDisbursed: 0, totalEpfSum: 0, totalEsicSum: 0, totalPtSum: 0, totalTdsSum: 0 },
      roster: []
    };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 2. PROCESS MONTHLY PAYROLL RUN BATCH
// -------------------------------------------------------------
export async function processMonthlyPayrollRunAction(params: {
  month: string;
  institutionCode: string;
  overrideLwpMap?: Record<string, number>;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { month, institutionCode, overrideLwpMap = {} } = params;
    const instCode = institutionCode && institutionCode !== 'ALL' ? institutionCode : 'CBS';

    // 1. Fetch all active staff
    const staffRes = await client.query(`
      SELECT s.*, s.institution_code
      FROM public.staff s
      WHERE s.status = 'ACTIVE'
        AND (s.institution_code = $1 OR $1 = 'ALL')
    `, [institutionCode === 'ALL' ? 'ALL' : instCode]);
    const staff = staffRes.rows;

    let processed = 0;
    let totalGross = 0;
    let totalNet = 0;

    for (const st of staff) {
      const basic = Number(st.basic_salary || 35000);
      const hra = Number(st.hra || 14000);
      const special = Number(st.special_allowance || 8000);
      const nominalGross = basic + hra + special;

      // LWP Days & Deduction
      const lwpDays = overrideLwpMap[st.id] || 0;
      const lwpDeduction = lwpDays > 0 ? Math.round((nominalGross / 30) * lwpDays) : 0;
      const earnedGross = nominalGross - lwpDeduction;

      // Statutory Deductions
      const epf = Math.min(1800, Math.round(basic * 0.12));
      const esic = earnedGross <= 21000 ? Math.round(earnedGross * 0.0075) : 0;
      const pt = 200;
      const tds = Number(st.tds_deduction || 1500);
      const totalDeductions = epf + esic + pt + tds;
      const netPayable = earnedGross - totalDeductions;
      const netWords = numberToIndianWords(netPayable);

      await client.query(`
        INSERT INTO public.staff_monthly_payslips (
          staff_id, payroll_month, academic_session, institution_code,
          staff_name, designation, department,
          bank_name, bank_account_no, bank_ifsc, pan_number, uan_number,
          total_working_days, present_days, lwp_days,
          basic_salary, hra, conveyance, special_allowance, gross_earnings,
          epf_deduction, esic_deduction, prof_tax_deduction, tds_deduction,
          advance_deduction, total_deductions, net_payable, net_payable_words,
          payment_status, payment_date, created_at
        ) VALUES (
          $1, $2, '2026–2027', $3,
          $4, $5, $6,
          $7, $8, $9, $10, $11,
          30, $12, $13,
          $14, $15, 0, $16, $17,
          $18, $19, $20, $21,
          0, $22, $23, $24,
          'DISBURSED', CURRENT_DATE, NOW()
        )
        ON CONFLICT (staff_id, payroll_month) DO UPDATE SET
          basic_salary = EXCLUDED.basic_salary,
          hra = EXCLUDED.hra,
          special_allowance = EXCLUDED.special_allowance,
          gross_earnings = EXCLUDED.gross_earnings,
          epf_deduction = EXCLUDED.epf_deduction,
          esic_deduction = EXCLUDED.esic_deduction,
          prof_tax_deduction = EXCLUDED.prof_tax_deduction,
          tds_deduction = EXCLUDED.tds_deduction,
          total_deductions = EXCLUDED.total_deductions,
          net_payable = EXCLUDED.net_payable,
          net_payable_words = EXCLUDED.net_payable_words,
          payment_status = 'DISBURSED',
          payment_date = CURRENT_DATE;
      `, [
        st.id,
        month,
        st.institution_code || 'CBS',
        `${st.first_name} ${st.last_name}`,
        st.designation || 'Faculty Member',
        st.department || 'Academics',
        st.bank_name || 'HDFC Bank',
        st.bank_account_no || '50100482910481',
        st.bank_ifsc || 'HDFC0001008',
        st.pan_number || 'ABCDE1234F',
        st.uan_number || '100928374619',
        30 - lwpDays,
        lwpDays,
        basic,
        hra,
        special,
        earnedGross,
        epf,
        esic,
        pt,
        tds,
        totalDeductions,
        netPayable,
        netWords
      ]);

      // Record in payroll_ledgers
      await client.query(`
        INSERT INTO public.payroll_ledgers (
          institution_code, staff_id, month, base_salary, lwp_days, lwp_deduction,
          allowances, net_payable, payment_status, processed_at, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'DISBURSED', NOW(), NOW()
        )
        ON CONFLICT (staff_id, month) DO UPDATE SET
          institution_code = EXCLUDED.institution_code,
          base_salary = EXCLUDED.base_salary,
          lwp_days = EXCLUDED.lwp_days,
          lwp_deduction = EXCLUDED.lwp_deduction,
          allowances = EXCLUDED.allowances,
          net_payable = EXCLUDED.net_payable,
          payment_status = 'DISBURSED',
          processed_at = NOW();
      `, [st.institution_code || 'CBS', st.id, month, basic, lwpDays, lwpDeduction, hra + special, netPayable]);

      processed++;
      totalGross += earnedGross;
      totalNet += netPayable;
    }

    safeRevalidate('/admin/hr/payroll');

    return {
      success: true,
      message: `✓ Successfully processed monthly payroll for ${processed} staff members! Total Disbursed: ₹${totalNet.toLocaleString('en-IN')}`,
      processedCount: processed,
      totalGross,
      totalNet
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. GET STAFF OFFICIAL STATUTORY PAYSLIP
// -------------------------------------------------------------
export async function getStaffOfficialPayslipAction(params: {
  staffId: string;
  month?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const month = params.month || 'August 2026';

    const res = await client.query(`
      SELECT p.*, s.first_name, s.last_name, COALESCE(s.joining_date, '2024-04-01'::date) as joining_date, s.emergency_contact
      FROM public.staff_monthly_payslips p
      JOIN public.staff s ON s.id = p.staff_id
      WHERE p.staff_id = $1 AND p.payroll_month = $2
      LIMIT 1
    `, [params.staffId, month]);

    if (res.rows.length === 0) {
      return { success: false, error: `No payslip found for this staff member in ${month}.` };
    }

    const p = res.rows[0];

    return {
      success: true,
      payslip: {
        ...p,
        payment_date: safeDateStr(p.payment_date),
        created_at: safeDateStr(p.created_at),
        joining_date: safeDateStr(p.joining_date),
        basic_salary: Number(p.basic_salary),
        hra: Number(p.hra),
        conveyance: Number(p.conveyance),
        special_allowance: Number(p.special_allowance),
        gross_earnings: Number(p.gross_earnings),
        epf_deduction: Number(p.epf_deduction),
        esic_deduction: Number(p.esic_deduction),
        prof_tax_deduction: Number(p.prof_tax_deduction),
        tds_deduction: Number(p.tds_deduction),
        advance_deduction: Number(p.advance_deduction),
        total_deductions: Number(p.total_deductions),
        net_payable: Number(p.net_payable),
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GENERATE BANK BULK NEFT/RTGS CSV STRING
// -------------------------------------------------------------
export async function generateBankNeftCsvAction(params: {
  month?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const month = params.month || 'August 2026';

    const res = await client.query(`
      SELECT staff_name, bank_account_no, bank_ifsc, bank_name, net_payable
      FROM public.staff_monthly_payslips
      WHERE payroll_month = $1
      ORDER BY staff_name ASC
    `, [month]);

    const rows = res.rows;
    const csvHeader = 'Beneficiary Name,Account Number,IFSC Code,Bank Name,Amount (INR),Transaction Type,Remarks\n';
    const csvRows = rows.map((r: any) =>
      `"${r.staff_name}","${r.bank_account_no}","${r.bank_ifsc}","${r.bank_name}",${r.net_payable},"NEFT","Salary for ${month}"`
    ).join('\n');

    return {
      success: true,
      filename: `HDFC_Bulk_Salary_Disbursement_${month.replace(' ', '_')}.csv`,
      csvContent: csvHeader + csvRows,
      totalEmployees: rows.length,
      totalAmount: rows.reduce((acc: number, cur: any) => acc + Number(cur.net_payable), 0)
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
