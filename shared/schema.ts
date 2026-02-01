import { pgTable, text, timestamp, bigint, uuid, date, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  parentGroup: text("parent_group"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const importMeta = pgTable("import_meta", {
  key: text("key").primaryKey(),
  value: boolean("value").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull().unique(),
  customerCode: text("customer_code"), // For XML imports - unique customer identifier
  pin: text("pin"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  source: text("source").default("system"),
  externalId: text("external_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ledger = pgTable("ledger", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  customerId: uuid("customer_id").references(() => customers.id),
  entryDate: date("entry_date").notNull(),
  debit: numeric("debit").notNull(),
  credit: numeric("credit").notNull(),
  balance: numeric("balance").notNull(),
  voucherNo: text("voucher_no").unique(),
});

export const bills = pgTable("bills", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  customerId: uuid("customer_id").references(() => customers.id),
  billNo: text("bill_no").notNull().unique(),
  billDate: date("bill_date").notNull(),
  amount: numeric("amount").notNull(),
});

export const payments = pgTable("payments", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  customerId: uuid("customer_id").references(() => customers.id),
  billId: bigint("bill_id", { mode: "number" }).references(() => bills.id), // Link to specific bill
  receiptNo: text("receipt_no").notNull(), // Receipt/payment number from XML
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount").notNull(),
  mode: text("mode").notNull(),
  referenceNo: text("reference_no"),
  source: text("source").default("system"),
});

// XML Upload tracking table
export const uploadLogs = pgTable("upload_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileName: text("file_name").notNull(),
  fileHash: text("file_hash").notNull().unique(), // SHA-256 hash for duplicate detection
  uploadType: text("upload_type", { enum: ["customers", "bills", "payments"] }).notNull(),
  recordsTotal: numeric("records_total").notNull().default("0"),
  recordsSuccess: numeric("records_success").notNull().default("0"),
  recordsFailed: numeric("records_failed").notNull().default("0"),
  recordsSkipped: numeric("records_skipped").notNull().default("0"),
  errorLog: jsonb("error_log"), // Array of error details
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: text("status", { enum: ["success", "partial", "failed"] }).notNull(),
});

// drizzle-zod's inferred typings can vary across versions; cast omit shape to keep `tsc` stable.
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true } as any);
export const insertLedgerSchema = createInsertSchema(ledger).omit({ id: true } as any);
export const insertBillSchema = createInsertSchema(bills).omit({ id: true } as any);
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true } as any);
export const insertUploadLogSchema = createInsertSchema(uploadLogs).omit({ id: true, uploadedAt: true } as any);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(), // School Essentials, Stationery, Competitive Books, Kids Education
  description: text("description"), // Optional product description
  imageUrl: text("image_url"), // Path to uploaded product image
  code: text("code"), // SKU or Item Code (optional)
  price: numeric("price").default("0"), // Optional - WhatsApp enquiry only
  stock: numeric("stock").default("0"),
  source: text("source").default("system"), // vyapar, system, etc
  externalId: text("external_id"), // ID from the source system
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true } as any);


export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNo: text("invoice_no").notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  date: date("date").notNull(),
  totalAmount: numeric("total_amount").notNull().default("0"),
  status: text("status").default("paid"), // paid, unpaid, partial
  source: text("source").default("system"),
  externalId: text("external_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: 'cascade' }),
  productId: uuid("product_id").references(() => products.id),
  productName: text("product_name"), // Snapshot in case product is deleted
  quantity: numeric("quantity").notNull().default("1"),
  rate: numeric("rate").notNull().default("0"),
  amount: numeric("amount").notNull().default("0"),
});

export const stagingImports = pgTable("staging_imports", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  source: text("source").default("vyapar"),
  type: text("type").notNull(), // customers, products, invoices
  status: text("status").default("pending"), // pending, processed, failed, partial
  rawData: jsonb("raw_data").notNull(),
  errorLog: jsonb("error_log"),
  processedCount: numeric("processed_count").default("0"),
  totalCount: numeric("total_count").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true } as any); // invoiceItems are usually handled manually or via a separate schema


export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type LedgerEntry = typeof ledger.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type TallyUploadResponse = {
  message: string;
  type: 'MASTER' | 'VOUCHER' | 'EXCEL';
  sessionId?: string;
  stats: {
    total: number;
    processed: number;
    groups?: number;
    ledgers?: number;
    skippedInvalid: number;
    duplicates: number;
    errors: number;
  };
  issues?: {
    validation: any[];
    rowErrors: any[];
  };
};

