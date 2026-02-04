-- Migration: Add Tally Excel Import Fields
-- Created: 2026-02-01
-- Purpose: Support for importing Tally Party Report and Sales Report

-- Add columns to customers table
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "opening_balance" numeric DEFAULT '0',
ADD COLUMN IF NOT EXISTS "balance_type" text DEFAULT 'receivable',
ADD COLUMN IF NOT EXISTS "locked" boolean DEFAULT false;

-- Add check constraint for balance_type
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

-- Add columns to bills table
ALTER TABLE "bills"
ADD COLUMN IF NOT EXISTS "source" text DEFAULT 'system',
ADD COLUMN IF NOT EXISTS "locked" boolean DEFAULT false;

-- Rename upload_logs to import_logs (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'upload_logs'
    ) THEN
        -- Rename table
        ALTER TABLE "upload_logs" RENAME TO "import_logs";
        
        -- Rename columns
        ALTER TABLE "import_logs" RENAME COLUMN "upload_type" TO "import_type";
        ALTER TABLE "import_logs" RENAME COLUMN "records_total" TO "total_rows";
        ALTER TABLE "import_logs" RENAME COLUMN "records_success" TO "imported_rows";
        ALTER TABLE "import_logs" RENAME COLUMN "records_skipped" TO "skipped_rows";
        ALTER TABLE "import_logs" RENAME COLUMN "uploaded_at" TO "imported_at";
        
        -- Drop old constraint
        ALTER TABLE "import_logs" DROP CONSTRAINT IF EXISTS "upload_logs_upload_type_check";
        
        -- Drop column we don't need
        ALTER TABLE "import_logs" DROP COLUMN IF EXISTS "records_failed";
    END IF;
END $$;

-- Create import_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS "import_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "file_name" text NOT NULL,
    "file_hash" text NOT NULL UNIQUE,
    "import_type" text NOT NULL,
    "total_rows" numeric DEFAULT '0' NOT NULL,
    "imported_rows" numeric DEFAULT '0' NOT NULL,
    "skipped_rows" numeric DEFAULT '0' NOT NULL,
    "error_log" jsonb,
    "imported_at" timestamp DEFAULT now(),
    "status" text NOT NULL
);

-- Add check constraint for import_type (include new types)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'import_logs_import_type_check'
    ) THEN
        ALTER TABLE "import_logs" 
        ADD CONSTRAINT "import_logs_import_type_check" 
        CHECK ("import_type" IN ('customers', 'bills', 'payments', 'party', 'sales'));
    END IF;
END $$;

-- Add check constraint for status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'import_logs_status_check'
    ) THEN
        ALTER TABLE "import_logs" 
        ADD CONSTRAINT "import_logs_status_check" 
        CHECK ("status" IN ('success', 'partial', 'failed'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_customers_source" ON "customers" ("source");
CREATE INDEX IF NOT EXISTS "idx_customers_locked" ON "customers" ("locked");
CREATE INDEX IF NOT EXISTS "idx_bills_source" ON "bills" ("source");
CREATE INDEX IF NOT EXISTS "idx_bills_locked" ON "bills" ("locked");
CREATE INDEX IF NOT EXISTS "idx_import_logs_type" ON "import_logs" ("import_type");
CREATE INDEX IF NOT EXISTS "idx_import_logs_hash" ON "import_logs" ("file_hash");
