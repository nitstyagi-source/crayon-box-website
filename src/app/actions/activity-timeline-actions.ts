"use server";

import { createClient } from '@/lib/supabase/server';
import { erpTimeline, TimelineEvent } from '@/lib/core/timeline/activity-timeline';

export async function recordTimelineEventAction(payload: Omit<TimelineEvent, 'id' | 'timestamp'>) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('activity_timeline')
      .insert({
        campus_id: payload.campusId || null,
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        actor_name: payload.actorName || 'System Administrator',
        actor_role: payload.actorRole || 'ADMIN',
        metadata: payload.metadata || {},
      })
      .select()
      .single();

    if (error) {
      const inMem = erpTimeline.recordEvent(payload);
      return { success: true, event: inMem };
    }

    return { success: true, event: data };
  } catch (e: any) {
    const inMem = erpTimeline.recordEvent(payload);
    return { success: true, event: inMem };
  }
}

export async function getEntityTimelineAction(entityType: string, entityId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('activity_timeline')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      const inMem = erpTimeline.getEntityTimeline(entityType, entityId);
      return { success: true, events: inMem };
    }

    return { success: true, events: data };
  } catch (e: any) {
    const inMem = erpTimeline.getEntityTimeline(entityType, entityId);
    return { success: true, events: inMem };
  }
}
