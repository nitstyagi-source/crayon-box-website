-- 0032_mobile_app_iam_matrix.sql
-- Extend erp_module_statuses for mobile app configurability and dynamic persona assignment

ALTER TABLE public.erp_module_statuses
  ADD COLUMN IF NOT EXISTS mobile_enabled BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS mobile_persona VARCHAR(50) DEFAULT 'ALL' NOT NULL,
  ADD COLUMN IF NOT EXISTS mobile_icon VARCHAR(50) DEFAULT 'Layers',
  ADD COLUMN IF NOT EXISTS mobile_route VARCHAR(100) DEFAULT 'Dashboard';

-- =========================================================================
-- Unified Family & Student Persona Modules
-- =========================================================================
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Users', mobile_route = 'Attendance' WHERE code = 'ATTENDANCE';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'BookOpen', mobile_route = 'DigitalDiary' WHERE code = 'LESSON_DIARY';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'CreditCard', mobile_route = 'Fees' WHERE code = 'FEE_COLLECTIONS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Calendar', mobile_route = 'Timetable' WHERE code = 'TIMETABLE';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'FileText', mobile_route = 'ReportCard' WHERE code = 'EXAMS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Award', mobile_route = 'QuizArena' WHERE code = 'PBIS_HOUSE_CUP';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Book', mobile_route = 'LibraryOpac' WHERE code = 'LIBRARY';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Video', mobile_route = 'LiveCctv' WHERE code = 'LIVE_STREAM';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Bus', mobile_route = 'BusTracker' WHERE code = 'TRANSPORT';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Calendar', mobile_route = 'PtmBooking' WHERE code = 'PTM';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'MessageSquare', mobile_route = 'GrievanceDesk' WHERE code = 'PARENT_CARE';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Bell', mobile_route = 'CampaignsCirculars' WHERE code = 'CAMPAIGNS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Clock', mobile_route = 'EarlyDeparture' WHERE code = 'EARLY_DEPARTURE';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'HelpCircle', mobile_route = 'QuizArena' WHERE code = 'CBT_ARENA';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'CalendarDays', mobile_route = 'AcademicCalendar' WHERE code = 'CALENDAR';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'HeartHandshake', mobile_route = 'Family360' WHERE code = 'FAMILIES';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FAMILY_STUDENT', mobile_icon = 'Newspaper', mobile_route = 'CmsNews' WHERE code = 'CMS';

-- =========================================================================
-- Dynamic Faculty Persona Modules
-- =========================================================================
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FACULTY', mobile_icon = 'CheckSquare', mobile_route = 'AttendanceRegister' WHERE code = 'STUDENTS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FACULTY', mobile_icon = 'BookOpenCheck', mobile_route = 'HomeworkPublisher' WHERE code = 'CURRICULUM';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FACULTY', mobile_icon = 'Shuffle', mobile_route = 'Substitutions' WHERE code = 'SUBSTITUTIONS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FACULTY', mobile_icon = 'GraduationCap', mobile_route = 'ExamsGradebook' WHERE code = 'RUBRICS_BUILDER';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FACULTY', mobile_icon = 'ScanLine', mobile_route = 'AttendanceScanner' WHERE code = 'OMR_GRADER';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FACULTY', mobile_icon = 'AlertTriangle', mobile_route = 'SafeguardingIncidents' WHERE code = 'INCIDENTS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'FACULTY', mobile_icon = 'Activity', mobile_route = 'HealthClinic' WHERE code = 'HEALTH';
UPDATE public.erp_module_statuses SET mobile_persona = 'FACULTY', mobile_icon = 'UserCheck', mobile_route = 'HRDashboard' WHERE code = 'FACULTY';
UPDATE public.erp_module_statuses SET mobile_persona = 'FACULTY', mobile_icon = 'HeartPulse', mobile_route = 'Family360' WHERE code = 'SEN_IEP';

-- =========================================================================
-- Logistics & Security Persona Modules
-- =========================================================================
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'LOGISTICS_SECURITY', mobile_icon = 'Radio', mobile_route = 'DriverCockpit' WHERE code = 'GATE_SCANNER';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'LOGISTICS_SECURITY', mobile_icon = 'QrCode', mobile_route = 'IdCardScanner' WHERE code = 'VISITORS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'LOGISTICS_SECURITY', mobile_icon = 'Siren', mobile_route = 'EmergencyBroadcast' WHERE code = 'EMERGENCY';

-- =========================================================================
-- Admin / Global Operations Mobile Modules
-- =========================================================================
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'Building2', mobile_route = 'Governance' WHERE code = 'TRUST_GOVERNANCE';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'FileSpreadsheet', mobile_route = 'AccountsDashboard' WHERE code = 'FINANCE';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'Coins', mobile_route = 'FeeStructure' WHERE code = 'FEE_STRUCTURE';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'Package', mobile_route = 'AssetInventory' WHERE code = 'INVENTORY';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'ShoppingBag', mobile_route = 'Procurement' WHERE code = 'PROCUREMENT';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'Users', mobile_route = 'AdmissionsCrm' WHERE code = 'ADMISSIONS';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'TrendingUp', mobile_route = 'AdmissionsAnalytics' WHERE code = 'RETENTION_RADAR';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'ShieldCheck', mobile_route = 'IamMatrix' WHERE code = 'IAM';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'MessageCircle', mobile_route = 'WhatsAppBroadcast' WHERE code = 'WHATSAPP_BOT';
UPDATE public.erp_module_statuses SET mobile_enabled = true, mobile_persona = 'ADMIN_ALL', mobile_icon = 'Send', mobile_route = 'CampaignsCirculars' WHERE code = 'PUSH_CENTER';

