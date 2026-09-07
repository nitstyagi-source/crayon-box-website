"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3Mzg5NiwiZXhwIjoyMTAyNjQ5ODk2fQ.unmRv2BZ5kb6VarZ4K44ja3HavDajRDsdaQ-g_B2o08';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export interface ClassroomMoment {
  id: string;
  class_id: string;
  author_name: string;
  caption: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO';
  tagged_students: string[];
  reactions_count: {
    heart: number;
    clap: number;
    celebrate: number;
  };
  is_published: boolean;
  created_at: string;
}

export async function getClassroomMomentsAction(classId?: string): Promise<{ success: boolean; moments: ClassroomMoment[]; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('classroom_moments')
      .select('*')
      .order('created_at', { ascending: false });

    if (classId && classId !== 'ALL') {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching classroom moments:", error);
      return { success: false, moments: [], error: error.message };
    }

    const moments: ClassroomMoment[] = (data || []).map((row: any) => ({
      id: row.id,
      class_id: row.class_id || '',
      author_name: row.author_name || 'Teacher',
      caption: row.caption || '',
      media_url: row.media_url || '',
      media_type: (row.media_type as 'IMAGE' | 'VIDEO') || 'IMAGE',
      tagged_students: Array.isArray(row.tagged_students) ? row.tagged_students : [],
      reactions_count: row.reactions_count && typeof row.reactions_count === 'object' 
        ? row.reactions_count 
        : { heart: 0, clap: 0, celebrate: 0 },
      is_published: row.is_published ?? true,
      created_at: row.created_at || new Date().toISOString()
    }));

    return { success: true, moments };
  } catch (err: any) {
    return { success: false, moments: [], error: err.message };
  }
}

export async function postClassroomMomentAction(payload: {
  classId: string;
  authorName: string;
  caption: string;
  mediaUrl: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  taggedStudents?: string[];
}): Promise<{ success: boolean; moment?: ClassroomMoment; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const insertPayload = {
      class_id: payload.classId,
      author_name: payload.authorName,
      caption: payload.caption,
      media_url: payload.mediaUrl,
      media_type: payload.mediaType || 'IMAGE',
      tagged_students: payload.taggedStudents || [],
      reactions_count: { heart: 0, clap: 0, celebrate: 0 },
      is_published: true
    };

    const { data, error } = await supabase
      .from('classroom_moments')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Error inserting classroom moment:", error);
      return { success: false, error: error.message };
    }

    const newMoment: ClassroomMoment = {
      id: data.id,
      class_id: data.class_id,
      author_name: data.author_name,
      caption: data.caption,
      media_url: data.media_url,
      media_type: data.media_type,
      tagged_students: Array.isArray(data.tagged_students) ? data.tagged_students : [],
      reactions_count: data.reactions_count || { heart: 0, clap: 0, celebrate: 0 },
      is_published: data.is_published,
      created_at: data.created_at
    };

    try {
      revalidatePath('/admin/parent-care');
    } catch (_) {}

    return { success: true, moment: newMoment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reactToMomentAction(
  momentId: string,
  reaction: 'heart' | 'clap' | 'celebrate'
): Promise<{ success: boolean; reactions: { heart: number; clap: number; celebrate: number } }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: current, error: fetchError } = await supabase
      .from('classroom_moments')
      .select('reactions_count')
      .eq('id', momentId)
      .maybeSingle();

    if (fetchError || !current) {
      return { success: false, reactions: { heart: 0, clap: 0, celebrate: 0 } };
    }

    const currentReactions = current.reactions_count || { heart: 0, clap: 0, celebrate: 0 };
    const updated = {
      ...currentReactions,
      [reaction]: (Number(currentReactions[reaction]) || 0) + 1
    };

    await supabase
      .from('classroom_moments')
      .update({ reactions_count: updated })
      .eq('id', momentId);

    return { success: true, reactions: updated };
  } catch (err: any) {
    return { success: false, reactions: { heart: 0, clap: 0, celebrate: 0 } };
  }
}
