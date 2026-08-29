-- Phase H: Smart Library & Asset Management (Multi-Tenant Hardening)

-- 1. Add institution_code to library tables
ALTER TABLE public.library_books ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.library_book_copies ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.library_transactions ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';
ALTER TABLE public.library_reservations ADD COLUMN IF NOT EXISTS institution_code VARCHAR(20) NOT NULL DEFAULT 'CBS';

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_library_books_inst ON public.library_books(institution_code);
CREATE INDEX IF NOT EXISTS idx_library_copies_inst ON public.library_book_copies(institution_code);
CREATE INDEX IF NOT EXISTS idx_library_transactions_inst ON public.library_transactions(institution_code);

-- 3. Row Level Security
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_reservations ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Superadmins
DROP POLICY IF EXISTS "Superadmins manage library_books" ON public.library_books;
CREATE POLICY "Superadmins manage library_books" ON public.library_books FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage library_book_copies" ON public.library_book_copies;
CREATE POLICY "Superadmins manage library_book_copies" ON public.library_book_copies FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage library_transactions" ON public.library_transactions;
CREATE POLICY "Superadmins manage library_transactions" ON public.library_transactions FOR ALL USING (is_superadmin());

-- Librarians / Staff
DROP POLICY IF EXISTS "Staff manage institution library_books" ON public.library_books;
CREATE POLICY "Staff manage institution library_books" ON public.library_books FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = library_books.institution_code)
);

DROP POLICY IF EXISTS "Staff manage institution library_book_copies" ON public.library_book_copies;
CREATE POLICY "Staff manage institution library_book_copies" ON public.library_book_copies FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = library_book_copies.institution_code)
);

DROP POLICY IF EXISTS "Staff manage institution library_transactions" ON public.library_transactions;
CREATE POLICY "Staff manage institution library_transactions" ON public.library_transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND institution_code = library_transactions.institution_code)
);

-- Students view books across institutions, but can only reserve from their own
DROP POLICY IF EXISTS "Students view library_books" ON public.library_books;
CREATE POLICY "Students view library_books" ON public.library_books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students view own library_transactions" ON public.library_transactions;
CREATE POLICY "Students view own library_transactions" ON public.library_transactions FOR SELECT USING (
    member_id = auth.uid()
);
