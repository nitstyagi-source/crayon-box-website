-- =========================================================================
-- MIGRATION 0029: ENHANCE PTM APPOINTMENT SCHEDULER
-- =========================================================================

-- Enhance existing ptm_slots with status, slot_start, and session_id
ALTER TABLE public.ptm_slots
ADD COLUMN IF NOT EXISTS status VARCHAR(16) DEFAULT 'AVAILABLE',
ADD COLUMN IF NOT EXISTS slot_start TIME,
ADD COLUMN IF NOT EXISTS slot_end TIME,
ADD COLUMN IF NOT EXISTS meeting_mode VARCHAR(16) DEFAULT 'IN_PERSON';

-- Create ptm_sessions if not existing
CREATE TABLE IF NOT EXISTS public.ptm_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID,
    title VARCHAR(128) NOT NULL,
    session_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '3 days'),
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '14:00:00',
    slot_duration_mins INT NOT NULL DEFAULT 15,
    buffer_mins INT NOT NULL DEFAULT 5,
    mode VARCHAR(16) NOT NULL DEFAULT 'IN_PERSON',
    status VARCHAR(16) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ptm_slots_date ON public.ptm_slots(event_date, is_booked);
CREATE INDEX IF NOT EXISTS idx_ptm_slots_teacher_name ON public.ptm_slots(teacher_name);
