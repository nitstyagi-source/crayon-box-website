-- Phase 12: Production-Grade School Admission Enquiry CRM v2 Schema

-- 1. Create enquiry sequence
CREATE SEQUENCE IF NOT EXISTS public.enquiry_number_seq START WITH 1001;

-- 2. Upgrade enquiries table with comprehensive fields (~90 fields)
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS enquiry_number VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS academic_session VARCHAR(20) DEFAULT '2026-2027',
  ADD COLUMN IF NOT EXISTS institution_code VARCHAR(10) DEFAULT 'CBS',
  ADD COLUMN IF NOT EXISTS admission_type VARCHAR(50) DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS lead_priority VARCHAR(20) DEFAULT 'WARM',
  ADD COLUMN IF NOT EXISTS child_dob DATE,
  ADD COLUMN IF NOT EXISTS child_gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS child_first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS child_middle_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS child_last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS current_school VARCHAR(255),
  ADD COLUMN IF NOT EXISTS current_board VARCHAR(50),
  ADD COLUMN IF NOT EXISTS medium_of_instruction VARCHAR(50) DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS reason_for_change TEXT,
  ADD COLUMN IF NOT EXISTS special_talents TEXT,
  ADD COLUMN IF NOT EXISTS stream_preference VARCHAR(50),
  ADD COLUMN IF NOT EXISTS second_language_preference VARCHAR(50),
  ADD COLUMN IF NOT EXISTS primary_guardian_relation VARCHAR(50) DEFAULT 'FATHER',
  ADD COLUMN IF NOT EXISTS primary_guardian_whatsapp VARCHAR(20),
  ADD COLUMN IF NOT EXISTS primary_guardian_occupation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS primary_guardian_company VARCHAR(150),
  ADD COLUMN IF NOT EXISTS primary_guardian_designation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS secondary_guardian_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS secondary_guardian_relation VARCHAR(50),
  ADD COLUMN IF NOT EXISTS secondary_guardian_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS secondary_guardian_whatsapp VARCHAR(20),
  ADD COLUMN IF NOT EXISTS secondary_guardian_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS secondary_guardian_occupation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS secondary_guardian_company VARCHAR(150),
  ADD COLUMN IF NOT EXISTS secondary_guardian_designation VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS locality_area VARCHAR(150),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Delhi',
  ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Delhi',
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
  ADD COLUMN IF NOT EXISTS landmark VARCHAR(150),
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS transport_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS matched_route_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS has_sibling BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS linked_sibling_student_id UUID REFERENCES public.students(id),
  ADD COLUMN IF NOT EXISTS linked_sibling_admission_no VARCHAR(50),
  ADD COLUMN IF NOT EXISTS linked_sibling_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS interest_areas TEXT[],
  ADD COLUMN IF NOT EXISTS visit_requested BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS visit_date DATE,
  ADD COLUMN IF NOT EXISTS visit_slot VARCHAR(50),
  ADD COLUMN IF NOT EXISTS number_of_visitors INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS visit_status VARCHAR(50) DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS visit_feedback_rating INT,
  ADD COLUMN IF NOT EXISTS visit_notes TEXT,
  ADD COLUMN IF NOT EXISTS preferred_contact_channel VARCHAR(50) DEFAULT 'PHONE',
  ADD COLUMN IF NOT EXISTS preferred_contact_time VARCHAR(50),
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50) DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
  ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
  ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(150),
  ADD COLUMN IF NOT EXISTS utm_term VARCHAR(150),
  ADD COLUMN IF NOT EXISTS utm_content VARCHAR(150),
  ADD COLUMN IF NOT EXISTS landing_page VARCHAR(255),
  ADD COLUMN IF NOT EXISTS referrer_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS device_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS parent_message TEXT,
  ADD COLUMN IF NOT EXISTS counsellor_notes TEXT,
  ADD COLUMN IF NOT EXISTS conversion_status VARCHAR(50) DEFAULT 'UNCONVERTED',
  ADD COLUMN IF NOT EXISTS converted_application_id UUID REFERENCES public.admissions_applications(id),
  ADD COLUMN IF NOT EXISTS converted_student_id UUID REFERENCES public.students(id),
  ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lost_reason VARCHAR(100),
  ADD COLUMN IF NOT EXISTS lost_remarks TEXT;

-- 3. Follow-Up Activities Table (Event Driven)
CREATE TABLE IF NOT EXISTS public.enquiry_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  counsellor_id UUID REFERENCES public.staff(id),
  counsellor_name VARCHAR(150) DEFAULT 'Admissions Counsellor',
  channel VARCHAR(50) NOT NULL, -- PHONE, WHATSAPP, IN_PERSON, EMAIL, SMS
  contacted_person VARCHAR(100),
  outcome VARCHAR(50) NOT NULL, -- CONNECTED, NO_ANSWER, CALLBACK_REQUESTED, VISIT_SCHEDULED, APPLICATION_REQUESTED, APPLICATION_SUBMITTED, LOST, INTERESTED
  parent_feedback TEXT,
  internal_notes TEXT NOT NULL,
  next_action VARCHAR(100),
  next_action_date DATE,
  status VARCHAR(20) DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy retrieval
CREATE INDEX IF NOT EXISTS idx_enquiry_followups_enquiry_id ON public.enquiry_followups(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_institution ON public.enquiries(institution_code);
