-- Phase 6: Academic & Teacher Operations Schema

-- 1. Staff (Extends auth.users for Teachers, Principals, etc.)
CREATE TABLE staff (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'Teacher', -- Teacher, Principal, Coordinator
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes (e.g. Grade 4 - Section A)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES staff(id) ON DELETE SET NULL, -- Homeroom teacher
    grade VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL,
    room_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academic_year_id, grade, section)
);

-- 3. Enrolled Students (The official roster after admission is approved)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    academic_year_id UUID REFERENCES academic_years(id),
    parent_id UUID REFERENCES parents(id),
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    admission_application_id UUID REFERENCES admissions_applications(id) UNIQUE, -- Link back to original application
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. CBS-2026-0001
    date_of_birth DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Graduated, Withdrawn
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Attendance Logs
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL, -- Present, Absent, Late, Excused
    marked_by UUID REFERENCES staff(id), -- Which teacher marked it
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- 5. Communications (Broadcast Messages)
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES staff(id) ON DELETE SET NULL, -- Null if sent by system
    campus_id UUID REFERENCES campuses(id),
    target_audience VARCHAR(50), -- All Parents, Specific Class, Specific Grade
    target_class_id UUID REFERENCES classes(id), -- If target is specific class
    channel VARCHAR(50), -- Email, SMS, WhatsApp, In-App
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Sent', -- Draft, Sent, Failed
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ENABLE RLS & POLICIES
-- ==========================================

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Superadmins can do everything
CREATE POLICY "Superadmins can manage staff" ON staff FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage classes" ON classes FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage students" ON students FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage attendance" ON attendance_logs FOR ALL USING (is_superadmin());
CREATE POLICY "Superadmins can manage communications" ON communications FOR ALL USING (is_superadmin());

-- Staff can view their own profile and students/classes they are assigned to
CREATE POLICY "Staff can view own profile" ON staff FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Staff can view assigned classes" ON classes FOR SELECT USING (auth.uid() = teacher_id OR is_superadmin());
CREATE POLICY "Staff can view students in assigned classes" ON students FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND teacher_id = auth.uid()) OR is_superadmin()
);

-- Staff can mark attendance for their assigned classes
CREATE POLICY "Staff can manage attendance for assigned classes" ON attendance_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE id = attendance_logs.class_id AND teacher_id = auth.uid()) OR is_superadmin()
);

-- Staff can view communications they sent, Parents can view communications targeted at them
CREATE POLICY "Staff can view own communications" ON communications FOR SELECT USING (auth.uid() = sender_id OR is_superadmin());
