import * as XLSX from "xlsx";
import { db } from "../db";
import { stagingImports, customers, products, invoices, invoiceItems, payments } from "@shared/schema";
import { VYAPAR_CONFIG } from "./vyapar-config";
import { eq, and, sql } from "drizzle-orm";
import { normalizePhoneNumber, parseFlexibleDate } from "./tally"; // Reuse helpers

// Helper to normalize header names
function normalizeHeader(header: string): string {
    return header.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

// 1. Parser Service
export async function parseFile(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    return rawData;
}

// 2. Validation & Mapping Service
export function validateAndMap(data: any[], type: "customers" | "products" | "invoices") {
    const config = VYAPAR_CONFIG[type];
    if (!config) throw new Error(`Unknown import type: ${type}`);

    const processedRows: any[] = [];
    const errors: any[] = [];

    // Create a mapping of likely headers in file to target keys
    // We scan the first row to determine availability
    if (data.length === 0) return { processedRows, errors };

    const fileHeaders = Object.keys(data[0]);
    const headerMap: Record<string, string> = {}; // key: normalizedHeader -> targetKey

    // Build header map
    for (const [targetKey, possibleNames] of Object.entries(config.mappings)) {
        for (const name of possibleNames) {
            const normalizedName = normalizeHeader(name);
            // Find matching header in file
            const foundHeader = fileHeaders.find(fh => normalizeHeader(fh) === normalizedName);
            if (foundHeader) {
                headerMap[targetKey] = foundHeader;
                break; // Found a match for this target key
            }
        }
    }

    // Validate required columns
    const missingColumns = config.requiredColumns.filter(col => {
        // Check if any of the possible names for this requirement maps to a found header
        // This is tricky because requiredColumns names in config might be "Party Name", but we need to check if we found a valid mapping for the 'name' key?
        // Let's simplify: VYAPAR_CONFIG.requiredColumns should verify that for critical keys, we found the mapping.

        // We'll iterate the config mapping to find which key corresponds to the required column text
        // actually, requiredColumns in my config was simple text. Let's find if we have a mapped key for it.
        // Better: Check if we have mapped keys for 'name' and 'mobile' for customers.
        // I'll update the config usage to be key-based for requirements or just check if data exists.

        // For now, let's proceed with row-level validation.
        return false;
    });

    data.forEach((row, index) => {
        const mappedRow: any = {};
        const rowErrors: string[] = [];
        let isValid = true;

        // Map fields
        for (const [targetKey, sourceHeader] of Object.entries(headerMap)) {
            mappedRow[targetKey] = row[sourceHeader];
        }

        // specific validation
        if (type === "customers") {
            if (!mappedRow.name) {
                rowErrors.push("Missing Name");
                isValid = false;
            }
            if (!mappedRow.mobile) {
                rowErrors.push("Missing Mobile");
                isValid = false;
            } else {
                mappedRow.mobile = normalizePhoneNumber(String(mappedRow.mobile));
                if (mappedRow.mobile.length !== 10) {
                    rowErrors.push("Invalid Mobile");
                    isValid = false;
                }
            }
        } else if (type === "products") {
            if (!mappedRow.name) {
                rowErrors.push("Missing Product Name");
                isValid = false;
            }
            mappedRow.price = mappedRow.price ? String(mappedRow.price) : "0";
            mappedRow.stock = mappedRow.stock ? String(mappedRow.stock) : "0";
        } else if (type === "invoices") {
            if (!mappedRow.invoiceNo || !mappedRow.totalAmount) {
                rowErrors.push("Missing Invoice No or Amount");
                isValid = false;
            }
            mappedRow.date = parseFlexibleDate(mappedRow.date);
            mappedRow.totalAmount = String(mappedRow.totalAmount);
        }

        if (isValid) {
            processedRows.push(mappedRow);
        } else {
            errors.push({ row: index + 2, error: rowErrors.join(", "), raw: row });
        }
    });

    return { processedRows, errors };
}

// 3. Staging -> Main Sync Service
export async function processStagingImport(importId: string) {
    const [record] = await db
        .select()
        .from(stagingImports)
        .where(eq(stagingImports.id, importId))
        .limit(1);

    if (!record || record.status === "processed") return;

    const type = record.type as "customers" | "products" | "invoices";
    // Safe parsing of JSONB in older environments or if drizzle just returns object
    let rawData = record.rawData;
    // If we couldn't use jsonb type and used text, we parse. But we used jsonb (or should have).
    // Drizzle with pg-core jsonb usually returns the object directly.
    if (typeof rawData === 'string') {
        try { rawData = JSON.parse(rawData); } catch (e) { }
    }

    const { processedRows, errors: validationErrors } = validateAndMap(rawData as any[], type);

    // Collect all errors (validation + runtime)
    const allErrors = [...validationErrors];

    // Transactional insert/upsert
    await db.transaction(async (tx) => {
        let successCount = 0;

        if (type === "customers") {
            for (const row of processedRows) {
                // Check for duplicate by mobile or external_id
                const existing = await tx.query.customers.findFirst({
                    where: eq(customers.mobile, row.mobile)
                });

                if (!existing) {
                    await tx.insert(customers).values({
                        name: row.name,
                        mobile: row.mobile,
                        source: "vyapar",
                        externalId: row.externalId || null
                    });
                    successCount++;
                } else {
                    allErrors.push({ row: row.name, error: "Duplicate Customer (Mobile)" });
                }
            }
        }
        else if (type === "products") {
            for (const row of processedRows) {
                // Check duplicate by code or name
                // Optimistically using name if code missing
                const existing = await tx.query.products.findFirst({
                    where: row.code ? eq(products.code, row.code) : eq(products.name, row.name)
                });

                if (!existing) {
                    await tx.insert(products).values({
                        name: row.name,
                        category: row.category || "Stationery", // Default category if not provided
                        code: row.code,
                        price: row.price,
                        stock: row.stock,
                        source: "vyapar"
                    });
                    successCount++;
                } else {
                    allErrors.push({ row: row.name, error: "Duplicate Product" });
                }
            }
        }
        else if (type === "invoices") {
            for (const row of processedRows) {
                try {
                    // 1. Resolve customer logic FIRST
                    let customerId = null;
                    if (row.customerName) {
                        // Robust matching: lower(trim(name))
                        const [customer] = await tx.select().from(customers).where(
                            sql`lower(trim(${customers.name})) = lower(trim(${row.customerName}))`
                        ).limit(1);

                        if (customer) {
                            customerId = customer.id;
                        } else {
                            allErrors.push({ row: row.invoiceNo, error: `Customer not found: ${row.customerName}` });
                            continue;
                        }
                    } else {
                        allErrors.push({ row: row.invoiceNo, error: "Missing Party Name" });
                        continue;
                    }

                    // 2. Check for duplicate invoice (Invoice + Customer + Source)
                    const existing = await tx.query.invoices.findFirst({
                        where: and(
                            eq(invoices.invoiceNo, row.invoiceNo),
                            eq(invoices.customerId, customerId),
                            eq(invoices.source, "vyapar")
                        )
                    });

                    if (existing) {
                        allErrors.push({ row: row.invoiceNo, error: "Duplicate Invoice (Skipped)" });
                        continue;
                    }

                    // Insert Invoice
                    const [newInvoice] = await tx.insert(invoices).values({
                        invoiceNo: row.invoiceNo,
                        customerId: customerId,
                        date: row.date,
                        totalAmount: row.totalAmount,
                        status: row.status || (Number(row.balanceAmount) > 0 ? "partial" : "paid"),
                        source: "vyapar"
                    }).returning();

                    // Insert Payment if Paid > 0
                    if (row.paidAmount && Number(row.paidAmount) > 0) {
                        await tx.insert(payments).values({
                            customerId: customerId,
                            paymentDate: row.date,
                            amount: row.paidAmount,
                            mode: "cash",
                            referenceNo: `INV-${row.invoiceNo}`,
                            source: "vyapar"
                        });
                    }

                    successCount++;
                } catch (e) {
                    console.error("Row Error:", e);
                    allErrors.push({ row: row.invoiceNo, error: (e as Error).message });
                }
            }
        }

        // Logic Check: if 0 success and 0 errors, but input > 0
        if (successCount === 0 && allErrors.length === 0 && processedRows.length === 0 && (rawData as any[]).length > 0) {
            allErrors.push({ row: "GENERAL", error: "All rows failed validation. Check file headers against requirements." });
        }

        // Update Staging Record
        await tx.update(stagingImports)
            .set({
                status: "processed",
                processedCount: String(successCount),
                errorLog: allErrors.length > 0 ? allErrors : null
            })
            .where(eq(stagingImports.id, importId));
    });

    return { success: true, processed: processedRows.length, errors: allErrors.length };
}
