-- =========================================================================
-- MIGRATION 0026: PHASE 3 ENTERPRISE AI & AUTONOMOUS HARDWARE SYNC
-- =========================================================================

-- 1. Longitudinal Board Exam Predictive Analytics & Remedial Engine
CREATE TABLE IF NOT EXISTS student_board_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(128) NOT NULL,
    admission_no VARCHAR(64) NOT NULL,
    grade_section VARCHAR(64) NOT NULL,
    current_term_pct NUMERIC(5, 2) NOT NULL,
    periodic_test_avg NUMERIC(5, 2) NOT NULL,
    mock_board_pct NUMERIC(5, 2) NOT NULL,
    predicted_cbse_pct NUMERIC(5, 2) NOT NULL,
    confidence_interval NUMERIC(4, 2) NOT NULL DEFAULT 3.5,
    risk_category VARCHAR(32) NOT NULL DEFAULT 'BORDERLINE', -- 'CRITICAL_REMEDIAL', 'BORDERLINE', 'HONORS_TRACK'
    subject_forecast JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_remedial_recommendation TEXT,
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AI Predictive Admissions Lead Scoring
CREATE TABLE IF NOT EXISTS admissions_lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
    parent_name VARCHAR(128) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    grade_applying VARCHAR(32) NOT NULL,
    lead_source VARCHAR(64) NOT NULL,
    conversion_score INT NOT NULL DEFAULT 50, -- 0-100
    score_tier VARCHAR(16) NOT NULL DEFAULT 'WARM', -- 'HOT', 'WARM', 'COLD'
    key_drivers JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_recommended_action TEXT NOT NULL,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Computer-Based Testing (CBT) & Browser Lockdown Proctored Engine
CREATE TABLE IF NOT EXISTS cbt_exam_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(64) NOT NULL,
    grade VARCHAR(32) NOT NULL,
    exam_type VARCHAR(32) NOT NULL DEFAULT 'CBSE_BOARD_MOCK', -- 'JEE_MAIN', 'NEET', 'CBSE_BOARD_MOCK'
    duration_minutes INT NOT NULL DEFAULT 180,
    total_marks INT NOT NULL DEFAULT 100,
    is_lockdown_enabled BOOLEAN NOT NULL DEFAULT true,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cbt_exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES cbt_exam_templates(id) ON DELETE CASCADE,
    student_name VARCHAR(128) NOT NULL,
    admission_no VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'SUBMITTED', 'DISQUALIFIED'
    tab_switch_violations INT NOT NULL DEFAULT 0,
    fullscreen_violations INT NOT NULL DEFAULT 0,
    proctor_flags INT NOT NULL DEFAULT 0,
    current_score INT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- 4. Turnstile UHF-RFID Gate Hardware Controller & Biometric Sync
CREATE TABLE IF NOT EXISTS turnstile_gate_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name VARCHAR(128) NOT NULL,
    gate_zone VARCHAR(64) NOT NULL, -- e.g. 'Main Academic Turnstile A', 'Junior Wing Gate 2'
    ip_address VARCHAR(45) NOT NULL,
    protocol VARCHAR(16) NOT NULL DEFAULT 'TCP_IP', -- 'TCP_IP', 'MQTT', 'WIEGAND_485'
    hardware_status VARCHAR(16) NOT NULL DEFAULT 'ONLINE', -- 'ONLINE', 'OFFLINE', 'MAINTENANCE'
    lockdown_active BOOLEAN NOT NULL DEFAULT false,
    free_egress_mode BOOLEAN NOT NULL DEFAULT false,
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turnstile_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES turnstile_gate_devices(id) ON DELETE SET NULL,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    user_type VARCHAR(32) NOT NULL, -- 'STUDENT', 'STAFF', 'VISITOR'
    auth_method VARCHAR(32) NOT NULL, -- 'UHF_RFID_TAP', 'FACE_BIOMETRIC', 'QR_PASS'
    direction VARCHAR(8) NOT NULL, -- 'IN', 'OUT'
    verification_latency_ms INT NOT NULL DEFAULT 185,
    anti_passback_ok BOOLEAN NOT NULL DEFAULT true,
    passed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
