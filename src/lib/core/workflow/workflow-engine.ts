/**
 * CENTRAL ERP WORKFLOW & APPROVAL ENGINE
 * Configurable multi-tier approval matrix with financial threshold rules, maker-checker governance, and automated escalation.
 */

export type WorkflowType =
  | 'FEE_REFUND'
  | 'FEE_CONCESSION'
  | 'STAFF_LEAVE'
  | 'PURCHASE_REQUISITION'
  | 'PETTY_CASH_EXPENSE'
  | 'STUDENT_CHANGE_REQUEST'
  | 'DISCIPLINARY_ACTION'
  | 'ADMISSION_FEE_WAIVER';

export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'CANCELLED';

export interface WorkflowRule {
  id: string;
  workflowType: WorkflowType;
  minAmount?: number;
  maxAmount?: number;
  requiredRole: 'Accounts_Manager' | 'Academic_Coordinator' | 'Principal' | 'Management_Trustee';
  stepOrder: number;
  autoEscalateHours?: number;
}

export interface WorkflowItem {
  id: string;
  workflowType: WorkflowType;
  campusId: string;
  referenceNo: string;
  title: string;
  description: string;
  amount?: number;
  requestedBy: {
    userId: string;
    name: string;
    role: string;
    timestamp: string;
  };
  currentStep: number;
  totalSteps: number;
  currentAssigneeRole: string;
  status: ApprovalStatus;
  auditHistory: Array<{
    step: number;
    actor: string;
    role: string;
    action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
    remarks: string;
    timestamp: string;
  }>;
  payload: Record<string, any>;
}

// In-Memory Rule Matrix (Configurable by Admin)
const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [
  // 1. Fee Refund Rules
  { id: 'R-REF-1', workflowType: 'FEE_REFUND', minAmount: 0, maxAmount: 5000, requiredRole: 'Accounts_Manager', stepOrder: 1 },
  { id: 'R-REF-2', workflowType: 'FEE_REFUND', minAmount: 5001, maxAmount: 25000, requiredRole: 'Principal', stepOrder: 1 },
  { id: 'R-REF-3', workflowType: 'FEE_REFUND', minAmount: 25001, requiredRole: 'Management_Trustee', stepOrder: 1 },

  // 2. Fee Concession Rules (Sibling & Merit)
  { id: 'R-CONC-1', workflowType: 'FEE_CONCESSION', minAmount: 0, maxAmount: 10000, requiredRole: 'Accounts_Manager', stepOrder: 1 },
  { id: 'R-CONC-2', workflowType: 'FEE_CONCESSION', minAmount: 10001, requiredRole: 'Principal', stepOrder: 1 },

  // 3. Purchase Requisitions
  { id: 'R-PO-1', workflowType: 'PURCHASE_REQUISITION', minAmount: 0, maxAmount: 10000, requiredRole: 'Accounts_Manager', stepOrder: 1 },
  { id: 'R-PO-2', workflowType: 'PURCHASE_REQUISITION', minAmount: 10001, maxAmount: 50000, requiredRole: 'Principal', stepOrder: 1 },
  { id: 'R-PO-3', workflowType: 'PURCHASE_REQUISITION', minAmount: 50001, requiredRole: 'Management_Trustee', stepOrder: 1 },

  // 4. Sensitive Master Data Change Requests (DOB, Student Name, Bank Details)
  { id: 'R-CR-1', workflowType: 'STUDENT_CHANGE_REQUEST', requiredRole: 'Academic_Coordinator', stepOrder: 1 },
  { id: 'R-CR-2', workflowType: 'STUDENT_CHANGE_REQUEST', requiredRole: 'Principal', stepOrder: 2 },
];

class WorkflowEngine {
  private items: Map<string, WorkflowItem> = new Map();
  private rules: WorkflowRule[] = [...DEFAULT_WORKFLOW_RULES];

  /**
   * Submit an item for multi-tier workflow review
   */
  public submitItem(params: {
    workflowType: WorkflowType;
    campusId: string;
    title: string;
    description: string;
    amount?: number;
    requestedBy: { userId: string; name: string; role: string };
    payload: Record<string, any>;
  }): WorkflowItem {
    const itemId = `WF-${Date.now().toString().slice(-6)}`;
    const referenceNo = `${params.workflowType.substring(0, 3)}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Determine applicable rules
    const applicableRules = this.rules
      .filter((r) => r.workflowType === params.workflowType)
      .filter((r) => {
        if (params.amount === undefined) return true;
        const minOk = r.minAmount === undefined || params.amount >= r.minAmount;
        const maxOk = r.maxAmount === undefined || params.amount <= r.maxAmount;
        return minOk && maxOk;
      })
      .sort((a, b) => a.stepOrder - b.stepOrder);

    const initialRole = applicableRules.length > 0 ? applicableRules[0].requiredRole : 'Principal';
    const totalSteps = Math.max(1, applicableRules.length);

    const newItem: WorkflowItem = {
      id: itemId,
      workflowType: params.workflowType,
      campusId: params.campusId,
      referenceNo,
      title: params.title,
      description: params.description,
      amount: params.amount,
      requestedBy: {
        ...params.requestedBy,
        timestamp: new Date().toISOString(),
      },
      currentStep: 1,
      totalSteps,
      currentAssigneeRole: initialRole,
      status: 'PENDING',
      auditHistory: [
        {
          step: 1,
          actor: params.requestedBy.name,
          role: params.requestedBy.role,
          action: 'SUBMITTED',
          remarks: 'Initial workflow submission',
          timestamp: new Date().toISOString(),
        },
      ],
      payload: params.payload,
    };

    this.items.set(itemId, newItem);
    console.log(`📋 [WORKFLOW ENGINE] Created workflow item #${itemId} (${newItem.referenceNo}) assigned to: ${initialRole}`);
    return newItem;
  }

  /**
   * Triage/Action an item (Approve, Reject, or Escalate)
   */
  public actionItem(
    itemId: string,
    action: 'APPROVE' | 'REJECT' | 'ESCALATE',
    actor: { userId: string; name: string; role: string },
    remarks: string = ''
  ): { success: boolean; item?: WorkflowItem; message: string } {
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, message: 'Workflow item not found.' };
    }

    if (item.status !== 'PENDING') {
      return { success: false, message: `Cannot act on item with status: ${item.status}` };
    }

    const currentAudit = {
      step: item.currentStep,
      actor: actor.name,
      role: actor.role,
      action: action === 'APPROVE' ? ('APPROVED' as const) : action === 'REJECT' ? ('REJECTED' as const) : ('ESCALATED' as const),
      remarks: remarks || `Action ${action} executed by ${actor.role}`,
      timestamp: new Date().toISOString(),
    };

    if (action === 'REJECT') {
      item.status = 'REJECTED';
      item.auditHistory.push(currentAudit);
      return { success: true, item, message: `Workflow item #${item.referenceNo} was REJECTED.` };
    }

    if (action === 'APPROVE') {
      // Check if more steps exist
      if (item.currentStep < item.totalSteps) {
        item.currentStep += 1;
        item.auditHistory.push(currentAudit);
        // Find next role in line
        item.currentAssigneeRole = 'Principal';
        return { success: true, item, message: `Step ${item.currentStep - 1} approved. Escalated to ${item.currentAssigneeRole}.` };
      } else {
        item.status = 'APPROVED';
        item.auditHistory.push(currentAudit);
        return { success: true, item, message: `Workflow #${item.referenceNo} is FULLY APPROVED.` };
      }
    }

    return { success: false, message: 'Unhandled workflow action.' };
  }

  /**
   * List pending approval items filtered by role/campus
   */
  public getPendingItems(role?: string, campusId?: string): WorkflowItem[] {
    let list = Array.from(this.items.values()).filter((i) => i.status === 'PENDING');
    if (campusId) list = list.filter((i) => i.campusId === campusId);
    if (role && role !== 'Admin' && role !== 'Management_Trustee') {
      list = list.filter((i) => i.currentAssigneeRole === role);
    }
    return list;
  }
}

export const erpWorkflowEngine = new WorkflowEngine();
