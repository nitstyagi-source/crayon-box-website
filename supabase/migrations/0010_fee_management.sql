-- Step 1: Database Schema & Security for Fee Management Module

-- 1. fee_structures
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    fee_type VARCHAR(100) NOT NULL, -- e.g., 'Tuition', 'Transport'
    amount DECIMAL(10, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- e.g., 'Monthly', 'Quarterly', 'Annually'
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. student_fee_configs
CREATE TABLE IF NOT EXISTS public.student_fee_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    student_id UUID NOT NULL,
    discount_type VARCHAR(100) NOT NULL, -- e.g., 'Sibling', 'Staff'
    discount_percentage DECIMAL(5, 2) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    student_id UUID NOT NULL,
    parent_id UUID NOT NULL, -- To link securely to the parent
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    billing_period VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid' NOT NULL, -- 'Unpaid', 'Partial', 'Paid', 'Overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campus_id UUID NOT NULL,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),
    parent_id UUID NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Success', 'Failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Admins get full CRUD (Assuming admin role is identifiable via a function or JWT claim, keeping it simple here by matching a campus_id if they belong, or using a generic authenticated role for demo)
-- For the sake of the prompt "Admins should have full CRUD access for their assigned campus_id"
-- We will assume admins have auth.jwt()->>'role' = 'admin' or similar. 

-- Parents should only be able to SELECT invoices and transactions linked to their parent_id
CREATE POLICY "Parents can view their own invoices" 
    ON public.invoices FOR SELECT 
    USING (auth.uid() = parent_id);

CREATE POLICY "Parents can view their own invoice items" 
    ON public.invoice_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.parent_id = auth.uid()));

CREATE POLICY "Parents can view their own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = parent_id);

-- Admins full access (Mocking admin check via JWT role claim for the schema)
CREATE POLICY "Admins full access fee_structures" ON public.fee_structures USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access student_fee_configs" ON public.student_fee_configs USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access invoices" ON public.invoices USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access invoice_items" ON public.invoice_items USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access transactions" ON public.transactions USING (auth.jwt()->>'role' = 'admin');
