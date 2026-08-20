-- 0012_fee_invoice_refactor.sql
-- Refactoring to support per-head due dates, discounts, and auto-late fees embedded in Invoices.

CREATE TABLE IF NOT EXISTS public.student_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    student_id UUID NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    billing_period VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_late_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Unpaid', -- 'Unpaid', 'Partial', 'Paid', 'Overdue', 'Cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.student_invoices(id) ON DELETE CASCADE,
    fee_head_id UUID NOT NULL REFERENCES public.fee_heads(id),
    base_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    late_fee_amount DECIMAL(10, 2) DEFAULT 0,
    auto_late_fee_daily_rate DECIMAL(10, 2) DEFAULT 0, -- Used by cron to add late fees automatically after due_date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access invoices" ON public.student_invoices;
CREATE POLICY "Admins full access invoices" ON public.student_invoices USING (auth.jwt()->>'role' = 'admin');
DROP POLICY IF EXISTS "Admins full access invoice_items" ON public.student_invoice_items;
CREATE POLICY "Admins full access invoice_items" ON public.student_invoice_items USING (auth.jwt()->>'role' = 'admin');
