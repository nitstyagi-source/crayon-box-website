-- Phase 5: RLS Policies and Tracking Token Trigger

-- 1. Create Super Admins table
CREATE TABLE superadmins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to check if user is a superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM superadmins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on all existing tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE superadmins ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Campuses: Anyone can view, only superadmins can edit
CREATE POLICY "Anyone can view campuses" ON campuses FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage campuses" ON campuses FOR ALL USING (is_superadmin());

-- Academic Years: Anyone can view, only superadmins can edit
CREATE POLICY "Anyone can view academic years" ON academic_years FOR SELECT USING (true);
CREATE POLICY "Superadmins can manage academic years" ON academic_years FOR ALL USING (is_superadmin());

-- Parents: Parents can manage their own profile, superadmins can manage all
CREATE POLICY "Parents can manage own profile" ON parents FOR ALL USING (auth.uid() = id);
CREATE POLICY "Superadmins can manage parents" ON parents FOR ALL USING (is_superadmin());

-- Admissions Applications: 
-- Anyone can insert (for public applications, they won't have a parent_id yet, wait, the schema says parent_id UUID REFERENCES parents(id) NOT NULL). 
-- This implies the parent must be logged in to apply, OR the parent account is created upon application.
-- Let's allow insert if parent_id = auth.uid() OR if auth.uid() is null (public draft?).
-- Actually, the user said: "When the Super Admin moves an application to the "Approved" column... that action should trigger an API call to supabase.auth.admin.createUser() to generate the parent's auth account".
-- This implies public users CAN submit applications WITHOUT being logged in.
-- Wait, the 0001 schema says `parent_id UUID REFERENCES parents(id) NOT NULL`. If they submit publicly, what is the `parent_id`?
-- Let's make `parent_id` NULLABLE in admissions_applications to allow public submissions.
ALTER TABLE admissions_applications ALTER COLUMN parent_id DROP NOT NULL;

CREATE POLICY "Anyone can insert applications" ON admissions_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Parents can view own applications" ON admissions_applications FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can update own draft applications" ON admissions_applications FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Superadmins can manage applications" ON admissions_applications FOR ALL USING (is_superadmin());

-- Application Documents
CREATE POLICY "Anyone can insert documents" ON application_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Parents can view own documents" ON application_documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM admissions_applications WHERE id = application_id AND parent_id = auth.uid())
);
CREATE POLICY "Superadmins can manage documents" ON application_documents FOR ALL USING (is_superadmin());

-- Transactions
CREATE POLICY "Parents can view own transactions" ON transactions FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Superadmins can manage transactions" ON transactions FOR ALL USING (is_superadmin());

-- Superadmins
CREATE POLICY "Superadmins can view superadmins" ON superadmins FOR SELECT USING (is_superadmin());

-- 4. Tracking Token Auto-Generator
-- Format: APP-YYYY-XXXX (e.g. APP-2026-0001)

CREATE SEQUENCE IF NOT EXISTS application_seq START 1;

CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS TRIGGER AS $$
DECLARE
    year_str VARCHAR(4);
    seq_val INT;
BEGIN
    year_str := to_char(CURRENT_DATE, 'YYYY');
    seq_val := nextval('application_seq');
    NEW.tracking_token := 'APP-' || year_str || '-' || lpad(seq_val::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_tracking_token
BEFORE INSERT ON admissions_applications
FOR EACH ROW
WHEN (NEW.tracking_token IS NULL)
EXECUTE FUNCTION generate_tracking_token();
