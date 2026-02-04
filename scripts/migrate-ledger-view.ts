
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrateLedgerToView() {
    console.log("Migrating Ledger to SQL VIEW...");
    try {
        // 1. Rename existing ledger table to back it up
        console.log("Backing up existing ledger table...");
        await db.execute(sql`
            DO $$
            BEGIN
                IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ledger') THEN
                    ALTER TABLE ledger RENAME TO ledger_legacy;
                END IF;
            END $$;
        `);

        // 2. Create the View
        console.log("Creating ledger view...");
        await db.execute(sql`
            CREATE OR REPLACE VIEW ledger AS
            SELECT 
                row_number() OVER (ORDER BY "entry_date", "created_at") AS id,
                "customer_id" AS "customer_id",
                "date" AS "entry_date",
                "total_amount" AS "debit",
                0 AS "credit",
                0 AS "balance", -- Application logic calculates running balance
                'INV-' || "invoice_no" AS "voucher_no"
            FROM invoices
            WHERE status != 'cancelled'
            
            UNION ALL
            
            SELECT 
                (row_number() OVER (ORDER BY "payment_date", "created_at") + 1000000) AS id, -- Offset ID to avoid collision
                "customer_id" AS "customer_id",
                "payment_date" AS "entry_date",
                0 AS "debit",
                "amount" AS "credit",
                0 AS "balance",
                'PAY-' || "receipt_no" AS "voucher_no"
            FROM payments;
        `);

        console.log("Ledger View created successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
}

migrateLedgerToView();
