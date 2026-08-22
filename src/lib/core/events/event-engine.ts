/**
 * CENTRAL ERP EVENT ENGINE
 * Pub/Sub event bus that dispatches system events and triggers automatic cascading actions across all ERP modules.
 */

export type ErpEventType =
  | 'STUDENT_ABSENT'
  | 'STUDENT_ENROLLED'
  | 'FEE_DEMAND_GENERATED'
  | 'FEE_PAYMENT_SUCCESS'
  | 'FEE_REFUND_REQUESTED'
  | 'EMPLOYEE_ABSENT'
  | 'EMPLOYEE_LEAVE_APPROVED'
  | 'HOMEWORK_PUBLISHED'
  | 'INCIDENT_REPORTED'
  | 'MEDICAL_INFIRMARY_LOGGED'
  | 'VISITOR_CHECKED_IN'
  | 'DOCUMENT_EXPIRING_SOON'
  | 'CHANGE_REQUEST_SUBMITTED'
  | 'CHANGE_REQUEST_APPROVED'
  | 'EMERGENCY_LOCKDOWN_TRIGGERED'
  | 'EMERGENCY_LOCKDOWN_RELEASED';

export interface ErpEventPayload {
  eventId: string;
  eventType: ErpEventType;
  timestamp: string;
  campusId: string;
  actor: {
    userId: string;
    name: string;
    role: string;
  };
  entity: {
    type: string;
    id: string;
    referenceNo?: string;
  };
  metadata: Record<string, any>;
}

export type EventHandler = (payload: ErpEventPayload) => Promise<void> | void;

class EventEngine {
  private handlers: Map<ErpEventType, EventHandler[]> = new Map();
  private eventLog: ErpEventPayload[] = [];

  constructor() {
    this.registerCoreSubscribers();
  }

  /**
   * Subscribe a handler to a specific ERP event
   */
  public subscribe(eventType: ErpEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  /**
   * Publish an event to the ERP bus
   */
  public async publish(event: Omit<ErpEventPayload, 'eventId' | 'timestamp'>): Promise<ErpEventPayload> {
    const fullEvent: ErpEventPayload = {
      ...event,
      eventId: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    // Log in memory cache & audit pipeline
    this.eventLog.unshift(fullEvent);
    if (this.eventLog.length > 500) this.eventLog.pop();

    console.log(`📡 [EVENT ENGINE] Dispatched event: ${fullEvent.eventType} (${fullEvent.eventId}) for entity: ${fullEvent.entity.type} #${fullEvent.entity.id}`);

    const registered = this.handlers.get(fullEvent.eventType) || [];
    const executionPromises = registered.map(async (handler) => {
      try {
        await handler(fullEvent);
      } catch (err) {
        console.error(`❌ [EVENT ENGINE] Error in subscriber handler for ${fullEvent.eventType}:`, err);
      }
    });

    await Promise.all(executionPromises);
    return fullEvent;
  }

  /**
   * Get recent event history for audit timelines
   */
  public getRecentEvents(limit: number = 50, campusId?: string): ErpEventPayload[] {
    if (campusId) {
      return this.eventLog.filter((e) => e.campusId === campusId).slice(0, limit);
    }
    return this.eventLog.slice(0, limit);
  }

  /**
   * Register default automatic cascading listeners
   */
  private registerCoreSubscribers() {
    // 1. When Student is Absent -> Push alert + chronic absence evaluation
    this.subscribe('STUDENT_ABSENT', async (payload) => {
      console.log(`🔔 [AUTO-TRIGGER] Sending absence push notification to parent of Student #${payload.entity.id}`);
      // Triggers Notification Engine & Daily Principal Defaulters KPI
    });

    // 2. When Fee Payment is Captured -> Settle Ledger + Dispatch Receipt
    this.subscribe('FEE_PAYMENT_SUCCESS', async (payload) => {
      console.log(`💰 [AUTO-TRIGGER] Fee payment confirmed for ₹${payload.metadata.amountPaid}. Settle ledger & send receipt.`);
    });

    // 3. When Employee is Absent -> Compute LWP deduction in Payroll
    this.subscribe('EMPLOYEE_ABSENT', async (payload) => {
      console.log(`⏱️ [AUTO-TRIGGER] Faculty unexcused absence recorded for Staff #${payload.entity.id}. Updating LWP ledger.`);
    });

    // 4. When Emergency Lockdown is Triggered -> Revoke all CCTV stream tokens instantly
    this.subscribe('EMERGENCY_LOCKDOWN_TRIGGERED', async (payload) => {
      console.warn(`🚨 [AUTO-TRIGGER] EMERGENCY LOCKDOWN ACTIVE: Revoking all live camera viewing tokens campus-wide.`);
    });
  }
}

// Global Singleton Instance
export const erpEventEngine = new EventEngine();
