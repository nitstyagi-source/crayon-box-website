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

const DEFAULT_MOMENTS: ClassroomMoment[] = [
  {
    id: 'mom-01',
    class_id: 'Class 1-A',
    author_name: 'Pooja Aggarwal (Class Teacher)',
    caption: '🌟 Hands-on Clay Sculpting & Geometric Shapes Discovery during today\'s Montessori Math Foundation hour! Every student built pyramids and cubes.',
    media_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    media_type: 'IMAGE',
    tagged_students: ['Aarav Sharma', 'Reyansh Gupta', 'Myra Kapoor'],
    reactions_count: { heart: 24, clap: 18, celebrate: 12 },
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 3600 * 3).toISOString()
  },
  {
    id: 'mom-02',
    class_id: 'Class 5-A',
    author_name: 'Dr. Sunita Rao (Science Dept)',
    caption: '⚡ Physics Curiosity Lab: Students wired their first operational series and parallel light circuits using solar cells!',
    media_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    media_type: 'IMAGE',
    tagged_students: ['Vihaan Tyagi', 'Ananya Verma', 'Kabir Sethi'],
    reactions_count: { heart: 32, clap: 28, celebrate: 19 },
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 3600 * 6).toISOString()
  },
  {
    id: 'mom-03',
    class_id: 'Class 1-A',
    author_name: 'Suman Lata (Music & Performing Arts)',
    caption: '🎵 Morning Assembly Choir Rehearsal: Preparing our patriotic choir medley for the upcoming Grandparents Day celebration.',
    media_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
    media_type: 'IMAGE',
    tagged_students: ['Aarav Sharma', 'Devika Jain'],
    reactions_count: { heart: 19, clap: 15, celebrate: 8 },
    is_published: true,
    created_at: new Date(Date.now() - 1000 * 3600 * 22).toISOString()
  }
];

export async function getClassroomMomentsAction(classId?: string): Promise<{ success: boolean; moments: ClassroomMoment[]; error?: string }> {
  try {
    if (classId && classId !== 'ALL') {
      return { success: true, moments: DEFAULT_MOMENTS.filter((m) => m.class_id === classId) };
    }
    return { success: true, moments: DEFAULT_MOMENTS };
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
    const newMoment: ClassroomMoment = {
      id: `mom-${Date.now()}`,
      class_id: payload.classId,
      author_name: payload.authorName,
      caption: payload.caption,
      media_url: payload.mediaUrl,
      media_type: payload.mediaType || 'IMAGE',
      tagged_students: payload.taggedStudents || [],
      reactions_count: { heart: 1, clap: 0, celebrate: 0 },
      is_published: true,
      created_at: new Date().toISOString()
    };

    DEFAULT_MOMENTS.unshift(newMoment);

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
  const item = DEFAULT_MOMENTS.find((m) => m.id === momentId);
  if (item) {
    item.reactions_count[reaction] = (item.reactions_count[reaction] || 0) + 1;
    return { success: true, reactions: item.reactions_count };
  }
  return { success: true, reactions: { heart: 1, clap: 1, celebrate: 1 } };
}
