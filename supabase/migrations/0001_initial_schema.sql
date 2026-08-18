-- 1. Campuses (Multi-tenant foundation)
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(20) NOT NULL, -- '2026-27'
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false
);

-- 3. Parents (Extends Supabase Auth Users)
CREATE TABLE parents (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Admissions Applications
CREATE TABLE admissions_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_token VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'APP-26-8942A' (Generated via trigger or edge function)
    campus_id UUID REFERENCES campuses(id) NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) NOT NULL,
    parent_id UUID REFERENCES parents(id) NOT NULL,
    
    student_first_name VARCHAR(100) NOT NULL,
    student_last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    grade_applied VARCHAR(50) NOT NULL,
    previous_school VARCHAR(255),
    
    transport_required BOOLEAN DEFAULT false,
    co_curricular_kits JSONB DEFAULT '{}'::jsonb,
    
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Payment Pending, Under Review, Approved, Rejected
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Application Documents Vault
CREATE TABLE application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES admissions_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, 
    file_url TEXT NOT NULL, 
    verification_status VARCHAR(50) DEFAULT 'Pending', 
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Unified Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parents(id),
    application_id UUID REFERENCES admissions_applications(id), -- Nullable for post-admission fees
    transaction_type VARCHAR(50) NOT NULL, -- 'Application Fee', 'Tuition', 'Transport'
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pending', 
    gateway_transaction_id VARCHAR(255), 
    paid_at TIMESTAMPTZ
);
