-- =============================================================================
-- Migration 0019: Enterprise Lifecycle, Maker-Checker Approvals & Multi-Tenant Indexes
-- Vaani Educational Trust School ERP
-- =============================================================================

-- 1. MAKER-CHECKER APPROVAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS',
    request_type VARCHAR(50) NOT NULL, -- 'FEE_CONCESSION', 'FEE_REFUND', 'STUDENT_PROFILE_CHANGE', 'SALARY_MODIFICATION', 'TC_ISSUANCE', 'STAFF_LEAVE'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL, -- 'STUDENT', 'STAFF', 'INVOICE', 'EXPENSE'
    entity_id VARCHAR(100) NOT NULL,
    entity_name VARCHAR(255),
    requested_by_id UUID,
    requested_by_name VARCHAR(255) NOT NULL,
    requested_by_role VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    diff_payload JSONB DEFAULT '{}'::jsonb,
    evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    reviewed_by_id UUID,
    reviewed_by_name VARCHAR(255),
    reviewer_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STUDENT LIFECYCLE HISTORY TABLE
CREATE TABLE IF NOT EXISTS student_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    universal_id VARCHAR(50) NOT NULL,
    institution_code VARCHAR(20) NOT NULL,
    campus_id UUID,
    from_state VARCHAR(50) NOT NULL,
    to_state VARCHAR(50) NOT NULL, -- 'ENQUIRY', 'APPLICATION', 'ADMISSION', 'ACTIVE', 'PROMOTED', 'TRANSFERRED', 'WITHDRAWN', 'ALUMNI', 'READMITTED'
    academic_session VARCHAR(50) NOT NULL,
    class_name VARCHAR(50),
    section_name VARCHAR(50),
    action_by VARCHAR(255) NOT NULL,
    remarks TEXT,
    snapshot_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HELPDESK & COMPLAINT ESCALATION TICKETS TABLE
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS',
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'ACADEMIC', 'FEES', 'TRANSPORT', 'INFIRMARY', 'IT_SUPPORT', 'GENERAL'
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    raised_by_role VARCHAR(50) NOT NULL, -- 'PARENT', 'STUDENT', 'STAFF', 'TEACHER'
    raised_by_name VARCHAR(255) NOT NULL,
    raised_by_phone VARCHAR(50),
    student_id UUID,
    student_name VARCHAR(255),
    assigned_to_id UUID,
    assigned_to_name VARCHAR(255),
    assigned_department VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    sla_due_date TIMESTAMPTZ,
    resolution_notes TEXT,
    parent_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 4. PERFORMANCE & MULTI-TENANT COMPOSITE INDEXES
CREATE INDEX IF NOT EXISTS idx_approval_requests_inst_status ON approval_requests(institution_code, status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_universal ON student_lifecycle_history(universal_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_student_session ON student_lifecycle_history(student_id, academic_session);
CREATE INDEX IF NOT EXISTS idx_helpdesk_inst_status ON helpdesk_tickets(institution_code, status);
