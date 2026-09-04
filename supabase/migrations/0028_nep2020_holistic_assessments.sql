-- =========================================================================
-- MIGRATION 0028: CBSE NEP 2020 HOLISTIC PROGRESS CARD & RUBRICS
-- =========================================================================

-- 1. Multidimensional Assessment Rubrics
CREATE TABLE IF NOT EXISTS public.assessment_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID,
    name VARCHAR(128) NOT NULL, -- e.g. 'CBSE NEP 2020 Middle School Holistic Rubric'
    grade_level VARCHAR(32) NOT NULL DEFAULT 'All Grades',
    domain VARCHAR(32) NOT NULL, -- 'COGNITIVE', 'AFFECTIVE', 'PSYCHOMOTOR', 'SOCIO_EMOTIONAL'
    competency_name VARCHAR(128) NOT NULL, -- e.g. 'Critical Inquiry & Scientific Temperament'
    descriptors JSONB NOT NULL DEFAULT '[
        {"level": 1, "title": "Emerging", "description": "Requires continuous guidance and modeling."},
        {"level": 2, "title": "Developing", "description": "Applies concepts with occasional scaffolding."},
        {"level": 3, "title": "Proficient", "description": "Demonstrates independent mastery with high consistency."},
        {"level": 4, "title": "Exemplary", "description": "Synthesizes concepts creatively and mentors peers."}
    ]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 360-Degree Holistic Competency Evaluations (Self, Peer, Teacher, Parent)
CREATE TABLE IF NOT EXISTS public.student_competency_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(128) NOT NULL,
    academic_year VARCHAR(16) NOT NULL DEFAULT '2026-2027',
    term VARCHAR(32) NOT NULL DEFAULT 'Term 1',
    evaluator_type VARCHAR(16) NOT NULL, -- 'TEACHER', 'SELF', 'PEER', 'PARENT'
    evaluator_name VARCHAR(128) NOT NULL,
    domain VARCHAR(32) NOT NULL, -- 'COGNITIVE', 'AFFECTIVE', 'PSYCHOMOTOR', 'SOCIO_EMOTIONAL'
    competency VARCHAR(128) NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 4), -- 1: Emerging, 2: Developing, 3: Proficient, 4: Exemplary
    evidence_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Student Experiential Portfolios & Artifacts
CREATE TABLE IF NOT EXISTS public.student_learning_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(128) NOT NULL,
    grade_section VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    learning_outcome_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    artifact_url TEXT,
    reflection_notes TEXT,
    teacher_endorsement BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hpc_student ON public.student_competency_evaluations(student_id, academic_year, term);
CREATE INDEX IF NOT EXISTS idx_hpc_evaluator ON public.student_competency_evaluations(evaluator_type, domain);
CREATE INDEX IF NOT EXISTS idx_portfolio_student ON public.student_learning_portfolios(student_id);
