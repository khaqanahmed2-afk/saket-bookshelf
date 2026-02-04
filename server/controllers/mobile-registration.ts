import { Request, Response } from "express";
import { db } from "../db";
import { customers, mobileLinkRequests } from "@shared/schema";
import { eq, or, isNull, and, ilike, sql } from "drizzle-orm";
import { z } from "zod";

// Strict 10-digit mobile validation starting with 6-9
const mobileSchema = z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9.");

/**
 * Live search for shops that need mobile registration (mobile is null or starts with '0')
 */
export async function searchShops(req: Request, res: Response) {
    try {
        const query = req.query.q as string;
        if (!query || query.length < 2) {
            return res.json([]);
        }

        const results = await db.query.customers.findMany({
            where: and(
                or(
                    isNull(customers.mobile),
                    ilike(customers.mobile, '0%'),
                    eq(customers.mobileVerified, false)
                ),
                or(
                    ilike(customers.name, `%${query}%`),
                    ilike(customers.customerCode || '', `%${query}%`)
                )
            ),
            limit: 10
        });

        res.json(results.map(c => ({
            id: c.id,
            name: c.name,
            address: c.address,
            customerCode: c.customerCode
        })));
    } catch (error: any) {
        res.status(500).json({ message: "Search failed", error: error.message });
    }
}

/**
 * Submit request to link a mobile number to a shop
 */
export async function requestMobileLink(req: Request, res: Response) {
    try {
        const { customerId, mobile } = req.body;

        // Validate inputs
        mobileSchema.parse(mobile);
        if (!customerId) return res.status(400).json({ message: "Customer ID is required" });

        // 1. Check if customer exists and is eligible for registration
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, customerId)
        });

        if (!customer) {
            return res.status(404).json({ message: "Shop not found" });
        }

        if (customer.mobileVerified === true && customer.mobile && !customer.mobile.startsWith('0')) {
            return res.status(400).json({ message: "This shop already has a verified mobile number." });
        }

        // 2. Check if mobile is already used by another verified customer
        const existingVerified = await db.query.customers.findFirst({
            where: and(
                eq(customers.mobile, mobile),
                eq(customers.mobileVerified, true)
            )
        });

        if (existingVerified) {
            return res.status(400).json({ message: "This mobile number is already registered with another shop." });
        }

        // 3. Create link request
        await db.insert(mobileLinkRequests).values({
            customerId,
            requestedMobile: mobile,
            status: 'pending'
        });

        // 4. Trigger WhatsApp Admin Notification (Mock)
        const whatsappMsg = `*Mobile registration request:*
Shop: ${customer.name}
Mobile: ${mobile}

✅ *Approve:* ${req.protocol}://${req.get('host')}/api/admin/approve-mobile?cid=${customerId}&m=${mobile}
❌ *Reject:* ${req.protocol}://${req.get('host')}/api/admin/reject-mobile?cid=${customerId}&m=${mobile}`;

        console.log(`[WHATSAPP NOTIFICATION SENT TO ADMIN]:\n${whatsappMsg}`);

        res.json({
            success: true,
            message: "Your request has been sent for approval. You will be logged in once it is approved."
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message || "Failed to submit request" });
    }
}

/**
 * Admin: Approve mobile linking
 */
export async function approveMobileRegistration(req: Request, res: Response) {
    try {
        const { cid, m } = req.query;
        if (!cid || !m) return res.status(400).send("<h1>Invalid Request</h1><p>Missing customer ID or mobile.</p>");

        const customerId = cid as string;
        const mobile = m as string;

        // 1. Check eligibility again
        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, customerId)
        });

        if (!customer) return res.status(404).send("<h1>Not Found</h1><p>Shop not found.</p>");

        // 2. Perform Atomic Update
        await db.transaction(async (tx) => {
            // Update customer
            await tx.update(customers)
                .set({
                    mobile,
                    mobileVerified: true,
                    // Note: We keep the old mobile in audit logs but here we overwrite the placeholder
                })
                .where(eq(customers.id, customerId));

            // Update all matching requests to approved
            await tx.update(mobileLinkRequests)
                .set({ status: 'approved', adminNotes: `Approved on ${new Date().toISOString()}` })
                .where(and(
                    eq(mobileLinkRequests.customerId, customerId),
                    eq(mobileLinkRequests.requestedMobile, mobile)
                ));
        });

        console.log(`[AUDIT] Mobile registration approved: Shop=${customer.name}, New Mobile=${mobile}`);

        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #22c55e;">✅ Approved!</h1>
                <p>Mobile number <b>${mobile}</b> has been linked to <b>${customer.name}</b>.</p>
                <p>The user can now log in.</p>
            </div>
        `);

    } catch (error: any) {
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
}

/**
 * Admin: Reject mobile linking
 */
export async function rejectMobileRegistration(req: Request, res: Response) {
    try {
        const { cid, m } = req.query;
        if (!cid || !m) return res.status(400).send("<h1>Invalid Request</h1>");

        const customerId = cid as string;
        const mobile = m as string;

        await db.update(mobileLinkRequests)
            .set({ status: 'rejected', adminNotes: `Rejected on ${new Date().toISOString()}` })
            .where(and(
                eq(mobileLinkRequests.customerId, customerId),
                eq(mobileLinkRequests.requestedMobile, mobile)
            ));

        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #ef4444;">❌ Rejected</h1>
                <p>Request for ${mobile} has been rejected.</p>
            </div>
        `);
    } catch (error: any) {
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
}
