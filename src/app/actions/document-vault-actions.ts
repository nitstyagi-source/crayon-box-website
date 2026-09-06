"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { erpDocumentVault, VaultDocument } from '@/lib/core/documents/document-vault';

export interface RegisterDocumentPayload {
  campusId: string;
  entityType: VaultDocument['entityType'];
  entityId: string;
  documentType: VaultDocument['documentType'];
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  issueDate?: string;
  expiryDate?: string;
}

/**
 * Register or upload a new document into the centralized document vault
 */
export async function registerDocumentAction(payload: RegisterDocumentPayload) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('documents')
      .insert({
        campus_id: payload.campusId,
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        document_type: payload.documentType,
        file_name: payload.fileName,
        file_url: payload.fileUrl,
        file_size_bytes: payload.fileSizeBytes,
        issue_date: payload.issueDate || null,
        expiry_date: payload.expiryDate || null,
        verification_status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      console.warn('Fallback to in-memory vault engine:', error.message);
      const inMemoryDoc = erpDocumentVault.registerDocument({
        ...payload,
        verificationStatus: 'PENDING',
      });
      return { success: true, data: inMemoryDoc };
    }

    revalidatePath('/admin/students');
    revalidatePath('/admin/faculty');
    return { success: true, data };
  } catch (err: any) {
    console.error('Error in registerDocumentAction:', err);
    return { success: false, error: err.message || 'Failed to register document' };
  }
}

/**
 * Get all verified or pending documents for a specific entity
 */
export async function getEntityDocumentsAction(entityType: string, entityId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const inMemoryDocs = erpDocumentVault.getEntityDocuments(entityId);
      return { success: true, documents: inMemoryDocs };
    }

    return { success: true, documents: data };
  } catch (err: any) {
    console.error('Error in getEntityDocumentsAction:', err);
    return { success: false, error: err.message, documents: [] };
  }
}

/**
 * Update verification status of a document
 */
export async function setDocumentVerificationStatusAction(
  docId: string,
  status: 'VERIFIED' | 'REJECTED',
  rejectionReason?: string
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('documents')
      .update({
        verification_status: status,
        rejection_reason: rejectionReason || null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', docId)
      .select()
      .single();

    if (error) {
      erpDocumentVault.setVerificationStatus(docId, status, {
        userId: 'SYSTEM',
        name: 'Administrator',
      });
      return { success: true, message: 'Status updated in memory' };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
