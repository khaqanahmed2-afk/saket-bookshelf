-- Migration: Add XML Upload System Tables and Indexes
-- Created: 2026-02-01
-- Description: Adds upload_logs table and indexes for duplicate detection in XML upload system

-- Add upload_logs table for tracking XML file uploads
CREATE TABLE IF NOT EXISTS upload_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash for duplicate file detection
  upload_type TEXT NOT NULL CHECK (upload_type IN ('customers', 'bills', 'payments')),
  records_total NUMERIC NOT NULL DEFAULT 0,
  records_success NUMERIC NOT NULL DEFAULT 0,
  records_failed NUMERIC NOT NULL DEFAULT 0,
  records_skipped NUMERIC NOT NULL DEFAULT 0,
  error_log JSONB, -- Array of {row, field, reason} objects
  uploaded_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed'))
);

-- Indexes for upload_logs
CREATE INDEX IF NOT EXISTS idx_upload_logs_type ON upload_logs(upload_type);
CREATE INDEX IF NOT EXISTS idx_upload_logs_hash ON upload_logs(file_hash);
CREATE INDEX IF NOT EXISTS idx_upload_logs_uploaded_at ON upload_logs(uploaded_at DESC);

-- Add customer_code column to customers table for XML imports
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT;

-- Create unique index on customer_code (partial - only where not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code) WHERE customer_code IS NOT NULL;

-- Create composite index for duplicate detection on name + mobile
CREATE INDEX IF NOT EXISTS idx_customers_name_mobile ON customers(name, mobile);

-- Add bill_id to payments table for linking payments to specific bills
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bill_id BIGINT REFERENCES bills(id) ON DELETE CASCADE;

-- Add receipt_no to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_no TEXT;

-- Create unique index on bills (bill_no + bill_date) for duplicate detection
CREATE UNIQUE INDEX IF NOT EXISTS idx_bills_no_date ON bills(bill_no, bill_date);

-- Create unique index on payments (receipt_no + bill_id) for duplicate detection
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_receipt_bill ON payments(receipt_no, bill_id) WHERE receipt_no IS NOT NULL AND bill_id IS NOT NULL;

-- Create index on payments.bill_id for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);

-- Add comment for documentation
COMMENT ON TABLE upload_logs IS 'Tracks XML file uploads with hash-based duplicate prevention';
COMMENT ON COLUMN upload_logs.file_hash IS 'SHA-256 hash of file content for duplicate detection';
COMMENT ON COLUMN upload_logs.error_log IS 'JSON array of errors: [{row: number, field: string, reason: string}]';
