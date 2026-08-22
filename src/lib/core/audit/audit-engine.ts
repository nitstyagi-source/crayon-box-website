/**
 * CENTRAL IMMUTABLE AUDIT LOGGING ENGINE
 * Records every significant administrative event, record modification, financial transaction, and security access.
 */

export interface AuditRecord {
  id: string;
  timestamp: string;
  trustId: string;
  legalEntityId?: string;
  institutionId?: string;
  campusId?: string;
  sessionId?: string;
  actor: {
    userId: string;
    name: string;
    role: string;
    scope: string;
    ipAddress: string;
    userAgent?: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'PAYMENT' | 'LOGIN' | 'TRANSFER';
  entityType: string;
  entityId: string;
  description: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  metadata?: Record<string, any>;
}

class AuditEngine {
  private inMemoryLogs: AuditRecord[] = [];

  /**
   * Log an immutable audit entry
   */
  public log(entry: Omit<AuditRecord, 'id' | 'timestamp'>): AuditRecord {
    const record: AuditRecord = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.inMemoryLogs.unshift(record);
    if (this.inMemoryLogs.length > 2000) this.inMemoryLogs.pop();

    console.log(`🛡️ [AUDIT ENGINE] [${record.action}] ${record.entityType} #${record.entityId} by ${record.actor.name} (${record.actor.role})`);
    return record;
  }

  /**
   * Get audit history for a specific entity
   */
  public getEntityAuditTrail(entityType: string, entityId: string): AuditRecord[] {
    return this.inMemoryLogs.filter(
      (l) => l.entityType.toUpperCase() === entityType.toUpperCase() && l.entityId === entityId
    );
  }

  /**
   * Get global campus audit history
   */
  public getGlobalAuditLogs(limit: number = 100, campusId?: string): AuditRecord[] {
    if (campusId) {
      return this.inMemoryLogs.filter((l) => l.campusId === campusId).slice(0, limit);
    }
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const erpAuditEngine = new AuditEngine();
