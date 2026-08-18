-- Phase 7: Wellness, HR, and Inventory Schema

-- ==========================================
-- MODULE 10: HEALTH & CLINIC
-- ==========================================

CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE,
    blood_group VARCHAR(10),
    allergies TEXT,
    chronic_conditions TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    pediatrician_name VARCHAR(100),
    pediatrician_phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medical_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    logged_by UUID REFERENCES staff(id), -- Nurse or Teacher
    incident_date TIMESTAMPTZ DEFAULT NOW(),
    symptoms TEXT NOT NULL,
    diagnosis TEXT,
    action_taken TEXT NOT NULL, -- Per user requirement
    medication_administered VARCHAR(255),
    temperature DECIMAL(5,2),
    emergency_contact_notified BOOLEAN DEFAULT false, -- Per user requirement
    status VARCHAR(50) DEFAULT 'Resolved', -- Resolved, Sent Home, Hospitalized
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- MODULE 3: DAYCARE & DIGITAL DIARY
-- ==========================================

CREATE TABLE daycare_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    logged_by UUID REFERENCES staff(id),
    log_type VARCHAR(50) NOT NULL, -- Meal, Nap, Potty, Mood, Activity
    value TEXT NOT NULL, -- e.g., 'Ate 100%', 'Slept 2 hours', 'Happy'
    photo_url TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- MODULE 15: HRMS & PAYROLL
-- ==========================================

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- Sick, Casual, Earned, Maternity
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    approved_by UUID REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL, -- Present, Absent, Half-Day, On Leave
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    UNIQUE(staff_id, date)
);

CREATE TABLE payroll_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL, -- e.g., 'August 2026'
    base_salary DECIMAL(10,2) NOT NULL,
    lwp_days INT DEFAULT 0, -- Leave Without Pay (Calculated dynamically via trigger/app)
    lwp_deduction DECIMAL(10,2) DEFAULT 0.00,
    allowances DECIMAL(10,2) DEFAULT 0.00,
    net_payable DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processed, Paid
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, month)
);

-- ==========================================
-- MODULE 13: SMART INVENTORY
-- ==========================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- Library Book, IT Equipment, Lab Gear
    name VARCHAR(255) NOT NULL,
    sku_code VARCHAR(100) UNIQUE,
    qr_hash VARCHAR(255) UNIQUE NOT NULL, -- Per user requirement (For camera scanning)
    condition VARCHAR(50) DEFAULT 'Good',
    location VARCHAR(100), -- Room 102, Library A
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE asset_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    assigned_to_student UUID REFERENCES students(id), -- Nullable if assigned to staff
    assigned_to_staff UUID REFERENCES staff(id),
    checkout_date TIMESTAMPTZ DEFAULT NOW(),
    expected_return_date TIMESTAMPTZ,
    actual_return_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'Checked Out' -- Checked Out, Returned, Overdue, Lost
);

-- ==========================================
-- ENABLE RLS & POLICIES
-- ==========================================

ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daycare_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_checkouts ENABLE ROW LEVEL SECURITY;

-- Superadmins
CREATE POLICY "Superadmins can manage health_profiles" ON health_profiles FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage medical_logs" ON medical_logs FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage daycare_logs" ON daycare_logs FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage leave_requests" ON leave_requests FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage staff_attendance" ON staff_attendance FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage payroll_ledgers" ON payroll_ledgers FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage assets" ON assets FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage asset_checkouts" ON asset_checkouts FOR ALL USING (is_superadmin());

-- Parents (Strict RLS for Privacy)
CREATE POLICY "Parents can view own child health profile" ON health_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
);
CREATE POLICY "Parents can view own child medical logs" ON medical_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
);
CREATE POLICY "Parents can view own child daycare logs" ON daycare_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
);

-- Staff Policies
CREATE POLICY "Nurses and admins can insert medical logs" ON medical_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid())
);
CREATE POLICY "Teachers can insert daycare logs" ON daycare_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid())
);
CREATE POLICY "Staff can view own leave requests" ON leave_requests FOR SELECT USING (staff_id = auth.uid());
CREATE POLICY "Staff can insert own leave requests" ON leave_requests FOR INSERT WITH CHECK (staff_id = auth.uid());
CREATE POLICY "Staff can view own attendance" ON staff_attendance FOR SELECT USING (staff_id = auth.uid());
CREATE POLICY "Staff can view own payroll" ON payroll_ledgers FOR SELECT USING (staff_id = auth.uid());

-- Assets: Anyone can view available assets, only staff/admins can checkout
CREATE POLICY "Anyone can view assets" ON assets FOR SELECT USING (true);
CREATE POLICY "Staff can checkout assets" ON asset_checkouts FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid())
);
