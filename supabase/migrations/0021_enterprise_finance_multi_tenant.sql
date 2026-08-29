-- Phase F: Fees & Finance Engine (Multi-Tenant Hardening)
-- Injecting institution_code boundaries into all finance tables

-- 1. Add institution_code to Master Configs
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.fee_heads ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.fee_templates ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.fee_late_rules ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.discounts_and_waivers ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.payment_modes ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';

-- 2. Add institution_code to Transactional Data
ALTER TABLE public.student_fee_configs ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.student_invoices ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.student_fee_ledgers ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.refunds ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';

-- Note: invoice_items and fee_template_items inherit isolation from their parent records (invoices, fee_templates),
-- but we can add institution_code to them as well for redundancy if needed. Keeping it normalized for now.

-- 3. Create Multi-Tenant Indexes for Performance & Security
CREATE INDEX IF NOT EXISTS idx_fee_heads_inst ON public.fee_heads(institution_code);
CREATE INDEX IF NOT EXISTS idx_fee_templates_inst ON public.fee_templates(institution_code);
CREATE INDEX IF NOT EXISTS idx_invoices_inst ON public.invoices(institution_code, student_id, status);
CREATE INDEX IF NOT EXISTS idx_student_invoices_inst ON public.student_invoices(institution_code, student_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_inst ON public.transactions(institution_code, student_id, status);
CREATE INDEX IF NOT EXISTS idx_student_fee_ledgers_inst ON public.student_fee_ledgers(institution_code, student_id);

-- 4. Enable RLS
ALTER TABLE public.fee_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_ledgers ENABLE ROW LEVEL SECURITY;

-- 5. Define Security Policies
-- Superadmins can manage everything
DROP POLICY IF EXISTS "Superadmins manage fee_heads" ON public.fee_heads;
CREATE POLICY "Superadmins manage fee_heads" ON public.fee_heads FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage fee_templates" ON public.fee_templates;
CREATE POLICY "Superadmins manage fee_templates" ON public.fee_templates FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage invoices" ON public.invoices;
CREATE POLICY "Superadmins manage invoices" ON public.invoices FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage transactions" ON public.transactions;
CREATE POLICY "Superadmins manage transactions" ON public.transactions FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage ledgers" ON public.student_fee_ledgers;
CREATE POLICY "Superadmins manage ledgers" ON public.student_fee_ledgers FOR ALL USING (is_superadmin());

-- Staff can view/manage financial data restricted to their institution
DROP POLICY IF EXISTS "Staff manage institution invoices" ON public.invoices;
CREATE POLICY "Staff manage institution invoices" ON public.invoices FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = invoices.institution_code)
);

DROP POLICY IF EXISTS "Staff manage institution transactions" ON public.transactions;
CREATE POLICY "Staff manage institution transactions" ON public.transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = transactions.institution_code)
);

DROP POLICY IF EXISTS "Staff manage institution fee configs" ON public.fee_heads;
CREATE POLICY "Staff manage institution fee configs" ON public.fee_heads FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = fee_heads.institution_code)
);

-- Students/Parents can view their own financial data
DROP POLICY IF EXISTS "Students view own invoices" ON public.invoices;
CREATE POLICY "Students view own invoices" ON public.invoices FOR SELECT USING (
    student_id = auth.uid()
);

DROP POLICY IF EXISTS "Students view own transactions" ON public.transactions;
CREATE POLICY "Students view own transactions" ON public.transactions FOR SELECT USING (
    student_id = auth.uid()
);

DROP POLICY IF EXISTS "Students view own ledgers" ON public.student_fee_ledgers;
CREATE POLICY "Students view own ledgers" ON public.student_fee_ledgers FOR SELECT USING (
    student_id = auth.uid()
);
