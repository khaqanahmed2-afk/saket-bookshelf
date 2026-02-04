import { pgTable, text, timestamp, bigint, uuid, date, numeric, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
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
  mobile: text("mobile").notNull(),
  customerCode: text("customer_code"), // For XML imports - unique customer identifier
  pin: text("pin"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  email: text("email"),
  address: text("address"),

  // Tally Import Fields
  openingBalance: numeric("opening_balance").default("0"),
  balanceType: text("balance_type", { enum: ["receivable", "payable"] }).default("receivable"),
  locked: boolean("locked").default(false),

  source: text("source").default("system"),
  externalId: text("external_id"),
  mobileVerified: boolean("mobile_verified").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

// Ledger table removed - using customer_ledger_view instead

// Bills table removed - merged into invoices

export const payments = pgTable("payments", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  customerId: uuid("customer_id").references(() => customers.id),
  invoiceId: uuid("invoice_id").references(() => invoices.id), // Unified reference to invoices
  // billId reference removed
  receiptNo: text("receipt_no").notNull(), // Receipt/payment number from XML
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount").notNull(),
  mode: text("mode").notNull(),
  referenceNo: text("reference_no"),
  source: text("source").default("system"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    idxPaymentUnique: uniqueIndex("idx_payment_unique").on(table.receiptNo, table.customerId),
  };
});

// Import tracking table (for XML/Excel uploads)
export const importLogs = pgTable("import_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileName: text("file_name").notNull(),
  fileHash: text("file_hash").notNull().unique(), // SHA-256 hash for duplicate detection
  importType: text("import_type", {
    enum: ["customers", "bills", "payments", "party", "sales"]
  }).notNull(),
  // Tally/Standard Import Audit
  totalRows: numeric("total_rows").notNull().default("0"),
  importedRows: numeric("imported_rows").notNull().default("0"),
  skippedRows: numeric("skipped_rows").notNull().default("0"),
  errorRows: numeric("error_rows").notNull().default("0"),
  errorLog: jsonb("error_log"), // Array of error details
  errorSummary: text("error_summary"),
  status: text("status", { enum: ["success", "partial", "failed"] }).notNull(),
  uploadedBy: uuid("uploaded_by"),
  importedAt: timestamp("imported_at").defaultNow(),
});

// drizzle-zod's inferred typings can vary across versions; cast omit shape to keep `tsc` stable.
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true } as any);
export const insertLedgerSchema = z.object({}); // Placeholder for type compatibility until removal complete
export const insertBillSchema = z.object({}); // Placeholder for type compatibility until removal complete
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true } as any);
export const insertImportLogSchema = createInsertSchema(importLogs).omit({ id: true, importedAt: true } as any);

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
  // Attributes from merged 'bills' table
  locked: boolean("locked").default(false),
  legacyBillId: bigint("legacy_bill_id", { mode: "number" }), // Temporary for migration
}, (table) => {
  return {
    idxInvoiceUnique: uniqueIndex("idx_invoice_unique").on(table.invoiceNo, table.customerId),
  };
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

export const mobileLinkRequests = pgTable("mobile_link_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  shopName: text("shop_name"),
  mobile: text("mobile").notNull(),
  status: text("status").default("pending").notNull(),

  // Admin Verification Metadata
  approvedBy: uuid("approved_by").references(() => customers.id),
  approvedAt: timestamp("approved_at"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true } as any); // invoiceItems are usually handled manually or via a separate schema


export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type LedgerEntry = any; // Deprecated
export type Bill = any; // Deprecated
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

