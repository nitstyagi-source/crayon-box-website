-- ==============================================================================
-- 0018_student_master_v2_transport_progression_tc.sql
-- Vani Educational Trust V2 ERP — Student Master V2 Architecture
-- ==============================================================================

-- 1. Enhance Students Table with Master Photo, PEN, and Transport Identity
ALTER TABLE public.students
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS pen_no VARCHAR(100), -- Permanent Education Number
    ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(50) DEFAULT 'PARENT_PICKUP', -- 'SCHOOL_BUS' | 'PRIVATE_VAN' | 'WALKER' | 'PARENT_PICKUP' | 'OTHER'
    ADD COLUMN IF NOT EXISTS transport_bus_no VARCHAR(50),
    ADD COLUMN IF NOT EXISTS transport_route VARCHAR(100),
    ADD COLUMN IF NOT EXISTS transport_stop VARCHAR(100),
    ADD COLUMN IF NOT EXISTS transport_pickup_time VARCHAR(20),
    ADD COLUMN IF NOT EXISTS transport_drop_time VARCHAR(20),
    ADD COLUMN IF NOT EXISTS transport_driver_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS transport_driver_phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS transport_conductor_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_van_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS father_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS mother_name VARCHAR(150);

-- 2. Enhance Guardians Table with Photo, Escort Authorization, & Work Details
ALTER TABLE public.guardians
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS organization VARCHAR(150),
    ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_authorized_pickup BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_emergency_contact BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS communication_preference VARCHAR(50) DEFAULT 'WHATSAPP_SMS';

-- 3. Student Progression History Table (Year-by-Year Academic Timeline)
CREATE TABLE IF NOT EXISTS public.student_progression (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_session VARCHAR(50) NOT NULL, -- e.g. '2024-2025', '2025-2026', '2026-2027'
    institution_code VARCHAR(20) NOT NULL REFERENCES public.institutions(code) ON DELETE CASCADE,
    campus_id UUID,
    academic_stage VARCHAR(50) NOT NULL, -- 'FOUNDATION' | 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR_SECONDARY'
    class_name VARCHAR(50) NOT NULL,
    section_name VARCHAR(20) NOT NULL DEFAULT 'A',
    roll_number VARCHAR(50),
    admission_number VARCHAR(100) NOT NULL,
    class_teacher_name VARCHAR(150),
    start_date DATE,
    end_date DATE,
    promotion_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'PROMOTED' | 'PROMOTED_WITH_CONDITION' | 'REPEAT' | 'TRANSFERRED' | 'WITHDRAWN' | 'GRADUATED'
    annual_result VARCHAR(50) DEFAULT 'PASSED',
    attendance_percentage NUMERIC(5,2) DEFAULT 92.50,
    total_working_days INT DEFAULT 220,
    days_present INT DEFAULT 204,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transfer Certificates (TC / SLC) Official Table
CREATE TABLE IF NOT EXISTS public.transfer_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tc_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'TC-CBS-2026-0042'
    ref_number VARCHAR(100),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    institution_code VARCHAR(20) NOT NULL REFERENCES public.institutions(code) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    school_id_number VARCHAR(100) DEFAULT '1253481',
    udise_code VARCHAR(100) DEFAULT '07124100151',
    student_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    admission_no VARCHAR(100) NOT NULL,
    admission_date DATE,
    class_admitted VARCHAR(50),
    class_last_attended VARCHAR(50) NOT NULL,
    section_last_attended VARCHAR(20) DEFAULT 'A',
    pen_no VARCHAR(100),
    withdrawal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    dues_paid BOOLEAN DEFAULT TRUE,
    last_session_attended VARCHAR(50) DEFAULT '2026-2027',
    total_attendance INT DEFAULT 220,
    student_attendance INT DEFAULT 204,
    annual_result VARCHAR(100) DEFAULT 'PROMOTED TO HIGHER CLASS',
    reason_for_leaving TEXT DEFAULT 'Parent Relocation / Transferred to Sister Campus',
    status VARCHAR(50) DEFAULT 'ISSUED', -- 'REQUESTED' | 'CLEARANCE_PENDING' | 'APPROVED' | 'ISSUED' | 'CANCELLED'
    
    -- Department Clearances Checklist (Maker-Checker)
    accounts_clearance BOOLEAN DEFAULT TRUE,
    library_clearance BOOLEAN DEFAULT TRUE,
    transport_clearance BOOLEAN DEFAULT TRUE,
    academic_clearance BOOLEAN DEFAULT TRUE,
    approved_by VARCHAR(150) DEFAULT 'Principal Dr. Ananya Roy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.student_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for progression" ON public.student_progression FOR SELECT USING (true);
CREATE POLICY "Allow public read for TC" ON public.transfer_certificates FOR SELECT USING (true);
