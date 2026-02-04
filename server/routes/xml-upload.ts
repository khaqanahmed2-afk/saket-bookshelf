import { Router, Request, Response } from 'express';
import multer from 'multer';
import { xmlUploadService } from '../services/xml-upload-service';
import { db } from '../db';
import { customers, payments, importLogs, invoices } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Configure multer for XML file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/xml' || file.mimetype === 'application/xml' || file.originalname.endsWith('.xml')) {
            cb(null, true);
        } else {
            cb(new Error('Only .xml files are allowed'));
        }
    },
});

/**
 * GET /api/admin/upload/status
 * Get current upload status to enforce order
 */
router.get('/status', requireAdmin, async (req: Request, res: Response) => {
    try {
        const status = await xmlUploadService.getUploadStatus();
        res.json(status);
    } catch (error: any) {
        console.error('Error getting upload status:', error);
        res.status(500).json({ error: 'Failed to get upload status' });
    }
});

/**
 * POST /api/admin/upload/customers
 * Upload customers XML file
 */
router.post('/customers', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = req.file.originalname;
        const fileBuffer = req.file.buffer;
        const fileHash = xmlUploadService.generateFileHash(fileBuffer);

        // Check for duplicate file
        if (await xmlUploadService.isDuplicateFile(fileHash)) {
            return res.status(400).json({
                error: 'This file has already been uploaded',
                details: `File hash: ${fileHash.substring(0, 12)}...`
            });
        }

        // Parse XML
        const xmlContent = fileBuffer.toString('utf-8');
        const xmlData = xmlUploadService.parseXML(xmlContent);

        if (!xmlUploadService.validateCustomerXML(xmlData)) {
            return res.status(400).json({ error: 'Invalid XML format for customers' });
        }

        // Extract customers
        const customerRecords = xmlUploadService.extractCustomers(xmlData);

        if (customerRecords.length === 0) {
            return res.status(400).json({ error: 'No customer records found in XML' });
        }

        // Process each customer in chunks for performance
        const CHUNK_SIZE = 500;
        let inserted = 0;
        let skipped = 0;
        let failed = 0;
        const errors: any[] = [];

        for (let i = 0; i < customerRecords.length; i += CHUNK_SIZE) {
            const chunk = customerRecords.slice(i, i + CHUNK_SIZE);

            await db.transaction(async (tx) => {
                for (let j = 0; j < chunk.length; j++) {
                    const customer = chunk[j];
                    const rowIndex = i + j + 1;

                    try {
                        // Check for duplicate by customer_code or name+mobile
                        const existing = customer.customerCode
                            ? await tx.query.customers.findFirst({
                                where: eq(customers.customerCode, customer.customerCode),
                            })
                            : await tx.query.customers.findFirst({
                                where: and(
                                    eq(customers.name, customer.name),
                                    eq(customers.mobile, customer.mobile)
                                ),
                            });

                        if (existing) {
                            skipped++;
                            continue;
                        }

                        // Validate mobile number
                        if (!customer.mobile || customer.mobile.length < 10) {
                            errors.push({
                                row: rowIndex,
                                field: 'mobile',
                                reason: 'Invalid or missing mobile number'
                            });
                            failed++;
                            continue;
                        }

                        // Insert customer
                        await tx.insert(customers).values({
                            name: customer.name,
                            mobile: customer.mobile,
                            customerCode: customer.customerCode,
                            source: customer.source,
                            role: 'user',
                        });

                        inserted++;
                    } catch (error: any) {
                        errors.push({
                            row: rowIndex,
                            reason: error.message || 'Database error'
                        });
                        failed++;
                    }
                }
            });
        }

        // Determine status
        const status = failed === 0 ? 'success' : (inserted > 0 ? 'partial' : 'failed');

        // Save upload log
        const uploadLog = await xmlUploadService.saveUploadLog({
            fileName,
            fileHash,
            uploadType: 'customers',
            recordsTotal: customerRecords.length,
            recordsSuccess: inserted,
            recordsFailed: failed,
            recordsSkipped: skipped,
            errorLog: errors,
            status,
        });

        res.json({
            success: status !== 'failed',
            summary: {
                total: customerRecords.length,
                inserted,
                skipped,
                failed,
            },
            errors: errors.slice(0, 100), // Limit to first 100 errors in response
            uploadLogId: uploadLog.id,
        });

    } catch (error: any) {
        console.error('Error uploading customers XML:', error);
        res.status(500).json({ error: error.message || 'Failed to upload customers XML' });
    }
});

/**
 * POST /api/admin/upload/bills
 * Upload bills XML file
 */
router.post('/bills', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
    try {
        // Check upload order
        const status = await xmlUploadService.getUploadStatus();
        if (!status.canUploadBills) {
            return res.status(400).json({
                error: 'Upload order violation',
                details: 'Customers XML must be uploaded before Bills XML'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = req.file.originalname;
        const fileBuffer = req.file.buffer;
        const fileHash = xmlUploadService.generateFileHash(fileBuffer);

        // Check for duplicate file
        if (await xmlUploadService.isDuplicateFile(fileHash)) {
            return res.status(400).json({
                error: 'This file has already been uploaded',
                details: `File hash: ${fileHash.substring(0, 12)}...`
            });
        }

        // Parse XML
        const xmlContent = fileBuffer.toString('utf-8');
        const xmlData = xmlUploadService.parseXML(xmlContent);

        // Extract bills
        const billRecords = xmlUploadService.extractBills(xmlData);

        if (billRecords.length === 0) {
            return res.status(400).json({ error: 'No bill records found in XML' });
        }

        // Process each bill in chunks
        const CHUNK_SIZE = 500;
        let inserted = 0;
        let skipped = 0;
        let failed = 0;
        const errors: any[] = [];

        for (let i = 0; i < billRecords.length; i += CHUNK_SIZE) {
            const chunk = billRecords.slice(i, i + CHUNK_SIZE);

            await db.transaction(async (tx) => {
                for (let j = 0; j < chunk.length; j++) {
                    const bill = chunk[j];
                    const rowIndex = i + j + 1;

                    try {
                        // 1. Find customer first
                        let customer;
                        if (bill.customerCode) {
                            customer = await tx.query.customers.findFirst({
                                where: eq(customers.customerCode, bill.customerCode),
                            });
                        } else if (bill.customerName) {
                            customer = await tx.query.customers.findFirst({
                                where: eq(customers.name, bill.customerName),
                            });
                        }

                        if (!customer) {
                            errors.push({
                                row: rowIndex,
                                field: 'customer',
                                reason: `Customer not found: ${bill.customerCode || bill.customerName}`
                            });
                            failed++;
                            continue;
                        }

                        // 2. Check for duplicate invoice (Bill No + Customer ID)
                        // Use UPSERT logic via ON CONFLICT if possible, but drizzle findFirst is safer for logging skipped
                        const existing = await tx.query.invoices.findFirst({
                            where: and(
                                eq(invoices.invoiceNo, bill.billNo),
                                eq(invoices.customerId, customer.id)
                            ),
                        });

                        if (existing) {
                            skipped++;
                            continue;
                        }

                        // 3. Insert invoice
                        await tx.insert(invoices).values({
                            invoiceNo: bill.billNo,
                            date: bill.billDate,
                            totalAmount: bill.amount,
                            customerId: customer.id,
                            source: 'xml_upload',
                            locked: true,
                            status: 'paid'
                        });

                        inserted++;
                    } catch (error: any) {
                        errors.push({
                            row: rowIndex,
                            reason: error.message || 'Database error'
                        });
                        failed++;
                    }
                }
            });
        }

        // Determine status
        const uploadStatus = failed === 0 ? 'success' : (inserted > 0 ? 'partial' : 'failed');

        // Save upload log
        const uploadLog = await xmlUploadService.saveUploadLog({
            fileName,
            fileHash,
            uploadType: 'bills',
            recordsTotal: billRecords.length,
            recordsSuccess: inserted,
            recordsFailed: failed,
            recordsSkipped: skipped,
            errorLog: errors,
            status: uploadStatus,
        });

        res.json({
            success: uploadStatus !== 'failed',
            summary: {
                total: billRecords.length,
                inserted,
                skipped,
                failed,
            },
            errors: errors.slice(0, 100),
            uploadLogId: uploadLog.id,
        });

    } catch (error: any) {
        console.error('Error uploading bills XML:', error);
        res.status(500).json({ error: error.message || 'Failed to upload bills XML' });
    }
});

/**
 * POST /api/admin/upload/payments
 * Upload payments/receipts XML file
 */
router.post('/payments', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
    try {
        // Check upload order
        const status = await xmlUploadService.getUploadStatus();
        if (!status.canUploadPayments) {
            return res.status(400).json({
                error: 'Upload order violation',
                details: 'Bills XML must be uploaded before Payments XML'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = req.file.originalname;
        const fileBuffer = req.file.buffer;
        const fileHash = xmlUploadService.generateFileHash(fileBuffer);

        // Check for duplicate file
        if (await xmlUploadService.isDuplicateFile(fileHash)) {
            return res.status(400).json({
                error: 'This file has already been uploaded',
                details: `File hash: ${fileHash.substring(0, 12)}...`
            });
        }

        // Parse XML
        const xmlContent = fileBuffer.toString('utf-8');
        const xmlData = xmlUploadService.parseXML(xmlContent);

        // Extract payments
        const paymentRecords = xmlUploadService.extractPayments(xmlData);

        if (paymentRecords.length === 0) {
            return res.status(400).json({ error: 'No payment records found in XML' });
        }

        // Process each payment in chunks
        const CHUNK_SIZE = 500;
        let inserted = 0;
        let skipped = 0;
        let failed = 0;
        const errors: any[] = [];

        for (let i = 0; i < paymentRecords.length; i += CHUNK_SIZE) {
            const chunk = paymentRecords.slice(i, i + CHUNK_SIZE);

            await db.transaction(async (tx) => {
                for (let j = 0; j < chunk.length; j++) {
                    const payment = chunk[j];
                    const rowIndex = i + j + 1;

                    try {
                        // Find invoice (mapped from bill)
                        const bill = await tx.query.invoices.findFirst({
                            where: eq(invoices.invoiceNo, payment.billNo),
                        });

                        if (!bill) {
                            errors.push({
                                row: rowIndex,
                                field: 'bill',
                                reason: `Bill not found: ${payment.billNo}`
                            });
                            failed++;
                            continue;
                        }

                        // Check for duplicate by receipt_no + invoice_id
                        const existing = await tx.query.payments.findFirst({
                            where: and(
                                eq(payments.receiptNo, payment.receiptNo),
                                eq(payments.invoiceId, bill.id)
                            ),
                        });

                        if (existing) {
                            skipped++;
                            continue;
                        }

                        // Insert payment
                        await tx.insert(payments).values({
                            receiptNo: payment.receiptNo,
                            invoiceId: bill.id,
                            customerId: bill.customerId!,
                            paymentDate: payment.paymentDate,
                            amount: payment.amount,
                            mode: payment.paymentMode || 'Cash',
                            source: 'xml_upload',
                        });

                        inserted++;
                    } catch (error: any) {
                        errors.push({
                            row: rowIndex,
                            reason: error.message || 'Database error'
                        });
                        failed++;
                    }
                }
            });
        }

        // Determine status
        const uploadStatus = failed === 0 ? 'success' : (inserted > 0 ? 'partial' : 'failed');

        // Save upload log
        const uploadLog = await xmlUploadService.saveUploadLog({
            fileName,
            fileHash,
            uploadType: 'payments',
            recordsTotal: paymentRecords.length,
            recordsSuccess: inserted,
            recordsFailed: failed,
            recordsSkipped: skipped,
            errorLog: errors,
            status: uploadStatus,
        });

        res.json({
            success: uploadStatus !== 'failed',
            summary: {
                total: paymentRecords.length,
                inserted,
                skipped,
                failed,
            },
            errors: errors.slice(0, 100),
            uploadLogId: uploadLog.id,
        });

    } catch (error: any) {
        console.error('Error uploading payments XML:', error);
        res.status(500).json({ error: error.message || 'Failed to upload payments XML' });
    }
});

/**
 * GET /api/admin/upload/:uploadId/errors
 * Download error report as CSV
 */
router.get('/:uploadId/errors', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { uploadId } = req.params;

        const uploadLog = await db.query.importLogs.findFirst({
            where: eq(importLogs.id, uploadId),
        });

        if (!uploadLog || !uploadLog.errorLog) {
            return res.status(404).json({ error: 'Upload log not found or has no errors' });
        }

        // Generate CSV
        const errors = uploadLog.errorLog as any[];
        let csv = 'Row,Field,Reason\n';

        for (const error of errors) {
            csv += `${error.row || ''},${error.field || ''},"${error.reason || ''}"\n`;
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${uploadLog.fileName}_errors.csv"`);
        res.send(csv);

    } catch (error: any) {
        console.error('Error downloading error report:', error);
        res.status(500).json({ error: 'Failed to download error report' });
    }
});

export default router;
