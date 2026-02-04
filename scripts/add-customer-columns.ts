import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addCustomerColumns() {
    console.log("Adding columns to customers table...");
    try {
        await db.execute(sql`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS address text,
            ADD COLUMN IF NOT EXISTS email text;
        `);
        console.log("Columns added successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
}

addCustomerColumns();
