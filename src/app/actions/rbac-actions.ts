"use server";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getLiveRbacMatrix() {
  try {
    const { data: roles } = await supabase
      .from('roles')
      .select('*')
      .order('hierarchy_level', { ascending: false });

    const { data: permissions } = await supabase
      .from('role_module_permissions')
      .select('*');

    return {
      success: true,
      roles: roles || [],
      permissions: permissions || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      roles: [],
      permissions: [],
    };
  }
}

export async function updateLiveRolePermission(
  roleCode: string,
  moduleCode: string,
  permissionField: string,
  value: boolean
) {
  try {
    const { data: existing } = await supabase
      .from('role_module_permissions')
      .select('id')
      .eq('role_code', roleCode)
      .eq('module_code', moduleCode)
      .single();

    if (existing) {
      await supabase
        .from('role_module_permissions')
        .update({ [permissionField]: value })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('role_module_permissions')
        .insert({
          role_code: roleCode,
          module_code: moduleCode,
          [permissionField]: value,
        });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
