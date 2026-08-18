"use server";
import { revalidateTag, unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// We use a vanilla Supabase client here because we are fetching public CMS data.
// Using the SSR client with cookies() inside unstable_cache() throws dynamic server usage errors.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export async function getPageContent(slug: string) {
  const fetchCachedData = unstable_cache(
    async () => {
      const { data, error } = await supabase
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
    },
    [`cms-${slug}`],
    {
      tags: [`cms-${slug}`],
      revalidate: false // Cache indefinitely until revalidated manually on publish
    }
  );

  const data = await fetchCachedData();
  return { success: true, data };
}

export async function updateContentBlock(slug: string, section: string, key: string, newValue: string) {
  const blockKey = `${section}.${key}`;
  
  const cookieStore = await cookies();
  const authSupabase = createServerClient(supabaseUrl, supabaseKey, {
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
  // To clear all caches, we'd theoretically need a list of all slugs.
  // For now, we will fetch all distinct slugs from the DB and clear them.
  const { data } = await supabase.from('cms_pages').select('slug');
  
  if (data) {
    data.forEach(row => {
      // @ts-ignore
      revalidateTag(`cms-${row.slug}`);
    });
  }
  
  console.log("[CMS] Cleared all caches manually.");
  return { success: true };
}
