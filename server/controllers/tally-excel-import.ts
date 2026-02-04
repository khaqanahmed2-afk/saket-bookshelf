import { Request, Response } from "express";
import { db } from "../db";
import { importLogs } from "@shared/schema";
import {
    parsePartyExcel,
    parseSalesExcel,
    validatePartyData,
    validateSalesData,
    importPartyData,
    importSalesData,
    calculateFileHash
} from "../services/tally-excel-import";
import { eq, desc } from "drizzle-orm";
import fs from "fs";

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

/**
 * Upload and import Tally Party Excel (Party Report)
 * Creates/updates customers with opening balances
 */
export async function uploadPartyExcel(req: MulterRequest, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Read file buffer
        const buffer = req.file.buffer || fs.readFileSync(req.file.path);

        // Calculate file hash
        const fileHash = calculateFileHash(buffer);

        // Check for duplicate file
        const existingImport = await db
            .select()
            .from(importLogs)
            .where(eq(importLogs.fileHash, fileHash))
            .limit(1);

        if (existingImport.length > 0) {
            // Clean up temp file
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(409).json({
                message: "This file has already been imported",
                importId: existingImport[0].id,
                importedAt: existingImport[0].importedAt
            });
        }

        // Parse Excel file
        const rawData = await parsePartyExcel(buffer);

        // Clean up temp file
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (rawData.length === 0) {
            return res.status(400).json({
                message: "File is empty or could not be parsed"
            });
        }

        // Validate and map data
        const { processedRows, errors: validationErrors } = validatePartyData(rawData);

        if (validationErrors.length > 0 && processedRows.length === 0) {
            return res.status(400).json({
                message: "Validation failed for all rows",
                errors: validationErrors
            });
        }

        // Import into database
        const result = await importPartyData(
            processedRows,
            req.file.originalname,
            fileHash
        );

        res.json({
            message: "Party import completed",
            summary: {
                totalRows: result.totalRows,
                imported: result.imported,
                skipped: result.skipped,
                failed: result.errors.length
            },
            errors: result.errors.slice(0, 50), // Limit error display
            validationErrors: validationErrors.slice(0, 50)
        });

    } catch (error) {
        console.error("Tally Party Import Error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: (error as Error).message
        });
    }
}

/**
 * Upload and import Tally Sales Excel (Sales Report)
 * Creates bills without affecting customer balances
 */
export async function uploadSalesExcel(req: MulterRequest, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Read file buffer
        const buffer = req.file.buffer || fs.readFileSync(req.file.path);

        // Calculate file hash
        const fileHash = calculateFileHash(buffer);

        // Check for duplicate file
        const existingImport = await db
            .select()
            .from(importLogs)
            .where(eq(importLogs.fileHash, fileHash))
            .limit(1);

        if (existingImport.length > 0) {
            // Clean up temp file
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(409).json({
                message: "This file has already been imported",
                importId: existingImport[0].id,
                importedAt: existingImport[0].importedAt
            });
        }

        // Parse Excel file
        const rawData = await parseSalesExcel(buffer);

        // Clean up temp file
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (rawData.length === 0) {
            return res.status(400).json({
                message: "File is empty or could not be parsed"
            });
        }

        // Validate and map data
        const { processedRows, errors: validationErrors } = validateSalesData(rawData);

        if (validationErrors.length > 0 && processedRows.length === 0) {
            return res.status(400).json({
                message: "Validation failed for all rows",
                errors: validationErrors
            });
        }

        // Import into database
        const result = await importSalesData(
            processedRows,
            req.file.originalname,
            fileHash
        );

        res.json({
            message: "Sales import completed",
            summary: {
                totalRows: result.totalRows,
                imported: result.imported,
                skipped: result.skipped,
                failed: result.errors.length
            },
            errors: result.errors.slice(0, 50), // Limit error display
            validationErrors: validationErrors.slice(0, 50)
        });

    } catch (error) {
        console.error("Tally Sales Import Error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: (error as Error).message
        });
    }
}

/**
 * Get import history/logs
 */
export async function getImportLogs(req: Request, res: Response) {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const type = req.query.type as string; // Optional filter by type

        let logs;

        if (type && ["party", "sales"].includes(type)) {
            logs = await db
                .select()
                .from(importLogs)
                .where(eq(importLogs.importType, type as "party" | "sales"))
                .orderBy(desc(importLogs.importedAt))
                .limit(limit);
        } else {
            logs = await db
                .select()
                .from(importLogs)
                .orderBy(desc(importLogs.importedAt))
                .limit(limit);
        }

        res.json(logs);
    } catch (error) {
        console.error("Error fetching import logs:", error);
        res.status(500).json({
            message: "Error fetching logs",
            error: (error as Error).message
        });
    }
}
