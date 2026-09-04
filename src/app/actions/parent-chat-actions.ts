"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
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

const DEFAULT_THREADS: ChatThread[] = [
  {
    id: 'thread-01',
    student_id: 'stu-01',
    student_name: 'Aarav Sharma',
    grade_section: 'Class 5-A',
    teacher_name: 'Dr. Sunita Rao (Class Teacher)',
    parent_name: 'Rajesh Sharma (Father)',
    parent_phone: '+91 98112 34567',
    quiet_hours_enabled: true,
    last_message_text: 'Thank you maam, Aarav will submit the Science fair model tomorrow morning.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    unread_count: 1
  },
  {
    id: 'thread-02',
    student_id: 'stu-02',
    student_name: 'Ananya Verma',
    grade_section: 'Class 3-B',
    teacher_name: 'Pooja Aggarwal (Class Teacher)',
    parent_name: 'Vikram Verma (Father)',
    parent_phone: '+91 98112 99887',
    quiet_hours_enabled: true,
    last_message_text: 'Please note that Ananya has a mild cold and will not participate in swimming today.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    unread_count: 0
  },
  {
    id: 'thread-03',
    student_id: 'stu-03',
    student_name: 'Vihaan Tyagi',
    grade_section: 'Class 8-A',
    teacher_name: 'Manish Tyagi (Math Faculty)',
    parent_name: 'Nitin Tyagi (Father)',
    parent_phone: '+91 99990 12345',
    quiet_hours_enabled: true,
    last_message_text: 'Sir, could you share the reference worksheet for quadratic equations?',
    last_message_at: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
    unread_count: 0
  }
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'thread-01': [
    {
      id: 'msg-1',
      thread_id: 'thread-01',
      sender_role: 'TEACHER',
      sender_name: 'Dr. Sunita Rao',
      content: 'Dear Mr. Sharma, Aarav did exceptionally well in today\'s robotics lab demonstration.',
      translated_content: 'प्रिय श्री शर्मा, आरव ने आज की रोबोटिक्स लैब प्रदर्शन में असाधारण प्रदर्शन किया।',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      is_read: true
    },
    {
      id: 'msg-2',
      thread_id: 'thread-01',
      sender_role: 'PARENT',
      sender_name: 'Rajesh Sharma',
      content: 'Thank you ma\'am, Aarav will submit the Science fair model tomorrow morning.',
      translated_content: 'धन्यवाद मैम, आरव कल सुबह विज्ञान मेले का मॉडल जमा करेगा।',
      created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      is_read: true
    }
  ]
};

export async function getChatThreadsAction(): Promise<{ success: boolean; threads: ChatThread[]; error?: string }> {
  try {
    return { success: true, threads: DEFAULT_THREADS };
  } catch (err: any) {
    return { success: false, threads: [], error: err.message };
  }
}

export async function getThreadMessagesAction(threadId: string): Promise<{ success: boolean; messages: ChatMessage[]; error?: string }> {
  try {
    const list = INITIAL_MESSAGES[threadId] || [
      {
        id: `msg-auto-${Date.now()}`,
        thread_id: threadId,
        sender_role: 'TEACHER',
        sender_name: 'Class Teacher',
        content: 'Good day! How can I assist you with your child\'s academic progress today?',
        translated_content: 'नमस्ते! आज आपके बच्चे की शैक्षणिक प्रगति में मैं आपकी क्या सहायता कर सकता हूँ?',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        is_read: true
      }
    ];
    return { success: true, messages: list };
  } catch (err: any) {
    return { success: false, messages: [], error: err.message };
  }
}

export async function sendChatMessageAction(payload: {
  threadId: string;
  senderRole: 'TEACHER' | 'PARENT';
  senderName: string;
  content: string;
}): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  try {
    // Basic bilingual translation helper
    const isEnglish = /^[a-zA-Z0-9\s.,!?'"()-]+$/.test(payload.content);
    const mockTranslation = isEnglish
      ? `[अनुवादित]: ${payload.content}`
      : `[Translated]: ${payload.content}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      thread_id: payload.threadId,
      sender_role: payload.senderRole,
      sender_name: payload.senderName,
      content: payload.content,
      translated_content: mockTranslation,
      created_at: new Date().toISOString(),
      is_read: false
    };

    if (!INITIAL_MESSAGES[payload.threadId]) {
      INITIAL_MESSAGES[payload.threadId] = [];
    }
    INITIAL_MESSAGES[payload.threadId].push(newMsg);

    try {
      revalidatePath('/admin/communications');
    } catch (_) {}

    return { success: true, message: newMsg };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleQuietHoursAction(threadId: string, enabled: boolean): Promise<{ success: boolean }> {
  return { success: true };
}
