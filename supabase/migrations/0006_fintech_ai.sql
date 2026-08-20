-- Phase 8: FinTech & Alumni Ecosystem

-- ==========================================
-- MODULE 9: SMART WALLET (CASHLESS CAMPUS)
-- ==========================================

CREATE TABLE IF NOT EXISTS student_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE,
    parent_id UUID REFERENCES parents(id), -- Who controls the wallet
    balance DECIMAL(10,2) DEFAULT 0.00,
    daily_limit DECIMAL(10,2) DEFAULT 500.00,
    nfc_card_hash VARCHAR(255) UNIQUE, -- For Canteen POS Scanning
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES student_wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'Top-Up', 'Purchase', 'Refund'
    amount DECIMAL(10,2) NOT NULL,
    description TEXT, -- e.g., 'Canteen: Lunch Combo', '1 Pay Top-Up'
    pos_terminal_id VARCHAR(100), -- Kiosk ID if purchase
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Balance Updater Trigger
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'Top-Up' THEN
        UPDATE student_wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
    ELSIF NEW.transaction_type = 'Purchase' THEN
        UPDATE student_wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wallet_transaction
AFTER INSERT ON wallet_transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- ==========================================
-- MODULE 12: ALUMNI & PORTFOLIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS alumni_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) UNIQUE, -- Link to past records
    user_id UUID REFERENCES auth.users(id), -- If they log back in
    graduation_year INT NOT NULL,
    current_university VARCHAR(255),
    current_company VARCHAR(255),
    job_title VARCHAR(255),
    linkedin_url TEXT,
    bio TEXT,
    is_mentorship_open BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- Academic, Sports, Arts, Extracurricular
    description TEXT,
    media_url TEXT,
    date_achieved DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ENABLE RLS & POLICIES
-- ==========================================

ALTER TABLE student_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_portfolios ENABLE ROW LEVEL SECURITY;

-- Superadmin overrides
DROP POLICY IF EXISTS "Superadmins can manage wallets" ON public.student_wallets;
CREATE POLICY "Superadmins can manage wallets" ON student_wallets FOR ALL USING (is_superadmin());
DROP POLICY IF EXISTS "Superadmins can manage wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Superadmins can manage wallet_transactions" ON wallet_transactions FOR ALL USING (is_superadmin());
DROP POLICY IF EXISTS "Superadmins can manage alumni" ON public.alumni_profiles;
CREATE POLICY "Superadmins can manage alumni" ON alumni_profiles FOR ALL USING (is_superadmin());
DROP POLICY IF EXISTS "Superadmins can manage portfolios" ON public.student_portfolios;
CREATE POLICY "Superadmins can manage portfolios" ON student_portfolios FOR ALL USING (is_superadmin());

-- Parents own wallet data
DROP POLICY IF EXISTS "Parents view own child wallet" ON public.student_wallets;
CREATE POLICY "Parents view own child wallet" ON student_wallets FOR SELECT USING (parent_id = auth.uid());
DROP POLICY IF EXISTS "Parents update own child wallet limits" ON public.student_wallets;
CREATE POLICY "Parents update own child wallet limits" ON student_wallets FOR UPDATE USING (parent_id = auth.uid());
DROP POLICY IF EXISTS "Parents view own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Parents view own wallet transactions" ON wallet_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_wallets WHERE id = wallet_transactions.wallet_id AND parent_id = auth.uid())
);

-- Alumni Profiles (Semi-Public)
DROP POLICY IF EXISTS "Anyone can view alumni profiles" ON public.alumni_profiles;
CREATE POLICY "Anyone can view alumni profiles" ON alumni_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Alumni can update own profile" ON public.alumni_profiles;
CREATE POLICY "Alumni can update own profile" ON alumni_profiles FOR UPDATE USING (user_id = auth.uid());

-- Portfolios (Visible to staff, parents, and self if logged in)
DROP POLICY IF EXISTS "Parents view own child portfolio" ON public.student_portfolios;
CREATE POLICY "Parents view own child portfolio" ON student_portfolios FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND parent_id = auth.uid())
);
DROP POLICY IF EXISTS "Staff view all portfolios" ON public.student_portfolios;
CREATE POLICY "Staff view all portfolios" ON student_portfolios FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid())
);
