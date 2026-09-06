"use server";

import { createClient } from '@/lib/supabase/server';
import { erpTasks, CentralTask } from '@/lib/core/tasks/central-tasks';
import { revalidatePath } from 'next/cache';

export async function createCentralTaskAction(payload: Omit<CentralTask, 'id' | 'createdAt'>) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('central_tasks')
      .insert({
        campus_id: payload.campusId || null,
        task_type: payload.taskType,
        related_module: payload.relatedModule,
        related_record_id: payload.relatedRecordId || null,
        assigned_user_id: payload.assignedUserId || null,
        assigned_user_name: payload.assignedUserName || 'Administrator',
        title: payload.title,
        description: payload.description || '',
        due_date: payload.dueDate,
        priority: payload.priority || 'MEDIUM',
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      const inMem = erpTasks.createTask(payload);
      return { success: true, task: inMem };
    }

    revalidatePath('/admin/dashboard');
    return { success: true, task: data };
  } catch (e: any) {
    const inMem = erpTasks.createTask(payload);
    return { success: true, task: inMem };
  }
}

export async function getCentralTasksAction(filter?: { campusId?: string; status?: string }) {
  try {
    const supabase = await createClient();

    let query = supabase.from('central_tasks').select('*').order('due_date', { ascending: true });
    if (filter?.status && filter.status !== 'ALL') {
      query = query.eq('status', filter.status);
    }
    if (filter?.campusId) {
      query = query.eq('campus_id', filter.campusId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const inMem = erpTasks.getTasks(filter);
      return { success: true, tasks: inMem };
    }

    return { success: true, tasks: data };
  } catch (e: any) {
    const inMem = erpTasks.getTasks(filter);
    return { success: true, tasks: inMem };
  }
}

export async function updateCentralTaskStatusAction(taskId: string, status: CentralTask['status']) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('central_tasks')
      .update({
        status,
        completed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      erpTasks.updateStatus(taskId, status);
      return { success: true, message: 'Updated in memory' };
    }

    revalidatePath('/admin/dashboard');
    return { success: true, task: data };
  } catch (e: any) {
    erpTasks.updateStatus(taskId, status);
    return { success: true, message: 'Updated in memory' };
  }
}
