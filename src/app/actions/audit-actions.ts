"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

function getPool() {
  return new Pool({ connectionString });
}

export interface AuditLogEntry {
  id: string;
  campus_id?: string;
  user_id?: string;
  actor_role: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  changed_fields?: string[];
  ip_address?: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL_FINANCE' | 'SECURITY';
  created_at: string;
}

/**
 * Record a tamper-proof audit log entry
 */
export async function logAuditEventAction(entry: {
  campus_id?: string;
  user_id?: string;
  actor_role?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  changed_fields?: string[];
  ip_address?: string;
  user_agent?: string;
  severity?: 'INFO' | 'WARN' | 'CRITICAL_FINANCE' | 'SECURITY';
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`
      INSERT INTO public.audit_logs (
        campus_id, user_id, actor_role, actor_name, action,
        entity_type, entity_id, old_value, new_value,
        changed_fields, ip_address, user_agent, severity, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id, created_at;
    `, [
      entry.campus_id || null,
      entry.user_id || null,
      entry.actor_role || 'SUPER_ADMIN',
      entry.actor_name || 'System Executive',
      entry.action,
      entry.entity_type,
      entry.entity_id,
      entry.old_value ? JSON.stringify(entry.old_value) : null,
      entry.new_value ? JSON.stringify(entry.new_value) : null,
      entry.changed_fields || [],
      entry.ip_address || '127.0.0.1',
      entry.user_agent || 'Enterprise Web Client',
      entry.severity || 'INFO'
    ]);

    return { success: true, id: res.rows[0].id };
  } catch (error: any) {
    console.error('Failed to write audit log:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Fetch filtered audit logs for compliance review
 */
export async function getAuditLogsAction(params?: {
  entityType?: string;
  severity?: string;
  limit?: number;
}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const limit = params?.limit || 50;
    let query = `
      SELECT id, campus_id, user_id, 
             COALESCE(actor_role, 'SYSTEM') as actor_role,
             COALESCE(actor_name, 'System Agent') as actor_name,
             action, entity_type, entity_id,
             old_value, new_value, changed_fields, ip_address,
             COALESCE(severity, 'INFO') as severity,
             created_at
      FROM public.audit_logs
      WHERE 1=1
    `;
    const values: any[] = [];
    let pIdx = 1;

    if (params?.entityType && params.entityType !== 'ALL') {
      query += ` AND entity_type = $${pIdx++}`;
      values.push(params.entityType);
    }

    if (params?.severity && params.severity !== 'ALL') {
      query += ` AND severity = $${pIdx++}`;
      values.push(params.severity);
    }

    query += ` ORDER BY created_at DESC LIMIT $${pIdx++}`;
    values.push(limit);

    const res = await client.query(query, values);
    return { success: true, logs: res.rows as AuditLogEntry[] };
  } catch (error: any) {
    console.error('Failed to get audit logs:', error);
    return { success: false, logs: [], error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Execute automated overdue late fee fines calculation sweep
 */
export async function triggerOverdueFinesCalculationAction() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const res = await client.query(`SELECT * FROM public.calculate_overdue_fines();`);
    const stats = res.rows[0] || { invoices_checked: 0, fines_applied_count: 0, total_fines_accumulated: 0 };

    // Record this automated finance action in audit logs
    if (Number(stats.fines_applied_count) > 0) {
      await client.query(`
        INSERT INTO public.audit_logs (
          actor_role, actor_name, action, entity_type, entity_id,
          new_value, severity, created_at
        ) VALUES (
          'CRON_FINANCE', 'Automated Fine Engine', 'LATE_FEE_SWEEP', 'INVOICE_BATCH',
          gen_random_uuid()::text, $1, 'CRITICAL_FINANCE', NOW()
        )
      `, [JSON.stringify(stats)]);
    }

    revalidatePath('/admin/finance');
    return { success: true, stats };
  } catch (error: any) {
    console.error('Failed to trigger overdue fine calculation:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
