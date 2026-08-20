-- Phase 1: Enterprise Fee Management ERP Schema Upgrade

-- 1. fee_heads
CREATE TABLE IF NOT EXISTS public.fee_heads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL, -- 'Tuition Fee', 'Transport', 'Exam Fee'
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_refundable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. fee_templates
CREATE TABLE IF NOT EXISTS public.fee_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., 'Grade 5 Default Template'
    academic_year VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. fee_template_items
CREATE TABLE IF NOT EXISTS public.fee_template_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES public.fee_templates(id) ON DELETE CASCADE,
    fee_head_id UUID NOT NULL REFERENCES public.fee_heads(id),
    amount DECIMAL(10, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- 'Monthly', 'Quarterly', 'Annually', 'One-time'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. fee_late_rules
CREATE TABLE IF NOT EXISTS public.fee_late_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    fee_head_id UUID REFERENCES public.fee_heads(id), -- Optional: if null, applies to all
    rule_type VARCHAR(50) NOT NULL, -- 'Daily', 'Monthly', 'Fixed', 'Percentage'
    amount_or_percentage DECIMAL(10, 2) NOT NULL,
    grace_period_days INT DEFAULT 0,
    max_late_fee_limit DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. discounts_and_waivers
CREATE TABLE IF NOT EXISTS public.discounts_and_waivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    student_id UUID NOT NULL,
    fee_head_id UUID REFERENCES public.fee_heads(id), -- Optional: if null, applies to total
    discount_type VARCHAR(50) NOT NULL, -- 'Fixed', 'Percentage'
    value DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    approved_by UUID, -- The admin who approved it
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. payment_modes
CREATE TABLE IF NOT EXISTS public.payment_modes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL, -- 'Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Gateway'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. student_fee_ledgers
-- This double-entry inspired table provides a complete history for each student
CREATE TABLE IF NOT EXISTS public.student_fee_ledgers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    student_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'Charge', 'Payment', 'Discount', 'LateFee', 'Refund', 'CarryForward'
    fee_head_id UUID REFERENCES public.fee_heads(id), -- What this transaction relates to
    amount DECIMAL(10, 2) NOT NULL, -- Positive for Charges/LateFees, Negative for Payments/Discounts/Refunds
    running_balance DECIMAL(10, 2) NOT NULL, -- Calculated running balance
    reference_id UUID, -- Links to invoice_id, receipt_id, or refund_id depending on type
    payment_mode_id UUID REFERENCES public.payment_modes(id), -- Only for 'Payment'
    remarks TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID -- Admin who recorded it, or null if system generated
);

-- 8. refunds
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    student_id UUID NOT NULL,
    ledger_reference_id UUID NOT NULL REFERENCES public.student_fee_ledgers(id),
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    approved_by UUID,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Processed', 'Rejected'
    processed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Who performed the action
    action VARCHAR(255) NOT NULL, -- 'GENERATED_INVOICE', 'WAIVED_LATE_FEE', 'PROCESSED_REFUND'
    entity_type VARCHAR(50) NOT NULL, -- 'Invoice', 'Ledger', 'Refund'
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies Setup

ALTER TABLE public.fee_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_late_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts_and_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins full access
DROP POLICY IF EXISTS "Admins full access fee_heads" ON public.fee_heads;
CREATE POLICY "Admins full access fee_heads" ON public.fee_heads USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access fee_templates" ON public.fee_templates;
CREATE POLICY "Admins full access fee_templates" ON public.fee_templates USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access fee_template_items" ON public.fee_template_items;
CREATE POLICY "Admins full access fee_template_items" ON public.fee_template_items USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access fee_late_rules" ON public.fee_late_rules;
CREATE POLICY "Admins full access fee_late_rules" ON public.fee_late_rules USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access discounts_and_waivers" ON public.discounts_and_waivers;
CREATE POLICY "Admins full access discounts_and_waivers" ON public.discounts_and_waivers USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access payment_modes" ON public.payment_modes;
CREATE POLICY "Admins full access payment_modes" ON public.payment_modes USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access student_fee_ledgers" ON public.student_fee_ledgers;
CREATE POLICY "Admins full access student_fee_ledgers" ON public.student_fee_ledgers USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access refunds" ON public.refunds;
CREATE POLICY "Admins full access refunds" ON public.refunds USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access audit_logs" ON public.audit_logs;
CREATE POLICY "Admins full access audit_logs" ON public.audit_logs USING (auth.jwt()->>'role' = 'admin');

-- Parents can view their own ledger and refunds (Mocking parent link via auth.uid() = student_id or similar, keeping it simple)
DROP POLICY IF EXISTS "Parents view own ledger" ON public.student_fee_ledgers;
CREATE POLICY "Parents view own ledger" ON public.student_fee_ledgers FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Parents view own refunds" ON public.refunds;
CREATE POLICY "Parents view own refunds" ON public.refunds FOR SELECT USING (auth.uid() = student_id);


