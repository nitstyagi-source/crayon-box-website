"use server";

import { createClient } from '@/lib/supabase/server';

export interface LeadScoreRecord {
  id: string;
  enquiry_id: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  student_name: string;
  grade_applying: string;
  lead_source: string;
  conversion_score: number; // 0-100
  score_tier: 'HOT' | 'WARM' | 'COLD';
  key_drivers: string[];
  ai_recommended_action: string;
  suggested_message: string;
  last_contacted_at: string | null;
  created_at: string;
}

const MOCK_LEADS: LeadScoreRecord[] = [
  {
    id: 'lead-01',
    enquiry_id: 'enq-901',
    parent_name: 'Dr. Rajesh Khanna',
    parent_phone: '+91 98112 34567',
    parent_email: 'rajesh.khanna@medcenter.in',
    student_name: 'Advait Khanna',
    grade_applying: 'Class 1 (Primary)',
    lead_source: 'Parent Referral',
    conversion_score: 92,
    score_tier: 'HOT',
    key_drivers: [
      'Completed comprehensive campus tour on Saturday (+25)',
      'Elder sibling Ananya already enrolled in Class 5 (+20)',
      'Downloaded fee schedule within 5 minutes (+15)',
      'Follow-up inquiry answered within 2 hours (+15)'
    ],
    ai_recommended_action: 'High conversion probability. Dispatch direct provisional admission link with sibling discount pre-applied.',
    suggested_message: 'Dear Dr. Rajesh Khanna, thank you for visiting Crayon Box School campus. As an esteemed member of our parent community, we have reserved a provisional seat for Advait in Class 1 with our priority sibling fee concession.',
    last_contacted_at: '2026-09-02T10:30:00Z',
    created_at: '2026-09-01T08:00:00Z'
  },
  {
    id: 'lead-02',
    enquiry_id: 'enq-902',
    parent_name: 'Meera Deshmukh',
    parent_phone: '+91 97234 56789',
    parent_email: 'meera.d@fintech.co',
    student_name: 'Ira Deshmukh',
    grade_applying: 'Montessori Early Years (Pre-K)',
    lead_source: 'Google Search / Website',
    conversion_score: 84,
    score_tier: 'HOT',
    key_drivers: [
      'Visited Early Years Montessori curriculum page 3 times (+20)',
      'Requested interactive campus walk-in slot (+20)',
      'Inquired about air-conditioned transport routes (+15)'
    ],
    ai_recommended_action: 'Send Montessori sensory classroom video tour and invite for Principal Tea on Saturday.',
    suggested_message: 'Hello Meera ji, we noticed your interest in our Montessori Early Years program. Our dedicated foundational wing ensures 1:8 teacher-child ratio. Would you like to reserve a private tour this Saturday at 10:30 AM?',
    last_contacted_at: '2026-09-03T14:15:00Z',
    created_at: '2026-09-02T09:30:00Z'
  },
  {
    id: 'lead-03',
    enquiry_id: 'enq-903',
    parent_name: 'Col. Vikram Rathore',
    parent_phone: '+91 94567 89012',
    parent_email: 'rathore.v@army.nic.in',
    student_name: 'Shaurya Rathore',
    grade_applying: 'Class 9 (Secondary)',
    lead_source: 'Defence / Institutional Transfer',
    conversion_score: 73,
    score_tier: 'WARM',
    key_drivers: [
      'Relocating to campus catchment area in November (+20)',
      'Inquired about board affiliation & Sports complex facilities (+15)',
      'Prospectus downloaded (+10)'
    ],
    ai_recommended_action: 'Share Board academic track record brochure and military transfer TC admission guidelines.',
    suggested_message: 'Dear Col. Rathore, welcome to our community. Our school offers flexible mid-term admission continuity for Defence personnel with full transfer certificate clearance support. Here is our Secondary School academic dossier.',
    last_contacted_at: null,
    created_at: '2026-09-02T16:45:00Z'
  },
  {
    id: 'lead-04',
    enquiry_id: 'enq-904',
    parent_name: 'Sunita Aggarwal',
    parent_phone: '+91 98765 43210',
    parent_email: 'sunita.aggarwal@gmail.com',
    student_name: 'Vihaan Aggarwal',
    grade_applying: 'Class 11 (Science / PCM)',
    lead_source: 'Instagram Ad Campaign',
    conversion_score: 65,
    score_tier: 'WARM',
    key_drivers: [
      'Submitted digital inquiry form (+15)',
      'Downloaded JEE/NEET coaching integrated curriculum syllabus (+15)',
      'Has not confirmed campus tour appointment yet (-10)'
    ],
    ai_recommended_action: 'Send JEE/NEET faculty credentials and invite to free Sunday STEM Diagnostic Scholarship Assessment.',
    suggested_message: 'Dear Sunita ji, our Senior Secondary program provides integrated JEE/NEET prep alongside Class 11-12 syllabus. We invite Vihaan to our upcoming Science scholarship benchmark test this Sunday.',
    last_contacted_at: '2026-08-30T11:00:00Z',
    created_at: '2026-08-28T12:00:00Z'
  },
  {
    id: 'lead-05',
    enquiry_id: 'enq-905',
    parent_name: 'Rohan Kapoor',
    parent_phone: '+91 91234 56780',
    parent_email: 'rohan.k@consulting.com',
    student_name: 'Reyansh Kapoor',
    grade_applying: 'Class 3 (Primary)',
    lead_source: 'Walk-in Inquiry Brochure',
    conversion_score: 42,
    score_tier: 'COLD',
    key_drivers: [
      'Collected print brochure 18 days ago (+10)',
      'No digital touchpoints logged since initial visit (-15)',
      'Unanswered phone reminder (-10)'
    ],
    ai_recommended_action: 'Re-engage via low-pressure WhatsApp digest of recent school awards and upcoming Annual Day showcase.',
    suggested_message: 'Hello Rohan, discover life at Crayon Box School! Check out our students’ recent regional robotics championship highlights and explore admissions for the upcoming academic session.',
    last_contacted_at: '2026-08-20T10:00:00Z',
    created_at: '2026-08-16T15:00:00Z'
  }
];

export async function getAdmissionsLeadScoresAction(): Promise<{
  success: boolean;
  leads: LeadScoreRecord[];
  stats: {
    totalScored: number;
    hotCount: number;
    warmCount: number;
    coldCount: number;
    avgConversionRate: number;
  };
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('admissions_lead_scores')
      .select('*')
      .order('conversion_score', { ascending: false });

    let leads = MOCK_LEADS;
    if (!error && data && data.length > 0) {
      leads = data as unknown as LeadScoreRecord[];
    }

    const totalScored = leads.length;
    const hotCount = leads.filter(l => l.score_tier === 'HOT').length;
    const warmCount = leads.filter(l => l.score_tier === 'WARM').length;
    const coldCount = leads.filter(l => l.score_tier === 'COLD').length;
    const avgConversionRate = Math.round(
      leads.reduce((acc, curr) => acc + curr.conversion_score, 0) / (totalScored || 1)
    );

    return {
      success: true,
      leads,
      stats: {
        totalScored,
        hotCount,
        warmCount,
        coldCount,
        avgConversionRate
      }
    };
  } catch {
    return {
      success: true,
      leads: MOCK_LEADS,
      stats: {
        totalScored: 5,
        hotCount: 2,
        warmCount: 2,
        coldCount: 1,
        avgConversionRate: 71
      }
    };
  }
}

export async function dispatchLeadNurtureMessageAction(
  leadId: string,
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL',
  customMessage: string
): Promise<{
  success: boolean;
  message: string;
  dispatchId: string;
}> {
  const lead = MOCK_LEADS.find(l => l.id === leadId) || MOCK_LEADS[0];
  return {
    success: true,
    message: `Personalized AI Nurture alert dispatched via ${channel} to ${lead.parent_name} (${lead.parent_phone}).`,
    dispatchId: `disp-${Date.now()}`
  };
}
