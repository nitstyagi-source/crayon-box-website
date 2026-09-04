/**
 * Admissions AI Predictive Lead Scorer
 * Calculates conversion probability (0-100) based on parental engagement,
 * geographic catchment proximity, sibling status, and interaction velocity.
 */

export interface LeadScoringInput {
  leadSource: 'Parent Referral' | 'Walk-in Inquiry Brochure' | 'Google Search / Website' | 'Instagram Ad Campaign' | 'Defence / Institutional Transfer';
  campusTourAttended: boolean;
  prospectusDownloaded: boolean;
  hasEnrolledSibling: boolean;
  commuteDistanceKm: number;
  inquiryAgeDays: number;
  unansweredFollowupsCount: number;
}

export interface LeadScoringEvaluation {
  conversionScore: number; // 0-100
  tier: 'HOT' | 'WARM' | 'COLD';
  driverBreakdown: { driver: string; points: number }[];
  counselorActionRecommendation: string;
}

export function evaluateAdmissionsLead(input: LeadScoringInput): LeadScoringEvaluation {
  let score = 0;
  const drivers: { driver: string; points: number }[] = [];

  // 1. Lead Source Attribution
  switch (input.leadSource) {
    case 'Parent Referral':
      score += 25;
      drivers.push({ driver: 'Parent Referral (High trust network)', points: 25 });
      break;
    case 'Defence / Institutional Transfer':
      score += 22;
      drivers.push({ driver: 'Defence / Institutional transfer relocation', points: 22 });
      break;
    case 'Google Search / Website':
      score += 18;
      drivers.push({ driver: 'High-intent digital website search', points: 18 });
      break;
    case 'Walk-in Inquiry Brochure':
      score += 15;
      drivers.push({ driver: 'In-person campus walk-in collection', points: 15 });
      break;
    case 'Instagram Ad Campaign':
      score += 12;
      drivers.push({ driver: 'Social media campaign inquiry', points: 12 });
      break;
  }

  // 2. High-Value Behavioral Touchpoints
  if (input.campusTourAttended) {
    score += 25;
    drivers.push({ driver: 'Physical campus & lab tour completed', points: 25 });
  }

  if (input.hasEnrolledSibling) {
    score += 20;
    drivers.push({ driver: 'Sibling already enrolled in campus cohort', points: 20 });
  }

  if (input.prospectusDownloaded) {
    score += 15;
    drivers.push({ driver: 'Official digital prospectus & fee schedule downloaded', points: 15 });
  }

  // 3. Proximity Catchment
  if (input.commuteDistanceKm <= 3.0) {
    score += 15;
    drivers.push({ driver: 'Ideal primary bus route catchment (<3 km)', points: 15 });
  } else if (input.commuteDistanceKm <= 7.0) {
    score += 8;
    drivers.push({ driver: 'Accessible suburban radius (3-7 km)', points: 8 });
  }

  // 4. Inactivity & Churn Decay
  if (input.inquiryAgeDays > 14) {
    score -= 15;
    drivers.push({ driver: 'Inactivity penalty (>14 days without touchpoint)', points: -15 });
  }

  if (input.unansweredFollowupsCount >= 2) {
    score -= 12;
    drivers.push({ driver: 'Unanswered counselor reminders', points: -12 });
  }

  // Clamp 0 to 100
  const finalScore = Math.min(100, Math.max(5, score));

  // Determine Tier
  let tier: 'HOT' | 'WARM' | 'COLD' = 'WARM';
  let counselorActionRecommendation = '';

  if (finalScore >= 80) {
    tier = 'HOT';
    counselorActionRecommendation =
      'High conversion likelihood (>85%). Direct phone call from Admissions Head and instant provisional seat reservation link.';
  } else if (finalScore >= 50) {
    tier = 'WARM';
    counselorActionRecommendation =
      'Active interest: Enroll in automated 3-part WhatsApp nurture drip (virtual STEM lab video, student achievements, fee structure).';
  } else {
    tier = 'COLD';
    counselorActionRecommendation =
      'Low responsiveness: Low-friction newsletter re-engagement invite for upcoming Annual Sports Day or Open House.';
  }

  return {
    conversionScore: finalScore,
    tier,
    driverBreakdown: drivers,
    counselorActionRecommendation
  };
}
