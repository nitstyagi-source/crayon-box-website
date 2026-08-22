"use server";

import {
  StudentMaster,
  StudentEnrollment,
  UniversalIdentityEngine
} from '@/lib/core/identity/universal-id-engine';
import { erpAuditEngine } from '@/lib/core/audit/audit-engine';
import { erpNotificationHub } from '@/lib/core/notifications/notification-hub';

// In-Memory Seeded Registry for Universal Students & Enrollments
let SEEDED_STUDENT_MASTERS: StudentMaster[] = [
  {
    uuid: 'STU-VET-882109',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dob: '2016-04-12',
    gender: 'Male',
    bloodGroup: 'O+',
    aadhaarNumberMasked: 'XXXX-XXXX-4821',
    parentFamilyId: 'FAM-VET-012',
    createdAt: '2022-04-01T08:00:00Z',
  },
  {
    uuid: 'STU-VET-882110',
    firstName: 'Anaya',
    lastName: 'Sharma',
    dob: '2020-09-18',
    gender: 'Female',
    bloodGroup: 'O+',
    aadhaarNumberMasked: 'XXXX-XXXX-9042',
    parentFamilyId: 'FAM-VET-012',
    createdAt: '2024-04-01T08:00:00Z',
  },
];

let SEEDED_ENROLLMENTS: StudentEnrollment[] = [
  {
    id: 'ENR-CBS-0042',
    studentUuid: 'STU-VET-882109',
    legalEntityId: 'leg-vet-main',
    institutionId: 'ins-cbs',
    institutionCode: 'CBS',
    campusId: 'cmp-cbs-spe',
    academicSessionId: 'sess-2026-2027',
    admissionNumber: 'CBS-2026-0042',
    gradeLevel: 'Grade 4',
    section: 'B',
    rollNumber: '14',
    enrollmentDate: '2022-04-01',
    status: 'ENROLLED_ACTIVE',
  },
  {
    id: 'ENR-CBPS-0018',
    studentUuid: 'STU-VET-882110',
    legalEntityId: 'leg-vet-main',
    institutionId: 'ins-cbps',
    institutionCode: 'CBPS',
    campusId: 'cmp-cbps-spe',
    academicSessionId: 'sess-2026-2027',
    admissionNumber: 'CBPS-2026-0018',
    gradeLevel: 'Nursery',
    section: 'A',
    rollNumber: '08',
    enrollmentDate: '2024-04-01',
    status: 'ENROLLED_ACTIVE',
  },
];

export async function getStudentMasterWithEnrollments(studentUuid: string) {
  try {
    const master = SEEDED_STUDENT_MASTERS.find((s) => s.uuid === studentUuid);
    if (!master) return { success: false, message: 'Student master not found' };

    const enrollments = SEEDED_ENROLLMENTS.filter((e) => e.studentUuid === studentUuid);
    const activeEnrollment = enrollments.find((e) => e.status === 'ENROLLED_ACTIVE') || enrollments[0];

    return {
      success: true,
      data: {
        master,
        activeEnrollment,
        enrollmentHistory: enrollments,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeInternalTrustTransferAction(params: {
  studentUuid: string;
  targetInstitutionId: string;
  targetInstitutionCode: string;
  targetCampusId: string;
  targetGrade: string;
  targetSection: string;
  transferReason: string;
  actor: { userId: string; name: string; role: string };
}) {
  try {
    const currentEnrollment = SEEDED_ENROLLMENTS.find(
      (e) => e.studentUuid === params.studentUuid && e.status === 'ENROLLED_ACTIVE'
    );
    if (!currentEnrollment) return { success: false, message: 'No active enrollment found to transfer' };

    const { previousEnrollment, newEnrollment } = UniversalIdentityEngine.executeInternalTrustTransfer({
      studentUuid: params.studentUuid,
      currentEnrollment,
      targetInstitutionId: params.targetInstitutionId,
      targetInstitutionCode: params.targetInstitutionCode,
      targetCampusId: params.targetCampusId,
      targetSessionId: 'sess-2026-2027',
      targetGrade: params.targetGrade,
      targetSection: params.targetSection,
      transferReason: params.transferReason,
    });

    // Update in-memory registry
    SEEDED_ENROLLMENTS = SEEDED_ENROLLMENTS.map((e) => (e.id === previousEnrollment.id ? previousEnrollment : e));
    SEEDED_ENROLLMENTS.push(newEnrollment);

    // Audit the internal transfer
    erpAuditEngine.log({
      trustId: 'org-vani-trust',
      legalEntityId: 'leg-vet-main',
      institutionId: currentEnrollment.institutionId,
      campusId: currentEnrollment.campusId,
      sessionId: currentEnrollment.academicSessionId,
      actor: {
        userId: params.actor.userId,
        name: params.actor.name,
        role: params.actor.role,
        scope: 'TRUST',
        ipAddress: '127.0.0.1',
      },
      action: 'TRANSFER',
      entityType: 'STUDENT_ENROLLMENT',
      entityId: newEnrollment.id,
      description: `Internal Trust Transfer executed from ${currentEnrollment.institutionCode} to ${newEnrollment.institutionCode} (${params.transferReason})`,
      previousState: previousEnrollment,
      newState: newEnrollment,
    });

    return {
      success: true,
      message: `Student successfully transferred to ${params.targetInstitutionCode} with Admission #${newEnrollment.admissionNumber}`,
      data: { previousEnrollment, newEnrollment },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
