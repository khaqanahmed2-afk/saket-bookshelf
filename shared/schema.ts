import { pgTable, text, timestamp, bigint, uuid, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull().unique(),
  pin: text("pin"),
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
  mode: text("mode").notNull(),
  referenceNo: text("reference_no"),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertLedgerSchema = createInsertSchema(ledger).omit({ id: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type LedgerEntry = typeof ledger.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type TallyUploadResponse = {
  message: string;
  stats: {
    processed: number;
    errors: number;
  };
};
