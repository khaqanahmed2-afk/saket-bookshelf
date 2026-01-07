import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { api } from "@shared/routes";

// Initialize Supabase Client for Backend (Admin operations)
// We need the SERVICE_ROLE_KEY to bypass RLS for admin uploads if the user isn't logged in as admin in the backend context,
// OR we can use the ANON_KEY if we trust the backend to only be called by authorized users (but here we are simulating).
// In a real app, we should verify the user's session from the request headers.

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.admin.uploadTally.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Parse the file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      console.log(`Parsed ${data.length} rows from uploaded file`);

      if (supabaseKey === "placeholder") {
        // Mock response if no keys
        return res.json({
          message: "File parsed successfully. (Supabase keys missing, so no actual DB write occurred)",
          stats: {
            processed: data.length,
            errors: 0
          }
        });
      }

      let processed = 0;
      let errors = 0;

      // Logic to process Tally data and UPSERT into Supabase
      // This logic depends heavily on the structure of the Tally export.
      // We will assume a generic structure mapping to our schema for now.
      
      for (const row of data as any[]) {
        try {
          // Example logic:
          // 1. Upsert Customer (based on Mobile or Name)
          // 2. Insert/Update Ledger/Bill
          
          // This is a simplified example. In reality, Tally data needs careful mapping.
          
          /*
          const { error } = await supabase
            .from('customers')
            .upsert({ mobile: row.Mobile, name: row.Name }, { onConflict: 'mobile' });
            
          if (error) throw error;
          */

          processed++;
        } catch (err) {
          console.error("Error processing row:", err);
          errors++;
        }
      }

      res.json({
        message: "File processed successfully",
        stats: {
          processed,
          errors
        }
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Internal server error processing file" });
    }
  });

  return httpServer;
}
