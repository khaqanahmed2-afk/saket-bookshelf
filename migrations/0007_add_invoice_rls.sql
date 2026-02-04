-- Migration: Add RLS Policies for Invoices, Invoice Items, and Products
-- Created: 2026-02-04
-- Purpose: Secure invoices, invoice_items, and products tables with RLS (BFF pattern)
-- Note: Backend uses SERVICE_ROLE_KEY which bypasses RLS, but this provides defense-in-depth

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Deny Public Access Invoices" ON invoices;
DROP POLICY IF EXISTS "Deny Public Access Invoice Items" ON invoice_items;
DROP POLICY IF EXISTS "Deny Public Access Products" ON products;

-- Create DENY ALL policies (BFF pattern - backend uses SERVICE_ROLE_KEY)
-- This ensures that if anon key is accidentally used, no data is exposed
CREATE POLICY "Deny Public Access Invoices" ON invoices FOR ALL USING (false);
CREATE POLICY "Deny Public Access Invoice Items" ON invoice_items FOR ALL USING (false);
CREATE POLICY "Deny Public Access Products" ON products FOR ALL USING (false);

-- Verify policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('invoices', 'invoice_items', 'products')
ORDER BY tablename, policyname;
