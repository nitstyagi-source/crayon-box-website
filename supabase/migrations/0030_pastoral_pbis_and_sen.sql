-- =========================================================================
-- Migration 0030: Pastoral Care, PBIS Gamified House Points & SEN / IEP Studio
-- =========================================================================

-- 1. SCHOOL HOUSES & STANDINGS
CREATE TABLE IF NOT EXISTS public.school_houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- PHOENIX, PEGASUS, GRIFFIN, DRAGON
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL, -- hex or tailwind name
    accent_color VARCHAR(30) NOT NULL,
    motto TEXT,
    crest_emoji VARCHAR(10) DEFAULT '🏆',
    total_points INTEGER DEFAULT 0,
    weekly_velocity INTEGER DEFAULT 0,
    house_master_name VARCHAR(150),
    captain_student_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial 4 Houses if empty
INSERT INTO public.school_houses (code, name, color, accent_color, motto, crest_emoji, total_points, weekly_velocity, house_master_name, captain_student_name)
VALUES
    ('PHOENIX', 'Phoenix House', '#EF4444', '#DC2626', 'Rising With Courage & Integrity', '🔥', 2840, 145, 'Dr. Rajesh Verma', 'Aarav Sharma (Class 10A)'),
    ('PEGASUS', 'Pegasus House', '#3B82F6', '#2563EB', 'Soaring To Academic Excellence', '⚡', 2910, 180, 'Mrs. Neha Gupta', 'Ananya Iyer (Class 10B)'),
    ('GRIFFIN', 'Griffin House', '#10B981', '#059669', 'Strength in Wisdom & Empathy', '🦅', 2760, 110, 'Mr. Amit Kumar', 'Rohan Mehta (Class 10A)'),
    ('DRAGON', 'Dragon House', '#F59E0B', '#D97706', 'Bold Leadership & Resilient Spirit', '🐉', 3050, 210, 'Ms. Pooja Sharma', 'Tanvi Patel (Class 10B)')
ON CONFLICT (code) DO NOTHING;

-- 2. PBIS MERIT & DEMERIT DEFINITIONS
CREATE TABLE IF NOT EXISTS public.pbis_merit_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- 'ACADEMIC', 'LEADERSHIP', 'KINDNESS', 'SPORTS', 'CITIZENSHIP', 'INFRACTION'
    name VARCHAR(150) NOT NULL,
    default_points INTEGER NOT NULL, -- positive for merits, negative for infractions
    tier VARCHAR(20) DEFAULT 'TIER_1', -- TIER_1 (Universal), TIER_2 (Targeted), TIER_3 (Intensive)
    icon_name VARCHAR(50) DEFAULT 'Award',
    is_positive BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.pbis_merit_types (category, name, default_points, tier, icon_name, is_positive)
VALUES
    ('ACADEMIC', 'Exemplary Subject Diligence & Curiosity', 10, 'TIER_1', 'BookOpen', true),
    ('ACADEMIC', 'Peer Tutoring & Collaborative Learning', 15, 'TIER_1', 'Users', true),
    ('KINDNESS', 'Outstanding Empathy & Inclusion of Peer', 15, 'TIER_1', 'Heart', true),
    ('LEADERSHIP', 'Proactive Assembly or Event Leadership', 20, 'TIER_2', 'Award', true),
    ('CITIZENSHIP', 'Campus Environmental Stewardship & Cleanliness', 10, 'TIER_1', 'Sparkles', true),
    ('SPORTS', 'Exceptional Sportsmanship & Team Spirit', 15, 'TIER_1', 'Shield', true),
    ('INFRACTION', 'Uniform / Equipment Incompliance', -5, 'TIER_1', 'AlertTriangle', false),
    ('INFRACTION', 'Repeated Classroom Disruption', -10, 'TIER_2', 'AlertCircle', false)
ON CONFLICT DO NOTHING;

-- 3. PBIS POINT TRANSACTIONS LEDGER
CREATE TABLE IF NOT EXISTS public.pbis_point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50),
    house_id UUID REFERENCES public.school_houses(id),
    house_code VARCHAR(20) NOT NULL,
    awarded_by_name VARCHAR(150) NOT NULL,
    merit_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PASTORAL INTERVENTIONS (MTSS TIER 1, 2, 3)
CREATE TABLE IF NOT EXISTS public.pastoral_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50),
    tier VARCHAR(20) NOT NULL DEFAULT 'TIER_2', -- 'TIER_1', 'TIER_2', 'TIER_3'
    trigger_reason VARCHAR(255) NOT NULL,
    assigned_counselor_name VARCHAR(150) NOT NULL,
    support_strategy TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'UNDER_REVIEW', 'RESOLVED'
    review_date DATE,
    parent_notified BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SPECIAL EDUCATIONAL NEEDS (SEN / IEP) PROFILES
CREATE TABLE IF NOT EXISTS public.sen_student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50),
    primary_category VARCHAR(100) NOT NULL, -- 'Dyslexia', 'ADHD', 'Autism Spectrum', 'Speech & Language', 'Sensory / Physical', 'Gifted & Talented'
    case_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'UNDER_EVALUATION', 'MONITORING', 'GRADUATED'
    lead_specialist_name VARCHAR(150) NOT NULL,
    shadow_educator_name VARCHAR(150),
    formal_diagnosis_date DATE,
    last_iep_review_date DATE DEFAULT CURRENT_DATE,
    next_iep_review_date DATE DEFAULT (CURRENT_DATE + INTERVAL '6 months'),
    general_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IEP FORMAL ACCOMMODATIONS
CREATE TABLE IF NOT EXISTS public.sen_accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sen_profile_id UUID REFERENCES public.sen_student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL, -- e.g. '25% Additional Examination Time', 'Dedicated Scribe / Reader', 'Sensory Break Access'
    category VARCHAR(50) NOT NULL DEFAULT 'EXAM', -- 'EXAM', 'CLASSROOM', 'HOMEWORK', 'ENVIRONMENT'
    is_active BOOLEAN DEFAULT true,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. IEP SMART GOALS
CREATE TABLE IF NOT EXISTS public.sen_smart_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sen_profile_id UUID REFERENCES public.sen_student_profiles(id) ON DELETE CASCADE,
    domain VARCHAR(50) NOT NULL, -- 'ACADEMIC_LITERACY', 'FOCUS_AND_EXECUTIVE', 'SOCIAL_COMMUNICATION', 'EMOTIONAL_REGULATION'
    goal_title VARCHAR(255) NOT NULL,
    baseline_level TEXT NOT NULL,
    target_criterion TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(30) DEFAULT 'IN_PROGRESS', -- 'NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'REVISED'
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SEN THERAPY & CLINICAL SESSION LOGS
CREATE TABLE IF NOT EXISTS public.sen_session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sen_profile_id UUID REFERENCES public.sen_student_profiles(id) ON DELETE CASCADE,
    specialist_name VARCHAR(150) NOT NULL,
    therapy_type VARCHAR(100) NOT NULL, -- 'Occupational Therapy', 'Speech & Language', 'Remedial Reading', 'Behavioral Coaching'
    session_date DATE DEFAULT CURRENT_DATE,
    duration_minutes INTEGER DEFAULT 45,
    key_observations TEXT NOT NULL,
    recommendations_for_teachers TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_pbis_tx_student ON public.pbis_point_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_pbis_tx_house ON public.pbis_point_transactions(house_code);
CREATE INDEX IF NOT EXISTS idx_sen_student ON public.sen_student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_sen_smart_goals ON public.sen_smart_goals(sen_profile_id);
