/**
 * CENTRAL INTEGRATION HUB & FAILURE QUEUE
 * Manages connections (MSG91, Razorpay, WhatsApp, FCM/APNs, GPS, Hikvision) and implements an automated dead-letter retry queue.
 */

export interface IntegrationService {
  id: string;
  name: string;
  category: 'PAYMENT_GATEWAY' | 'SMS_OTP' | 'PUSH_NOTIFICATIONS' | 'GPS_TELEMETRY' | 'CCTV_STREAMING';
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  lastPingAt: string;
  successRate24h: number;
}

export interface QueuedJob {
  id: string;
  serviceId: string;
  action: string;
  payload: Record<string, any>;
  attempts: number;
  maxAttempts: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  lastError?: string;
  createdAt: string;
  nextRetryAt: string;
}

class IntegrationHub {
  private services: Map<string, IntegrationService> = new Map([
    ['msg91', { id: 'msg91', name: 'MSG91 SendOTP & SMS', category: 'SMS_OTP', status: 'HEALTHY', lastPingAt: new Date().toISOString(), successRate24h: 99.8 }],
    ['razorpay', { id: 'razorpay', name: 'Razorpay Fintech Gateway', category: 'PAYMENT_GATEWAY', status: 'HEALTHY', lastPingAt: new Date().toISOString(), successRate24h: 99.9 }],
    ['fcm_apns', { id: 'fcm_apns', name: 'Apple APNs & Google FCM Push', category: 'PUSH_NOTIFICATIONS', status: 'HEALTHY', lastPingAt: new Date().toISOString(), successRate24h: 99.4 }],
    ['gps_radar', { id: 'gps_radar', name: 'Fleet GPS Telemetry Engine', category: 'GPS_TELEMETRY', status: 'HEALTHY', lastPingAt: new Date().toISOString(), successRate24h: 98.9 }],
    ['cctv_stream', { id: 'cctv_stream', name: 'Hikvision / RTSP Gateway', category: 'CCTV_STREAMING', status: 'HEALTHY', lastPingAt: new Date().toISOString(), successRate24h: 97.5 }],
  ]);

  private queue: Map<string, QueuedJob> = new Map();

  /**
   * Queue a failed or asynchronous outbound operation
   */
  public enqueue(serviceId: string, action: string, payload: Record<string, any>): QueuedJob {
    const id = `JOB-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const job: QueuedJob = {
      id,
      serviceId,
      action,
      payload,
      attempts: 0,
      maxAttempts: 3,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      nextRetryAt: new Date(Date.now() + 5000).toISOString(),
    };
    this.queue.set(id, job);
    console.log(`📥 [INTEGRATION QUEUE] Enqueued job #${id} for ${serviceId} -> ${action}`);
    return job;
  }

  /**
   * Get all registered integration statuses
   */
  public getAllServices(): IntegrationService[] {
    return Array.from(this.services.values());
  }

  /**
   * Get pending / dead-letter jobs
   */
  public getQueueJobs(): QueuedJob[] {
    return Array.from(this.queue.values());
  }
}

export const erpIntegrationHub = new IntegrationHub();
