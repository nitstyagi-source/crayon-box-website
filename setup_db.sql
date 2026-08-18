
-- ==========================================
-- SCHEMA: CMS TABLES
-- ==========================================
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug VARCHAR(255) REFERENCES cms_pages(slug) ON DELETE CASCADE,
    block_key VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    content_value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_slug, block_key)
);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view cms_pages" ON cms_pages;
CREATE POLICY "Public can view cms_pages" ON cms_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view cms_blocks" ON cms_blocks;
CREATE POLICY "Public can view cms_blocks" ON cms_blocks FOR SELECT USING (true);

-- Allow anyone to update blocks for the prototype (since we don't have auth fully wired yet)
DROP POLICY IF EXISTS "Allow updates to cms_blocks" ON cms_blocks;
CREATE POLICY "Allow updates to cms_blocks" ON cms_blocks FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- SEED DATA: CMS PAGES
-- ==========================================
INSERT INTO cms_pages (slug, title) VALUES ('global', 'Global') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('global_theme', 'Global_theme') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('home', 'Home') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('about', 'About') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('academics', 'Academics') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('contact', 'Contact') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('faculty', 'Faculty') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('campus-life', 'Campus-life') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('news', 'News') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('admissions', 'Admissions') ON CONFLICT (slug) DO NOTHING;
INSERT INTO cms_pages (slug, title) VALUES ('alumni', 'Alumni') ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- SEED DATA: CMS BLOCKS
-- ==========================================
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'brand.logo_primary_url', '/logo-uploaded.png') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'brand.logo_inverse_url', '/logo-uploaded.png') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'brand.primary_brand_color', '#0F172A') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'contact.phone', '+91 9811102008') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'contact.email', 'admissions@crayonbox.edu') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'contact.address', 'Kh. No. 6/20, D-Block, Shastri Park Extension, Phool Bagh Road, Nathupura, Burari, New Delhi - 110084') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'footer.description', 'A modern, holistic learning ecosystem designed to help your child thrive in a rapidly evolving world. Inspiring Excellence, Nurturing Tomorrow.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global', 'footer.visitor_notice', 'All campus visits must be pre-registered via our Smart Visitor Kiosk.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'primary_color.0', '#') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'primary_color.1', '1') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'primary_color.2', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'primary_color.3', '3') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'primary_color.4', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'primary_color.5', '8') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'primary_color.6', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'secondary_color.0', '#') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'secondary_color.1', '0') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'secondary_color.2', '5') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'secondary_color.3', '9') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'secondary_color.4', '6') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'secondary_color.5', '6') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'secondary_color.6', '9') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'accent_color.0', '#') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'accent_color.1', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'accent_color.2', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'accent_color.3', '5') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'accent_color.4', '8') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'accent_color.5', '0') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'accent_color.6', 'c') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.0', 'P') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.1', 'l') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.2', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.3', 'y') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.4', 'f') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.5', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.6', 'i') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.7', 'r') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.8', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.9', 'D') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.10', 'i') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.11', 's') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.12', 'p') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.13', 'l') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.14', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_heading.15', 'y') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_body.0', 'I') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_body.1', 'n') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_body.2', 't') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_body.3', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'font_family_body.4', 'r') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_active.0', 't') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_active.1', 'r') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_active.2', 'u') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_active.3', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.0', 'A') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.1', 'd') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.2', 'm') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.3', 'i') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.4', 's') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.5', 's') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.6', 'i') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.7', 'o') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.8', 'n') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.9', 's') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.10', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.11', 'f') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.12', 'o') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.13', 'r') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.14', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.15', 't') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.16', 'h') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.17', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.18', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.19', '2') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.20', '0') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.21', '2') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.22', '6') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.23', '-') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.24', '2') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.25', '0') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.26', '2') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.27', '7') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.28', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.29', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.30', 'c') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.31', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.32', 'd') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.33', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.34', 'm') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.35', 'i') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.36', 'c') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.37', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.38', 'y') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.39', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.40', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.41', 'r') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.42', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.43', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.44', 'r') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.45', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.46', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.47', 'n') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.48', 'o') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.49', 'w') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.50', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.51', 'o') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.52', 'p') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.53', 'e') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.54', 'n') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.55', '.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.56', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.57', 'A') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.58', 'p') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.59', 'p') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.60', 'l') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.61', 'y') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.62', ' ') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.63', 't') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.64', 'o') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.65', 'd') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.66', 'a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.67', 'y') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('global_theme', 'announcement_banner_text.68', '!') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'hero.headline', 'Inspiring Excellence.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'hero.subtext', 'Nurturing Tomorrow.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'hero.description', 'Welcome to Crayon Box School—a modern, holistic learning ecosystem designed to help your child thrive in a rapidly evolving world.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'hero.image_url', 'https://crayonboxpreschool.in/wp-content/uploads/2020/07/84346916_177865773623747_828072988908716032_n.jpg') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'growth_announcement.title', 'Growing Alongside Your Child.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'growth_announcement.description', 'Crayon Box School is currently a premier Kindergarten through Grade 8 (K-8) institution, providing a foundational environment where young minds feel secure, challenged, and deeply understood.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'growth_announcement.vision_quote', '“We are expanding our horizons. Crayon Box School is actively upgrading our infrastructure, faculty, and curriculum to become a comprehensive K-12 institution in the near future. Students joining us today will have the seamless opportunity to complete their entire high school journey within the campus they know and love.”') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'why_us.heading', 'Why Choose Us') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'why_us.feature_1_title', 'Future-Ready Academics') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'why_us.feature_1_desc', 'A dynamic curriculum blending traditional rigor with AI-integrated tools, coding, and critical thinking.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'why_us.feature_2_title', 'Safe & Smart Campus') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'why_us.feature_2_desc', 'Equipped with real-time digital visitor logs, automated gate security, and comprehensive CCTV monitoring for absolute peace of mind.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'why_us.feature_3_title', '360° Parent Transparency') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'why_us.feature_3_desc', 'Stay connected with our live transport tracking, digital daily diaries, and seamless in-app fee management.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'admissions_cta.headline', 'Begin Your Child''s Journey With Us.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'admissions_cta.description', 'Admissions for the upcoming academic year are now open. Experience our paperless, hassle-free digital enrollment process.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'admissions_cta.button_text', 'Start Application') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'testimonials.heading', 'What Our Parents Say') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'testimonials.t1_quote', '"The teaching quality is outstanding, but what really impressed us is the absolute safety of the campus. The live bus tracking feature on the school app gives us incredible peace of mind every single day."') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'testimonials.t1_author', 'Priya Sharma') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'testimonials.t1_role', 'Parent of Grade 4 Student') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'testimonials.t2_quote', '"Moving from paper forms to their digital enrollment and fee payment was seamless. Crayon Box truly operates like a modern, transparent institution that values parent time as much as student education."') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'testimonials.t2_author', 'David & Emma Wilson') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('home', 'testimonials.t2_role', 'Parents of Grade 7 Student') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'hero.headline', 'Shaping Minds.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'hero.subtext', 'Coloring the Future.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'hero.description', 'More than a school—a canvas where every student discovers their unique potential.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'hero.image_url', 'https://crayonboxpreschool.in/wp-content/uploads/2021/02/Group-3-Copy-6.jpg') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'philosophy.heading', 'Why "Crayon Box"?') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'philosophy.quote', '“A crayon box holds an array of distinct colors, each unique, yet together capable of creating masterpieces. At Crayon Box School, we view our students through this exact lens. We don''t believe in a one-size-fits-all education. Whether a child is an analytical thinker, a creative artist, or a natural athlete, our ecosystem is designed to nurture their individual brilliance and equip them for a dynamic world.”') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'vision_mission.vision_headline', 'Our Vision') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'vision_mission.vision_description', 'To be a globally recognized institution that blends technological innovation with deep-rooted human values, empowering students to lead with empathy and intellect.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'vision_mission.vision_bg_color', '#1e3a8a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'vision_mission.mission_headline', 'Our Mission') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'vision_mission.mission_description', 'To provide a secure, inclusive, and challenging K-12 environment where modern pedagogy, robust infrastructure, and dedicated mentorship converge to build the leaders of tomorrow.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'vision_mission.mission_bg_color', '#ffffff') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.headline', 'A Message from the Director') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.p1', 'Welcome to Crayon Box School.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.p2', 'Education is not merely about imparting knowledge; it is about discovering the unique potential within every child. When we envisioned Crayon Box School, our goal was to create a vibrant, dynamic ecosystem—much like a box of crayons—where diverse talents, thoughts, and abilities are nurtured to create something truly extraordinary.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.p3', 'Currently, as a premier K-8 institution, we take immense pride in laying a robust foundation for our students during their most formative years. We have cultivated an environment that balances academic rigor with socio-emotional well-being, ensuring our primary and middle schoolers feel secure, challenged, and deeply understood. Through our integration of modern technology, experiential learning, and dedicated mentorship, we ensure every child is equipped with the critical thinking skills needed for a rapidly evolving world.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.p4', 'But our journey, much like your child’s, continues to grow. I am thrilled to share our active vision of expanding into a comprehensive K-12 institution. We are currently scaling our infrastructure, developing advanced scientific and digital laboratories, and broadening our exceptional faculty to accommodate senior secondary education. This strategic evolution ensures that the students who join our family today will enjoy a seamless, uninterrupted transition through high school, right here in the environment they trust.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.p5', 'We consider it a profound privilege to partner with parents in this educational journey. Together, let us continue to shape resilient, compassionate minds and color the future with purpose and brilliance.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.author_name', 'Nitin Tyagi') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.author_role', 'Director, Crayon Box School') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'director.image_url', 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1974&auto=format&fit=crop') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.headline', 'Our Journey & The Road to K-12') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.description', 'A legacy of excellence, rooted in primary education, expanding to shape the leaders of tomorrow.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.past_title', 'The Foundation') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.past_desc', 'Crayon Box School opens its doors with a mission to redefine early and primary education, establishing a reputation for safety, care, and foundational excellence.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.present_title', 'Mastering Middle School') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.present_desc', 'Currently operating as a premier K-8 institution. We have integrated smart classrooms, AI-driven learning tools, and comprehensive sports facilities to nurture pre-teens during their most crucial developmental years.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.future_title', 'K-12 Campus Expansion') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'journey.future_desc', 'Actively upgrading our infrastructure, advanced science laboratories, and senior faculty recruitment. Students joining us today will have the distinct advantage of seamlessly transitioning into high school within the ecosystem they trust.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.headline', 'How We Teach') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p1_title', 'Experiential Learning') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p1_desc', 'Moving beyond textbooks with hands-on labs, robotics, and project-based assessments.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p2_title', 'Tech-Enabled Campus') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p2_desc', 'From our Parent App to Smart Boards, we use technology to enhance transparency and learning, not replace human connection.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p3_title', 'Holistic Well-being') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p3_desc', 'Dedicated focus on socio-emotional health, physical fitness, and the arts.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p4_title', 'Exceptional Faculty') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'pillars.p4_desc', 'Rigorously selected educators who undergo continuous professional development to stay ahead of global teaching standards.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'cta.headline', 'Come See the Difference Yourself.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'cta.description', 'Words can only say so much. We invite you to walk our corridors, meet our faculty, and experience the energy of Crayon Box School.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'cta.button_1_text', 'Book a Campus Tour') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'cta.button_2_text', 'Begin Admissions Process') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('about', 'cta.image_url', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('academics', 'hero.headline', 'A Curriculum Designed for the Future.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('academics', 'hero.description', 'We don''t just teach students what to think; we teach them how to think. Blending academic rigor with critical thinking and creativity to prepare your child for a dynamic world.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('academics', 'hero.image_url', 'https://crayonboxpreschool.in/wp-content/uploads/2020/07/day_care_img_16.png') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('contact', 'hero.headline', 'Let’s Start a') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('contact', 'hero.subtext', 'Conversation.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('contact', 'hero.description', 'Whether you are exploring admissions for your child or need assistance from our administrative team, we are here to help.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('contact', 'hero.image_url', 'https://crayonboxpreschool.in/wp-content/uploads/2020/07/Virtual-tour.png') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('faculty', 'hero.headline', 'The Mentors Behind the') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('faculty', 'hero.subtext', 'Masterpieces.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('faculty', 'hero.description', 'Meet the dedicated educators, innovators, and guides who bring the colors of Crayon Box School to life every single day.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('faculty', 'hero.image_url', 'https://crayonboxpreschool.in/wp-content/uploads/2020/08/jess-watters-483666-unsplash.jpg') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('campus-life', 'hero.headline', 'A Canvas for') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('campus-life', 'hero.subtext', 'Every Talent.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('campus-life', 'hero.description', 'At Crayon Box School, education doesn''t stop when the bell rings. Discover a vibrant, secure, and inclusive campus where every student finds their space to shine.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('news', 'hero.tag', 'Campus Expansion') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('news', 'hero.headline', 'Breaking Ground: The Road to our K-12 Senior Wing Begins.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('news', 'hero.description', 'Director Nitin Tyagi officially laid the foundation stone for our new state-of-the-art Senior Secondary Science and Robotics Block, marking the beginning of our highly anticipated K-12 expansion.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('news', 'hero.image_url', 'https://crayonboxpreschool.in/wp-content/uploads/2021/02/blocks-bg.jpg') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('admissions', 'hero.headline', 'Begin Your Child’s') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('admissions', 'hero.subtext', 'Journey.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('admissions', 'hero.description', 'Welcome to a paperless, transparent, and seamless admissions experience. We are currently accepting applications for the 2026–27 academic year.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('admissions', 'hero.image_url', 'https://crayonboxpreschool.in/wp-content/uploads/2021/02/shapes-bg-1.png') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('alumni', 'hero.headline', 'Our') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('alumni', 'hero.subtext', 'Alumni') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
INSERT INTO cms_blocks (page_slug, block_key, content_value) VALUES ('alumni', 'hero.description', 'Connect with past graduates of Crayon Box School who are making waves across the globe.') ON CONFLICT (page_slug, block_key) DO UPDATE SET content_value = EXCLUDED.content_value;
