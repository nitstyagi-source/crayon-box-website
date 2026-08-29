-- Phase G: HR & Payroll Engine (Multi-Tenant Hardening)

-- 1. Create missing staff_monthly_payslips table
CREATE TABLE IF NOT EXISTS public.staff_monthly_payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS',
    payroll_month VARCHAR(20) NOT NULL,
    academic_session VARCHAR(20),
    
    -- Snapshot fields for historical accuracy
    staff_name VARCHAR(255),
    designation VARCHAR(100),
    department VARCHAR(100),
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(50),
    bank_ifsc VARCHAR(20),
    pan_number VARCHAR(20),
    uan_number VARCHAR(30),
    
    total_working_days INT DEFAULT 30,
    present_days INT DEFAULT 30,
    lwp_days INT DEFAULT 0,
    
    basic_salary DECIMAL(10,2) DEFAULT 0,
    hra DECIMAL(10,2) DEFAULT 0,
    conveyance DECIMAL(10,2) DEFAULT 0,
    special_allowance DECIMAL(10,2) DEFAULT 0,
    gross_earnings DECIMAL(10,2) DEFAULT 0,
    
    epf_deduction DECIMAL(10,2) DEFAULT 0,
    esic_deduction DECIMAL(10,2) DEFAULT 0,
    prof_tax_deduction DECIMAL(10,2) DEFAULT 0,
    tds_deduction DECIMAL(10,2) DEFAULT 0,
    advance_deduction DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    
    net_payable DECIMAL(10,2) NOT NULL,
    net_payable_words TEXT,
    
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_date DATE,
    transaction_ref VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, payroll_month)
);

CREATE INDEX IF NOT EXISTS idx_payslips_inst ON public.staff_monthly_payslips(institution_code, staff_id, payroll_month);

-- 2. Alter existing payroll_ledgers table
ALTER TABLE public.payroll_ledgers ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
CREATE INDEX IF NOT EXISTS idx_payroll_ledgers_inst ON public.payroll_ledgers(institution_code, staff_id, month);

-- 3. Enable RLS
ALTER TABLE public.staff_monthly_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_ledgers ENABLE ROW LEVEL SECURITY;

-- 4. Define Security Policies
-- Superadmins manage all
DROP POLICY IF EXISTS "Superadmins manage payslips" ON public.staff_monthly_payslips;
CREATE POLICY "Superadmins manage payslips" ON public.staff_monthly_payslips FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage ledgers" ON public.payroll_ledgers;
CREATE POLICY "Superadmins manage ledgers" ON public.payroll_ledgers FOR ALL USING (is_superadmin());

-- HR / Principals manage their institution
DROP POLICY IF EXISTS "Staff manage institution payslips" ON public.staff_monthly_payslips;
CREATE POLICY "Staff manage institution payslips" ON public.staff_monthly_payslips FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = staff_monthly_payslips.institution_code)
);

DROP POLICY IF EXISTS "Staff manage institution ledgers" ON public.payroll_ledgers;
CREATE POLICY "Staff manage institution ledgers" ON public.payroll_ledgers FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = payroll_ledgers.institution_code)
);

-- Staff view their own payslips
DROP POLICY IF EXISTS "Staff view own payslips" ON public.staff_monthly_payslips;
CREATE POLICY "Staff view own payslips" ON public.staff_monthly_payslips FOR SELECT USING (
    staff_id = auth.uid()
);

DROP POLICY IF EXISTS "Staff view own ledgers" ON public.payroll_ledgers;
CREATE POLICY "Staff view own ledgers" ON public.payroll_ledgers FOR SELECT USING (
    staff_id = auth.uid()
);
