-- ==============================================================================
-- 0015_master_data_architecture.sql
-- Vani Educational Trust V2 ERP — Universal Student, Family & Staff Architecture
-- ==============================================================================

-- 1. Student Enrollments Table (Decoupled from permanent Student Master)
CREATE TABLE IF NOT EXISTS public.student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    institution_code VARCHAR(20) NOT NULL REFERENCES public.institutions(code) ON DELETE CASCADE,
    campus_id UUID,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    class_name VARCHAR(50) NOT NULL,
    section_name VARCHAR(20) NOT NULL DEFAULT 'A',
    admission_number VARCHAR(100) UNIQUE NOT NULL,
    roll_number VARCHAR(50),
    enrollment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'TRANSFERRED' | 'WITHDRAWN' | 'ALUMNI'
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Guardians Table (Family 360)
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL DEFAULT 'FATHER',
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    occupation VARCHAR(255),
    address TEXT,
    is_primary_contact BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Student Guardians Junction Table (Multi-child sibling relationships)
CREATE TABLE IF NOT EXISTS public.student_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, guardian_id)
);

-- 4. Employee Assignments Table (Multi-Institution Faculty Splits)
CREATE TABLE IF NOT EXISTS public.employee_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    institution_code VARCHAR(20) NOT NULL REFERENCES public.institutions(code) ON DELETE CASCADE,
    campus_id UUID,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    workload_percentage NUMERIC(5,2) DEFAULT 100.00,
    is_primary_assignment BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_assignments ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Allow public read for enrollments" ON public.student_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow public read for guardians" ON public.guardians FOR SELECT USING (true);
CREATE POLICY "Allow public read for student guardians" ON public.student_guardians FOR SELECT USING (true);
CREATE POLICY "Allow public read for employee assignments" ON public.employee_assignments FOR SELECT USING (true);
