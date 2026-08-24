-- ==============================================================================
-- 0014_trust_hierarchy_and_rbac.sql
-- Vani Educational Trust V2 ERP — Foundational Hierarchy & 4D RBAC Engine
-- ==============================================================================

-- 1. Trusts Table
CREATE TABLE IF NOT EXISTS public.trusts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    headquarters TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Legal Entities Table
CREATE TABLE IF NOT EXISTS public.legal_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trust_id UUID REFERENCES public.trusts(id) ON DELETE CASCADE,
    legal_name VARCHAR(255) NOT NULL,
    cin_or_registration_no VARCHAR(100),
    pan_number VARCHAR(20),
    tan_number VARCHAR(20),
    gstin_number VARCHAR(30),
    registered_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Institutions Table (CBS, AVM, AS, CBPS)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    trust_id UUID REFERENCES public.trusts(id) ON DELETE CASCADE,
    legal_entity_id UUID REFERENCES public.legal_entities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    institution_type VARCHAR(50) NOT NULL, -- 'K12_SCHOOL' | 'PRE_SCHOOL'
    academic_framework VARCHAR(50) NOT NULL, -- 'CBSE' | 'MONTESSORI'
    board_affiliation VARCHAR(50) NOT NULL,
    affiliation_number VARCHAR(100),
    principal_name VARCHAR(255),
    principal_email VARCHAR(255),
    brand_color VARCHAR(20),
    address TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Academic Sessions Table
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "2026-2027"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    calendar_model VARCHAR(50) DEFAULT 'CBSE_ANNUAL',
    is_current BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RBAC Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INT DEFAULT 1,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Role Module Permissions Matrix Table
CREATE TABLE IF NOT EXISTS public.role_module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code VARCHAR(50) NOT NULL REFERENCES public.roles(code) ON DELETE CASCADE,
    module_code VARCHAR(100) NOT NULL,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_code, module_code)
);

-- Enable RLS
ALTER TABLE public.trusts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_module_permissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and service roles access
CREATE POLICY "Allow public read for hierarchy" ON public.trusts FOR SELECT USING (true);
CREATE POLICY "Allow public read for legal entities" ON public.legal_entities FOR SELECT USING (true);
CREATE POLICY "Allow public read for institutions" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Allow public read for academic sessions" ON public.academic_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read for roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Allow public read for permissions" ON public.role_module_permissions FOR SELECT USING (true);
