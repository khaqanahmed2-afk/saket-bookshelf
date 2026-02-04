-- CRITICAL FIX: Add Vyapar Import Columns to Customers Table
-- Run this DIRECTLY in Supabase SQL Editor

-- Step 1: Add columns if they don't exist
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "opening_balance" numeric DEFAULT 0;

ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "balance_type" text DEFAULT 'receivable';

ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "locked" boolean DEFAULT false;

ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "source" text DEFAULT 'system';

-- Step 2: Add constraint check for balance_type
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

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_customers_source" ON "customers" ("source");
CREATE INDEX IF NOT EXISTS "idx_customers_locked" ON "customers" ("locked");

-- Step 4: VERIFY columns were added (this will show results)
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('opening_balance', 'balance_type', 'locked', 'source')
ORDER BY column_name;

-- Expected: You should see 4 rows returned with these columns
