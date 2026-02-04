-- 1. Add new columns to invoices
ALTER TABLE "invoices" ADD COLUMN "locked" boolean DEFAULT false;
ALTER TABLE "invoices" ADD COLUMN "legacy_bill_id" bigint;

-- 2. Add invoice_id to payments
ALTER TABLE "payments" ADD COLUMN "invoice_id" uuid REFERENCES "invoices"("id");

-- 3. Migrate data from 'bills' to 'invoices'
-- We generate new UUIDs for the bills being moved to invoices table.
INSERT INTO "invoices" ("customer_id", "invoice_no", "date", "total_amount", "source", "locked", "legacy_bill_id")
SELECT 
    "customer_id",
    "bill_no" as "invoice_no",
    "bill_date" as "date",
    "amount" as "total_amount",
    "source",
    "locked",
    "id" as "legacy_bill_id"
FROM "bills";

-- 4. Link payments to new invoices using the legacy_bill_id mapping
-- This updates payments that were previously linked to bills
UPDATE "payments"
SET "invoice_id" = "invoices"."id"
FROM "invoices"
WHERE "payments"."bill_id" = "invoices"."legacy_bill_id"
AND "payments"."bill_id" IS NOT NULL;

-- 5. Drop the old bill_id column from payments and the bills table
ALTER TABLE "payments" DROP COLUMN "bill_id";
DROP TABLE "bills";

-- 6. Clean up temporary column (Optional, or keep for audit if needed. Plan says drop)
ALTER TABLE "invoices" DROP COLUMN "legacy_bill_id";

-- 7. Drop unused ledger table
DROP TABLE IF EXISTS "ledger";
