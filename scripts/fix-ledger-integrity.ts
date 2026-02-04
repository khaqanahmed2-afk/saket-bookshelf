
import "dotenv/config";
import { db } from "../server/db";
import { invoices, payments, ledger, customers } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

async function fixLedgerIntegrity() {
    console.log("Starting Ledger Integrity Fix...");

    // 1. Fetch all invoices marked as 'paid'
    const paidInvoices = await db.select().from(invoices).where(eq(invoices.status, 'paid'));
    console.log(`Found ${paidInvoices.length} paid invoices.`);

    let fixedCount = 0;

    for (const invoice of paidInvoices) {
        if (!invoice.customerId) continue;

        // Check if a payment exists for this invoice (using reference check or approximate date/amount match)
        // Since original import might use 'VYAPAR-{invoiceNo}' as receiptNo or logic
        const receiptRef = `FIX-${invoice.invoiceNo}`;

        // Check for loose match: Payment with reference to this invoice OR created on same day with same amount
        const existingPayment = await db.query.payments.findFirst({
            where: and(
                eq(payments.customerId, invoice.customerId),
                eq(payments.amount, invoice.totalAmount),
                eq(payments.paymentDate, invoice.date)
                // We don't check reference strictly as it might be missing
            )
        });

        if (!existingPayment) {
            console.log(`Fixing Invoice ${invoice.invoiceNo}: Creating Payment Entry for ₹${invoice.totalAmount}`);

            await db.transaction(async (tx) => {
                // 1. Create Payment
                const [newPayment] = await tx.insert(payments).values({
                    customerId: invoice.customerId,
                    amount: invoice.totalAmount,
                    paymentDate: invoice.date,
                    mode: 'adjustment', // Mark as auto-fix
                    receiptNo: receiptRef,
                    referenceNo: `INV-${invoice.invoiceNo}`,
                    source: 'system-fix'
                }).returning();

                // 2. Create Ledger Credit Entry (Payment)
                await tx.insert(ledger).values({
                    customerId: invoice.customerId,
                    entryDate: invoice.date,
                    credit: invoice.totalAmount,
                    debit: "0",
                    balance: "0", // Will need full recalculation later, but for now filtering sums will work
                    voucherNo: `PAY-${receiptRef}`
                });

                // 3. Create Ledger Debit Entry (Purchase) if missing? 
                // We should also check if the *Purchase* side exists in ledger. 
                // But typically purchases are more reliably imported as invoices.
                // Let's assume dashboard aggregates invoices + ledger-debits. 
                // Previous code aggregates ledger.debit. Does import create ledger.debit for invoices?

                // Let's check if we need to insert Debit for the Invoice itself into Ledger
                // The current Dashboard logic sums LEDGER DEBITS. If import does not put invoice into ledger, total purchase will be 0.

                const existingLedgerDebit = await tx.query.ledger.findFirst({
                    where: and(
                        eq(ledger.customerId, invoice.customerId),
                        eq(ledger.debit, invoice.totalAmount),
                        eq(ledger.entryDate, invoice.date),
                        eq(ledger.voucherNo, `INV-${invoice.invoiceNo}`)
                    )
                });

                if (!existingLedgerDebit) {
                    console.log(`  -> Also creating missing Ledger Debit for Invoice ${invoice.invoiceNo}`);
                    await tx.insert(ledger).values({
                        customerId: invoice.customerId,
                        entryDate: invoice.date,
                        debit: invoice.totalAmount,
                        credit: "0",
                        balance: "0",
                        voucherNo: `INV-${invoice.invoiceNo}`
                    });
                }
            });

            fixedCount++;
        }
    }

    console.log(`Finished. Fixed ${fixedCount} invoices.`);
    process.exit(0);
}

fixLedgerIntegrity().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
