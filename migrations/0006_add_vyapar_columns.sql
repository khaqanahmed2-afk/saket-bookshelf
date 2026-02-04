-- Quick Fix: Add Vyapar Party Import Columns to Customers Table
-- Safe, non-destructive ALTER TABLE statements

-- Add opening_balance column
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "opening_balance" numeric DEFAULT '0';

-- Add balance_type column
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "balance_type" text DEFAULT 'receivable';

-- Add locked column
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "locked" boolean DEFAULT false;

-- Ensure source column exists (might already exist)
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "source" text DEFAULT 'system';

-- Add check constraint for balance_type (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'customers_balance_type_check'
    ) THEN
        ALTER TABLE "customers" 
        ADD CONSTRAINT "customers_balance_type_check" 
        CHECK ("balance_type" IN ('receivable', 'payable'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_customers_source" ON "customers" ("source");
CREATE INDEX IF NOT EXISTS "idx_customers_locked" ON "customers" ("locked");

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('opening_balance', 'balance_type', 'locked', 'source')
ORDER BY column_name;
