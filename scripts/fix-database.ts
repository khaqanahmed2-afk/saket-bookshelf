// Emergency Database Fix Script
// Run this to add missing columns to customers table

import pg from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

const SQL = `
-- Add columns if they don't exist
ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "opening_balance" numeric DEFAULT 0;

ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "balance_type" text DEFAULT 'receivable';

ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "locked" boolean DEFAULT false;

ALTER TABLE "customers" 
ADD COLUMN IF NOT EXISTS "source" text DEFAULT 'system';

-- Add constraint
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

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_customers_source" ON "customers" ("source");
CREATE INDEX IF NOT EXISTS "idx_customers_locked" ON "customers" ("locked");

-- Verify
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('opening_balance', 'balance_type', 'locked', 'source')
ORDER BY column_name;
`;

async function fixDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔧 Connecting to database...');
        const client = await pool.connect();

        console.log('✅ Connected! Running migration...');
        const result = await client.query(SQL);

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 Verification - Columns added:');

        // The last SELECT will be in the result
        if (result.rows && result.rows.length > 0) {
            console.table(result.rows);
        } else {
            console.log('   (Running verification query separately...)');
            const verifyResult = await client.query(`
                SELECT column_name, data_type, column_default
                FROM information_schema.columns 
                WHERE table_name = 'customers' 
                AND column_name IN ('opening_balance', 'balance_type', 'locked', 'source')
                ORDER BY column_name;
            `);
            console.table(verifyResult.rows);
        }

        client.release();

        console.log('\n✅ Database is ready for Vyapar Party import!');
        console.log('   You can now restart your dev server and try importing.');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

fixDatabase();
