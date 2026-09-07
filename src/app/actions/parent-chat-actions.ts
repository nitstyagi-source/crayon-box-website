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

export interface ChatThread {
  id: string;
  student_id: string;
  student_name: string;
  grade_section: string;
  teacher_name: string;
  parent_name: string;
  parent_phone: string;
  quiet_hours_enabled: boolean;
  last_message_text: string;
  last_message_at: string;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_role: 'TEACHER' | 'PARENT';
  sender_name: string;
  content: string;
  translated_content?: string;
  created_at: string;
  is_read: boolean;
}

import pg from 'pg';

let globalPool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
    globalPool = new pg.Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });
  }
  return globalPool;
}

export async function getChatThreadsAction(): Promise<{ success: boolean; threads: ChatThread[]; error?: string }> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        s.id as student_id,
        s.first_name || ' ' || s.last_name as student_name,
        COALESCE(c.grade, 'Class 1') as grade_section,
        COALESCE(s.parent_phone, s.father_mobile, s.emergency_contact, 'Not Provided') as parent_phone,
        COALESCE(s.father_name, 'Parent') as parent_name,
        'Class Teacher' as teacher_name
      FROM public.students s
      LEFT JOIN public.classes c ON c.id = s.class_id
      WHERE s.status = 'ACTIVE'
      ORDER BY s.first_name ASC
      LIMIT 15;
    `);

    const threads: ChatThread[] = await Promise.all(res.rows.map(async (row: any) => {
      const threadId = `thread-${row.student_id}`;
      // Fetch latest message from database
      const msgRes = await client.query(`
        SELECT content, created_at, is_read
        FROM public.parent_chat_messages
        WHERE thread_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
      `, [threadId]);

      const lastMsg = msgRes.rows[0];

      return {
        id: threadId,
        student_id: row.student_id,
        student_name: row.student_name,
        grade_section: row.grade_section,
        teacher_name: row.teacher_name,
        parent_name: `${row.parent_name} (Guardian)`,
        parent_phone: row.parent_phone,
        quiet_hours_enabled: true,
        last_message_text: lastMsg ? lastMsg.content : 'Academic progress discussion initiated.',
        last_message_at: lastMsg ? lastMsg.created_at : new Date().toISOString(),
        unread_count: lastMsg && !lastMsg.is_read ? 1 : 0
      };
    }));

    return { success: true, threads };
  } catch (err: any) {
    return { success: false, threads: [], error: err.message };
  } finally {
    client.release();
  }
}

export async function getThreadMessagesAction(threadId: string): Promise<{ success: boolean; messages: ChatMessage[]; error?: string }> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, thread_id, sender_role, sender_name, content, translated_content, created_at, is_read
      FROM public.parent_chat_messages
      WHERE thread_id = $1
      ORDER BY created_at ASC;
    `, [threadId]);

    let list: ChatMessage[] = res.rows;
    if (list.length === 0) {
      list = [
        {
          id: `msg-welcome-${Date.now()}`,
          thread_id: threadId,
          sender_role: 'TEACHER',
          sender_name: 'Class Teacher',
          content: 'Good day! How can I assist you with your child\'s academic progress today?',
          translated_content: 'नमस्ते! आज आपके बच्चे की शैक्षणिक प्रगति में मैं आपकी क्या सहायता कर सकता हूँ?',
          created_at: new Date().toISOString(),
          is_read: true
        }
      ];
    }
    return { success: true, messages: list };
  } catch (err: any) {
    return { success: false, messages: [], error: err.message };
  } finally {
    client.release();
  }
}

export async function sendChatMessageAction(payload: {
  threadId: string;
  senderRole: 'TEACHER' | 'PARENT';
  senderName: string;
  content: string;
}): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    // Only set translated_content if actual multilingual translation exists
    const res = await client.query(`
      INSERT INTO public.parent_chat_messages (
        thread_id, sender_role, sender_name, content, translated_content, is_read, created_at
      ) VALUES ($1, $2, $3, $4, NULL, false, NOW())
      RETURNING id, thread_id, sender_role, sender_name, content, translated_content, created_at, is_read;
    `, [payload.threadId, payload.senderRole, payload.senderName, payload.content]);

    const newMsg: ChatMessage = res.rows[0];

    try {
      revalidatePath('/admin/communications');
      revalidatePath('/admin/parent-care');
    } catch (_) {}

    return { success: true, message: newMsg };
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

export async function toggleQuietHoursAction(threadId: string, enabled: boolean): Promise<{ success: boolean }> {
  return { success: true };
}
