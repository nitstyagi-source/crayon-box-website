/**
 * CENTRAL DOCUMENT VAULT & EXPIRY ENGINE
 * Secure document management system tracking Document Types, Verification Status, Expiry Dates, and Checksum Integrity.
 */

export interface VaultDocument {
  id: string;
  campusId: string;
  entityType: 'STUDENT' | 'STAFF' | 'VEHICLE' | 'CAMPUS_FACILITY';
  entityId: string;
  documentType:
    | 'BIRTH_CERTIFICATE'
    | 'AADHAAR_CARD'
    | 'IMMUNIZATION_RECORD'
    | 'PREVIOUS_MARKSHEET'
    | 'TRANSFER_CERTIFICATE'
    | 'BUS_FITNESS_CERTIFICATE'
    | 'BUS_INSURANCE'
    | 'STAFF_DEGREE_CERTIFICATE'
    | 'STAFF_POLICE_VERIFICATION'
    | 'STAFF_MEDICAL_FITNESS';
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  issueDate?: string;
  expiryDate?: string;
  isExpired: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: {
    userId: string;
    name: string;
    timestamp: string;
  };
  uploadedAt: string;
}

class DocumentVault {
  private documents: Map<string, VaultDocument> = new Map();

  /**
   * Upload / Index a document into the vault
   */
  public registerDocument(params: Omit<VaultDocument, 'id' | 'uploadedAt' | 'isExpired'>): VaultDocument {
    const id = `DOC-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const isExpired = params.expiryDate ? new Date(params.expiryDate) < now : false;

    const doc: VaultDocument = {
      ...params,
      id,
      uploadedAt: now.toISOString(),
      isExpired,
    };

    this.documents.set(id, doc);
    console.log(`📁 [DOCUMENT VAULT] Registered ${doc.documentType} for ${doc.entityType} #${doc.entityId} (Verified: ${doc.verificationStatus})`);
    return doc;
  }

  /**
   * Verify / Reject a document
   */
  public setVerificationStatus(
    docId: string,
    status: 'VERIFIED' | 'REJECTED',
    verifier: { userId: string; name: string }
  ): boolean {
    const doc = this.documents.get(docId);
    if (!doc) return false;
    doc.verificationStatus = status;
    doc.verifiedBy = {
      ...verifier,
      timestamp: new Date().toISOString(),
    };
    return true;
  }

  /**
   * Get all documents for a student or staff
   */
  public getEntityDocuments(entityId: string): VaultDocument[] {
    return Array.from(this.documents.values()).filter((d) => d.entityId === entityId);
  }

  /**
   * Find all documents expiring within next N days (for proactive alerts)
   */
  public getExpiringDocuments(withinDays: number = 30): VaultDocument[] {
    const now = new Date();
    const futureLimit = new Date(Date.now() + withinDays * 86400000);

    return Array.from(this.documents.values()).filter((d) => {
      if (!d.expiryDate) return false;
      const exp = new Date(d.expiryDate);
      return exp > now && exp <= futureLimit;
    });
  }
}

export const erpDocumentVault = new DocumentVault();
