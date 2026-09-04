-- =========================================================================
-- Migration 0031: Dynamic ERP Module Status & Global Enable/Disable Switch
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.erp_module_statuses (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    href VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    disabled_reason TEXT,
    updated_by VARCHAR(100) DEFAULT 'SUPER_ADMIN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed current active modules with default enabled = true
INSERT INTO public.erp_module_statuses (code, name, category, href, description, is_enabled)
VALUES
    ('DASHBOARD', 'Unified Command Desk', 'Governance & Overview', '/admin/dashboard', 'Executive telematics, cross-campus enrollment KPIs, and operational alerts.', true),
    ('INSTITUTIONS', 'Multi-Campus Matrix', 'Governance & Overview', '/admin/institutions', 'Multi-school configuration, school creation, campus switching, and brand settings.', true),
    ('TRUST_GOVERNANCE', 'Trust Master Governance', 'Governance & Overview', '/admin/trust', 'Central Vaani Educational Trust leadership, statutory 80G, PAN, and trust seals.', true),
    ('GOVERNANCE_MIS', 'Governance MIS Analytics', 'Governance & Overview', '/admin/reports/governance', 'Consolidated executive reports, regulatory compliance matrices, and trust benchmarks.', true),
    ('ONEROSTER_LTI', 'OneRoster & LTI 1.3 Gateway', 'Governance & Overview', '/admin/integrations/oneroster', '1EdTech OneRoster v1.2 REST endpoints & LTI 1.3 Advantage interoperability.', true),
    ('AUDIT_LOGS', 'Enterprise Audit Vault', 'Governance & Overview', '/admin/audit-logs', 'ISO 27001 & DPDP 2023 tamper-evident immutable forensic audit trails.', true),
    ('COMPLIANCE_BOARD', 'Statutory Board Exporter', 'Governance & Overview', '/admin/reports/compliance', 'CBSE OASIS, SARAS, and U-DISE+ XML/CSV automated compliance generation.', true),
    ('STUDENTS', 'Student Roster Directory', 'Students & Admissions', '/admin/students', 'Universal student registry, 360 dossiers, roll-calls, and demographic profiles.', true),
    ('ADMISSIONS', 'Enquiries & Leads', 'Students & Admissions', '/admin/admissions', 'Lead capture, Kanban enquiry pipeline, document verification, and seat allocation.', true),
    ('FAMILIES', 'Family 360° Household Master', 'Students & Admissions', '/admin/families', 'Household linking, multi-child parent directories, sibling concession links.', true),
    ('RETENTION_RADAR', 'Predictive Retention Radar', 'Students & Admissions', '/admin/students/retention', 'AI Early Warning Attrition radar tracking multi-variable withdrawal risks.', true),
    ('SEN_IEP', 'SEN & Inclusive Education Studio', 'Students & Admissions', '/admin/students/sen-iep', 'Longitudinal IEP accommodation tracking, SMART goals, and specialist logs.', true),
    ('FACULTY', 'Faculty Staff Directory', 'Academic Operations', '/admin/faculty', 'Teacher profiles, qualifications, class allocations, and police verification status.', true),
    ('ATTENDANCE', 'Daily Student Attendance', 'Academic Operations', '/admin/attendance', 'Classroom roll-call, RFID badge scan logs, leave requests, and journey tracking.', true),
    ('SUBSTITUTIONS', 'Teacher Substitutions Engine', 'Academic Operations', '/admin/faculty/substitutions', 'Automated proxy period assignment and teacher leave load-balancing.', true),
    ('CURRICULUM', 'Curriculum & Syllabus', 'Academic Operations', '/admin/curriculum', 'CBSE & Montessori learning frameworks, unit planners, and competency rubrics.', true),
    ('LESSON_DIARY', 'Teacher Lesson Diary', 'Academic Operations', '/admin/lesson-diary', 'Daily classroom teaching logs, homework broadcast, and principal sign-off.', true),
    ('TIMETABLE', 'AI Genetic Timetable & Proxy Hub', 'Academic Operations', '/admin/timetable/smart-builder', 'Evolutionary constraint solver for conflict-free period allocation.', true),
    ('EXAMS', 'Exams & Moderation', 'Academic Operations', '/admin/exams', 'Scholastic gradebooks, CBSE marks entry, report card generation, and hall tickets.', true),
    ('CBT_ARENA', 'CBT Quiz & Lockdown Arena', 'Academic Operations', '/admin/academic/quiz-arena', 'Secure browser anti-cheat computerized testing studio.', true),
    ('OMR_GRADER', 'WebRTC Camera OMR Auto-Grader', 'Academic Operations', '/admin/exams?tab=omr-grader', 'Fiducial computer vision bubble sheet evaluation.', true),
    ('RUBRICS_BUILDER', 'Assessment Rubrics Studio', 'Academic Operations', '/admin/academics/rubrics', 'NEP 2020 qualitative rubric matrix builder.', true),
    ('CALENDAR', 'Academic Calendar & Events', 'Academic Operations', '/admin/calendar', 'School term schedules, gazetted holidays, institutional event planner.', true),
    ('FINANCE', 'Executive Finance & GL', 'Finance & Procurement', '/admin/finance', 'Double-entry general ledger, revenue charts, budget forecasting, and audits.', true),
    ('FEE_COLLECTIONS', 'Fee Collections & Invoices', 'Finance & Procurement', '/admin/finance/collections', 'Quarterly billing, counter cash receipts, UPI QR verification, and arrears reconciliation.', true),
    ('FEE_STRUCTURE', 'Fee Structure & Concessions', 'Finance & Procurement', '/admin/finance/structure', 'Tuition slabs, fee heads, sibling discount rules, and trust scholarship policies.', true),
    ('HR_PAYROLL', 'HR & Statutory Payroll', 'Finance & Procurement', '/admin/hr/payroll', 'Staff biometric attendance sync, monthly salary slips, EPF, ESI, and TDS deductions.', true),
    ('PROCUREMENT', 'Spend & Procurement', 'Finance & Procurement', '/admin/procurement', 'Vendor purchase orders, quotation comparisons, and expense approvals.', true),
    ('INVENTORY', 'Fixed Asset Inventory', 'Finance & Procurement', '/admin/inventory', 'School furniture, lab equipment, IT hardware assets, and depreciation tracking.', true),
    ('TRANSPORT', 'Transport Fleet Radar', 'Campus Logistics & Safety', '/admin/transport', 'School bus telematics, route waypoints, driver allocations, and QR boarding passes.', true),
    ('GATE_SCANNER', 'Offline-First Gate Scanner', 'Campus Logistics & Safety', '/admin/gate-scanner', 'IndexedDB-queued turnstile and barcode entry scanner.', true),
    ('INCIDENTS', 'Child Safeguarding & POCSO', 'Campus Logistics & Safety', '/admin/incidents', 'Confidential incident reporting, designated safeguarding leads, and safety compliance.', true),
    ('HEALTH', 'Health Clinic Infirmary', 'Campus Logistics & Safety', '/admin/health', 'Medical health checkups, allergies, vaccination tracker, and clinic visits.', true),
    ('LIBRARY', 'Digital Library Master', 'Campus Logistics & Safety', '/admin/library', 'Book cataloging, ISBN barcode search, issue/returns, and fine management.', true),
    ('LIVE_STREAM', 'Live CCTV Security Stream', 'Campus Logistics & Safety', '/admin/live-stream', 'Authorized parental CCTV classroom streaming and security camera feeds.', true),
    ('VISITORS', 'Visitor Gate Pass', 'Campus Logistics & Safety', '/admin/visitors', 'Digital visitor check-in, photo badge printing, and escort OTP authorization.', true),
    ('EMERGENCY', 'Emergency Red Broadcast', 'Campus Logistics & Safety', '/admin/emergency', 'Instant campus lockdown alerts, SMS/WhatsApp emergency dispatches.', true),
    ('CAMPAIGNS', 'Broadcasts & Circulars', 'Parent & Community Services', '/admin/campaigns', 'Omnichannel SMS, WhatsApp, and email circular dispatches to parent cohorts.', true),
    ('PUSH_CENTER', 'Native Mobile Push Center', 'Parent & Community Services', '/admin/communications/push', 'Firebase FCM and Web Push multi-channel notification dispatcher.', true),
    ('WHATSAPP_BOT', '2-Way WhatsApp Bot Simulator', 'Parent & Community Services', '/admin/communications/whatsapp-bot', 'Conversational AI intent parser for student fees and attendance.', true),
    ('PBIS_HOUSE_CUP', 'PBIS House Cup & Pastoral Care', 'Parent & Community Services', '/admin/pastoral/house-points', 'Gamified merit points, house cup trophy standings, and MTSS pastoral support.', true),
    ('PTM', 'PTM Slot Booking', 'Parent & Community Services', '/admin/ptm', 'Parent-Teacher meeting scheduling, 15-minute slot selection, and feedback logs.', true),
    ('PARENT_CARE', 'Parent Care & Grievance SLA Hub', 'Parent & Community Services', '/admin/parent-care', 'Ticketing system for parent concerns, SLA tracking, and resolution history.', true),
    ('EARLY_DEPARTURE', 'Early Departure Passes', 'Parent & Community Services', '/admin/early-departure', 'Gate security clearance QR codes for early student pickups.', true),
    ('CMS', 'Website CMS & News', 'Parent & Community Services', '/admin/cms', 'Public portal content editor, photo gallery updates, and notice board.', true),
    ('IAM', 'Identity & Access (IAM)', 'System & Security', '/admin/iam', 'Super Admin module access selector, RBAC matrix, and staff overrides.', true),
    ('DATA_QUALITY', 'Data Quality & Integrity', 'System & Security', '/admin/data-quality', 'Automated database schema audits and orphan record resolution.', true)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    href = EXCLUDED.href,
    description = EXCLUDED.description;
