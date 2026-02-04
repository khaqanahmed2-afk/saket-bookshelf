import { Request, Response } from "express";
import { db } from "../db";
import { customers, invoices, payments } from "@shared/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function getDashboardData(req: Request, res: Response) {
    try {
        if (!req.session?.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const customerId = req.session.user.id;
        const { period, start_date, end_date, page, pageSize } = req.query;

        // Pagination parameters (optional)
        const pageNum = page ? Math.max(1, parseInt(page as string, 10)) : null;
        const pageSizeNum = pageSize ? Math.max(1, Math.min(1000, parseInt(pageSize as string, 10))) : null;
        const offset = pageNum && pageSizeNum ? (pageNum - 1) * pageSizeNum : null;

        // Determine Date Range
        // Only apply date filtering if period is explicitly 'monthly' or 'yearly'
        // 'all' or undefined means no date filtering (show all invoices)
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        const now = new Date();

        if (start_date && end_date) {
            // Custom date range takes precedence
            startDate = new Date(start_date as string);
            endDate = new Date(end_date as string);
        } else if (period === 'monthly') {
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
        } else if (period === 'yearly') {
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const startYear = currentMonth < 3 ? currentYear - 1 : currentYear;
            startDate = new Date(startYear, 3, 1);
            endDate = new Date(startYear + 1, 2, 31);
        }
        // If period is 'all' or undefined, startDate and endDate remain null (no filtering)

        // 1. Fetch Customer
        const customerData = await db.query.customers.findFirst({
            where: eq(customers.id, customerId)
        });

        if (!customerData) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const baseOpeningBalance = Number(customerData.openingBalance || 0);
        let calculatedOpeningBalance = baseOpeningBalance;

        // 2. Calculate Opening Balance from View (Transactions before Start Date)
        if (startDate) {
            const dateStr = format(startDate, 'yyyy-MM-dd');
            const preStats = await db.execute(sql`
                SELECT SUM(debit - credit) as balance_change
                FROM customer_ledger_view
                WHERE customer_id = ${customerId}
                AND entry_date < ${dateStr}
            `);
            const change = Number(preStats.rows[0]?.balance_change || 0);
            calculatedOpeningBalance += change;
        }

        // 3. Calculate Period Stats
        let purchase = 0;
        let paid = 0;
        let periodQuery = sql`customer_id = ${customerId}`;

        if (startDate) {
            periodQuery = sql`${periodQuery} AND entry_date >= ${format(startDate, 'yyyy-MM-dd')}`;
        }
        if (endDate) {
            periodQuery = sql`${periodQuery} AND entry_date <= ${format(endDate, 'yyyy-MM-dd')}`;
        }

        const periodStats = await db.execute(sql`
            SELECT SUM(debit) as total_debit, SUM(credit) as total_credit
            FROM customer_ledger_view
            WHERE ${periodQuery}
        `);

        purchase = Number(periodStats.rows[0]?.total_debit || 0);
        paid = Number(periodStats.rows[0]?.total_credit || 0);

        // 4. Closing Balance
        const closingBalance = calculatedOpeningBalance + purchase - paid;

        // 5. Fetch Transaction List
        const ledgerResult = await db.execute(sql`
            SELECT * FROM customer_ledger_view
            WHERE ${periodQuery}
            ORDER BY entry_date ASC, created_at ASC
            LIMIT 1000
        `);

        // Calculate Running Balance for the ledger list
        let currentRunningBalance = calculatedOpeningBalance;
        const ledgerList = ledgerResult.rows.map(row => {
            currentRunningBalance += (Number(row.debit) - Number(row.credit));
            return {
                id: row.source_id,
                type: row.type, // Fixed: view returns 'type', not 'entry_type'
                entryDate: row.entry_date,
                referenceNo: row.description, // Fixed: view returns 'description', not 'reference_no'
                debit: row.debit,
                credit: row.credit,
                balance: currentRunningBalance,
                createdAt: row.created_at
            };
        }).reverse(); // Latest first for UI 


        // 6. Fetch Invoices and Payments for dedicated tabs
        // Use raw query for complex join/aggregation in reconciliation
        // Build WHERE clause conditionally (only apply date filter if dates are provided)
        let invoiceWhereClause = sql`i.customer_id = ${customerId}`;
        if (startDate && endDate) {
            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');
            invoiceWhereClause = sql`${invoiceWhereClause} AND i.date >= ${startStr} AND i.date <= ${endStr}`;
        } else if (startDate) {
            const startStr = format(startDate, 'yyyy-MM-dd');
            invoiceWhereClause = sql`${invoiceWhereClause} AND i.date >= ${startStr}`;
        } else if (endDate) {
            const endStr = format(endDate, 'yyyy-MM-dd');
            invoiceWhereClause = sql`${invoiceWhereClause} AND i.date <= ${endStr}`;
        }

        // Get total count for pagination (if pagination is requested)
        let totalInvoiceCount = null;
        if (pageNum !== null) {
            const countResult = await db.execute(sql`
                SELECT COUNT(DISTINCT i.id) as total
                FROM invoices i
                WHERE ${invoiceWhereClause}
            `);
            totalInvoiceCount = Number(countResult.rows[0]?.total || 0);
        }

        // Build pagination clause
        let paginationClause = sql``;
        if (offset !== null && pageSizeNum !== null) {
            paginationClause = sql`LIMIT ${pageSizeNum} OFFSET ${offset}`;
        }

        const invoicesWithReconciliation = await db.execute(sql`
            SELECT 
                i.*,
                COALESCE(SUM(p.amount), 0) as paid_amount,
                (i.total_amount - COALESCE(SUM(p.amount), 0)) as due_amount
            FROM invoices i
            LEFT JOIN payments p ON p.invoice_id = i.id
            WHERE ${invoiceWhereClause}
            GROUP BY i.id
            ORDER BY i.date DESC
            ${paginationClause}
        `);

        // Map to standard layout for frontend
        const invoiceList = invoicesWithReconciliation.rows.map(row => ({
            ...row,
            id: row.id,
            invoiceNo: row.invoice_no,
            date: row.date,
            totalAmount: row.total_amount,
            paidAmount: row.paid_amount,
            dueAmount: row.due_amount,
            status: Number(row.due_amount) <= 0 ? 'paid' : (Number(row.paid_amount) > 0 ? 'partial' : 'unpaid')
        }));

        // Payments - build WHERE clause conditionally (only apply date filter if dates are provided)
        let paymentWhereClause = sql`customer_id = ${customerId}`;
        if (startDate && endDate) {
            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');
            paymentWhereClause = sql`${paymentWhereClause} AND payment_date >= ${startStr} AND payment_date <= ${endStr}`;
        } else if (startDate) {
            const startStr = format(startDate, 'yyyy-MM-dd');
            paymentWhereClause = sql`${paymentWhereClause} AND payment_date >= ${startStr}`;
        } else if (endDate) {
            const endStr = format(endDate, 'yyyy-MM-dd');
            paymentWhereClause = sql`${paymentWhereClause} AND payment_date <= ${endStr}`;
        }

        // Payments query - no hard limit, apply pagination if requested
        let paymentPaginationClause = sql``;
        if (offset !== null && pageSizeNum !== null) {
            paymentPaginationClause = sql`LIMIT ${pageSizeNum} OFFSET ${offset}`;
        }

        const paymentList = await db.execute(sql`
            SELECT * FROM payments
            WHERE ${paymentWhereClause}
            ORDER BY payment_date DESC
            ${paymentPaginationClause}
        `);

        // 7. Calculate Monthly Stats for Charts
        const monthlyStats = await db.execute(sql`
            SELECT 
                to_char(entry_date, 'Mon') as month,
                EXTRACT(MONTH FROM entry_date) as m_num,
                SUM(debit) as total_purchase,
                SUM(credit) as total_paid
            FROM customer_ledger_view
            WHERE ${periodQuery}
            GROUP BY 1, 2
            ORDER BY 2
        `);

        res.json({
            customer: customerData,
            ledger: ledgerList, // Dictionary-like objects from raw SQL
            bills: [], // Empty, legacy support for frontend
            payments: Array.isArray(paymentList.rows) ? paymentList.rows : [],
            invoices: invoiceList,
            summary: {
                openingBalance: calculatedOpeningBalance,
                totalPurchases: purchase,
                totalPaid: paid,
                currentBalance: closingBalance
            },
            monthly: monthlyStats.rows.map(r => ({
                month: r.month,
                total_purchase: Number(r.total_purchase || 0),
                total_paid: Number(r.total_paid || 0)
            })),
            period: {
                type: period || 'all',
                startDate,
                endDate
            },
            pagination: pageNum !== null ? {
                page: pageNum,
                pageSize: pageSizeNum,
                total: totalInvoiceCount,
                totalPages: pageSizeNum ? Math.ceil((totalInvoiceCount || 0) / pageSizeNum) : null
            } : null
        });

    } catch (error: any) {
        console.error("Dashboard fetch error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
}

