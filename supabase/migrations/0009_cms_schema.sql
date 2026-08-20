-- Phase 13: Headless CMS Engine Schema

CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'home', 'about', 'academics'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug VARCHAR(255) REFERENCES cms_pages(slug) ON DELETE CASCADE,
    block_key VARCHAR(255) NOT NULL, -- e.g., 'hero_headline', 'hero_subtext'
    content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'richtext', 'image_url'
    content_value TEXT,
    description TEXT, -- Helps the admin understand what this block is for
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_slug, block_key)
);

-- ==========================================
-- ENABLE RLS & POLICIES
-- ==========================================

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public can view cms_pages" ON public.cms_pages;
CREATE POLICY "Public can view cms_pages" ON cms_pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can view cms_blocks" ON public.cms_blocks;
CREATE POLICY "Public can view cms_blocks" ON cms_blocks FOR SELECT USING (true);

-- Superadmin full access
DROP POLICY IF EXISTS "Superadmins can manage cms_pages" ON public.cms_pages;
CREATE POLICY "Superadmins can manage cms_pages" ON cms_pages FOR ALL USING (is_superadmin());
DROP POLICY IF EXISTS "Superadmins can manage cms_blocks" ON public.cms_blocks;
CREATE POLICY "Superadmins can manage cms_blocks" ON cms_blocks FOR ALL USING (is_superadmin());
