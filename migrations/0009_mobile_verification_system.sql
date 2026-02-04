-- Migration: Mobile Number Linking & Verification System
-- Created: 2026-02-04
-- Purpose: Complete mobile verification system with temporary numbers and admin verification

-- 1. Add new columns to customers table for mobile verification
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS temporary_mobile text,
ADD COLUMN IF NOT EXISTS actual_mobile text,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS verified_at timestamp;

-- 2. Enhance mobile_link_requests table with admin metadata
ALTER TABLE mobile_link_requests
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS verified_at timestamp,
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS rejected_at timestamp,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 3. Create audit log table for mobile verification actions
CREATE TABLE IF NOT EXISTS mobile_verification_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES customers(id) NOT NULL,
    action text NOT NULL CHECK (action IN ('temp_assigned', 'verification_requested', 'verified', 'rejected', 'temp_replaced')),
    admin_id uuid REFERENCES customers(id),
    old_mobile text,
    new_mobile text,
    temporary_mobile text,
    notes text,
    created_at timestamp DEFAULT now()
);

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_temporary_mobile ON customers(temporary_mobile);
CREATE INDEX IF NOT EXISTS idx_customers_actual_mobile ON customers(actual_mobile);
CREATE INDEX IF NOT EXISTS idx_customers_mobile_verified ON customers(mobile_verified);
CREATE INDEX IF NOT EXISTS idx_mobile_link_requests_status ON mobile_link_requests(status);
CREATE INDEX IF NOT EXISTS idx_mobile_verification_audit_customer ON mobile_verification_audit(customer_id);
CREATE INDEX IF NOT EXISTS idx_mobile_verification_audit_admin ON mobile_verification_audit(admin_id);

-- 5. Function to generate unique temporary mobile number
CREATE OR REPLACE FUNCTION generate_temporary_mobile()
RETURNS text AS $$
DECLARE
    temp_mobile text;
    exists_check int;
BEGIN
    LOOP
        -- Generate 10-digit number starting with 000 (e.g., 0004301160)
        temp_mobile := '000' || LPAD(FLOOR(RANDOM() * 10000000)::text, 7, '0');
        
        -- Check if it already exists
        SELECT COUNT(*) INTO exists_check
        FROM customers
        WHERE temporary_mobile = temp_mobile OR mobile = temp_mobile;
        
        -- Exit loop if unique
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN temp_mobile;
END;
$$ LANGUAGE plpgsql;

-- 6. Enable RLS on audit table
ALTER TABLE mobile_verification_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny Public Access Mobile Verification Audit" ON mobile_verification_audit FOR ALL USING (false);

-- 7. Add comment for documentation
COMMENT ON COLUMN customers.temporary_mobile IS 'System-generated temporary mobile number (format: 000XXXXXXX) assigned before verification';
COMMENT ON COLUMN customers.actual_mobile IS 'User-entered real mobile number stored separately until verification';
COMMENT ON COLUMN customers.verified_by IS 'Admin user ID who verified the mobile number';
COMMENT ON COLUMN customers.verified_at IS 'Timestamp when mobile was verified';
