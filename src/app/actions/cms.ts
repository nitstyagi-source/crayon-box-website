"use server";
import { revalidateTag, unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// We use a vanilla Supabase client here because we are fetching public CMS data.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fesqtrunkqlmvyvqodzy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3F0cnVua3FsbXZ5dnFvZHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzM4OTYsImV4cCI6MjEwMjY0OTg5Nn0.orDLjRNcUVXRNuGvJCDZHJdx8BDMvYC-6MvRKuDUm3o';

function getPublicSupabase() {
  try {
    return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.error('[CMS] Failed to initialize public Supabase client:', e);
    return null;
  }
}

export async function getPageContent(slug: string) {
  try {
    const fetchCachedData = unstable_cache(
      async () => {
        try {
          const client = getPublicSupabase();
          if (!client) return {};

          const { data, error } = await client
            .from('cms_blocks')
            .select('block_key, content_value')
            .eq('page_slug', slug);

          if (error || !data) {
            console.error(`[CMS] Error fetching content for ${slug}:`, error);
            return {};
          }

          // Restructure the flat rows into a nested object: { section: { key: value } }
          const formattedData: Record<string, Record<string, string>> = {};
          data.forEach((row) => {
            const parts = row.block_key.split('.');
            if (parts.length === 2) {
              const [section, key] = parts;
              if (!formattedData[section]) formattedData[section] = {};
              formattedData[section][key] = row.content_value;
            }
          });

          return formattedData;
        } catch (innerErr) {
          console.error(`[CMS] Inner fetch error for ${slug}:`, innerErr);
          return {};
        }
      },
      [`cms-${slug}`],
      {
        tags: [`cms-${slug}`],
        revalidate: false // Cache indefinitely until revalidated manually on publish
      }
    );

    const data = await fetchCachedData();
    return { success: true, data: data || {} };
  } catch (err) {
    console.error(`[CMS] Top-level getPageContent error for ${slug}:`, err);
    return { success: false, data: {} };
  }
}

export async function updateContentBlock(slug: string, section: string, key: string, newValue: string) {
  const blockKey = `${section}.${key}`;
  
  const cookieStore = await cookies();
  const authSupabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch (error) {}
      },
    },
  });

  const { error } = await authSupabase
    .from('cms_blocks')
    .upsert(
      { 
        page_slug: slug, 
        block_key: blockKey, 
        content_value: newValue 
      },
      { onConflict: 'page_slug, block_key' }
    );

  if (error) {
    console.error(`[CMS] Error updating ${slug}.${blockKey}:`, error);
    return { success: false, error };
  }

  console.log(`[CMS] Updated ${slug}.${blockKey} to "${newValue}"`);

  // @ts-ignore
  revalidateTag(`cms-${slug}`);

  return { success: true };
}

export async function clearAllCaches() {
  const client = getPublicSupabase();
  if (!client) return { success: false };

  const { data } = await client.from('cms_pages').select('slug');
  
  if (data) {
    data.forEach(row => {
      // @ts-ignore
      revalidateTag(`cms-${row.slug}`);
    });
  }
  
  console.log("[CMS] Cleared all caches manually.");
  return { success: true };
}
