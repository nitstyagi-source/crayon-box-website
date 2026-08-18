-- Phase 11: Enquiry CRM & Lead Migration Schema

CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_name VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(255),
    child_name VARCHAR(255) NOT NULL,
    grade_interested VARCHAR(50) NOT NULL,
    source VARCHAR(50) DEFAULT 'Walk-in', -- Walk-in, Phone, Website
    status VARCHAR(50) DEFAULT 'New', -- New, Contacted, Tour Booked, Ready to Apply, Dropped, Converted
    follow_up_date DATE,
    assigned_to UUID REFERENCES staff(id), -- Admissions Counselor
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enquiry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id),
    interaction_type VARCHAR(50), -- Call, Email, Campus Tour, SMS
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link back to the core Admissions table from Phase 2
ALTER TABLE admissions_applications
ADD COLUMN enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL UNIQUE;

-- ==========================================
-- ENABLE RLS & POLICIES
-- ==========================================

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage enquiries" ON enquiries FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage enquiry_logs" ON enquiry_logs FOR ALL USING (is_superadmin());

-- Admissions staff can manage all enquiries
CREATE POLICY "Admissions staff can manage enquiries" ON enquiries FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid()) -- Broad staff access for prototype
);
CREATE POLICY "Admissions staff can manage logs" ON enquiry_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid())
);
