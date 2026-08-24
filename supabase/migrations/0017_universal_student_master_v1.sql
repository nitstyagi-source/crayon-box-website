-- ==============================================================================
-- 0017_universal_student_master_v1.sql
-- Vani Educational Trust V2 ERP — Universal Student Master V1 Architecture
-- ==============================================================================

-- 1. Create Universal Student Sequence & Universal ID Column
CREATE SEQUENCE IF NOT EXISTS public.student_universal_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.family_code_seq START 1;

-- 2. Create Families Table
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code VARCHAR(50) UNIQUE NOT NULL,
    family_name VARCHAR(255) NOT NULL,
    primary_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhance Students Master Table
ALTER TABLE public.students 
    ADD COLUMN IF NOT EXISTS universal_id VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS is_test_record BOOLEAN DEFAULT FALSE;

-- 4. Enhance Student Enrollments Table
ALTER TABLE public.student_enrollments
    ADD COLUMN IF NOT EXISTS academic_stage VARCHAR(50) DEFAULT 'PRIMARY',
    ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT TRUE;

-- 5. Enhance Guardians Table with Family ID
ALTER TABLE public.guardians
    ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

-- 6. Enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read for families" ON public.families FOR SELECT USING (true);
