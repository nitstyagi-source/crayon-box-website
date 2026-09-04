-- =========================================================================
-- MIGRATION 0027: ENTERPRISE AUDIT TRAILS, GOVERNANCE & AUTOMATED FEE FINES
-- =========================================================================

-- 1. Extend audit_logs table to support Enterprise Compliance
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS actor_role VARCHAR(64) DEFAULT 'SYSTEM',
ADD COLUMN IF NOT EXISTS actor_name VARCHAR(128) DEFAULT 'System Agent',
ADD COLUMN IF NOT EXISTS changed_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS severity VARCHAR(16) DEFAULT 'INFO';

-- Indexes for audit queries & compliance filtering
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_role, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON public.audit_logs(severity);

-- 2. Enhance student_invoices with dynamic fine rules
ALTER TABLE public.student_invoices 
ADD COLUMN IF NOT EXISTS grace_period_days INT DEFAULT 7,
ADD COLUMN IF NOT EXISTS daily_fine_rate NUMERIC(8, 2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS max_fine_cap NUMERIC(10, 2) DEFAULT 2500.00,
ADD COLUMN IF NOT EXISTS fine_calculated_at TIMESTAMPTZ;

-- 3. Automated function to recalculate overdue late fee fines
CREATE OR REPLACE FUNCTION public.calculate_overdue_fines()
RETURNS TABLE (
    invoices_checked INT,
    fines_applied_count INT,
    total_fines_accumulated NUMERIC
) AS $$
DECLARE
    v_checked INT := 0;
    v_applied INT := 0;
    v_total NUMERIC := 0.00;
    r RECORD;
    v_days_overdue INT;
    v_fine NUMERIC;
BEGIN
    FOR r IN 
        SELECT id, due_date, grace_period_days, daily_fine_rate, max_fine_cap, total_amount, total_discount, amount_paid, total_late_fee
        FROM public.student_invoices
        WHERE status IN ('UNPAID', 'PARTIAL', 'OVERDUE') 
          AND due_date + (COALESCE(grace_period_days, 7) || ' days')::INTERVAL < NOW()
    LOOP
        v_checked := v_checked + 1;
        -- Days past grace period
        v_days_overdue := GREATEST(0, EXTRACT(DAY FROM (NOW() - (r.due_date + (COALESCE(r.grace_period_days, 7) || ' days')::INTERVAL)))::INT);
        
        IF v_days_overdue > 0 THEN
            v_fine := LEAST(COALESCE(r.max_fine_cap, 2500.00), v_days_overdue * COALESCE(r.daily_fine_rate, 50.00));
            
            IF v_fine > COALESCE(r.total_late_fee, 0) THEN
                UPDATE public.student_invoices
                SET total_late_fee = v_fine,
                    fine_calculated_at = NOW(),
                    status = 'OVERDUE'
                WHERE id = r.id;
                
                v_applied := v_applied + 1;
                v_total := v_total + (v_fine - COALESCE(r.total_late_fee, 0));
            END IF;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT v_checked, v_applied, v_total;
END;
$$ LANGUAGE plpgsql;
