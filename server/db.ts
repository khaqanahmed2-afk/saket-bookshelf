import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// This is for Drizzle ORM if we were to use it directly against the DB.
// Since we are primarily using Supabase Client for this specific request (due to Auth/RLS requirements),
// this might be unused or used only if DATABASE_URL is provided for direct connection.
// We keep it to satisfy the template structure.

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Drizzle will not be able to connect.");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/db" 
});
export const db = drizzle(pool, { schema });
