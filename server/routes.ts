import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { api } from "@shared/routes";
import { format, parse } from "date-fns";

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
      // Expected Columns in Tally Export (Adjust as per actual Tally TDL export):
      // - Name (Customer Name)
      // - Mobile (Customer Mobile)
      // - Date (Entry Date)
      // - VoucherNo
      // - VoucherType (Sales / Receipt / Journal)
      // - Debit
      // - Credit
      // - Amount
      // - Reference (for receipts)
      
      for (const row of data as any[]) {
        try {
          const mobile = row["Mobile"]?.toString()?.trim();
          const name = row["Name"]?.toString()?.trim();
          
          if (!mobile || !name) {
             console.warn("Skipping row: Missing Name or Mobile", row);
             errors++;
             continue;
          }

          // 1. Upsert Customer
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .upsert({ mobile: mobile, name: name }, { onConflict: 'mobile' })
            .select()
            .single();

          if (customerError) throw new Error(`Customer Upsert Failed: ${customerError.message}`);
          if (!customer) throw new Error("Customer not found after upsert");

          const customerId = customer.id;
          
          // Parse Date (Assuming Excel serial date or string like 'YYYY-MM-DD' or 'DD-MM-YYYY')
          // Tally often exports dates as strings like '2-Apr-2023'. Let's assume standard format or Excel number for now.
          let entryDate = new Date();
          if (row["Date"]) {
             // Basic date handling logic here - simplified
             // If Excel serial number
             if (typeof row["Date"] === 'number') {
                 entryDate = new Date((row["Date"] - (25567 + 2)) * 86400 * 1000);
             } else {
                 entryDate = new Date(row["Date"]);
             }
          }
          const formattedDate = format(entryDate, 'yyyy-MM-dd');

          // 2. Insert/Upsert Ledger Entry
          const voucherNo = row["VoucherNo"]?.toString() || `V-${Date.now()}-${processed}`; // Fallback if missing
          const voucherType = row["VoucherType"]?.toString()?.toLowerCase();
          const debit = parseFloat(row["Debit"] || 0);
          const credit = parseFloat(row["Credit"] || 0);
          
          // Ledger Upsert
          // We use voucherNo as unique constraint if available to prevent dupes
          const { error: ledgerError } = await supabase
            .from('ledger')
            .upsert({
              customer_id: customerId,
              entry_date: formattedDate,
              debit: debit,
              credit: credit,
              balance: 0, // In real Tally sync, this might be calculated or imported. Let's assume 0 for now as it's a running calc in frontend often or imported directly if available.
              voucher_no: voucherNo
            }, { onConflict: 'voucher_no' });
            
          if (ledgerError) {
             // Ignore duplicate key error if we just want to skip existing
             if (ledgerError.code === '23505') { 
                // Duplicate voucher - ignore as per requirement
             } else {
                throw new Error(`Ledger Error: ${ledgerError.message}`);
             }
          }

          // 3. Insert specific Bill or Payment record based on VoucherType
          if (voucherType === 'sales' || voucherType === 'bill') {
             // Upsert Bill
             const billAmount = parseFloat(row["Amount"] || debit); // Sales usually Debit the customer
             const { error: billError } = await supabase
                .from('bills')
                .upsert({
                   customer_id: customerId,
                   bill_no: voucherNo, // Assuming Bill No is same as Voucher No for Sales
                   bill_date: formattedDate,
                   amount: billAmount
                }, { onConflict: 'bill_no' });
             
             if (billError && billError.code !== '23505') throw new Error(`Bill Error: ${billError.message}`);
          } else if (voucherType === 'receipt' || voucherType === 'payment') {
             // Insert Payment (Payments table doesn't have unique constraint on voucherNo in schema yet, but usually should have unique ID or ref)
             // Schema has 'reference_no'.
             const paymentAmount = parseFloat(row["Amount"] || credit); // Receipts Credit the customer
             
             // Check if payment already exists (simple check by ref no if available)
             // Ideally we should have a unique constraint on payments too (e.g. receipt_no)
             // For now, we will just Insert to keep it simple, or check if we want dedupe logic.
             // Requirement says "Re-upload same file -> NO DUPLICATES".
             
             // Let's assume ReferenceNo is unique for payments
             const refNo = row["Reference"]?.toString() || voucherNo;
             
             const { data: existingPayment } = await supabase
                .from('payments')
                .select('id')
                .eq('reference_no', refNo)
                .single();
                
             if (!existingPayment) {
                 const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                       customer_id: customerId,
                       payment_date: formattedDate,
                       amount: paymentAmount,
                       mode: row["Mode"] || 'Cash', // Default to Cash
                       reference_no: refNo
                    });
                 if (paymentError) throw new Error(`Payment Error: ${paymentError.message}`);
             }
          }

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
