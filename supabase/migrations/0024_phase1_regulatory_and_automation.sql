-- =========================================================================
-- MIGRATION 0024: PHASE 1 REGULATORY, E-COLLECT & HIGH-VOLUME AUTOMATION
-- =========================================================================

-- 1. Student Bank Virtual Accounts (VAN for ICICI/HDFC e-Collect)
CREATE TABLE IF NOT EXISTS student_virtual_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    van_account_number VARCHAR(64) UNIQUE NOT NULL,
    ifsc_code VARCHAR(16) NOT NULL DEFAULT 'ICIC0000104',
    bank_name VARCHAR(64) NOT NULL DEFAULT 'ICICI Bank',
    upi_vpa VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Inbound Bank Webhook Logs (Automated NEFT/RTGS/IMPS Reconciliation)
CREATE TABLE IF NOT EXISTS bank_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(32) NOT NULL, -- 'ICICI_ECOLLECT', 'HDFC_SMART_HUB', 'AXIS_VAN'
    transaction_ref VARCHAR(128) UNIQUE NOT NULL,
    van_account_number VARCHAR(64) NOT NULL,
    amount_received NUMERIC(12, 2) NOT NULL,
    remitter_name VARCHAR(128),
    remitter_account VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'PROCESSED', -- 'PROCESSED', 'FAILED', 'MANUAL_REVIEW'
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CBSE Mandatory 50-Hour Teacher Continuous Professional Development (CPD)
CREATE TABLE IF NOT EXISTS teacher_cpd_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
    academic_year VARCHAR(16) NOT NULL DEFAULT '2026-2027',
    workshop_title VARCHAR(255) NOT NULL,
    conducting_agency VARCHAR(128) NOT NULL, -- 'CBSE_COE', 'NCERT', 'SAHODAYA', 'INTERNAL'
    hours_credited NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    certificate_url TEXT,
    approval_status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Transport Real-Time Geofence Arrival Logs
CREATE TABLE IF NOT EXISTS transport_geofence_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID REFERENCES transport_buses(id) ON DELETE CASCADE,
    stop_name VARCHAR(128) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    distance_km NUMERIC(5, 2) NOT NULL,
    eta_minutes INT NOT NULL,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'DELIVERED'
);

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_student_van ON student_virtual_accounts(van_account_number);
CREATE INDEX IF NOT EXISTS idx_webhook_trans_ref ON bank_webhook_logs(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_teacher_cpd_year ON teacher_cpd_records(academic_year, teacher_id);
CREATE INDEX IF NOT EXISTS idx_geofence_bus ON transport_geofence_alerts(bus_id, dispatched_at);
