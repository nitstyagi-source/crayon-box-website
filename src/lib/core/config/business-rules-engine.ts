/**
 * HIERARCHICAL BUSINESS RULES REGISTRY ENGINE
 * Resolves operational rules dynamically via 4-tier inheritance:
 * 1. Trust Default -> 2. Institution Override -> 3. Campus Override -> 4. Session Override
 */

export interface SchoolBusinessRuleMap {
  ATTENDANCE_ABSENTEE_ALERT_DELAY_MINS: number;
  ATTENDANCE_CHRONIC_ABSENTEE_THRESHOLD_PERCENT: number;
  ATTENDANCE_STAFF_GEOFENCE_RADIUS_METERS: number;
  FINANCE_LATE_FEE_GRACE_PERIOD_DAYS: number;
  FINANCE_DAILY_LATE_FEE_AMOUNT: number;
  FINANCE_SIBLING_CONCESSION_PERCENT_SECOND_CHILD: number;
  FINANCE_SIBLING_CONCESSION_PERCENT_THIRD_CHILD: number;
  FINANCE_STAFF_CHILD_CONCESSION_PERCENT: number;
  ACADEMICS_MINIMUM_PASSING_PERCENTAGE: number;
  ACADEMICS_LOCK_EXAM_MARKS_AFTER_PUBLISH: boolean;
  TRANSPORT_BUS_PROXIMITY_ALERT_METERS: number;
  TRANSPORT_MAX_ALLOWABLE_SPEED_KMH: number;
  SECURITY_CCTV_STREAM_DURATION_MINS: number;
}

// 1. Level 1: Default Trust-Wide Baseline Rules (Vani Educational Trust)
const TRUST_DEFAULT_RULES: SchoolBusinessRuleMap = {
  ATTENDANCE_ABSENTEE_ALERT_DELAY_MINS: 15,
  ATTENDANCE_CHRONIC_ABSENTEE_THRESHOLD_PERCENT: 75.0,
  ATTENDANCE_STAFF_GEOFENCE_RADIUS_METERS: 250,
  FINANCE_LATE_FEE_GRACE_PERIOD_DAYS: 5,
  FINANCE_DAILY_LATE_FEE_AMOUNT: 100,
  FINANCE_SIBLING_CONCESSION_PERCENT_SECOND_CHILD: 15.0,
  FINANCE_SIBLING_CONCESSION_PERCENT_THIRD_CHILD: 25.0,
  FINANCE_STAFF_CHILD_CONCESSION_PERCENT: 50.0,
  ACADEMICS_MINIMUM_PASSING_PERCENTAGE: 40.0,
  ACADEMICS_LOCK_EXAM_MARKS_AFTER_PUBLISH: true,
  TRANSPORT_BUS_PROXIMITY_ALERT_METERS: 500,
  TRANSPORT_MAX_ALLOWABLE_SPEED_KMH: 45,
  SECURITY_CCTV_STREAM_DURATION_MINS: 15,
};

// 2. Level 2: Institution-Specific Overrides
const INSTITUTION_RULE_OVERRIDES: Record<string, Partial<SchoolBusinessRuleMap>> = {
  // Crayon Box School (CBS) - Standard K-12
  'ins-cbs': {
    FINANCE_DAILY_LATE_FEE_AMOUNT: 100,
    SECURITY_CCTV_STREAM_DURATION_MINS: 15,
  },
  // Crayon Box Pre School (CBPS) - Pre-Primary / Toddlers
  'ins-cbps': {
    FINANCE_DAILY_LATE_FEE_AMOUNT: 50,
    SECURITY_CCTV_STREAM_DURATION_MINS: 20, // Extended stream for nursery parents
    ATTENDANCE_CHRONIC_ABSENTEE_THRESHOLD_PERCENT: 70.0,
  },
  // Avinya School (AS)
  'ins-as': {
    FINANCE_DAILY_LATE_FEE_AMOUNT: 100,
    FINANCE_LATE_FEE_GRACE_PERIOD_DAYS: 7,
  },
  // Avinya Vidya Mandir (AVM)
  'ins-avm': {
    FINANCE_DAILY_LATE_FEE_AMOUNT: 50,
    FINANCE_SIBLING_CONCESSION_PERCENT_SECOND_CHILD: 20.0, // Higher concession for AVM community
  },
};

export class BusinessRulesEngine {
  /**
   * Resolve a specific business rule for an institution/campus context
   */
  public static getRule<K extends keyof SchoolBusinessRuleMap>(
    ruleKey: K,
    institutionId?: string,
    campusId?: string
  ): SchoolBusinessRuleMap[K] {
    // 1. Check Institution Override
    if (institutionId && INSTITUTION_RULE_OVERRIDES[institutionId]?.[ruleKey] !== undefined) {
      return INSTITUTION_RULE_OVERRIDES[institutionId]![ruleKey] as SchoolBusinessRuleMap[K];
    }

    // 2. Fallback to Trust Baseline Default
    return TRUST_DEFAULT_RULES[ruleKey];
  }

  /**
   * Get all active effective rules for an institution
   */
  public static getAllEffectiveRules(institutionId?: string): SchoolBusinessRuleMap {
    if (!institutionId) return { ...TRUST_DEFAULT_RULES };
    const overrides = INSTITUTION_RULE_OVERRIDES[institutionId] || {};
    return {
      ...TRUST_DEFAULT_RULES,
      ...overrides,
    };
  }
}
