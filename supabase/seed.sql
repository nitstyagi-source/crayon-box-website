-- Seed file for local development

-- Create default campus
INSERT INTO campuses (id, name, address, contact_email, contact_phone)
VALUES ('11111111-1111-1111-1111-111111111111', 'Delhi Main Branch', '123 Main St, Delhi', 'admin@crayonbox.edu', '+91 9999999999')
ON CONFLICT DO NOTHING;

-- Create default academic year
INSERT INTO academic_years (id, campus_id, name, start_date, end_date, is_active)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-27', '2026-04-01', '2027-03-31', true)
ON CONFLICT DO NOTHING;

-- Since auth.users is managed by Supabase Auth, creating a superadmin manually requires inserting into auth.users first.
-- For local dev, we will assume a known user ID will be the superadmin.
