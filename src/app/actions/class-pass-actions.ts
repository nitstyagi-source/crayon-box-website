"use server";

import { getFilteredUniversalStudentsAction } from './universal-student-actions';

export interface ClassAccessPass {
  passId: string;
  studentId: string;
  universalId: string;
  studentName: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  photoUrl?: string;
  emergencyPhone: string;
  bloodGroup: string;
  busRoute: string;
  academicSession: string;
  qrPayload: string;
  issuedDate: string;
  validTill: string;
  accessLevel: string;
  institutionCode: string;
}

export async function getClassPassesForClassAction(params: {
  className: string;
  sectionName?: string;
  institutionCode?: string;
}) {
  try {
    const { className, sectionName, institutionCode = 'CBS' } = params;

    // Fetch dynamic students for the requested class
    const stuRes = await getFilteredUniversalStudentsAction({
      institutionCode: institutionCode !== 'ALL' ? institutionCode : undefined,
      className: className !== 'ALL' ? className : undefined,
      sectionName: sectionName && sectionName !== 'ALL' ? sectionName : undefined,
    });

    if (!stuRes.success || !stuRes.data) {
      return {
        success: false,
        error: stuRes.error || 'Failed to fetch students for class pass generation',
        passes: [],
      };
    }

    const students = stuRes.data;

    // Generate dynamic access passes for each student
    const passes: ClassAccessPass[] = students.map((s: any, idx: number) => {
      const studentName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student';
      const universalId = s.universal_id || `CBS-2026-${String(idx + 1).padStart(4, '0')}`;
      const cName = s.class_name || className || 'Class 1';
      const sName = s.section_name || sectionName || 'A';
      const rollNo = s.roll_number || String(idx + 1);

      return {
        passId: `PASS-26-${s.id.slice(0, 8)}`,
        studentId: s.id,
        universalId,
        studentName,
        className: cName,
        sectionName: sName,
        rollNumber: rollNo,
        photoUrl: s.photo_url || '',
        emergencyPhone: s.guardian_phone || '9810081008',
        bloodGroup: s.blood_group || 'B+',
        busRoute: `Route 0${(idx % 6) + 1}`,
        academicSession: '2026–2027',
        qrPayload: `SCHOOL_ACCESS:${universalId}:${cName}-${sName}:ROLL-${rollNo}:VERIFIED`,
        issuedDate: new Date().toLocaleDateString('en-GB'),
        validTill: '31 Mar 2027',
        accessLevel: 'CAMPUS_TURNSTILE_MAIN_GATE_AND_LIBRARY',
        institutionCode: s.institution_code || institutionCode,
      };
    });

    return {
      success: true,
      className,
      sectionName: sectionName || 'ALL',
      totalPassesGenerated: passes.length,
      passes,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error generating class access passes',
      passes: [],
    };
  }
}
