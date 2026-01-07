import { pgTable, text, serial, integer, boolean, timestamp, bigint, uuid, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull().unique(),
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
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount").notNull(),
  mode: text("mode").notNull(), // e.g., 'Cash', 'UPI'
  referenceNo: text("reference_no"),
});

// Schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertLedgerSchema = createInsertSchema(ledger).omit({ id: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type LedgerEntry = typeof ledger.$inferSelect;
export type InsertLedgerEntry = z.infer<typeof insertLedgerSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type TallyUploadResponse = {
  message: string;
  stats: {
    processed: number;
    errors: number;
  };
};
