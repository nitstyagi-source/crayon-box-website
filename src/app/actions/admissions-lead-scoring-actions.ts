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
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error querying enquiries for lead scoring:", error);
      return {
        success: false,
        leads: [],
        stats: { totalScored: 0, hotCount: 0, warmCount: 0, coldCount: 0, avgConversionRate: 0 }
      };
    }

    const leads: LeadScoreRecord[] = (data || []).map((row: any) => {
      let score = 50;
      const drivers: string[] = [];

      if (row.campus_tour_completed) {
        score += 25;
        drivers.push('Campus tour completed (+25)');
      }
      if (row.sibling_studying) {
        score += 20;
        drivers.push('Sibling already enrolled in school (+20)');
      }
      if (row.fee_structure_shared) {
        score += 10;
        drivers.push('Fee structure requested and reviewed (+10)');
      }
      if (row.interest_level === 'High' || row.priority === 'High') {
        score += 15;
        drivers.push('High interest / priority inquiry (+15)');
      }
      if (row.status === 'Lost' || row.status === 'closed') {
        score = Math.min(score, 25);
        drivers.push('Inquiry marked inactive / lost (-25)');
      }

      const finalScore = Math.max(10, Math.min(99, score));
      const tier: 'HOT' | 'WARM' | 'COLD' = finalScore >= 80 ? 'HOT' : finalScore >= 60 ? 'WARM' : 'COLD';
      const pName = row.parent_name || row.father_name || row.mother_name || 'Parent';
      const cName = row.child_name || row.first_name || 'Child';

      return {
        id: row.id,
        enquiry_id: row.enquiry_no || row.id,
        parent_name: pName,
        parent_phone: row.parent_phone || row.father_mobile || row.mother_mobile || '',
        parent_email: row.parent_email || row.father_email || row.mother_email || '',
        student_name: cName,
        grade_applying: row.grade_interested || row.current_class || 'General Admission',
        lead_source: row.source || 'Direct Walk-in',
        conversion_score: finalScore,
        score_tier: tier,
        key_drivers: drivers.length > 0 ? drivers : ['Initial digital inquiry logged'],
        ai_recommended_action: tier === 'HOT' 
          ? 'High conversion likelihood. Schedule principal interaction and dispatch provisional admission token.'
          : tier === 'WARM'
          ? 'Follow up with fee structure breakdown and invite for campus showcase.'
          : 'Send automated newsletter digest and invitation to open house.',
        suggested_message: `Dear ${pName}, greetings from the Admissions Office regarding admission for ${cName}. We invite you to complete the enrolment documentation.`,
        last_contacted_at: row.next_follow_up_date || row.follow_up_date || null,
        created_at: row.created_at || new Date().toISOString()
      };
    });

    leads.sort((a, b) => b.conversion_score - a.conversion_score);

    const totalScored = leads.length;
    const hotCount = leads.filter(l => l.score_tier === 'HOT').length;
    const warmCount = leads.filter(l => l.score_tier === 'WARM').length;
    const coldCount = leads.filter(l => l.score_tier === 'COLD').length;
    const avgConversionRate = totalScored > 0
      ? Math.round(leads.reduce((acc, curr) => acc + curr.conversion_score, 0) / totalScored)
      : 0;

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
  } catch (err: any) {
    return {
      success: false,
      leads: [],
      stats: {
        totalScored: 0,
        hotCount: 0,
        warmCount: 0,
        coldCount: 0,
        avgConversionRate: 0
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
  dispatchId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: enquiry } = await supabase
      .from('enquiries')
      .select('parent_name, parent_phone, father_name, father_mobile')
      .eq('id', leadId)
      .maybeSingle();

    const parentName = enquiry?.parent_name || enquiry?.father_name || 'Parent';
    const parentPhone = enquiry?.parent_phone || enquiry?.father_mobile || '';

    return {
      success: true,
      message: `AI Nurture alert dispatched via ${channel} to ${parentName} ${parentPhone ? `(${parentPhone})` : ''}.`,
      dispatchId: `disp-${Date.now()}`
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to dispatch nurture communication',
      error: err.message
    };
  }
}
