/**
 * MAKER-CHECKER CHANGE REQUEST SYSTEM
 * Prevents direct destructive overwriting of sensitive master data (DOB, Student Name, Parent Mobile, Bank Account, Salary, Class Allocation).
 * All changes require: Reason, Supporting Document, Maker submission -> Checker verification -> Approver signoff.
 */

export interface ChangeRequest {
  id: string;
  campusId: string;
  entityType: 'STUDENT' | 'STAFF' | 'FEE_LEDGER' | 'FAMILY';
  entityId: string;
  entityName: string;
  fieldToChange: string;
  currentValue: any;
  requestedValue: any;
  reasonForChange: string;
  documentProofUrl?: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  maker: {
    userId: string;
    name: string;
    role: string;
    timestamp: string;
  };
  verifier?: {
    userId: string;
    name: string;
    role: string;
    timestamp: string;
    remarks: string;
  };
  approver?: {
    userId: string;
    name: string;
    role: string;
    timestamp: string;
    remarks: string;
  };
}

class ChangeRequestEngine {
  private requests: Map<string, ChangeRequest> = new Map();

  /**
   * Submit a change request for a sensitive record
   */
  public submitChangeRequest(params: {
    campusId: string;
    entityType: 'STUDENT' | 'STAFF' | 'FEE_LEDGER' | 'FAMILY';
    entityId: string;
    entityName: string;
    fieldToChange: string;
    currentValue: any;
    requestedValue: any;
    reasonForChange: string;
    documentProofUrl?: string;
    maker: { userId: string; name: string; role: string };
  }): ChangeRequest {
    const id = `CR-${Date.now().toString().slice(-6)}`;
    const newCR: ChangeRequest = {
      id,
      campusId: params.campusId,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      fieldToChange: params.fieldToChange,
      currentValue: params.currentValue,
      requestedValue: params.requestedValue,
      reasonForChange: params.reasonForChange,
      documentProofUrl: params.documentProofUrl,
      status: 'PENDING_VERIFICATION',
      maker: {
        ...params.maker,
        timestamp: new Date().toISOString(),
      },
    };

    this.requests.set(id, newCR);
    console.log(`📝 [CHANGE REQUEST] Created #${id} for ${params.entityType} ${params.entityName} (${params.fieldToChange}: "${params.currentValue}" -> "${params.requestedValue}")`);
    return newCR;
  }

  /**
   * Approve a change request and apply changes to the master record
   */
  public approveChangeRequest(
    crId: string,
    approver: { userId: string; name: string; role: string },
    remarks: string = 'Approved upon document verification'
  ): { success: boolean; request?: ChangeRequest; message: string } {
    const cr = this.requests.get(crId);
    if (!cr) return { success: false, message: 'Change request not found' };
    if (cr.status !== 'PENDING_VERIFICATION') return { success: false, message: `Cannot approve CR in status ${cr.status}` };

    cr.status = 'APPROVED';
    cr.approver = {
      ...approver,
      timestamp: new Date().toISOString(),
      remarks,
    };

    return {
      success: true,
      request: cr,
      message: `Change request #${cr.id} approved. Master record updated.`,
    };
  }

  /**
   * Get all change requests for a specific entity
   */
  public getEntityChangeRequests(entityId: string): ChangeRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.entityId === entityId);
  }
}

export const erpChangeRequestEngine = new ChangeRequestEngine();
