/**
 * MULTI-ACADEMIC FRAMEWORK & ASSESSMENT ENGINE
 * Distinguishes between:
 * 1. Academic Operating Model (CBSE vs. Montessori vs. State Board)
 * 2. Assessment Schemes (Configurable components, weights, grade scales, and passing rules)
 */

export interface AssessmentComponentScheme {
  id: string;
  name: string; // e.g. "Periodic Assessment 1"
  code: string;
  maxMarks: number;
  weightagePercent: number; // e.g. 10%
  isMandatory: boolean;
  passingMarks: number;
}

export interface ConfigurableAssessmentScheme {
  id: string;
  institutionId: string;
  academicSessionId: string;
  gradeLevel: string; // e.g. "Grade 10"
  schemeName: string;
  components: AssessmentComponentScheme[];
  gradingScale: {
    grades: Array<{ letter: string; minPercent: number; maxPercent: number; gradePoint: number; remarks: string }>;
  };
  moderationPolicy: {
    allowGraceMarks: boolean;
    maxGraceMarks: number;
    requirePrincipalApproval: boolean;
  };
  effectiveFromDate: string;
  version: number;
}

export interface MontessoriActivityPresentation {
  id: string;
  studentId: string;
  developmentalArea:
    | 'PRACTICAL_LIFE_SKILLS'
    | 'SENSORIAL_EXPLORATION'
    | 'LANGUAGE_&_PHONETICS'
    | 'MATHEMATICAL_MIND'
    | 'CULTURAL_&_SCIENTIFIC_STUDIES'
    | 'SOCIO_EMOTIONAL_&_MOTOR_SKILLS';
  activityName: string;
  presentationDate: string;
  currentMilestone: 'PRESENTED' | 'PRACTICING_INDEPENDENTLY' | 'INTERNALIZED_&_MASTERED';
  concentrationLevel: 'DEVELOPING' | 'FOCUSED' | 'DEEP_FLOW';
  teacherObservationRemarks: string;
  mediaAttachments?: string[];
  parentHomeExtensionNotes?: string;
}

export class AcademicFrameworkEngine {
  /**
   * Resolve complete academic framework and assessment blueprint for any institution
   */
  public static getFrameworkBlueprint(institutionCode: 'CBS' | 'CBPS' | 'AS' | 'AVM') {
    switch (institutionCode) {
      case 'CBPS':
        return {
          institutionCode: 'CBPS',
          frameworkType: 'MONTESSORI' as const,
          frameworkName: 'Montessori Early Childhood Academic Operating Engine',
          isGradingBased: false,
          coreDevelopmentalAreas: [
            'Practical Life Skills & Independence',
            'Sensorial Refinement & Perception',
            'Language, Phonetics & Pre-Reading',
            'Mathematical Mind & Numeracy',
            'Cultural & Cosmic Education',
            'Socio-Emotional Growth & Motor Skills',
          ],
          dailyObservationTracking: true,
          parentAppDisplay: 'MILESTONES_ACTIVITY_PORTFOLIO',
        };

      case 'CBS':
      case 'AS':
        return {
          institutionCode,
          frameworkType: 'CBSE' as const,
          frameworkName: 'National Standard K-12 Academic Framework',
          isGradingBased: true,
          defaultAssessmentComponents: [
            { code: 'PA1', name: 'Periodic Assessment 1', weightage: 10 },
            { code: 'MID', name: 'Mid-Term Examination', weightage: 30 },
            { code: 'PA2', name: 'Periodic Assessment 2', weightage: 10 },
            { code: 'FIN', name: 'Annual Final Examination', weightage: 50 },
          ],
          gradingScale: '9_POINT_SCALE_A1_TO_E',
          parentAppDisplay: 'SCHOLASTIC_REPORT_CARDS_&_GPA',
        };

      case 'AVM':
        return {
          institutionCode: 'AVM',
          frameworkType: 'STATE_BOARD' as const,
          frameworkName: 'State Board Secondary Academic Framework',
          isGradingBased: true,
          defaultAssessmentComponents: [
            { code: 'QTR', name: 'Quarterly Examination', weightage: 20 },
            { code: 'HY', name: 'Half-Yearly Examination', weightage: 30 },
            { code: 'ANN', name: 'Annual Board Examination', weightage: 50 },
          ],
          gradingScale: 'MARKS_WITH_DIVISION_DISTINCTION',
          parentAppDisplay: 'STATUTORY_BOARD_MARKSHEET',
        };
    }
  }
}
