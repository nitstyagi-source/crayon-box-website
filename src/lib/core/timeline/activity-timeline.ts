/**
 * CENTRAL ACTIVITY TIMELINE ENGINE (Section 74)
 * Powers Student, Parent, Faculty, Admissions, Finance, and Incident Timelines.
 */

export interface TimelineEvent {
  id: string;
  campusId?: string;
  entityType: 'STUDENT' | 'PARENT' | 'FACULTY' | 'ADMISSION' | 'FINANCE' | 'TRANSPORT' | 'INCIDENT';
  entityId: string;
  category:
    | 'ADMISSION'
    | 'ENROLLMENT'
    | 'CLASS_CHANGE'
    | 'ATTENDANCE'
    | 'ASSESSMENT'
    | 'EXAM_RESULT'
    | 'FEE_PAYMENT'
    | 'TRANSPORT_EVENT'
    | 'LIBRARY_TRANSACTION'
    | 'INCIDENT'
    | 'PTM'
    | 'DOCUMENT_UPDATE'
    | 'TRANSFER'
    | 'PROMOTION'
    | 'TC'
    | 'COMMUNICATION';
  title: string;
  description: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class ActivityTimelineManager {
  private events: TimelineEvent[] = [];
  private counter = 0;

  public recordEvent(event: Omit<TimelineEvent, 'id' | 'timestamp'>): TimelineEvent {
    const record: TimelineEvent = {
      ...event,
      id: `EVT-${Date.now()}-${String(++this.counter).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
    };
    this.events.unshift(record);
    if (this.events.length > 5000) this.events.pop();
    return record;
  }

  public getEntityTimeline(entityType: string, entityId: string, limit: number = 50): TimelineEvent[] {
    return this.events
      .filter((e) => e.entityType.toUpperCase() === entityType.toUpperCase() && e.entityId === entityId)
      .slice(0, limit);
  }
}

export const erpTimeline = new ActivityTimelineManager();
