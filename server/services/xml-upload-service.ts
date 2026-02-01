import crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import { db } from '../db';
import { uploadLogs, customers, bills, payments } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

export interface UploadResult {
    success: boolean;
    summary: {
        total: number;
        inserted: number;
        skipped: number;
        failed: number;
    };
    errors: Array<{
        row: number;
        field?: string;
        reason: string;
    }>;
    uploadLogId?: string;
}

export interface UploadStatus {
    customersUploaded: boolean;
    billsUploaded: boolean;
    paymentsUploaded: boolean;
    canUploadBills: boolean;
    canUploadPayments: boolean;
}

export class XMLUploadService {
    /**
     * Generate SHA-256 hash for file content
     */
    generateFileHash(buffer: Buffer): string {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }

    /**
     * Check if file with this hash has already been uploaded
     */
    async isDuplicateFile(hash: string): Promise<boolean> {
        const existing = await db.query.uploadLogs.findFirst({
            where: eq(uploadLogs.fileHash, hash),
        });
        return !!existing;
    }

    /**
     * Get current upload status to enforce order
     */
    async getUploadStatus(): Promise<UploadStatus> {
        const [customersLog, billsLog, paymentsLog] = await Promise.all([
            db.query.uploadLogs.findFirst({
                where: and(
                    eq(uploadLogs.uploadType, 'customers'),
                    or(eq(uploadLogs.status, 'success'), eq(uploadLogs.status, 'partial'))
                ),
                orderBy: (logs, { desc }) => [desc(logs.uploadedAt)],
            }),
            db.query.uploadLogs.findFirst({
                where: and(
                    eq(uploadLogs.uploadType, 'bills'),
                    or(eq(uploadLogs.status, 'success'), eq(uploadLogs.status, 'partial'))
                ),
                orderBy: (logs, { desc }) => [desc(logs.uploadedAt)],
            }),
            db.query.uploadLogs.findFirst({
                where: and(
                    eq(uploadLogs.uploadType, 'payments'),
                    or(eq(uploadLogs.status, 'success'), eq(uploadLogs.status, 'partial'))
                ),
                orderBy: (logs, { desc }) => [desc(logs.uploadedAt)],
            }),
        ]);

        const customersUploaded = !!customersLog;
        const billsUploaded = !!billsLog;
        const paymentsUploaded = !!paymentsLog;

        return {
            customersUploaded,
            billsUploaded,
            paymentsUploaded,
            canUploadBills: customersUploaded,
            canUploadPayments: billsUploaded,
        };
    }

    /**
     * Parse XML to JavaScript object
     */
    parseXML(xmlContent: string): any {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            textNodeName: '#text',
            parseTagValue: true,
            parseAttributeValue: true,
            trimValues: true,
        });

        try {
            return parser.parse(xmlContent);
        } catch (error: any) {
            throw new Error(`Invalid XML format: ${error.message}`);
        }
    }

    /**
     * Validate and normalize customer data from XML
     */
    validateCustomerXML(data: any): boolean {
        // Check if XML has expected structure
        // This will vary based on actual XML format - update as needed
        return !!(data && (data.Customers || data.ENVELOPE || data.customers));
    }

    /**
     * Extract customer records from parsed XML
     * Returns normalized customer objects
     */
    extractCustomers(xmlData: any): Array<{
        name: string;
        mobile: string;
        customerCode?: string;
        source: string;
    }> {
        // This is a template - update based on actual XML structure
        const customers: any[] = [];

        // Handle different possible XML structures
        let customerList = xmlData.Customers?.Customer
            || xmlData.ENVELOPE?.BODY?.DATA?.TALLYMESSAGE
            || xmlData.customers?.customer
            || [];

        // Ensure it's an array
        if (!Array.isArray(customerList)) {
            customerList = [customerList];
        }

        for (const customer of customerList) {
            if (!customer) continue;

            const name = customer.NAME || customer.name || customer['@_NAME'];
            const mobile = customer.MOBILE || customer.mobile || customer.PHONE || customer.phone;
            const customerCode = customer.CODE || customer.code || customer.GUID;

            if (name) {
                customers.push({
                    name: String(name).trim(),
                    mobile: mobile ? String(mobile).trim() : '',
                    customerCode: customerCode ? String(customerCode).trim() : undefined,
                    source: 'xml_upload',
                });
            }
        }

        return customers;
    }

    /**
     * Extract bill records from parsed XML
     */
    extractBills(xmlData: any): Array<{
        billNo: string;
        billDate: string;
        amount: string;
        customerCode?: string;
        customerName?: string;
    }> {
        const bills: any[] = [];

        let billList = xmlData.Bills?.Bill
            || xmlData.ENVELOPE?.BODY?.DATA?.TALLYMESSAGE
            || xmlData.bills?.bill
            || [];

        if (!Array.isArray(billList)) {
            billList = [billList];
        }

        for (const bill of billList) {
            if (!bill) continue;

            const billNo = bill.BILLNO || bill.billNo || bill.NUMBER || bill.number || bill.VOUCHERNUMBER;
            const billDate = bill.DATE || bill.billDate || bill.date;
            const amount = bill.AMOUNT || bill.amount || bill.TOTAL || bill.total;
            const customerCode = bill.CUSTOMER_CODE || bill.customerCode || bill.PARTYNAME;
            const customerName = bill.CUSTOMER_NAME || bill.customerName || bill.PARTYNAME;

            if (billNo && billDate) {
                bills.push({
                    billNo: String(billNo).trim(),
                    billDate: String(billDate).trim(),
                    amount: amount ? String(amount) : '0',
                    customerCode: customerCode ? String(customerCode).trim() : undefined,
                    customerName: customerName ? String(customerName).trim() : undefined,
                });
            }
        }

        return bills;
    }

    /**
     * Extract payment records from parsed XML
     */
    extractPayments(xmlData: any): Array<{
        receiptNo: string;
        billNo: string;
        amount: string;
        paymentDate: string;
        paymentMode?: string;
    }> {
        const payments: any[] = [];

        let paymentList = xmlData.Payments?.Payment
            || xmlData.ENVELOPE?.BODY?.DATA?.TALLYMESSAGE
            || xmlData.payments?.payment
            || [];

        if (!Array.isArray(paymentList)) {
            paymentList = [paymentList];
        }

        for (const payment of paymentList) {
            if (!payment) continue;

            const receiptNo = payment.RECEIPTNO || payment.receiptNo || payment.NUMBER || payment.number;
            const billNo = payment.BILLNO || payment.billNo || payment.AGAINST_BILL;
            const amount = payment.AMOUNT || payment.amount;
            const paymentDate = payment.DATE || payment.paymentDate || payment.date;
            const paymentMode = payment.MODE || payment.mode || payment.METHOD || 'Cash';

            if (receiptNo && billNo && paymentDate) {
                payments.push({
                    receiptNo: String(receiptNo).trim(),
                    billNo: String(billNo).trim(),
                    amount: amount ? String(amount) : '0',
                    paymentDate: String(paymentDate).trim(),
                    paymentMode: paymentMode ? String(paymentMode).trim() : 'Cash',
                });
            }
        }

        return payments;
    }

    /**
     * Save upload log to database
     */
    async saveUploadLog(logData: {
        fileName: string;
        fileHash: string;
        uploadType: 'customers' | 'bills' | 'payments';
        recordsTotal: number;
        recordsSuccess: number;
        recordsFailed: number;
        recordsSkipped: number;
        errorLog: any[];
        status: 'success' | 'partial' | 'failed';
    }) {
        const [log] = await db.insert(uploadLogs).values({
            fileName: logData.fileName,
            fileHash: logData.fileHash,
            uploadType: logData.uploadType,
            recordsTotal: String(logData.recordsTotal),
            recordsSuccess: String(logData.recordsSuccess),
            recordsFailed: String(logData.recordsFailed),
            recordsSkipped: String(logData.recordsSkipped),
            errorLog: logData.errorLog,
            status: logData.status,
        }).returning();

        return log;
    }
}

export const xmlUploadService = new XMLUploadService();
