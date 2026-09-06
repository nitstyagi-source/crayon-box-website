"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ApprovalRequestPayload {
  institutionCode: string;
  requestType: 'FEE_CONCESSION' | 'FEE_REFUND' | 'STUDENT_PROFILE_CHANGE' | 'SALARY_MODIFICATION' | 'TC_ISSUANCE' | 'STAFF_LEAVE';
  title: string;
  description?: string;
  entityType: 'STUDENT' | 'STAFF' | 'INVOICE' | 'EXPENSE';
  entityId: string;
  entityName: string;
  requestedByName: string;
  requestedByRole: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  diffPayload?: any;
  evidenceUrls?: string[];
}

/**
 * 1. Submit a New Maker-Checker Approval Request
 */
export async function createApprovalRequestAction(payload: ApprovalRequestPayload) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('approval_requests')
      .insert({
        institution_code: payload.institutionCode || 'CBS',
        request_type: payload.requestType,
        title: payload.title,
        description: payload.description || '',
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        entity_name: payload.entityName,
        requested_by_name: payload.requestedByName || 'Admin User',
        requested_by_role: payload.requestedByRole || 'ADMIN',
        priority: payload.priority || 'MEDIUM',
        diff_payload: payload.diffPayload || {},
        evidence_urls: payload.evidenceUrls || [],
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating approval request in DB:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/admin/approvals');
    return {
      success: true,
      data,
      message: 'Approval request submitted successfully.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to submit approval request.',
    };
  }
}

/**
 * 2. Get Pending Approvals with Multi-Tenant Filtering
 */
export async function getApprovalRequestsAction(filters?: {
  institutionCode?: string;
  status?: string;
  requestType?: string;
}) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('approval_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.institutionCode && filters.institutionCode !== 'ALL') {
      query = query.eq('institution_code', filters.institutionCode);
    }
    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters?.requestType && filters.requestType !== 'ALL') {
      query = query.eq('request_type', filters.requestType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error querying approval requests:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to fetch approval requests.',
      data: []
    };
  }
}

/**
 * 3. Process Decision (APPROVE or REJECT)
 */
export async function processApprovalDecisionAction(params: {
  requestId: string;
  decision: 'APPROVED' | 'REJECTED';
  reviewerName: string;
  comments?: string;
}) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('approval_requests')
      .update({
        status: params.decision,
        reviewed_by_name: params.reviewerName || 'Managing Trustee',
        reviewer_comments: params.comments || '',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.requestId)
      .select()
      .single();

    revalidatePath('/admin/approvals');
    return {
      success: true,
      data: data || { id: params.requestId, status: params.decision },
      message: `Request ${params.decision === 'APPROVED' ? 'Approved & Committed' : 'Rejected'}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to process decision.',
    };
  }
}
