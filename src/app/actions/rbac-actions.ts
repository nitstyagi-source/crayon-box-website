"use server";

import pg from 'pg';
import { revalidatePath } from 'next/cache';
import { ERP_MODULES_REGISTRY, ErpModuleDefinition } from '@/lib/core/security/erp-modules-registry';

const { Pool } = pg;
const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface DynamicModuleStatus {
  code: string;
  name: string;
  category: string;
  href: string;
  description: string;
  is_enabled: boolean;
  disabled_reason?: string;
  defaultRoles?: string[];
}

/**
 * 1. GET LIVE RBAC MATRIX & MODULE REGISTRY
 * Dynamically reconciles database module statuses with code registry.
 */
export async function getLiveRbacMatrix() {
  const p = getPool();
  const client = await p.connect();

  try {
    // 1. Fetch system roles
    const rolesRes = await client.query(`
      SELECT * FROM public.roles ORDER BY hierarchy_level DESC;
    `);

    // 2. Fetch role module permissions
    const permsRes = await client.query(`
      SELECT * FROM public.role_module_permissions;
    `);

    // 3. Fetch module statuses from DB
    const statusRes = await client.query(`
      SELECT * FROM public.erp_module_statuses ORDER BY category ASC, name ASC;
    `);

    // Build merged dynamic module list
    const dbStatusMap = new Map<string, any>();
    statusRes.rows.forEach((r: any) => dbStatusMap.set(r.code, r));

    const allModules: DynamicModuleStatus[] = [];

    // First, add all canonical registry modules with DB overrides
    for (const reg of ERP_MODULES_REGISTRY) {
      const dbEntry = dbStatusMap.get(reg.code);
      allModules.push({
        code: reg.code,
        name: dbEntry?.name || reg.name,
        category: dbEntry?.category || reg.category,
        href: dbEntry?.href || reg.href,
        description: dbEntry?.description || reg.description,
        is_enabled: dbEntry ? Boolean(dbEntry.is_enabled) : true,
        disabled_reason: dbEntry?.disabled_reason || undefined,
        defaultRoles: reg.defaultRoles
      });
      dbStatusMap.delete(reg.code);
    }

    // Next, add any custom dynamic modules that exist only in DB
    for (const [_, dbEntry] of dbStatusMap) {
      allModules.push({
        code: dbEntry.code,
        name: dbEntry.name,
        category: dbEntry.category,
        href: dbEntry.href,
        description: dbEntry.description,
        is_enabled: Boolean(dbEntry.is_enabled),
        disabled_reason: dbEntry.disabled_reason || undefined,
        defaultRoles: ['SUPER_ADMIN']
      });
    }

    return {
      success: true,
      roles: rolesRes.rows,
      permissions: permsRes.rows,
      modules: allModules
    };
  } catch (error: any) {
    console.error('getLiveRbacMatrix error:', error);
    return {
      success: false,
      error: error.message,
      roles: [],
      permissions: [],
      modules: []
    };
  } finally {
    client.release();
  }
}

/**
 * 2. UPDATE ROLE PERMISSION FIELD (View, Create, Edit, Delete, Export)
 */
export async function updateLiveRolePermission(
  roleCode: string,
  moduleCode: string,
  permissionField: string,
  value: boolean
) {
  const p = getPool();
  const client = await p.connect();

  try {
    const existing = await client.query(`
      SELECT id FROM public.role_module_permissions
      WHERE role_code = $1 AND module_code = $2;
    `, [roleCode, moduleCode]);

    if (existing.rows.length > 0) {
      await client.query(`
        UPDATE public.role_module_permissions
        SET ${permissionField} = $1
        WHERE id = $2;
      `, [value, existing.rows[0].id]);
    } else {
      await client.query(`
        INSERT INTO public.role_module_permissions (role_code, module_code, ${permissionField})
        VALUES ($1, $2, $3);
      `, [roleCode, moduleCode, value]);
    }

    safeRevalidate('/admin/iam');
    return { success: true };
  } catch (error: any) {
    console.error('updateLiveRolePermission error:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * 3. TOGGLE ERP MODULE GLOBAL STATUS (ENABLE / DISABLE)
 */
export async function toggleErpModuleStatusAction(
  moduleCode: string,
  isEnabled: boolean,
  reason?: string
) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(`
      INSERT INTO public.erp_module_statuses (code, name, category, href, description, is_enabled, disabled_reason, updated_at)
      VALUES (
        $1, $1, 'General Operations', '/admin', '', $2, $3, NOW()
      )
      ON CONFLICT (code) DO UPDATE
      SET is_enabled = $2,
          disabled_reason = $3,
          updated_at = NOW();
    `, [moduleCode, isEnabled, isEnabled ? null : (reason || 'Disabled by Super Administrator')]);

    safeRevalidate('/admin/iam');
    safeRevalidate('/admin/dashboard');

    return {
      success: true,
      message: `Module "${moduleCode}" has been globally ${isEnabled ? 'ENABLED' : 'DISABLED'}.`
    };
  } catch (error: any) {
    console.error('toggleErpModuleStatusAction error:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * 4. DYNAMICALLY REGISTER A NEW CUSTOM MODULE
 */
export async function addNewDynamicModuleAction(params: {
  code: string;
  name: string;
  category: string;
  href: string;
  description: string;
}) {
  const p = getPool();
  const client = await p.connect();

  try {
    const cleanCode = params.code.toUpperCase().trim().replace(/[^A-Z0-9_]/g, '_');

    await client.query(`
      INSERT INTO public.erp_module_statuses (code, name, category, href, description, is_enabled)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (code) DO UPDATE
      SET name = $2, category = $3, href = $4, description = $5, is_enabled = true;
    `, [cleanCode, params.name, params.category, params.href, params.description]);

    // Give Super Admin full permissions by default
    await client.query(`
      INSERT INTO public.role_module_permissions (role_code, module_code, can_view, can_create, can_edit, can_delete, can_export)
      VALUES ('SUPER_ADMIN', $1, true, true, true, true, true)
      ON CONFLICT DO NOTHING;
    `, [cleanCode]);

    safeRevalidate('/admin/iam');
    return {
      success: true,
      message: `✓ Custom module "${params.name}" (${cleanCode}) dynamically registered into IAM Matrix!`
    };
  } catch (error: any) {
    console.error('addNewDynamicModuleAction error:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * 5. DELETE DYNAMIC MODULE
 */
export async function deleteDynamicModuleAction(moduleCode: string) {
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query(`
      DELETE FROM public.erp_module_statuses WHERE code = $1;
    `, [moduleCode]);

    await client.query(`
      DELETE FROM public.role_module_permissions WHERE module_code = $1;
    `, [moduleCode]);

    safeRevalidate('/admin/iam');
    return { success: true, message: `Module "${moduleCode}" removed from registry.` };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * 6. GET DISABLED MODULE ROUTES (For dynamic navigation filtering)
 */
export async function getDisabledModuleHrefsAction(): Promise<string[]> {
  const p = getPool();
  const client = await p.connect();

  try {
    const res = await client.query(`
      SELECT href FROM public.erp_module_statuses WHERE is_enabled = false;
    `);
    return res.rows.map((r: any) => r.href);
  } catch (e) {
    return [];
  } finally {
    client.release();
  }
}

