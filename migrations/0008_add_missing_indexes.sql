-- Migration: Add Missing Database Indexes for Performance
-- Created: 2026-02-04
-- Purpose: Improve query performance for frequently accessed columns
-- Note: These indexes are critical for dashboard queries and invoice reconciliation

-- Indexes for invoices table (high usage in dashboard and reconciliation)
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_no ON invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_date ON invoices(customer_id, date DESC);

-- Indexes for invoice_items table (joins with invoices)
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

-- Indexes for payments table (reconciliation queries)
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_date ON payments(customer_id, payment_date DESC);

-- Composite index for common payment lookup pattern (customer + invoice + date)
CREATE INDEX IF NOT EXISTS idx_payments_customer_invoice_date ON payments(customer_id, invoice_id, payment_date DESC);

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('invoices', 'invoice_items', 'payments')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
