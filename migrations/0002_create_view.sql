-- Ledger View: A single source of truth for customer financial history
-- Unions Invoices (Debit) and Payments (Credit)

DROP VIEW IF EXISTS "customer_ledger_view";

CREATE VIEW "customer_ledger_view" AS
SELECT
    'invoice'::text as type,
    id as source_id,
    customer_id,
    date as entry_date,
    invoice_no as description,
    total_amount as debit,
    0 as credit,
    created_at
FROM invoices
UNION ALL
SELECT
    'payment'::text as type,
    id as source_id,
    customer_id,
    payment_date as entry_date,
    COALESCE(mode, 'payment') || ' - ' || COALESCE(receipt_no, '') as description,
    0 as debit,
    amount as credit,
    COALESCE(created_at, NOW()) as created_at
FROM payments;
