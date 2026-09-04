-- =========================================================================
-- MIGRATION 0025: PHASE 2 NEXT-GEN EDTECH, PARENT PARTNERSHIP & E-COMMERCE
-- =========================================================================

-- 1. Encrypted Parent-Teacher Direct In-App Chat
CREATE TABLE IF NOT EXISTS parent_teacher_chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(128) NOT NULL,
    grade_section VARCHAR(64) NOT NULL,
    teacher_name VARCHAR(128) NOT NULL,
    parent_name VARCHAR(128) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT true,
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unread_count_teacher INT NOT NULL DEFAULT 0,
    unread_count_parent INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_teacher_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES parent_teacher_chat_threads(id) ON DELETE CASCADE,
    sender_role VARCHAR(16) NOT NULL, -- 'TEACHER', 'PARENT'
    sender_name VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    translated_content TEXT,
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Classroom Daily Moments Social Feed
CREATE TABLE IF NOT EXISTS classroom_daily_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id VARCHAR(64) NOT NULL, -- e.g. 'Class 1-A'
    author_name VARCHAR(128) NOT NULL,
    caption TEXT NOT NULL,
    media_url TEXT NOT NULL,
    media_type VARCHAR(16) NOT NULL DEFAULT 'IMAGE', -- 'IMAGE', 'VIDEO'
    tagged_students TEXT[] DEFAULT ARRAY[]::TEXT[],
    reactions_count JSONB NOT NULL DEFAULT '{"heart": 0, "clap": 0, "celebrate": 0}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. School Store Bundles & Inventory
CREATE TABLE IF NOT EXISTS school_store_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(32) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    items_included TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    in_stock INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_store_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(64) UNIQUE NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    grade VARCHAR(32) NOT NULL,
    parent_name VARCHAR(128) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    kit_id UUID REFERENCES school_store_kits(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    pickup_slot VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'READY_FOR_PICKUP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rapid query performance
CREATE INDEX IF NOT EXISTS idx_chat_thread_student ON parent_teacher_chat_threads(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_msg_thread ON parent_teacher_chat_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_moments_class ON classroom_daily_moments(class_id, created_at);
CREATE INDEX IF NOT EXISTS idx_store_orders_grade ON school_store_orders(grade, status);
