"use server";

import pg from 'pg';
import { revalidatePath } from "next/cache";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || '';

let globalPool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!globalPool) {
    globalPool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
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

async function getDefaultCampusId(pool: any): Promise<string> {
  try {
    const res = await pool.query(`SELECT id FROM public.campuses LIMIT 1;`);
    return res.rows[0]?.id || '';
  } catch {
    return '';
  }
}

// -------------------------------------------------------------
// 1. LIBRARY DASHBOARD STATS
// -------------------------------------------------------------
export async function getLibraryDashboardStats(institutionCode?: string) {
  const pool = getPool();

  try {
    const defaultCampus = await getDefaultCampusId(pool);
    const cid = (institutionCode && institutionCode !== 'all' && institutionCode !== 'default') ? institutionCode : defaultCampus;

    const [booksRes, copiesRes, txsRes, resRes] = await Promise.all([
      pool.query(`
        SELECT 
          count(*) as total_titles, 
          COALESCE(sum(total_copies), 0) as total_volumes,
          count(CASE WHEN date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE) THEN 1 END) as added_this_month
        FROM public.library_books 
        WHERE institution_code = $1 OR $1 = 'ALL'
      `, [cid]),
      pool.query(`
        SELECT status, count(*) as count 
        FROM public.library_book_copies c
        JOIN public.library_books b ON b.id = c.book_id
        WHERE b.institution_code = $1 OR $1 = 'ALL'
        GROUP BY status
      `, [cid]),
      pool.query(`
        SELECT 
          count(*) as total_txs,
          count(CASE WHEN status = 'Issued' THEN 1 END) as active_loans,
          count(CASE WHEN status = 'Overdue' THEN 1 END) as overdue_loans,
          count(CASE WHEN status = 'Issued' AND date_trunc('day', issue_date) = CURRENT_DATE THEN 1 END) as issued_today,
          count(CASE WHEN return_date IS NOT NULL AND date_trunc('day', return_date) = CURRENT_DATE THEN 1 END) as returned_today,
          COALESCE(sum(CASE WHEN fine_status = 'Pending' THEN fine_amount ELSE 0 END), 0) as pending_fines,
          COALESCE(sum(CASE WHEN fine_status = 'Paid' THEN fine_amount ELSE 0 END), 0) as collected_fines
        FROM public.library_transactions
        WHERE institution_code = $1 OR $1 = 'ALL'
      `, [cid]),
      pool.query(`SELECT count(*) as active_reservations FROM public.library_reservations WHERE status = 'Active' AND (institution_code = $1 OR $1 = 'ALL')`, [cid])
    ]);

    const totalTitles = Number(booksRes.rows[0]?.total_titles || 0);
    const totalVolumes = Number(booksRes.rows[0]?.total_volumes ?? 0);
    const addedThisMonth = Number(booksRes.rows[0]?.added_this_month || 0);

    const copiesMap: Record<string, number> = {};
    copiesRes.rows.forEach((r: any) => {
      copiesMap[r.status] = Number(r.count);
    });

    const txMetrics = txsRes.rows[0] || {};
    const available = copiesMap['Available'] !== undefined ? copiesMap['Available'] : Math.max(0, totalVolumes - (copiesMap['Issued'] || 0));
    const issued = Number(txMetrics.active_loans || copiesMap['Issued'] || 0);
    const overdue = Number(txMetrics.overdue_loans || copiesMap['Overdue'] || 0);
    const lostDamaged = Number((copiesMap['Damaged'] || 0) + (copiesMap['Lost'] || 0));
    const reserved = Number(resRes.rows[0]?.active_reservations || 0);
    const pendingFines = Number(txMetrics.pending_fines ?? 0);
    const collectedFines = Number(txMetrics.collected_fines || 0);
    const booksIssuedToday = Number(txMetrics.issued_today || 0);
    const booksReturnedToday = Number(txMetrics.returned_today || 0);

    return {
      success: true,
      data: {
        totalBooks: totalTitles,
        totalCopies: totalVolumes,
        available,
        issued,
        overdue,
        lostDamaged,
        reserved,
        booksAddedThisMonth: addedThisMonth,
        booksIssuedToday,
        booksReturnedToday,
        pendingFines,
        collectedFines
      }
    };
  } catch (error: any) {
    console.error("Error in getLibraryDashboardStats:", error);
    return {
      success: false,
      error: error.message,
      data: {
        totalBooks: 0,
        totalCopies: 0,
        available: 0,
        issued: 0,
        overdue: 0,
        lostDamaged: 0,
        reserved: 0,
        booksAddedThisMonth: 0,
        booksIssuedToday: 0,
        booksReturnedToday: 0,
        pendingFines: 0,
        collectedFines: 0
      }
    };
  }
}

// -------------------------------------------------------------
// 2. GET BOOKS CATALOG WITH COPIES & CATEGORY FILTER
// -------------------------------------------------------------
export async function getLibraryBooksCatalog(payload?: {
  institutionCode?: string;
  category?: string;
  search?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const defaultCampus = await getDefaultCampusId(client);
    const cid = (payload?.institutionCode && payload.institutionCode !== 'all' && payload.institutionCode !== 'default') 
      ? payload.institutionCode 
      : defaultCampus;

    let query = `
      SELECT b.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'accession_number', c.accession_number,
                   'barcode_qr', c.barcode_qr,
                   'copy_number', c.copy_number,
                   'status', c.status,
                   'rack_location', c.rack_location
                 ) ORDER BY c.copy_number ASC
               ) FILTER (WHERE c.id IS NOT NULL), '[]'::json
             ) as copies
      FROM public.library_books b
      LEFT JOIN public.library_book_copies c ON c.book_id = b.id
      WHERE (b.institution_code = $1 OR $1 = 'ALL')
    `;
    const values: any[] = [cid];

    if (payload?.category && payload.category !== 'All') {
      values.push(payload.category);
      query += ` AND b.category = $${values.length}`;
    }

    if (payload?.search && payload.search.trim()) {
      values.push(`%${payload.search.trim()}%`);
      query += ` AND (
        b.title ILIKE $${values.length} OR 
        b.author ILIKE $${values.length} OR 
        b.isbn ILIKE $${values.length} OR 
        b.book_code ILIKE $${values.length} OR
        b.rack_location ILIKE $${values.length}
      )`;
    }

    query += ` GROUP BY b.id ORDER BY b.title ASC`;

    const res = await client.query(query, values);
    const books = res.rows.map((r: any) => ({
      ...r,
      price: Number(r.price || 0),
      created_at: safeDateStr(r.created_at),
      copies: Array.isArray(r.copies) ? r.copies : []
    }));

    return { success: true, data: books };
  } catch (error: any) {
    console.error("Error in getLibraryBooksCatalog:", error);
    return { success: false, error: error.message, data: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 3. GET ACTIVE TRANSACTIONS LIST
// -------------------------------------------------------------
export async function getLibraryTransactions(payload?: {
  institutionCode?: string;
  status?: string; // 'All' | 'Issued' | 'Overdue' | 'Returned'
  studentId?: string;
  search?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const defaultCampus = await getDefaultCampusId(client);
    const cid = (payload?.institutionCode && payload.institutionCode !== 'all' && payload.institutionCode !== 'default') 
      ? payload.institutionCode 
      : defaultCampus;

    let query = `
      SELECT tx.*, 
             b.author, 
             b.category, 
             b.rack_location,
             s.photo_url as student_photo,
             COALESCE(p.phone_number, '') as parent_phone
      FROM public.library_transactions tx
      LEFT JOIN public.library_books b ON b.id = tx.book_id
      LEFT JOIN public.students s ON s.id = tx.student_id
      LEFT JOIN public.parents p ON p.id = s.parent_id
      WHERE (tx.institution_code = $1 OR $1 = 'ALL')
    `;
    const values: any[] = [cid];

    if (payload?.status && payload.status !== 'All') {
      values.push(payload.status);
      query += ` AND tx.status = $${values.length}`;
    }

    if (payload?.studentId) {
      values.push(payload.studentId);
      query += ` AND tx.student_id = $${values.length}`;
    }

    if (payload?.search && payload.search.trim()) {
      values.push(`%${payload.search.trim()}%`);
      query += ` AND (
        tx.book_title ILIKE $${values.length} OR 
        tx.student_name ILIKE $${values.length} OR 
        tx.accession_number ILIKE $${values.length} OR 
        tx.transaction_code ILIKE $${values.length}
      )`;
    }

    query += ` ORDER BY tx.issue_date DESC, tx.created_at DESC`;

    const res = await client.query(query, values);
    const transactions = res.rows.map((r: any) => ({
      ...r,
      issue_date: safeDateStr(r.issue_date),
      due_date: safeDateStr(r.due_date),
      return_date: r.return_date ? safeDateStr(r.return_date) : null,
      fine_amount: Number(r.fine_amount || 0)
    }));

    return { success: true, data: transactions };
  } catch (error: any) {
    console.error("Error in getLibraryTransactions:", error);
    return { success: false, error: error.message, data: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 4. GET MASTER ACCESSION REGISTER
// -------------------------------------------------------------
export async function getLibraryAccessionRegister(payload?: {
  institutionCode?: string;
  status?: string;
  search?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const defaultCampus = await getDefaultCampusId(client);
    const cid = (payload?.institutionCode && payload.institutionCode !== 'all' && payload.institutionCode !== 'default') 
      ? payload.institutionCode 
      : defaultCampus;

    let query = `
      SELECT c.*, 
             b.title as book_title, 
             b.author, 
             b.isbn, 
             b.category, 
             b.price, 
             b.publisher,
             tx.student_name as current_borrower,
             tx.due_date as current_due_date
      FROM public.library_book_copies c
      JOIN public.library_books b ON b.id = c.book_id
      LEFT JOIN public.library_transactions tx ON tx.copy_id = c.id AND (tx.status = 'Issued' OR tx.status = 'Overdue')
      WHERE (b.institution_code = $1 OR $1 = 'ALL')
    `;
    const values: any[] = [cid];

    if (payload?.status && payload.status !== 'All') {
      values.push(payload.status);
      query += ` AND c.status = $${values.length}`;
    }

    if (payload?.search && payload.search.trim()) {
      values.push(`%${payload.search.trim()}%`);
      query += ` AND (
        c.accession_number ILIKE $${values.length} OR 
        b.title ILIKE $${values.length} OR 
        b.author ILIKE $${values.length} OR 
        c.rack_location ILIKE $${values.length}
      )`;
    }

    query += ` ORDER BY c.accession_number ASC`;

    const res = await client.query(query, values);
    const accessions = res.rows.map((r: any) => ({
      ...r,
      price: Number(r.price || 0),
      current_due_date: r.current_due_date ? safeDateStr(r.current_due_date) : null
    }));

    return { success: true, data: accessions };
  } catch (error: any) {
    console.error("Error in getLibraryAccessionRegister:", error);
    return { success: false, error: error.message, data: [] };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 5. ISSUE BOOK (FAST ACCESSION / BARCODE SCAN)
// -------------------------------------------------------------
export async function issueBookTransaction(payload: {
  institutionCode?: string;
  bookId?: string;
  accessionNumber: string;
  borrowerType?: "Student" | "Teacher";
  studentId?: string;
  studentName: string;
  className: string;
  loanDays?: number;
  remarks?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const defaultCampus = await getDefaultCampusId(client);
    const cid = (payload.institutionCode && payload.institutionCode !== 'all' && payload.institutionCode !== 'default') 
      ? payload.institutionCode 
      : defaultCampus;

    // 1. Fetch Copy & Book
    const copyRes = await client.query(`
      SELECT c.*, b.title as book_title, b.author, b.available_copies, b.id as book_id
      FROM public.library_book_copies c
      JOIN public.library_books b ON b.id = c.book_id
      WHERE c.accession_number ILIKE $1 OR c.barcode_qr ILIKE $1
      LIMIT 1;
    `, [payload.accessionNumber.trim()]);

    if (copyRes.rows.length === 0) {
      return { success: false, error: `Copy with Accession / Barcode #${payload.accessionNumber} not found in catalog!` };
    }

    const copy = copyRes.rows[0];

    if (copy.status === 'Issued' || copy.status === 'Overdue') {
      return { success: false, error: `Book Copy ${copy.accession_number} is already currently issued!` };
    }

    if (copy.status === 'Lost' || copy.status === 'Damaged' || copy.status === 'Under Binding') {
      return { success: false, error: `Cannot issue copy ${copy.accession_number} because its condition is '${copy.status}'!` };
    }

    const loanDays = payload.loanDays || 7;
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const countRes = await client.query(`SELECT count(*)::int as count FROM public.library_transactions;`);
    const nextSeq = ((countRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const txCode = `LIB-TX-${new Date().getFullYear()}-${nextSeq}`;

    // 2. Insert Transaction
    const insertRes = await client.query(`
      INSERT INTO public.library_transactions (
        institution_code, transaction_code, book_id, copy_id, accession_number,
        book_title, borrower_type, student_id, student_name, class_name,
        issue_date, due_date, status, fine_amount, fine_status, remarks,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, 'Issued', 0, 'None', $13,
        NOW(), NOW()
      )
      RETURNING *;
    `, [
      cid, txCode, copy.book_id, copy.id, copy.accession_number,
      copy.book_title, payload.borrowerType || 'Student', payload.studentId || null,
      payload.studentName, payload.className,
      issueDate, dueDate, payload.remarks || 'Standard circulation loan'
    ]);

    // 3. Mark copy as Issued
    await client.query(`
      UPDATE public.library_book_copies 
      SET status = 'Issued' 
      WHERE id = $1;
    `, [copy.id]);

    // 4. Decrement available copies on title
    await client.query(`
      UPDATE public.library_books 
      SET available_copies = GREATEST(0, available_copies - 1), updated_at = NOW()
      WHERE id = $1;
    `, [copy.book_id]);

    safeRevalidate("/admin/library");
    safeRevalidate("/parent/academics");

    return {
      success: true,
      message: `✓ Book '${copy.book_title}' (${copy.accession_number}) issued to ${payload.studentName}! Due on ${dueDate}.`,
      data: insertRes.rows[0]
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 6. RETURN BOOK & COMPUTE FINE
// -------------------------------------------------------------
export async function returnBookTransaction(payload: {
  transactionId: string;
  waiveFine?: boolean;
  finePaymentRemarks?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 1. Fetch transaction
    const txRes = await client.query(`
      SELECT tx.*, b.id as book_id, b.available_copies
      FROM public.library_transactions tx
      LEFT JOIN public.library_books b ON b.id = tx.book_id
      WHERE tx.id = $1;
    `, [payload.transactionId]);

    if (txRes.rows.length === 0) {
      return { success: false, error: "Transaction record not found!" };
    }

    const tx = txRes.rows[0];
    if (tx.status === 'Returned') {
      return { success: false, error: "Book copy has already been returned!" };
    }

    const returnDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(tx.due_date);
    const today = new Date(returnDate);

    let fineAmt = 0;
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmt = diffDays * 10; // ₹10/day fine
    }

    if (payload.waiveFine) {
      fineAmt = 0;
    }

    const fineStatus = fineAmt > 0 ? 'Pending' : 'None';

    // 2. Update Transaction
    await client.query(`
      UPDATE public.library_transactions 
      SET return_date = $1, status = 'Returned', fine_amount = $2, fine_status = $3, updated_at = NOW()
      WHERE id = $4;
    `, [returnDate, fineAmt, fineStatus, tx.id]);

    // 3. Mark copy as Available
    await client.query(`
      UPDATE public.library_book_copies 
      SET status = 'Available' 
      WHERE id = $1;
    `, [tx.copy_id]);

    // 4. Increment available copies on title
    await client.query(`
      UPDATE public.library_books 
      SET available_copies = available_copies + 1, updated_at = NOW()
      WHERE id = $1;
    `, [tx.book_id]);

    safeRevalidate("/admin/library");
    safeRevalidate("/parent/academics");

    return {
      success: true,
      message: `✓ Book '${tx.book_title}' (${tx.accession_number}) checked in successfully! ${fineAmt > 0 ? `Late Overdue Fine: ₹${fineAmt}` : "No fine due."}`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 7. RENEW BOOK LOAN
// -------------------------------------------------------------
export async function renewBookLoanAction(payload: {
  transactionId: string;
  additionalDays?: number;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const additionalDays = payload.additionalDays || 7;

    const txRes = await client.query(`
      SELECT * FROM public.library_transactions WHERE id = $1;
    `, [payload.transactionId]);

    if (txRes.rows.length === 0) {
      return { success: false, error: "Transaction not found" };
    }

    const tx = txRes.rows[0];
    if (tx.status !== 'Issued' && tx.status !== 'Overdue') {
      return { success: false, error: "Only active issued books can be renewed!" };
    }

    const currentDue = new Date(tx.due_date);
    const newDue = new Date(currentDue.getTime() + additionalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const renewalCount = (tx.renewal_count || 0) + 1;

    await client.query(`
      UPDATE public.library_transactions 
      SET due_date = $1, status = 'Issued', renewal_count = $2, updated_at = NOW()
      WHERE id = $3;
    `, [newDue, renewalCount, tx.id]);

    // Ensure copy status is Issued
    await client.query(`UPDATE public.library_book_copies SET status = 'Issued' WHERE id = $1;`, [tx.copy_id]);

    safeRevalidate("/admin/library");

    return {
      success: true,
      message: `✓ Book '${tx.book_title}' renewed for ${additionalDays} days. New Due Date: ${newDue}`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 8. ADD NEW BOOK TITLE WITH AUTO ACCESSIONS
// -------------------------------------------------------------
export async function addNewBookTitleAction(payload: {
  institutionCode?: string;
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  edition?: string;
  category: string;
  language?: string;
  classGrade?: string;
  rackLocation: string;
  price?: number;
  totalCopies: number;
  description?: string;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const defaultCampus = await getDefaultCampusId(client);
    const cid = (payload.institutionCode && payload.institutionCode !== 'all' && payload.institutionCode !== 'default') 
      ? payload.institutionCode 
      : defaultCampus;

    const countRes = await client.query(`SELECT count(*)::int as count FROM public.library_books;`);
    const seq = ((countRes.rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    const bookCode = `BK-${new Date().getFullYear()}-${seq}`;
    const copiesCount = Math.max(1, payload.totalCopies || 1);

    // 1. Insert Title
    const bookRes = await client.query(`
      INSERT INTO public.library_books (
        institution_code, book_code, title, author, publisher, isbn, edition,
        category, language, class_grade, rack_location, price,
        total_copies, available_copies, description, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, NOW(), NOW()
      ) RETURNING id;
    `, [
      cid, bookCode, payload.title, payload.author, payload.publisher || 'NCERT', payload.isbn || null, payload.edition || '1st Edition',
      payload.category || 'GENERAL', payload.language || 'English', payload.classGrade || 'All Classes', payload.rackLocation || 'Rack A1',
      payload.price || 250, copiesCount, copiesCount, payload.description || ''
    ]);

    const createdBook = bookRes.rows[0];

    // 2. Fetch max accession number to continue sequence
    const maxAccRes = await client.query(`
      SELECT accession_number FROM public.library_book_copies 
      WHERE accession_number ~ '^ACC-[0-9]+$' 
      ORDER BY substring(accession_number from 5)::int DESC LIMIT 1;
    `);

    let nextAccNum = 1034;
    if (maxAccRes.rows.length > 0) {
      const lastStr = maxAccRes.rows[0].accession_number;
      const parsed = parseInt(lastStr.replace('ACC-', ''), 10);
      if (!isNaN(parsed)) nextAccNum = parsed + 1;
    }

    // 3. Create physical copies
    for (let i = 1; i <= copiesCount; i++) {
      const accNum = `ACC-${nextAccNum + i - 1}`;
      const barcodeQr = `QR-${accNum}`;
      await client.query(`
        INSERT INTO public.library_book_copies (
          book_id, accession_number, barcode_qr, copy_number, status, rack_location, created_at
        ) VALUES (
          $1, $2, $3, $4, 'Available', $5, NOW()
        );
      `, [createdBook.id, accNum, barcodeQr, i, payload.rackLocation || 'Rack A1']);
    }

    safeRevalidate("/admin/library");

    return {
      success: true,
      message: `✓ Book '${payload.title}' added to catalog with code ${bookCode} and ${copiesCount} physical accession copies (ACC-${nextAccNum} to ACC-${nextAccNum + copiesCount - 1})!`,
      book: createdBook
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// 9. STUDENT LIBRARY PROFILE (FOR PARENT APP & SIS)
// -------------------------------------------------------------
export async function getStudentLibraryProfile(studentIdOrName?: string) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let student: any = null;
    if (studentIdOrName && studentIdOrName.trim()) {
      const stuRes = await client.query(`
        SELECT s.id, s.first_name, s.last_name, s.admission_no, COALESCE(c.grade, 'Grade 5') as grade, COALESCE(c.section, 'A') as section
        FROM public.students s
        LEFT JOIN public.classes c ON c.id = s.class_id
        WHERE s.admission_no ILIKE $1 OR (s.first_name || ' ' || s.last_name) ILIKE $1
        LIMIT 1;
      `, [`%${studentIdOrName.trim()}%`]);
      student = stuRes.rows[0];
    } else {
      const stuRes = await client.query(`
        SELECT s.id, s.first_name, s.last_name, s.admission_no, COALESCE(c.grade, 'Grade 5') as grade, COALESCE(c.section, 'A') as section
        FROM public.students s
        LEFT JOIN public.classes c ON c.id = s.class_id
        WHERE s.status = 'ACTIVE'
        ORDER BY s.created_at ASC
        LIMIT 1;
      `);
      student = stuRes.rows[0];
    }
    if (!student) {
      return {
        success: false,
        error: "No student found matching query",
        data: null
      };
    }

    const txsRes = await client.query(`
      SELECT * FROM public.library_transactions 
      WHERE (student_id = $1::uuid OR student_name ILIKE $2) AND status = 'Issued'
      ORDER BY due_date ASC;
    `, [student.id, `%${student.first_name}%`]);

    const activeLoans = txsRes.rows.map((r: any) => ({
      ...r,
      issue_date: safeDateStr(r.issue_date),
      due_date: safeDateStr(r.due_date)
    }));

    const pendingFineTotal = activeLoans.reduce((acc: number, t: any) => acc + Number(t.fine_amount || 0), 0);

    return {
      success: true,
      data: {
        studentName: `${student.first_name} ${student.last_name}`,
        className: `${student.grade}-${student.section}`,
        activeLoans,
        totalIssued: activeLoans.length,
        pendingFine: pendingFineTotal
      }
    };
  } catch (error: any) {
    console.error("Error in getStudentLibraryProfile:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
