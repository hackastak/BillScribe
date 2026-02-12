-- Enable Row Level Security on all tables
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- Users can only access their own profile
-- ============================================

CREATE POLICY "Users can view their own profile"
ON "profiles" FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON "profiles" FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON "profiles" FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own profile"
ON "profiles" FOR DELETE
TO authenticated
USING (id = auth.uid());

-- ============================================
-- CLIENTS POLICIES
-- Users can only access clients they own
-- ============================================

CREATE POLICY "Users can view their own clients"
ON "clients" FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clients"
ON "clients" FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients"
ON "clients" FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
ON "clients" FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- INVOICES POLICIES
-- Users can only access invoices they own
-- ============================================

CREATE POLICY "Users can view their own invoices"
ON "invoices" FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own invoices"
ON "invoices" FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own invoices"
ON "invoices" FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own invoices"
ON "invoices" FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- INVOICE_ITEMS POLICIES
-- Users can only access items for invoices they own
-- ============================================

CREATE POLICY "Users can view their own invoice items"
ON "invoice_items" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "invoices"
    WHERE "invoices".id = "invoice_items".invoice_id
    AND "invoices".user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert items for their own invoices"
ON "invoice_items" FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "invoices"
    WHERE "invoices".id = "invoice_items".invoice_id
    AND "invoices".user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items for their own invoices"
ON "invoice_items" FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "invoices"
    WHERE "invoices".id = "invoice_items".invoice_id
    AND "invoices".user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "invoices"
    WHERE "invoices".id = "invoice_items".invoice_id
    AND "invoices".user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items for their own invoices"
ON "invoice_items" FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "invoices"
    WHERE "invoices".id = "invoice_items".invoice_id
    AND "invoices".user_id = auth.uid()
  )
);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- Users can only access their own subscription
-- ============================================

CREATE POLICY "Users can view their own subscription"
ON "subscriptions" FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription"
ON "subscriptions" FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription"
ON "subscriptions" FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own subscription"
ON "subscriptions" FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- SERVICE ROLE BYPASS
-- The service role (used by server-side code) bypasses RLS by default
-- This is the expected behavior for Supabase
-- ============================================
