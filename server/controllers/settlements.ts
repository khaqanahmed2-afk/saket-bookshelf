import { Request, Response } from "express";
import { db } from "../db";
import { payments, invoices } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Handle manual invoice settlement (UX Sugar)
 */
export async function settleInvoice(req: Request, res: Response) {
    try {
        const { invoiceId, amount, paymentDate, paymentMode, referenceNo } = req.body;

        if (!invoiceId || !amount || !paymentDate) {
            return res.status(400).json({ message: "Missing required fields (invoiceId, amount, paymentDate)" });
        }

        // 1. Verify invoice exists
        const invoice = await db.query.invoices.findFirst({
            where: eq(invoices.id, invoiceId)
        });

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // 2. Validate payment amount
        const paymentAmount = Number(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ message: "Payment amount must be greater than 0" });
        }

        // 3. Calculate total already paid for this invoice
        const totalPaidResult = await db.execute(sql`
            SELECT COALESCE(SUM(amount::numeric), 0) as total_paid
            FROM payments
            WHERE invoice_id = ${invoiceId}
        `);
        const totalPaid = Number(totalPaidResult.rows[0]?.total_paid || 0);
        const invoiceTotal = Number(invoice.totalAmount || 0);
        const remainingDue = invoiceTotal - totalPaid;

        // 4. Validate that payment doesn't exceed remaining due amount
        if (paymentAmount > remainingDue) {
            return res.status(400).json({ 
                message: `Payment amount (₹${paymentAmount.toLocaleString()}) exceeds remaining due amount (₹${remainingDue.toLocaleString()})`,
                remainingDue: remainingDue,
                totalPaid: totalPaid,
                invoiceTotal: invoiceTotal
            });
        }

        // 5. Check for duplicate payment (same amount, same date, same invoice)
        const existingPayment = await db.query.payments.findFirst({
            where: and(
                eq(payments.invoiceId, invoiceId),
                eq(payments.amount, paymentAmount.toString()),
                eq(payments.paymentDate, new Date(paymentDate).toISOString().split('T')[0])
            )
        });

        if (existingPayment) {
            return res.status(400).json({ 
                message: "A payment with the same amount and date already exists for this invoice",
                existingPaymentId: existingPayment.id
            });
        }

        // 6. Insert payment record
        // Note: receiptNo is required by schema, we'll generate one or use referenceNo
        const receiptNo = referenceNo || `SETTLE-${Date.now()}`;

        await db.insert(payments).values({
            customerId: invoice.customerId,
            invoiceId: invoice.id,
            receiptNo,
            paymentDate: new Date(paymentDate).toISOString().split('T')[0], // YYYY-MM-DD
            amount: amount.toString(),
            mode: paymentMode || 'Cash',
            referenceNo,
            source: 'manual_settlement'
        });

        res.json({ success: true, message: "Payment recorded successfully" });

    } catch (error: any) {
        console.error("Settlement error:", error);
        res.status(500).json({ message: "Failed to record settlement", error: error.message });
    }
}
