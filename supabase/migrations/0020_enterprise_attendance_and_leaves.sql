-- Phase E: Enterprise Attendance & Automated Leave Management
-- Multi-Tenant Boundary Hardening for Attendance Data

-- 1. Create Student Attendance Records Table
CREATE TABLE IF NOT EXISTS student_attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS',
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME,
    academic_session VARCHAR(20),
    class_name VARCHAR(50),
    section_name VARCHAR(50),
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE
    event_type VARCHAR(50) DEFAULT 'Classroom', -- Classroom, Gate, Transport
    verification_method VARCHAR(50) DEFAULT 'Manual', -- Manual, RFID, Biometric
    remarks TEXT,
    parent_notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date, event_type)
);

CREATE INDEX IF NOT EXISTS idx_student_attendance_inst ON student_attendance_records(institution_code, student_id, date);

-- 2. Create Student Leave Requests Table
CREATE TABLE IF NOT EXISTS student_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS',
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- Sick, Casual, Medical, Family
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_leave_inst ON student_leave_requests(institution_code, student_id, status);

-- 3. Retrofit Staff Attendance & Leave Requests for Multi-Tenant Isolation
ALTER TABLE staff_attendance ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
CREATE INDEX IF NOT EXISTS idx_staff_attendance_inst ON staff_attendance(institution_code, staff_id, date);

ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
CREATE INDEX IF NOT EXISTS idx_leave_requests_inst ON leave_requests(institution_code, staff_id, status);

-- 4. Row Level Security Policies
ALTER TABLE student_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_leave_requests ENABLE ROW LEVEL SECURITY;

-- Superadmins can manage all
DROP POLICY IF EXISTS "Superadmins can manage student_attendance" ON public.student_attendance_records;
CREATE POLICY "Superadmins can manage student_attendance" ON student_attendance_records FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins can manage student_leaves" ON public.student_leave_requests;
CREATE POLICY "Superadmins can manage student_leaves" ON student_leave_requests FOR ALL USING (is_superadmin());

-- Staff can view/manage attendance for their institution
DROP POLICY IF EXISTS "Staff manage institution attendance" ON public.student_attendance_records;
CREATE POLICY "Staff manage institution attendance" ON student_attendance_records FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = student_attendance_records.institution_code)
);

-- Staff can view/manage leaves for their institution
DROP POLICY IF EXISTS "Staff manage institution leaves" ON public.student_leave_requests;
CREATE POLICY "Staff manage institution leaves" ON student_leave_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = student_leave_requests.institution_code)
);

-- Students view their own attendance
DROP POLICY IF EXISTS "Students view own attendance" ON public.student_attendance_records;
CREATE POLICY "Students view own attendance" ON student_attendance_records FOR SELECT USING (
    student_id = auth.uid()
);

-- Students manage their own leaves
DROP POLICY IF EXISTS "Students manage own leaves" ON public.student_leave_requests;
CREATE POLICY "Students manage own leaves" ON student_leave_requests FOR ALL USING (
    student_id = auth.uid()
);
