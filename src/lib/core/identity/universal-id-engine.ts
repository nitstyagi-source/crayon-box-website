/**
 * UNIVERSAL IDENTITY, ENROLLMENT & ASSIGNMENT ENGINE
 * Distinguishes between:
 * 1. Permanent Identity (Universal Student UUID / Universal Employee UUID)
 * 2. Active Enrollment / Employment Assignment (Institution, Campus, Session, Class)
 * 3. 3-Way Student Lifecycle Exits (Internal Trust Transfer vs. External TC Transfer vs. Withdrawal)
 */

export interface StudentMaster {
  uuid: string; // Permanent across all institutions (e.g. STU-VET-882109)
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  aadhaarNumberMasked: string; // e.g. "XXXX-XXXX-4821"
  parentFamilyId: string;
  createdAt: string;
}

export interface StudentEnrollment {
  id: string;
  studentUuid: string;
  legalEntityId: string;
  institutionId: string;
  institutionCode: string;
  campusId: string;
  academicSessionId: string;
  admissionNumber: string; // e.g. "CBS-2026-0042"
  gradeLevel: string;
  section: string;
  rollNumber: string;
  enrollmentDate: string;
  status:
    | 'ENROLLED_ACTIVE'
    | 'ON_LEAVE'
    | 'INTERNAL_TRANSFER_IN_PROGRESS'
    | 'INTERNAL_TRANSFERRED'
    | 'EXTERNAL_TC_IN_PROGRESS'
    | 'WITHDRAWN_TC_ISSUED'
    | 'ALUMNI_GRADUATED';
}

export interface EmployeeMaster {
  uuid: string; // Permanent across all institutions (e.g. EMP-VET-1042)
  fullName: string;
  email: string;
  phone: string;
  panNumberMasked: string;
  epfUanNumber?: string;
  primaryHomeAddress: string;
  createdAt: string;
}

export interface EmployeeAssignment {
  id: string;
  employeeUuid: string;
  legalEntityId: string;
  institutionId: string;
  institutionCode: string;
  campusId: string;
  campusName: string;
  employeeCode: string; // e.g. "CBS-EMP-042"
  department: string;
  designation: string;
  workloadAllocationPercent: number; // e.g. 70% primary, 30% secondary
  isPrimaryAssignment: boolean;
  employmentType: 'PERMANENT' | 'PROBATION' | 'CONTRACTUAL' | 'VISITING';
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TRANSFERRED' | 'RELIEVED';
}

export class UniversalIdentityEngine {
  /**
   * 1. Internal Trust Transfer (e.g. CBS -> AS)
   * Preserves permanent student UUID without requiring full external TC clearance
   */
  public static executeInternalTrustTransfer(params: {
    studentUuid: string;
    currentEnrollment: StudentEnrollment;
    targetInstitutionId: string;
    targetInstitutionCode: string;
    targetCampusId: string;
    targetSessionId: string;
    targetGrade: string;
    targetSection: string;
    transferReason: string;
  }): { previousEnrollment: StudentEnrollment; newEnrollment: StudentEnrollment } {
    // Settle old enrollment as internally transferred
    const previousEnrollment: StudentEnrollment = {
      ...params.currentEnrollment,
      status: 'INTERNAL_TRANSFERRED',
    };

    // Create new enrollment under target institution
    const newAdmissionNumber = `${params.targetInstitutionCode}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnrollment: StudentEnrollment = {
      id: `ENR-${Date.now().toString().slice(-6)}`,
      studentUuid: params.studentUuid,
      legalEntityId: 'leg-vet-main',
      institutionId: params.targetInstitutionId,
      institutionCode: params.targetInstitutionCode,
      campusId: params.targetCampusId,
      academicSessionId: params.targetSessionId,
      admissionNumber: newAdmissionNumber,
      gradeLevel: params.targetGrade,
      section: params.targetSection,
      rollNumber: 'TBD',
      enrollmentDate: new Date().toISOString(),
      status: 'ENROLLED_ACTIVE',
    };

    console.log(`🔄 [TRUST TRANSFER] Transferred student ${params.studentUuid} from ${params.currentEnrollment.institutionCode} to ${params.targetInstitutionCode} (New Admission #${newAdmissionNumber})`);
    return { previousEnrollment, newEnrollment };
  }

  /**
   * 2. External Transfer / Withdrawal (Full clearance -> TC Generation)
   */
  public static initiateExternalTcClearance(enrollment: StudentEnrollment): StudentEnrollment {
    return {
      ...enrollment,
      status: 'EXTERNAL_TC_IN_PROGRESS',
    };
  }
}
