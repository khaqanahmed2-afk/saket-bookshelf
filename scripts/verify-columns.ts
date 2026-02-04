// Quick verification script
import pg from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

async function verifyColumns() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🔍 Checking database columns...\n');

        const result = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'customers' 
            AND column_name IN ('opening_balance', 'balance_type', 'locked', 'source')
            ORDER BY column_name;
        `);

        if (result.rows.length === 4) {
            console.log('✅ All 4 columns exist!\n');
            console.table(result.rows);
            console.log('\n✅ Database is ready for Vyapar Party import!');
            process.exit(0);
        } else {
            console.log('❌ Missing columns! Found only:', result.rows.length);
            console.table(result.rows);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verifyColumns();
