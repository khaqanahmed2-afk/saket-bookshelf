
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("Fixing Schema Issues...");
    try {
        await db.execute(sql`
            ALTER TABLE invoices 
            ADD COLUMN IF NOT EXISTS status text DEFAULT 'paid';
        `);
        console.log("Invoices table schema ensured.");
        process.exit(0);
    } catch (error) {
        console.error("Schema Fix Failed:", error);
        process.exit(1);
    }
}

fixSchema();
