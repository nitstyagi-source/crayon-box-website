-- 0013_student_erp_schema.sql
-- Comprehensive Student Information System (SIS) Schema

-- 1. Core Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Alumni, TC Issued, Withdrawn
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    nationality VARCHAR(50) DEFAULT 'Indian',
    category VARCHAR(50), -- General, OBC, SC, ST, EWS
    aadhaar_no VARCHAR(20), -- Masked in UI
    apaar_id VARCHAR(50),
    pen_no VARCHAR(50),
    mother_tongue VARCHAR(50),
    place_of_birth VARCHAR(100),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Academic History (Multi-session tracking)
CREATE TABLE IF NOT EXISTS public.student_academic_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
    class_name VARCHAR(50) NOT NULL,
    section_name VARCHAR(50),
    roll_no VARCHAR(20),
    house VARCHAR(50),
    transport_required BOOLEAN DEFAULT false,
    is_current_session BOOLEAN DEFAULT false, -- True for the active session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Student Parents
CREATE TABLE IF NOT EXISTS public.student_parents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_type VARCHAR(20) NOT NULL, -- Father, Mother, Guardian
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(100),
    occupation VARCHAR(100),
    organization VARCHAR(100),
    designation VARCHAR(100),
    annual_income VARCHAR(50),
    education VARCHAR(100),
    aadhaar_no VARCHAR(20),
    is_primary_contact BOOLEAN DEFAULT false,
    is_emergency_contact BOOLEAN DEFAULT false,
    is_authorized_pickup BOOLEAN DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Student Addresses
CREATE TABLE IF NOT EXISTS public.student_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL, -- Current, Permanent
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    pin_code VARCHAR(20) NOT NULL,
    landmark VARCHAR(100),
    gps_location VARCHAR(100),
    distance_from_school DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Student Medical
CREATE TABLE IF NOT EXISTS public.student_medical (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    allergies TEXT,
    medication TEXT,
    medical_remarks TEXT,
    doctor_name VARCHAR(100),
    doctor_contact VARCHAR(20),
    emergency_medical_info TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Student Documents
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- Birth Certificate, Aadhaar, TC, Medical
    document_no VARCHAR(100),
    file_url TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Verified, Rejected
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Student Lifecycle
CREATE TABLE IF NOT EXISTS public.student_lifecycle (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- Admission, Promotion, Transfer, TC, Withdrawal, Alumni
    action_date DATE NOT NULL,
    remarks TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_medical ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lifecycle ENABLE ROW LEVEL SECURITY;

-- Basic Admin Policies
CREATE POLICY "Admins full access students" ON public.students USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access academic_history" ON public.student_academic_history USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access parents" ON public.student_parents USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access addresses" ON public.student_addresses USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access medical" ON public.student_medical USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access documents" ON public.student_documents USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access lifecycle" ON public.student_lifecycle USING (auth.jwt()->>'role' = 'admin');
