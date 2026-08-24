"use server";

import { Client } from 'pg';

const DB_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPgClient() {
  return new Client({ connectionString: DB_CONNECTION_STRING });
}

// 1. Update Full Student Profile
export async function updateStudentProfileFullAction(studentId: string, data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  category?: string;
  aadhaarNo?: string;
  penNo?: string;
  photoUrl?: string;
  status?: string;
  admissionNo?: string;
  transportMode?: string;
  transportBusNo?: string;
  transportRoute?: string;
  transportStop?: string;
  transportDriverName?: string;
  transportDriverPhone?: string;
}) {
  const client = getPgClient();
  try {
    await client.connect();
    await client.query('BEGIN');

    const res = await client.query(`
      UPDATE public.students
      SET
        first_name = $2,
        middle_name = $3,
        last_name = $4,
        dob = $5,
        gender = $6,
        blood_group = $7,
        nationality = $8,
        category = $9,
        aadhaar_no = $10,
        pen_no = $11,
        photo_url = COALESCE($12, photo_url),
        status = COALESCE($13, status),
        admission_no = COALESCE($14, admission_no),
        transport_mode = $15,
        transport_bus_no = $16,
        transport_route = $17,
        transport_stop = $18,
        transport_driver_name = $19,
        transport_driver_phone = $20,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `, [
      studentId,
      data.firstName.trim(),
      data.middleName?.trim() || null,
      data.lastName.trim(),
      data.dob,
      data.gender,
      data.bloodGroup || 'O+',
      data.nationality || 'Indian',
      data.category || 'General',
      data.aadhaarNo || null,
      data.penNo || null,
      data.photoUrl || null,
      data.status || 'ACTIVE',
      data.admissionNo || null,
      data.transportMode || 'PARENT_PICKUP',
      data.transportBusNo || null,
      data.transportRoute || null,
      data.transportStop || null,
      data.transportDriverName || null,
      data.transportDriverPhone || null,
    ]);

    if (data.admissionNo) {
      await client.query(`
        UPDATE public.student_enrollments
        SET admission_number = $2
        WHERE student_id = $1 AND is_current = true;
      `, [studentId, data.admissionNo.trim()]);
    }

    await client.query('COMMIT');
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// 2. Update Guardian Profile
export async function updateGuardianProfileFullAction(guardianId: string, data: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  occupation?: string;
  organization?: string;
  designation?: string;
  relationship?: string;
  photoUrl?: string;
  isAuthorizedPickup?: boolean;
  isEmergencyContact?: boolean;
}) {
  const client = getPgClient();
  try {
    await client.connect();
    const res = await client.query(`
      UPDATE public.guardians
      SET
        first_name = $2,
        last_name = $3,
        phone = $4,
        email = $5,
        occupation = $6,
        organization = $7,
        designation = $8,
        relationship = COALESCE($9, relationship),
        photo_url = COALESCE($10, photo_url),
        is_authorized_pickup = COALESCE($11, is_authorized_pickup),
        is_emergency_contact = COALESCE($12, is_emergency_contact)
      WHERE id = $1
      RETURNING *;
    `, [
      guardianId,
      data.firstName.trim(),
      data.lastName.trim(),
      data.phone.trim(),
      data.email?.trim() || null,
      data.occupation || null,
      data.organization || null,
      data.designation || null,
      data.relationship || null,
      data.photoUrl || null,
      data.isAuthorizedPickup !== undefined ? data.isAuthorizedPickup : true,
      data.isEmergencyContact !== undefined ? data.isEmergencyContact : true,
    ]);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// 3. Upload / Update Student Photo
export async function uploadStudentPhotoAction(studentId: string, photoUrl: string) {
  const client = getPgClient();
  try {
    await client.connect();
    const res = await client.query(`
      UPDATE public.students
      SET photo_url = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING photo_url;
    `, [studentId, photoUrl]);
    return { success: true, photoUrl: res.rows[0].photo_url };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// 4. Upload / Update Guardian Photo
export async function uploadGuardianPhotoAction(guardianId: string, photoUrl: string) {
  const client = getPgClient();
  try {
    await client.connect();
    const res = await client.query(`
      UPDATE public.guardians
      SET photo_url = $2
      WHERE id = $1
      RETURNING photo_url;
    `, [guardianId, photoUrl]);
    return { success: true, photoUrl: res.rows[0].photo_url };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// 5. Get Student Documents
export async function getStudentDocumentsAction(studentId: string) {
  const client = getPgClient();
  try {
    await client.connect();
    const res = await client.query(`
      SELECT * FROM public.student_documents
      WHERE student_id = $1
      ORDER BY uploaded_at DESC;
    `, [studentId]);
    return { success: true, data: res.rows };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  } finally {
    await client.end();
  }
}

// 6. Upload Student Document
export async function uploadStudentDocumentAction(data: {
  studentId: string;
  documentType: string; // 'BIRTH_CERTIFICATE' | 'AADHAAR' | 'IMMUNIZATION' | 'PREVIOUS_TC' | 'ADDRESS_PROOF' | 'OTHER'
  documentTitle: string;
  documentNo?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
}) {
  const client = getPgClient();
  try {
    await client.connect();
    const res = await client.query(`
      INSERT INTO public.student_documents (
        student_id, document_type, document_title, document_no,
        file_url, file_name, file_size, verification_status, uploaded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'VERIFIED', NOW())
      RETURNING *;
    `, [
      data.studentId,
      data.documentType,
      data.documentTitle,
      data.documentNo || null,
      data.fileUrl,
      data.fileName,
      data.fileSize || '1.2 MB',
    ]);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

// 7. Delete Student Document
export async function deleteStudentDocumentAction(documentId: string) {
  const client = getPgClient();
  try {
    await client.connect();
    await client.query(`DELETE FROM public.student_documents WHERE id = $1;`, [documentId]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}
