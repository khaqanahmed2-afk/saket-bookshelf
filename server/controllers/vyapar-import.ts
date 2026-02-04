import { Request, Response } from "express";
import { db } from "../db";
import { stagingImports } from "@shared/schema";
import { parseFile, processStagingImport, detectFileType } from "../services/import-service";
import { eq, desc } from "drizzle-orm";
import fs from "fs";

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export async function uploadVyapar(req: MulterRequest, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const type = req.body.type || "invoices"; // Default to invoices if not specified
        if (!["customers", "products", "invoices"].includes(type)) {
            return res.status(400).json({ message: "Invalid import type. Must be customers, products, or invoices." });
        }

        // 1. Parse File
        const rawData = await parseFile(req.file.buffer || fs.readFileSync(req.file.path));

        // 2. Clear temp file if disk storage used
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (rawData.length === 0) {
            return res.status(400).json({ message: "File is empty or could not be parsed." });
        }

        // 2.5 Auto-Detect Type from Headers
        let detectedType: string | null = null;
        if (rawData.length > 0) {
            const headers = Object.keys((rawData as any[])[0]);
            const detected = detectFileType(headers);
            if (detected) {
                detectedType = detected;
                console.log(`Smart Import: Auto-detected file type as '${detected}' (Overriding user selection '${type}')`);
            }
        }

        const finalType = detectedType || type;

        if (!["customers", "products", "invoices"].includes(finalType)) {
            return res.status(400).json({ message: `Invalid import type '${finalType}'. Must be customers, products, or invoices.` });
        }

        // 3. Save to Staging
        const [stagingRecord] = await db.insert(stagingImports).values({
            filename: req.file.originalname,
            source: "vyapar",
            type: finalType,
            status: "pending",
            // rawData is text or jsonb in schema. If jsonb, we pass object. If text, stringify.
            // We set it to jsonb in schema.ts
            rawData: rawData as any,
            processedCount: "0",
            totalCount: String(rawData.length)
        }).returning();

        res.json({
            message: "File uploaded successfully. Ready for processing.",
            importId: stagingRecord.id,
            totalRows: rawData.length,
            preview: rawData.slice(0, 5) // Send back a preview
        });

    } catch (error) {
        console.error("Vyapar Upload Error:", error);
        res.status(500).json({ message: "Internal server error", error: (error as Error).message });
    }
}

export async function getImportStatus(req: Request, res: Response) {
    const { id } = req.params;
    try {
        const [record] = await db
            .select()
            .from(stagingImports)
            .where(eq(stagingImports.id, id))
            .limit(1);

        if (!record) {
            return res.status(404).json({ message: "Import record not found" });
        }

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: "Error fetching status", error: (error as Error).message });
    }
}

export async function syncImport(req: Request, res: Response) {
    const { id } = req.params;
    try {
        const result = await processStagingImport(id);
        if (!result) {
            return res.status(404).json({ message: "Import not found or already processed" });
        }

        res.json({ message: "Sync completed", ...result });
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ message: "Error processing import", error: (error as Error).message });
    }
}

export async function getRecentImports(req: Request, res: Response) {
    try {
        const recent = await db
            .select()
            .from(stagingImports)
            .orderBy(desc(stagingImports.createdAt))
            .limit(10);

        res.json(recent);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history" });
    }
}
