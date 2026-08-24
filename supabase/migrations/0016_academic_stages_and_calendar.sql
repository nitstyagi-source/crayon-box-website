-- ==============================================================================
-- 0016_academic_stages_and_calendar.sql
-- Vani Educational Trust V2 ERP — 5-Stage Adaptive Academic Engine & Calendar
-- ==============================================================================

-- 1. Academic Stages Table
CREATE TABLE IF NOT EXISTS public.academic_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'FOUNDATION' | 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR_SECONDARY'
    name VARCHAR(100) NOT NULL,
    grade_range VARCHAR(100) NOT NULL,
    assessment_model VARCHAR(50) NOT NULL, -- 'DEVELOPMENTAL_MILESTONES' | 'FORMATIVE_SUMMATIVE' | 'CBSE_BOARD'
    pedagogy_type VARCHAR(100) NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed 5 Adaptive Academic Stages
INSERT INTO public.academic_stages (code, name, grade_range, assessment_model, pedagogy_type, order_index)
VALUES 
    ('FOUNDATION', 'Foundation Stage (Early Childhood)', 'Pre-Nursery to Class 2', 'DEVELOPMENTAL_MILESTONES', 'Montessori / Activity-Based Sensory Learning', 1),
    ('PRIMARY', 'Primary Stage', 'Class 3 to Class 5', 'FORMATIVE_SUMMATIVE', 'Thematic & Experiential Foundation', 2),
    ('MIDDLE', 'Middle Stage', 'Class 6 to Class 8', 'FORMATIVE_SUMMATIVE', 'Subject-Led Experiential Science & Math', 3),
    ('SECONDARY', 'Secondary Stage', 'Class 9 to Class 10', 'CBSE_BOARD', 'CBSE Core Curriculum & Board Exam Prep', 4),
    ('SENIOR_SECONDARY', 'Senior Secondary Stage', 'Class 11 to Class 12', 'CBSE_BOARD', 'Specialized Stream Focus (PCM, PCB, Commerce, Humanities)', 5)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    grade_range = EXCLUDED.grade_range,
    assessment_model = EXCLUDED.assessment_model,
    pedagogy_type = EXCLUDED.pedagogy_type;

-- 2. Master Working Calendar Holidays Table
CREATE TABLE IF NOT EXISTS public.trust_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_code VARCHAR(20) DEFAULT 'ALL',
    event_title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'GAZETTED_HOLIDAY' | 'VACATION' | 'EXAMINATION' | 'PTM' | 'SPORTS_EVENT'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_instructional_day BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.academic_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for academic stages" ON public.academic_stages FOR SELECT USING (true);
CREATE POLICY "Allow public read for calendar events" ON public.trust_calendar_events FOR SELECT USING (true);
