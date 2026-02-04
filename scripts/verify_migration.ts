import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function verifyMigration() {
    console.log("Starting Migration Verification...");

    try {
        // 1. Check Invoices Table
        const invoicesCount = await db.execute(sql`SELECT count(*) FROM invoices`);
        console.log(`✅ Invoices Count: ${invoicesCount.rows[0].count}`);

        // 2. Check Payments Table Linkage
        const linkedPayments = await db.execute(sql`SELECT count(*) FROM payments WHERE invoice_id IS NOT NULL`);
        console.log(`✅ Linked Payments: ${linkedPayments.rows[0].count}`);

        // 3. Check Bills Table (Should be gone or empty if we just cleared it)
        try {
            await db.execute(sql`SELECT count(*) FROM bills`);
            console.warn(`⚠️ Bills table still exists (Expected if migration script didn't fully run drop)`);
        } catch (e) {
            console.log(`✅ Bills table successfully dropped or inaccessible.`);
        }

        // 4. Check View
        const viewResult = await db.execute(sql`SELECT count(*) FROM customer_ledger_view`);
        console.log(`✅ Ledger View Rows: ${viewResult.rows[0].count}`);

    } catch (err) {
        console.error("❌ Verification Failed:", err);
    }
}

verifyMigration();
