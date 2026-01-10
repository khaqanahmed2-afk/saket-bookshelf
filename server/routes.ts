import type { Express, Request } from "express";
import type { Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { api } from "@shared/routes";
import { format } from "date-fns";
import bcrypt from "bcryptjs";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.auth.checkMobile.path, async (req, res) => {
    try {
      const { mobile } = api.auth.checkMobile.input.parse(req.body);
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("id, pin")
        .eq("mobile", mobile)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        return res.json({ exists: false });
      }
      
      res.json({ exists: !!customer && !!customer.pin });
    } catch (error) {
      console.error("Check mobile error:", error);
      res.json({ exists: false });
    }
  });

  app.post(api.auth.setupPin.path, async (req, res) => {
    try {
      console.log("Setting up PIN for mobile:", req.body.mobile);
      const { mobile, pin } = api.auth.setupPin.input.parse(req.body);
      const hashedPin = await bcrypt.hash(pin, 10);
      
      const { data: existing, error: fetchError } = await supabase
        .from("customers")
        .select("id")
        .eq("mobile", mobile)
        .maybeSingle();

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        return res.status(500).json({ message: "Database connection failed" });
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from("customers")
          .update({ pin: hashedPin })
          .eq("mobile", mobile);
        if (updateError) return res.status(400).json({ message: updateError.message });
      } else {
        const { error: insertError } = await supabase
          .from("customers")
          .insert({ mobile, name: "New Customer", pin: hashedPin });
        if (insertError) return res.status(400).json({ message: insertError.message });
      }

      res.json({ success: true, session: { mobile } });
    } catch (error: any) {
      console.error("PIN setup error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post(api.auth.loginPin.path, async (req, res) => {
    try {
      console.log("Login attempt for mobile:", req.body.mobile);
      const { mobile, pin } = api.auth.loginPin.input.parse(req.body);
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("mobile", mobile)
        .maybeSingle();

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        return res.status(500).json({ message: "Database connection failed" });
      }

      if (!customer || !customer.pin) {
        return res.status(401).json({ message: "Mobile not registered" });
      }

      const valid = await bcrypt.compare(pin, customer.pin);
      if (!valid) {
        return res.status(401).json({ message: "Incorrect PIN" });
      }

      res.json({ success: true, session: { mobile, id: customer.id } });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(401).json({ message: error.message });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    // In this simple MVP, we check if there is a session in the header or just return null
    // The frontend uses localStorage for persistence, but we should have a way to verify
    res.json({ user: null });
  });

  app.post(api.admin.uploadTally.path, upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (supabaseKey === "placeholder") {
        return res.json({
          message: "File parsed successfully. (Supabase keys missing)",
          stats: { processed: data.length, errors: 0 }
        });
      }

      let processed = 0;
      let errors = 0;
      
      for (const row of data as any[]) {
        try {
          const mobile = row["Mobile"]?.toString()?.trim();
          const name = row["Name"]?.toString()?.trim();
          
          if (!mobile || !name) {
             errors++;
             continue;
          }

          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .upsert({ mobile: mobile, name: name }, { onConflict: 'mobile' })
            .select()
            .single();

          if (customerError || !customer) throw new Error("Customer error");

          const customerId = customer.id;
          let entryDate = new Date();
          if (row["Date"]) {
             if (typeof row["Date"] === 'number') {
                 entryDate = new Date((row["Date"] - (25567 + 2)) * 86400 * 1000);
             } else {
                 entryDate = new Date(row["Date"]);
             }
          }
          const formattedDate = format(entryDate, 'yyyy-MM-dd');

          const voucherNo = row["VoucherNo"]?.toString() || `V-${Date.now()}-${processed}`;
          const voucherType = row["VoucherType"]?.toString()?.toLowerCase();
          const debit = parseFloat(row["Debit"] || 0);
          const credit = parseFloat(row["Credit"] || 0);
          
          await supabase.from('ledger').upsert({
            customer_id: customerId,
            entry_date: formattedDate,
            debit: debit,
            credit: credit,
            balance: 0,
            voucher_no: voucherNo
          }, { onConflict: 'voucher_no' });

          if (voucherType === 'sales' || voucherType === 'bill') {
             const billAmount = parseFloat(row["Amount"] || debit);
             await supabase.from('bills').upsert({
                customer_id: customerId,
                bill_no: voucherNo,
                bill_date: formattedDate,
                amount: billAmount
             }, { onConflict: 'bill_no' });
          } else if (voucherType === 'receipt' || voucherType === 'payment') {
             const paymentAmount = parseFloat(row["Amount"] || credit);
             const refNo = row["Reference"]?.toString() || voucherNo;
             const { data: existingPayment } = await supabase.from('payments').select('id').eq('reference_no', refNo).single();
             if (!existingPayment) {
                 await supabase.from('payments').insert({
                    customer_id: customerId,
                    payment_date: formattedDate,
                    amount: paymentAmount,
                    mode: row["Mode"] || 'Cash',
                    reference_no: refNo
                 });
             }
          }
          processed++;
        } catch (err) {
          errors++;
        }
      }
      res.json({ message: "File processed successfully", stats: { processed, errors } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
